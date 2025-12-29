import { createClient } from '@supabase/supabase-js';
import { ensureDriveFoldersAndUpload } from '@/lib/google-drive';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this runs dynamically

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  // Optional: Verify a secret header to prevent unauthorized access
  // const authHeader = request.headers.get('authorization');
  // if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  //   return new NextResponse('Unauthorized', { status: 401 });
  // }

  try {
    console.log('[Cron] Starting Drive Retry Job...');

    // 1. Find failed uploads (limit 10 to avoid timeouts)
    const { data: failedReceipts, error } = await supabaseAdmin
      .from('receipts')
      .select('*')
      .eq('drive_status', 'failed')
      .limit(10);

    if (error) throw error;

    if (!failedReceipts || failedReceipts.length === 0) {
      console.log('[Cron] No failed uploads found.');
      return NextResponse.json({ message: 'No failed uploads to retry' });
    }

    console.log(`[Cron] Found ${failedReceipts.length} failed uploads. Retrying...`);

    const results = [];

    for (const receipt of failedReceipts) {
      try {
        // Download file again
        const { data: fileData, error: downloadError } = await supabaseAdmin
          .storage
          .from('receipts')
          .download(receipt.file_path);

        if (downloadError || !fileData) {
          console.error(`[Cron] Failed to download file for receipt ${receipt.id}`);
          results.push({ id: receipt.id, status: 'download_failed' });
          continue;
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Retry Upload
        const result = await ensureDriveFoldersAndUpload(receipt, buffer, fileData.type);
        results.push({ id: receipt.id, result });

      } catch (innerError) {
        console.error(`[Cron] Error retrying receipt ${receipt.id}`, innerError);
        results.push({ id: receipt.id, status: 'error', error: innerError });
      }
    }

    return NextResponse.json({ 
      success: true, 
      processed: failedReceipts.length, 
      results 
    });

  } catch (error: any) {
    console.error('[Cron] Job failed:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
