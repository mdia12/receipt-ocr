import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { processReceiptOCR } from "@/lib/ocr";

export async function POST(
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
    // 2. Fetch Receipt to verify ownership
    const { data: receipt, error } = await supabase
      .from("receipts")
      .select("user_id")
      .eq("id", id)
      .single();

    if (error || !receipt) {
      return NextResponse.json({ error: "Receipt not found" }, { status: 404 });
    }

    if (receipt.user_id !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 3. Check Credentials
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_BASE64) {
        return NextResponse.json({ error: "Server configuration error: Missing Google Credentials" }, { status: 500 });
    }

    // 4. Trigger OCR
    console.log(`[Reprocess] Triggering OCR for receipt: ${id}`);
    
    // We await this to ensure it runs
    await processReceiptOCR(id);

    return NextResponse.json({ message: "OCR processing triggered" });

  } catch (e: any) {
    console.error("[Reprocess] Error:", e);
    return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
  }
}
