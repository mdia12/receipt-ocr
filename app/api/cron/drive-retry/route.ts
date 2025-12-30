import { createClient } from '@supabase/supabase-js';
import { ensureDriveFoldersAndUpload } from '@/lib/google-drive';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Ensure this runs dynamically

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export const maxDuration = 60; // Allow longer timeout for cron jobs

export async function POST(request: Request) {
  // 1. Security Check
  const authHeader = request.headers.get('x-cron-secret');
  if (authHeader !== process.env.CRON_SECRET) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    console.log('[Cron] Starting Drive Retry Job...');

    // 2. Fetch failed or pending uploads
    // We limit to 20 to process in this batch
    const { data: receipts, error } = await supabaseAdmin
      .from('receipts')
      .select('*')
      .in('drive_status', ['failed', 'pending'])
      .limit(20);

    if (error) throw error;

    if (!receipts || receipts.length === 0) {
      return NextResponse.json({ processed: 0, success: 0, failed: 0, message: 'No pending/failed uploads found' });
    }

    console.log(`[Cron] Found ${receipts.length} receipts to retry.`);

    const results = [];
    const CONCURRENCY_LIMIT = 5;

    // Helper to process a single receipt
    const processReceipt = async (receipt: any) => {
      try {
        // Download file
        const { data: fileData, error: downloadError } = await supabaseAdmin
          .storage
          .from('receipts')
          .download(receipt.file_path);

        if (downloadError || !fileData) {
          console.error(`[Cron] Failed to download file for receipt ${receipt.id}`);
          return { id: receipt.id, status: 'download_failed' };
        }

        const arrayBuffer = await fileData.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Retry Upload
        const result = await ensureDriveFoldersAndUpload(receipt, buffer, fileData.type);
        
        if (result.success) {
            return { id: receipt.id, status: 'success', ...result };
        } else {
            return { id: receipt.id, status: 'failed', ...result };
        }

      } catch (err: any) {
        console.error(`[Cron] Error processing ${receipt.id}:`, err);
        return { id: receipt.id, status: 'error', error: err.message };
      }
    };

    // 3. Process with Chunking (Simple Concurrency)
    for (let i = 0; i < receipts.length; i += CONCURRENCY_LIMIT) {
        const chunk = receipts.slice(i, i + CONCURRENCY_LIMIT);
        const chunkPromises = chunk.map(r => processReceipt(r));
        const chunkResults = await Promise.all(chunkPromises);
        results.push(...chunkResults);
    }

    const successCount = results.filter(r => r.status === 'success').length;
    const failedCount = results.filter(r => r.status !== 'success').length;

    return NextResponse.json({
      processed: receipts.length,
      success: successCount,
      failed: failedCount,
      results
    });

  } catch (error: any) {
    console.error('[Cron] Job failed:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
