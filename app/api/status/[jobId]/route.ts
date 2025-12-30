import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  try {
    // Check status from FastAPI backend
    // Assuming backend has GET /status/{jobId}
    const backendResponse = await fetch(`${apiUrl}/status/${jobId}`);

    if (!backendResponse.ok) {
      if (backendResponse.status === 404) {
        return NextResponse.json({ error: "Job not found" }, { status: 404 });
      }
      throw new Error("Failed to fetch job status");
    }

    const data = await backendResponse.json();
    
    // Assuming backend returns { status: "processing" | "completed" | "failed", ... }
    return NextResponse.json(data);
  } catch (error) {
    console.error("Status check error:", error);
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 });
  }
}
