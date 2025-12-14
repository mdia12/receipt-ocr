import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const params = await props.params;
  const { id } = params;
  const supabase = await createClient();

  // 1. Auth Check
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 2. Fetch Receipt
    // We try 'receipts' table first, then 'documents' if needed.
    let tableName = "receipts";
    let { data: receipt, error } = await supabase
      .from(tableName)
      .select("user_id, file_path, original_file_url")
      .eq("id", id)
      .single();

    if (error) {
      // Fallback to 'documents'
      tableName = "documents";
      const { data: doc, error: docError } = await supabase
        .from(tableName)
        .select("user_id, file_path, original_file_url")
        .eq("id", id)
        .single();
      
      if (docError) {
        console.error("Error fetching receipt:", error, docError);
        return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
      }
      receipt = doc;
    }

    if (!receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    // 3. Ownership Check
    if (receipt.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 4. Determine URL
    if (receipt.original_file_url) {
      return NextResponse.json({ url: receipt.original_file_url });
    }

    if (receipt.file_path) {
      // 5. Generate Signed URL
      // We try 'receipts_raw' as it is defined in the codebase, fallback to 'receipts'
      let bucket = "receipts_raw";
      
      // Check if file_path implies a bucket (e.g. "receipts_pdf/file.pdf")
      // But usually file_path is relative to bucket.
      
      let { data, error: signError } = await supabase
        .storage
        .from(bucket)
        .createSignedUrl(receipt.file_path, 60);

      if (signError) {
         // Try 'receipts' bucket as fallback
         bucket = "receipts";
         const { data: dataFallback, error: signErrorFallback } = await supabase
            .storage
            .from(bucket)
            .createSignedUrl(receipt.file_path, 60);
         
         if (signErrorFallback) {
             // Try 'receipts_pdf' as another fallback
             bucket = "receipts_pdf";
             const { data: dataPdf, error: signErrorPdf } = await supabase
                .storage
                .from(bucket)
                .createSignedUrl(receipt.file_path, 60);
                
             if (signErrorPdf) {
                 console.error("Error generating signed url:", signError);
                 return NextResponse.json({ error: "Could not generate file URL" }, { status: 500 });
             }
             return NextResponse.json({ url: dataPdf.signedUrl });
         }
         return NextResponse.json({ url: dataFallback.signedUrl });
      }

      return NextResponse.json({ url: data.signedUrl });
    }

    return NextResponse.json({ error: "No file associated with this receipt" }, { status: 404 });

  } catch (e) {
    console.error("Internal error:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
