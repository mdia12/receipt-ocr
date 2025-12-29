import { NextResponse } from "next/server";
import { testVisionConnection } from "@/lib/ocr";

export async function GET() {
  const isConnected = await testVisionConnection();
  if (isConnected) {
    return NextResponse.json({ status: "ok", message: "VISION API REACHABLE" });
  } else {
    return NextResponse.json({ status: "error", message: "VISION API UNREACHABLE" }, { status: 500 });
  }
}
