import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ connected: false, reason: "No user" });
    }

    const { data, error } = await supabase
        .from("google_drive_tokens")
        .select("expires_at, refresh_token")
        .eq("user_id", user.id)
        .single();

    if (error || !data) {
        return NextResponse.json({ connected: false, reason: "No token found" });
    }

    // Check if connected
    // We consider connected if we have a refresh token OR a valid access token
    const isConnected = !!data.refresh_token; 
    
    // Check if token is expired (optional, but good for UI)
    const isExpired = new Date(data.expires_at) < new Date();

    return NextResponse.json({ 
        connected: isConnected, 
        expires_at: data.expires_at,
        needs_reauth: isConnected && isExpired && !data.refresh_token // Should not happen if logic is correct
    });

  } catch (error) {
    console.error("Drive status check error:", error);
    return NextResponse.json({ connected: false, reason: "Internal error" }, { status: 500 });
  }
}
