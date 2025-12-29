import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const next = searchParams.get("next") || "/dashboard";
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`;
  
  if (!clientId) {
    console.error("GOOGLE_CLIENT_ID is missing in environment variables");
    return new NextResponse("Configuration error: GOOGLE_CLIENT_ID missing", { status: 500 });
  }

  // Scopes required for the application
  // drive.file: View and manage Google Drive files and folders that you have opened or created with this app
  const scope = [
    "https://www.googleapis.com/auth/drive.file",
    "email",
    "profile"
  ].join(" ");

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
    access_type: "offline", // Important to get refresh_token
    prompt: "consent",      // Force consent screen to ensure refresh_token is returned
    state: next,
  });

  const url = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  console.log("[Google Auth] Redirecting to:", url);
  return NextResponse.redirect(url);
}
