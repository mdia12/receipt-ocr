import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "pdf"; // pdf or excel

  // TODO: Generate signed URL for the requested file from storage

  // Mock response
  const downloadUrl = `https://example.com/downloads/${id}.${format}`;
  
  return NextResponse.json({
    id,
    format,
    downloadUrl
  });
}
