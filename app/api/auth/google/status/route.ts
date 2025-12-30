import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ connected: false });
    }

    const { data, error } = await supabase
      .from("google_drive_tokens")
      .select("id")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 is "no rows returned"
      console.error("Error checking drive status:", error);
    }

    return NextResponse.json({ connected: !!data });
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ connected: false }, { status: 500 });
  }
}
