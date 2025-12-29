import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { processReceiptOCR } from "@/lib/ocr";

export async function POST(request: Request) {
  try {
    // 1. Authenticate User (using standard client)
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // 2. Validate File
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const ALLOWED_TYPES = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "application/pdf"
    ];

    if (file.size > MAX_SIZE) {
      return NextResponse.json({ 
        error: "File too large. Maximum size is 10MB." 
      }, { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ 
        error: "Invalid file type. Only JPG, PNG, WEBP, and PDF are allowed." 
      }, { status: 400 });
    }

    // 3. Prepare File Info
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const datePrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    const fileName = `${user.id}/${datePrefix}/${crypto.randomUUID()}.${fileExt}`;
    const bucketName = "receipts_raw"; 

    console.log(`[Upload] Starting upload for ${file.name} to ${bucketName}/${fileName}`);

    // 4. Initialize Admin Client for Storage (Bypass RLS)
    // CRITICAL: Always use service role key for storage uploads to avoid RLS errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey || supabaseServiceKey === "your_supabase_service_role_key") {
        console.error("[Upload] CRITICAL: SUPABASE_SERVICE_ROLE_KEY is missing or invalid.");
        return NextResponse.json({ 
          error: "Server configuration error. Please check server logs." 
        }, { status: 500 });
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 5. Upload to Supabase Storage
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("[Upload] Storage error:", uploadError);
      return NextResponse.json({ error: "Storage upload failed", details: uploadError }, { status: 500 });
    }

    // 6. Insert into public.receipts
    const { data: receiptData, error: dbError } = await supabase
      .from("receipts")
      .insert({
        user_id: user.id,
        status: "processing",
        original_filename: file.name,
        file_type: file.type,
        file_path: fileName,
        currency: "EUR",
        amount: null, // Explicitly null initially
        merchant: null,
        date: null,
        category: null
      })
      .select()
      .single();

    if (dbError) {
      console.error("[Upload] DB insert error:", dbError);
      // Cleanup storage if DB insert fails
      await supabaseAdmin.storage.from(bucketName).remove([fileName]);
      return NextResponse.json({ error: "Database insert failed", details: dbError }, { status: 500 });
    }

    console.log(`[Upload] Receipt created: ${receiptData.id}`);

    // 7. Insert into public.jobs_processing
    const jobData = {
        job_id: receiptData.id,
        receipt_id: receiptData.id,
        status: "queued",
    };
    console.log("[Upload] Inserting into jobs_processing:", jobData);

    const { error: jobError } = await supabase
      .from("jobs_processing")
      .insert(jobData);

    if (jobError) {
        console.error("[Upload] Job insert error:", jobError);
    }

    // 8. Trigger OCR (Node.js Worker)
    // Replaces the Python backend trigger to ensure execution on Vercel
    console.log(`[Upload] Triggering OCR for receipt: ${receiptData.id}`);
    
    // We await this to ensure it runs before the lambda freezes/terminates
    try {
        await processReceiptOCR(receiptData.id);
    } catch (ocrError) {
        console.error("[Upload] OCR processing failed:", ocrError);
        // We don't fail the request, as the upload was successful
    }

    return NextResponse.json({
        receipt_id: receiptData.id,
        file_path: fileName,
        file_type: file.type,
        original_filename: file.name,
        status: "success" // Optimistically return success if OCR finished
    });

  } catch (error: any) {
    console.error("[Upload] Unhandled error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
