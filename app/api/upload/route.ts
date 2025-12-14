import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
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

    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    // Create a unique path: userId/YYYY-MM/uuid.ext
    const datePrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    const fileName = `${user.id}/${datePrefix}/${crypto.randomUUID()}.${fileExt}`;
    const bucketName = "receipts_raw"; 

    console.log(`[Upload] Starting upload for ${file.name} to ${bucketName}/${fileName}`);

    // Use Admin Client for Storage if available to bypass RLS issues
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;
    
    let storageClient = supabase;
    if (supabaseServiceKey) {
        console.log("[Upload] Using Service Role Key for storage upload");
        storageClient = createAdminClient(supabaseUrl, supabaseServiceKey, {
          auth: {
            autoRefreshToken: false,
            persistSession: false
          }
        });
    }

    // Convert File to Buffer for reliable upload in Node environment
    const arrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(arrayBuffer);

    // 1. Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await storageClient.storage
      .from(bucketName)
      .upload(fileName, fileBuffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error("[Upload] Storage error:", uploadError);
      return NextResponse.json({ error: "Storage upload failed", details: uploadError }, { status: 500 });
    }

    // 2. Insert into public.receipts
    const { data: receiptData, error: dbError } = await supabase
      .from("receipts")
      .insert({
        user_id: user.id,
        status: "processing",
        original_filename: file.name,
        file_type: file.type,
        file_path: fileName,
        currency: "EUR",
        // organization_id: user.user_metadata?.organization_id || null
      })
      .select()
      .single();

    if (dbError) {
      console.error("[Upload] DB insert error:", dbError);
      return NextResponse.json({ error: "Database insert failed", details: dbError }, { status: 500 });
    }

    console.log(`[Upload] Receipt created: ${receiptData.id}`);

    // 3. Insert into public.jobs_processing
    const { error: jobError } = await supabase
      .from("jobs_processing")
      .insert({
        receipt_id: receiptData.id,
        status: "queued",
        job_type: file.type === "application/pdf" ? "pdf_ocr" : "image_ocr",
        payload: {
            file_path: fileName,
            file_type: file.type
        }
      });

    if (jobError) {
        console.error("[Upload] Job insert error:", jobError);
        // We don't fail the request here, but we log it.
    }

    // 4. Call Python Backend to start processing
    // Fire and forget - don't await the result
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    fetch(`${backendUrl}/api/process-receipt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            receipt_id: receiptData.id,
            file_path: fileName,
            file_type: file.type,
            user_id: user.id,
            email: user.email
        }),
    }).catch(err => console.error("[Upload] Backend trigger failed:", err));

    return NextResponse.json({
        receipt_id: receiptData.id,
        file_path: fileName,
        file_type: file.type,
        original_filename: file.name,
        status: "processing"
    });

  } catch (error: any) {
    console.error("[Upload] Unhandled error:", error);
    return NextResponse.json({ error: error.message || "Internal Server Error", step: "unknown" }, { status: 500 });
  }
}
