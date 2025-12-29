import vision from '@google-cloud/vision';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Admin Client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase credentials for OCR worker");
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Initialize Google Vision Client
function getVisionClient() {
  const credentialsBase64 = process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64;
  if (!credentialsBase64) {
    throw new Error("GOOGLE_APPLICATION_CREDENTIALS_BASE64 is missing");
  }

  try {
    const credentialsJson = Buffer.from(credentialsBase64, 'base64').toString('utf-8');
    const credentials = JSON.parse(credentialsJson);
    return new vision.ImageAnnotatorClient({ credentials });
  } catch (error) {
    console.error("Failed to parse Google Cloud credentials", error);
    throw new Error("Invalid Google Cloud credentials");
  }
}

export async function testVisionConnection() {
  try {
    console.log("[Vision] Testing connection...");
    const client = getVisionClient();
    // Perform a minimal request (e.g., detect text in a sample image or empty request check)
    // We'll use a public image or just check if client initializes. 
    // Better to try a real request.
    const [result] = await client.textDetection({
        image: {
            source: {
                imageUri: 'https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_272x92dp.png'
            }
        }
    });
    
    if (result) {
        console.log("[Vision] VISION API REACHABLE");
        return true;
    }
    return false;
  } catch (error) {
    console.error("[Vision] Connection failed:", error);
    return false;
  }
}

export async function processReceiptOCR(receiptId: string) {
  console.log(`[OCR] Starting processing for receipt: ${receiptId}`);

  try {
    // 0. Update status to indicate OCR started
    // We use 'processing' to stay within standard constraints (pending, processing, completed, failed)
    await supabaseAdmin.from('receipts').update({ status: 'processing' }).eq('id', receiptId);

    // 1. Get Receipt Info
    const { data: receipt, error: fetchError } = await supabaseAdmin
      .from('receipts')
      .select('*')
      .eq('id', receiptId)
      .single();

    if (fetchError || !receipt) {
      console.error(`[OCR] Receipt not found: ${receiptId}`, fetchError);
      throw new Error(`Receipt not found: ${fetchError?.message}`);
    }

    console.log(`[OCR] Processing file: ${receipt.file_path}`);

    // 2. Download File from Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin
      .storage
      .from('receipts_raw')
      .download(receipt.file_path);

    if (downloadError || !fileData) {
      console.error(`[OCR] Failed to download file: ${receipt.file_path}`, downloadError);
      throw new Error(`Download failed: ${downloadError?.message}`);
    }
    
    const buffer = Buffer.from(await fileData.arrayBuffer());
    console.log(`[OCR] File downloaded. Size: ${buffer.length} bytes`);

    // 3. Call Google Vision
    console.log("[OCR] VISION OCR CALLED");
    const client = getVisionClient();
    
    const [result] = await client.textDetection({
        image: {
            content: buffer
        }
    });

    const detections = result.textAnnotations;
    if (!detections || detections.length === 0) {
        console.log("[OCR] No text detected");
        await supabaseAdmin.from('receipts').update({ 
            status: 'success', 
            raw_text: 'No text detected',
            raw_json: JSON.parse(JSON.stringify(result))
        }).eq('id', receiptId);
        return;
    }

    const rawText = detections[0].description || "";
    console.log("[OCR] VISION OCR SUCCESS. Text length:", rawText.length);

    // 4. Parse Data
    const parsedData = parseReceiptText(rawText);
    console.log("[OCR] Parsed data:", parsedData);

    // 5. Update Database
    const updatePayload = {
        status: 'success',
        raw_text: rawText,
        raw_json: JSON.parse(JSON.stringify(result)), // Save full result for debugging
        merchant: parsedData.merchant,
        date: parsedData.date,
        amount: parsedData.amount,
        currency: parsedData.currency,
        extracted_vat: parsedData.vatAmount, // Save to new column
    };
    
    // Inject VAT into raw_json for visibility without schema change
    updatePayload.raw_json.extracted_vat = parsedData.vatAmount;
    
    console.log(`[OCR] Saving VAT: ${parsedData.vatAmount} for receipt ${receiptId}`);

    const { error: updateError } = await supabaseAdmin
      .from('receipts')
      .update(updatePayload)
      .eq('id', receiptId);

    if (updateError) {
      console.error("[OCR] Failed to update receipt", updateError);
      
      // Specific check for the updated_at error
      if (updateError.message?.includes('updated_at')) {
          throw new Error("Database Schema Error: Missing 'updated_at' column. Please run the migration '20251229_fix_updated_at.sql' in Supabase.");
      }

      // If update fails (e.g. missing column), try updating just status
      if (updateError.message.includes('column') || updateError.message.includes('extracted_vat')) {
          console.warn("[OCR] Column missing. Retrying without 'extracted_vat' column but WITH raw_json...");
          // Remove the problematic column but keep raw_json which has the injected VAT
          const { extracted_vat, ...fallbackPayload } = updatePayload;
          await supabaseAdmin.from('receipts').update(fallbackPayload).eq('id', receiptId);
      } else {
          throw updateError;
      }
    } else {
      console.log("[OCR] Receipt updated successfully");
    }

  } catch (error: any) {
    console.error("[OCR] VISION OCR FAILED", error);
    await supabaseAdmin.from('receipts').update({ 
        status: 'failed',
        // Store error in a field if possible, or just log it
    }).eq('id', receiptId);
    throw error; // Re-throw to let caller know
  }
}

import { extractAmount, extractVAT } from './receipt-parser';

// ... existing imports ...

// Simple parser helper
function parseReceiptText(text: string) {
  const lines = text.split('\n');
  let date = null;
  let merchant = lines[0] || "Unknown";
  
  // Use the robust extractor
  const { amount, currency } = extractAmount(lines, true);
  const vatAmount = extractVAT(lines, amount, true);

  console.log(`[OCR] Extracted Amount: ${amount} ${currency}, VAT: ${vatAmount}`);

  // Regex for Date (DD/MM/YYYY, YYYY-MM-DD)
  const numericDateRegex = /(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{2,4})|(\d{4})[\/.-](\d{1,2})[\/.-](\d{1,2})/;
  
  // Regex for French Date (e.g. 24 avril 2024)
  const frenchMonths = "janvier|février|mars|avril|mai|juin|juillet|août|aout|septembre|octobre|novembre|décembre|decembre";
  const frenchDateRegex = new RegExp(`(\\d{1,2})\\s+(${frenchMonths})\\s+(\\d{4})`, 'i');

  const monthMap: {[key: string]: string} = {
      'janvier': '01', 'février': '02', 'fevrier': '02', 'mars': '03', 'avril': '04', 'mai': '05', 'juin': '06',
      'juillet': '07', 'août': '08', 'aout': '08', 'septembre': '09', 'octobre': '10', 'novembre': '11', 'décembre': '12', 'decembre': '12'
  };

  for (const line of lines) {
    // Date Parsing
    if (!date) {
        // Try French date first
        const frMatch = line.match(frenchDateRegex);
        if (frMatch) {
            const day = frMatch[1].padStart(2, '0');
            const monthStr = frMatch[2].toLowerCase();
            const month = monthMap[monthStr];
            const year = frMatch[3];
            date = `${year}-${month}-${day}`;
        } else {
            // Try numeric date
            const numMatch = line.match(numericDateRegex);
            if (numMatch) {
                // Check which group matched
                if (numMatch[1]) { // DD/MM/YYYY
                     const day = numMatch[1].padStart(2, '0');
                     const month = numMatch[2].padStart(2, '0');
                     let year = numMatch[3];
                     if (year.length === 2) year = "20" + year;
                     date = `${year}-${month}-${day}`;
                } else if (numMatch[4]) { // YYYY-MM-DD
                     date = numMatch[0];
                }
            }
        }
    }
  }

  return { merchant, date, amount, currency, vatAmount };
}
