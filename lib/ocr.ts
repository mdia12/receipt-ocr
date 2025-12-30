import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { ensureDriveFoldersAndUpload } from './google-drive';
import { ImageAnnotatorClient } from '@google-cloud/vision';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any;

function getVisionClient() {
  const credsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (!credsBase64) throw new Error('Missing GOOGLE_APPLICATION_CREDENTIALS_BASE64');
  
  try {
    const credsJson = Buffer.from(credsBase64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credsJson);
    return new ImageAnnotatorClient({ credentials });
  } catch (e) {
    console.error('[Vision] Failed to parse credentials', e);
    throw new Error('Invalid Vision credentials');
  }
}

function parseReceiptText(text: string) {
  const lines = text.split('\n');
  let amount = 0;
  let date = null;
  let merchant = lines[0]?.trim() || 'Unknown Merchant';
  let currency = 'EUR';
  let tax = 0;

  // 1. Extract Amounts
  // Look for patterns like 12.34 or 12,34
  // We'll collect all valid numbers and try to find the "Total"
  const priceRegex = /\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})\b/g;
  const potentialPrices: number[] = [];

  // Keywords that suggest a total line
  const totalKeywords = ['total', 'montant', 'somme', 'payer', 'ttc'];
  let maxPriceFound = 0;

  lines.forEach(line => {
    const lowerLine = line.toLowerCase();
    const matches = line.match(priceRegex);
    
    if (matches) {
      matches.forEach(match => {
        // Normalize: replace , with . and remove spaces
        const normalized = match.replace(/,/g, '.').replace(/\s/g, '');
        const val = parseFloat(normalized);
        if (!isNaN(val)) {
          potentialPrices.push(val);
          
          // If line contains "Total", this is a strong candidate
          if (totalKeywords.some(k => lowerLine.includes(k))) {
             if (val > maxPriceFound) maxPriceFound = val;
          }
        }
      });
    }
  });

  // If we found a "Total" line price, use it. Otherwise use the max number found (heuristic)
  if (maxPriceFound > 0) {
    amount = maxPriceFound;
  } else if (potentialPrices.length > 0) {
    amount = Math.max(...potentialPrices);
  }

  // 2. Extract Tax (TVA/VAT)
  // Look for lines with TVA/VAT and a number smaller than total
  const taxKeywords = ['tva', 'vat', 'tax'];
  lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (taxKeywords.some(k => lowerLine.includes(k))) {
          const matches = line.match(priceRegex);
          if (matches) {
              matches.forEach(m => {
                  const normalized = m.replace(/,/g, '.').replace(/\s/g, '');
                  const val = parseFloat(normalized);
                  // Heuristic: Tax is usually non-zero and less than the total amount
                  if (!isNaN(val) && val > 0 && val < amount) {
                      // If we find multiple, take the largest one that fits criteria (often there are multiple tax rates)
                      if (val > tax) tax = val;
                  }
              });
          }
      }
  });

  // 3. Extract Date
  // DD/MM/YYYY or YYYY-MM-DD
  const dateRegex = /\b(\d{2}[./-]\d{2}[./-]\d{4})|(\d{4}[./-]\d{2}[./-]\d{2})\b/;
  const dateMatch = text.match(dateRegex);
  if (dateMatch) {
    const dateStr = dateMatch[0].replace(/[./]/g, '-'); // Normalize separators
    // Try to parse
    const parsed = new Date(dateStr.split('-').reverse().join('-')); // naive DD-MM-YYYY -> YYYY-MM-DD
    if (!isNaN(parsed.getTime())) {
        date = parsed.toISOString().split('T')[0];
    } else {
        // Try standard parse
        const parsed2 = new Date(dateStr);
        if (!isNaN(parsed2.getTime())) date = parsed2.toISOString().split('T')[0];
    }
  }

  // 4. Extract Currency (Simple check)
  if (text.includes('$') || text.includes('USD')) currency = 'USD';
  else if (text.includes('£') || text.includes('GBP')) currency = 'GBP';

  return { amount, date, merchant, currency, tax };
}

export async function processReceipt(receiptId: string) {
  console.log(`[OCR] Processing receipt: ${receiptId}`);

  // 1. Fetch receipt metadata
  const { data: receipt, error } = await supabaseAdmin
    .from('receipts')
    .select('*')
    .eq('id', receiptId)
    .single();

  if (error || !receipt) {
    console.error('[OCR] Receipt not found');
    return;
  }

  // 2. Download file from Storage
  // Note: Uploads go to 'receipts_raw' bucket
  const { data: fileData, error: downloadError } = await supabaseAdmin
    .storage
    .from('receipts_raw')
    .download(receipt.file_path);

  if (downloadError || !fileData) {
    console.error('[OCR] Failed to download file from storage', downloadError);
    return;
  }

  // Convert Blob to Buffer
  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 3. Perform OCR
  let extractedData = { amount: 0, date: null as string | null, merchant: 'Unknown', currency: 'EUR', tax: 0 };
  let rawText = '';

  try {
    const client = getVisionClient();
    const [result] = await client.textDetection(buffer);
    const detections = result.textAnnotations;
    rawText = detections?.[0]?.description || '';

    if (rawText) {
        extractedData = parseReceiptText(rawText);
        console.log(`[OCR] Extracted: Amount=${extractedData.amount}, Tax=${extractedData.tax}, Date=${extractedData.date}`);
    } else {
        console.log('[OCR] No text detected by Vision API');
    }

  } catch (ocrError) {
      console.error('[OCR] Vision API error:', ocrError);
      // Continue to allow Drive upload even if OCR fails, but log it
  }

  // Update DB with extracted data
  await supabaseAdmin.from('receipts').update({
      status: 'processed', // Mark as processed
      merchant: extractedData.merchant,
      amount: extractedData.amount,
      currency: extractedData.currency,
      date: extractedData.date,
      tax: extractedData.tax, // Save extracted tax
      description: rawText.slice(0, 500), // Store snippet of text
      // raw_json: JSON.stringify(extractedData) // Optional if column exists
  }).eq('id', receiptId);

  // 4. Upload to Google Drive (if connected)
  // We pass the buffer and mime type explicitly
  // Pass the updated receipt object (merged with extracted data) for better naming
  const updatedReceipt = { ...receipt, ...extractedData };
  await ensureDriveFoldersAndUpload(updatedReceipt, buffer, fileData.type);

  console.log(`[OCR] Finished processing ${receiptId}`);
}

// Alias for compatibility with existing routes
export const processReceiptOCR = processReceipt;

export async function testVisionConnection() {
  try {
    const credsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
    if (!credsBase64) {
      console.error('[Vision] Missing GOOGLE_APPLICATION_CREDENTIALS_BASE64');
      return false;
    }

    const credsJson = Buffer.from(credsBase64, 'base64').toString('utf-8');
    const creds = JSON.parse(credsJson);

    if (!creds.client_email || !creds.private_key) {
      console.error('[Vision] Invalid credentials structure');
      return false;
    }

    // Optional: Could instantiate ImageAnnotatorClient here to verify further
    // const client = new ImageAnnotatorClient({ credentials: creds });
    
    return true;
  } catch (error) {
    console.error('[Vision] Connection test failed:', error);
    return false;
  }
}
