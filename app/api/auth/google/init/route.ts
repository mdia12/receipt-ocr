import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/dashboard";
  
  const apiBase = process.env.NEXT_PUBLIC_API_URL;
  if (!apiBase) {
    return new NextResponse("Configuration error: NEXT_PUBLIC_API_URL missing", { status: 500 });
  }

  try {
    // Call backend to get the Google Auth URL
    // We pass 'next' as state so we can redirect back to it later
    const res = await fetch(`${apiBase}/drive/auth/init?state=${encodeURIComponent(next)}`, {
      redirect: "manual",
      cache: "no-store"
    });

    const location = res.headers.get("location");
    if (!location) {
      console.error("Backend did not return a redirect location");
      return new NextResponse("Backend error", { status: 500 });
    }

    return NextResponse.redirect(location);
  } catch (error) {
    console.error("Auth Init Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
