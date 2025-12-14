import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";

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

    // 2. Prepare File Info
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'bin';
    const datePrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
    const fileName = `${user.id}/${datePrefix}/${crypto.randomUUID()}.${fileExt}`;
    const bucketName = "receipts_raw"; 

    console.log(`[Upload] Starting upload for ${file.name} to ${bucketName}/${fileName}`);

    // 3. Initialize Admin Client for Storage (Bypass RLS)
    // CRITICAL: Always use service role key for storage uploads to avoid RLS errors
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseServiceKey) {
        console.error("[Upload] Missing SUPABASE_SERVICE_ROLE_KEY");
        return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
    }

    const supabaseAdmin = createSupabaseClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    // 4. Upload to Supabase Storage
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

    // 5. Insert into public.receipts
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
      return NextResponse.json({ error: "Database insert failed", details: dbError }, { status: 500 });
    }

    console.log(`[Upload] Receipt created: ${receiptData.id}`);

    // 6. Insert into public.jobs_processing
    const { error: jobError } = await supabase
      .from("jobs_processing")
      .insert({
        receipt_id: receiptData.id,
        status: "queued",
        // job_type: file.type === "application/pdf" ? "pdf_ocr" : "image_ocr", // Optional if your schema doesn't require it
        // payload: {
        //     file_path: fileName,
        //     file_type: file.type
        // }
      });

    if (jobError) {
        console.error("[Upload] Job insert error:", jobError);
        // We continue even if job insert fails, but ideally this should be atomic.
        // For now, we log it. The backend trigger below is the primary mechanism in some setups,
        // but the prompt asked to insert into jobs_processing.
    }

    // 7. Trigger Python Backend (Fire and Forget)
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
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
