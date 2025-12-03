import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // TODO: Upload file to Supabase Storage or S3
    // TODO: Call FastAPI backend to start OCR job

    // Mock response
    const jobId = "job_" + Math.random().toString(36).substring(7);
    
    return NextResponse.json({ 
      success: true, 
      jobId,
      message: "File uploaded and processing started" 
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
