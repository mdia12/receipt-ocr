import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { ScanCompletedEmail } from '@/emails/ScanCompletedEmail';

export async function POST(request: Request) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  console.log("🚀 [API] Scan completed email route called");
  try {
    const body = await request.json();
    console.log("📦 [API] Request body received:", body);
    const { email, receiptName, amount, date } = body;

    if (!email) {
      console.warn("⚠️ [API] Email missing in body");
      return NextResponse.json({ status: "error", message: 'Email is required' }, { status: 400 });
    }

    console.log(`📧 [API] Attempting to send scan completed email to: ${email}`);
    const { data, error } = await resend.emails.send({
      from: 'NovaReceipt <support@support.novareceipt.com>',
      to: email,
      subject: 'Ton scan est terminé 🎉',
      react: ScanCompletedEmail({ email, receiptName, amount, date }),
    });

    if (error) {
      console.error('❌ [API] Resend error:', error);
      return NextResponse.json({ status: "error", message: error.message, details: error }, { status: 500 });
    }

    console.log("✅ [API] Email sent successfully:", data);
    return NextResponse.json({ status: "email_sent", data });
  } catch (error: any) {
    console.error('🔥 [API] Server error sending scan completed email:', error);
    return NextResponse.json({ status: "error", message: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
