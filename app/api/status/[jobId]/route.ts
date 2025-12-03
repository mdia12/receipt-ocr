import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  const { jobId } = await params;

  // TODO: Check status from database or FastAPI backend
  
  // Mock response
  const status = Math.random() > 0.5 ? "completed" : "processing";
  
  return NextResponse.json({
    jobId,
    status,
    progress: status === "completed" ? 100 : 50
  });
}
