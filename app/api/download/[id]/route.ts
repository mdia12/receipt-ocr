import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "pdf"; // pdf or excel

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  try {
    // Get download URL from FastAPI backend
    // Assuming backend has GET /receipts/{id}/download?format={format}
    // returning { url: "https://..." }
    const backendResponse = await fetch(`${apiUrl}/receipts/${id}/download?format=${format}`);

    if (!backendResponse.ok) {
      return NextResponse.json({ error: "Failed to get download URL" }, { status: backendResponse.status });
    }

    const data = await backendResponse.json();
    
    return NextResponse.json({
      id,
      format,
      downloadUrl: data.url
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json({ error: "Failed to generate download link" }, { status: 500 });
  }
}
