import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

const apiBase = process.env.NEXT_PUBLIC_API_URL!;

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ connected: false });
    }

    // Call FastAPI backend with user_id param
    const res = await fetch(`${apiBase}/drive/status?user_id=${user.id}`, {
      cache: "no-store",
    });

    if (!res.ok) {
      console.error("Drive status backend error:", res.status, await res.text());
      return NextResponse.json({ connected: false }, { status: 200 });
    }

    const data = await res.json();
    return NextResponse.json({ connected: !!data.connected }, { status: 200 });
  } catch (error) {
    console.error("Drive status fetch error:", error);
    return NextResponse.json({ connected: false }, { status: 200 });
  }
}
