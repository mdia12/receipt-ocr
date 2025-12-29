import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "/dashboard";
  const error = searchParams.get("error");

  if (error) {
    console.error("Google Auth Error:", error);
    return NextResponse.redirect(new URL(`/dashboard?error=google_auth_${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/dashboard?error=no_code", request.url));
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;

  if (!clientId || !clientSecret) {
     console.error("Missing Google Client ID or Secret");
     return NextResponse.redirect(new URL("/dashboard?error=config_error", request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const tokens = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token Exchange Error:", tokens);
      throw new Error(tokens.error_description || "Failed to exchange token");
    }

    // Calculate expiry
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + tokens.expires_in);

    // Save to Supabase
    const payload: any = {
        user_id: user.id,
        access_token: tokens.access_token,
        expires_at: expiresAt.toISOString(),
        updated_at: new Date().toISOString(),
    };

    if (tokens.refresh_token) {
        payload.refresh_token = tokens.refresh_token;
    }

    const { error: dbError } = await supabase
        .from("google_drive_tokens")
        .upsert(payload, { onConflict: 'user_id' });

    if (dbError) {
        console.error("DB Save Error:", dbError);
        throw new Error("Failed to save tokens");
    }

    return NextResponse.redirect(new URL(state, request.url));

  } catch (err: any) {
    console.error("Callback Error:", err);
    return NextResponse.redirect(new URL(`/dashboard?error=auth_failed&details=${encodeURIComponent(err.message)}`, request.url));
  }
}
