import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { DriveConnectedEmail } from '@/emails/DriveConnectedEmail';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'NovaReceipt <support@support.novareceipt.com>',
      to: email,
      subject: 'Google Drive est bien connecté ✅',
      react: DriveConnectedEmail({ email }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Server error sending drive connected email:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
