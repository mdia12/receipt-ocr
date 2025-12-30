import { NextResponse } from "next/server";
import { Resend } from "resend";

export async function GET(req: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log("🚀 [API TEST] /api/email/test called");

  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");

  if (!email) {
    console.error("❌ [API TEST] Missing email parameter");
    return NextResponse.json(
      { status: "error", message: "Missing email parameter" },
      { status: 400 }
    );
  }

  console.log("📦 [API TEST] Email received:", email);

  try {
    console.log("📧 [API TEST] Attempting to send email...");

    const result = await resend.emails.send({
      from: "NovaReceipt <support@support.novareceipt.com>",
      to: email,
      subject: "Test Email NovaReceipt",
      html: "<h1>Test NovaReceipt</h1><p>Si tu vois ce message, Resend fonctionne !</p>",
    });

    console.log("✅ [API TEST] Email sent:", result);

    return NextResponse.json({ status: "email_sent", result });
  } catch (error: any) {
    console.error("❌ [API TEST] Error sending email:", error);

    return NextResponse.json(
      { status: "error", message: error.message || "Unknown error", details: error },
      { status: 500 }
    );
  }
}
