import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ensureDriveFoldersAndUpload } from "@/lib/google-drive";

// Initialize Admin Client for background jobs
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: Request) {
  // 1. Security Check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    // Allow local dev testing without secret if needed, or strict check
    if (process.env.NODE_ENV === 'production') {
        return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    console.log("[Cron] Starting Drive Retry Job");

    // 2. Fetch pending/failed receipts
    // Limit to 5 to avoid timeouts
    const { data: receipts, error } = await supabaseAdmin
      .from('receipts')
      .select('*')
      .in('drive_status', ['pending', 'failed'])
      .not('file_path', 'is', null)
      .limit(5);

    if (error) throw error;

    if (!receipts || receipts.length === 0) {
        return NextResponse.json({ message: "No receipts to process" });
    }

    console.log(`[Cron] Found ${receipts.length} receipts to retry`);

    const results = [];

    // 3. Process each receipt
    for (const receipt of receipts) {
        try {
            // Download file
            const { data: fileData, error: downloadError } = await supabaseAdmin
                .storage
                .from('receipts_raw')
                .download(receipt.file_path);

            if (downloadError || !fileData) {
                console.error(`[Cron] Failed to download file for ${receipt.id}`, downloadError);
                await supabaseAdmin.from('receipts').update({ 
                    drive_status: 'failed', 
                    drive_error: 'File not found in storage' 
                }).eq('id', receipt.id);
                results.push({ id: receipt.id, status: 'failed', reason: 'storage_missing' });
                continue;
            }

            const buffer = Buffer.from(await fileData.arrayBuffer());
            const mimeType = receipt.file_type || (receipt.file_path.endsWith('.pdf') ? 'application/pdf' : 'image/jpeg');

            // Retry Upload
            const res = await ensureDriveFoldersAndUpload(receipt, buffer, mimeType);
            results.push({ id: receipt.id, ...res });

        } catch (err: any) {
            console.error(`[Cron] Error processing ${receipt.id}`, err);
            results.push({ id: receipt.id, status: 'failed', error: err.message });
        }
    }

    return NextResponse.json({ 
        success: true, 
        processed: receipts.length, 
        results 
    });

  } catch (error: any) {
    console.error("[Cron] Job failed:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
