import { NextRequest, NextResponse } from "next/server";

export const runtime = 'edge'; // Optional: Use Edge Runtime for lower latency if possible, but Node is fine too.

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Determine Backend URL
    // In development, we point to the local FastAPI server.
    // In production, we point to the deployed Vercel URL (via the /api/py rewrite or direct function URL).
    // However, calling the Vercel function from within Next.js server-side can be tricky with auth/networking.
    // A robust way is to use the internal localhost in dev, and the public URL in prod.
    
    let backendUrl = "http://127.0.0.1:8000";
    if (process.env.VERCEL_URL) {
      backendUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      backendUrl = process.env.NEXT_PUBLIC_API_URL;
    }

    // Construct the target URL
    // If we are in Vercel, the Python backend is exposed at /api/py
    // If we are local, it's at root (usually) but we might have rewrites.
    // Let's assume the standard pattern:
    // Local: http://127.0.0.1:8000/anonymous/scan
    // Prod: https://.../api/py/anonymous/scan
    
    const targetPath = process.env.NODE_ENV === "development" 
      ? "/anonymous/scan" 
      : "/api/py/anonymous/scan";
      
    const apiUrl = `${backendUrl}${targetPath}`;

    // Forward the request to Python Backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const res = await fetch(apiUrl, {
      method: "POST",
      body: backendFormData,
      // Note: fetch with FormData automatically sets the Content-Type header with boundary
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error("Backend Error:", errorText);
      return NextResponse.json(
        { error: "Failed to process receipt with backend." },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}
