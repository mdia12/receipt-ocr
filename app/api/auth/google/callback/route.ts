import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state") || "/dashboard";
  const error = searchParams.get("error");

  if (error) {
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

  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
     return NextResponse.redirect(new URL("/dashboard?error=config_error", request.url));
  }

  try {
    // Exchange code via Backend
    const res = await fetch(`${apiBase}/drive/auth/exchange`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        user_id: user.id
      }),
    });

    if (!res.ok) {
      const errData = await res.json();
      console.error("Backend Exchange Error:", errData);
      throw new Error(errData.detail || "Failed to exchange token");
    }

    return NextResponse.redirect(new URL(state, request.url));

  } catch (err: any) {
    console.error(err);
    const errorMessage = err.message || "Unknown error";
    return NextResponse.redirect(new URL(`/dashboard?error=auth_failed&details=${encodeURIComponent(errorMessage)}`, request.url));
  }
}
