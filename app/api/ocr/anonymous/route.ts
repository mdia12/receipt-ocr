import { NextResponse } from "next/server";

export const runtime = "edge"; // rapide et compatible Vercel

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Determine Backend URL
    let backendUrl = "http://127.0.0.1:8000";
    if (process.env.VERCEL_URL) {
      backendUrl = `https://${process.env.VERCEL_URL}`;
    } else if (process.env.NEXT_PUBLIC_API_URL) {
      backendUrl = process.env.NEXT_PUBLIC_API_URL;
    }

    // Construct the target URL
    // In production, Vercel routes /api/py to the Python backend
    // In development, we target localhost:8000 directly
    const targetPath = process.env.NODE_ENV === "development" 
      ? "/anonymous/scan" 
      : "/api/py/anonymous/scan";
      
    const apiUrl = `${backendUrl}${targetPath}`;
    console.log("Proxying to:", apiUrl);

    // Forward headers to pass Vercel Authentication / Deployment Protection
    const headers = new Headers();
    request.headers.forEach((value, key) => {
      const lowerKey = key.toLowerCase();
      // Forward cookies and auth, but skip host/content-length/content-type
      if (!['host', 'content-length', 'content-type', 'connection'].includes(lowerKey)) {
        headers.set(key, value);
      }
    });

    // Forward to Python Backend
    const backendFormData = new FormData();
    backendFormData.append("file", file);

    const res = await fetch(apiUrl, {
      method: "POST",
      headers: headers,
      body: backendFormData,
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

    return NextResponse.json(data, { status: 200 });

  } catch (error) {
    console.error("Anonymous OCR error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
