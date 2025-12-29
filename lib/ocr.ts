import { createClient } from '@supabase/supabase-js';
import { ensureDriveFoldersAndUpload } from './google-drive';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

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
