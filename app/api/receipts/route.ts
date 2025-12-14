import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: receipts, error } = await supabase
      .from("receipts")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase receipts fetch error:", error);
      throw error;
    }

    // Map to frontend expected format if necessary, or return as is
    // Frontend expects: id, date, merchant, category, amount_total, currency, status, file_url, etc.
    // Assuming the DB columns match these names or close enough.
    
    return NextResponse.json({ receipts });
  } catch (error) {
    console.error("Receipts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
}
