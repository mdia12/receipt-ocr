export async function sendWelcomeEmail(email: string): Promise<void> {
  console.log(`🚀 [Frontend] Calling welcome email API for: ${email}`);
  try {
    // Determine base URL
    let baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    
    // Handle Vercel preview/production URLs if NEXT_PUBLIC_APP_URL is not set
    if (process.env.VERCEL_URL && !process.env.NEXT_PUBLIC_APP_URL) {
      baseUrl = `https://${process.env.VERCEL_URL}`;
    }

    // Ensure we don't have double slashes if baseUrl ends with /
    baseUrl = baseUrl.replace(/\/$/, '');

    const url = `${baseUrl}/api/email/welcome`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ [Frontend] Email API failed. Status: ${response.status}. Body: ${text}`);
    } else {
      const res = await response.json();
      console.log("✅ [Frontend] Email API response:", res);
    }
  } catch (error) {
    console.error('🔥 [Frontend] Error calling welcome email API:', error);
  }
}
