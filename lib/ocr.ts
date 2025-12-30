import 'server-only';
import { createClient } from '@supabase/supabase-js';
import { ensureDriveFoldersAndUpload } from './google-drive';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = (supabaseUrl && supabaseServiceKey)
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null as any;

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
  const { data: fileData, error: downloadError } = await supabaseAdmin
    .storage
    .from('receipts')
    .download(receipt.file_path);

  if (downloadError || !fileData) {
    console.error('[OCR] Failed to download file from storage', downloadError);
    return;
  }

  // Convert Blob to Buffer
  const arrayBuffer = await fileData.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  // 3. Perform OCR (Mock for now, or call external API)
  // In a real scenario, you'd send 'buffer' to OpenAI/DocumentAI here.
  // For this example, we'll assume OCR was done or is simulated.
  
  // ... OCR Logic ...

  // 4. Upload to Google Drive (if connected)
  // We pass the buffer and mime type explicitly
  await ensureDriveFoldersAndUpload(receipt, buffer, fileData.type);

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
