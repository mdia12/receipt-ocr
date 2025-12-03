import { NextResponse } from "next/server";

export async function GET() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return NextResponse.json({ error: "Configuration error" }, { status: 500 });
  }

  try {
    const backendResponse = await fetch(`${apiUrl}/receipts?limit=100`, {
      cache: "no-store"
    });

    if (!backendResponse.ok) {
      throw new Error("Failed to fetch receipts");
    }

    const data = await backendResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Receipts fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch receipts" }, { status: 500 });
  }
}
