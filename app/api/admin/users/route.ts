import { verifyAdminApi, logAdminAction } from "@/lib/admin-api-helpers";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const adminCheck = await verifyAdminApi();
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const supabase = await createClient();

  // Fetch profiles
  const { data: profiles, error: dbError } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100);

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  // For each profile, get scan count
  const usersWithStats = await Promise.all(profiles.map(async (profile) => {
    const { count } = await supabase
      .from("jobs_processing")
      .select("*", { count: "exact", head: true })
      .eq("user_id", profile.id);

    return {
      ...profile,
      scan_count: count || 0,
      quota: 50 // Hardcoded for now
    };
  }));

  return NextResponse.json(usersWithStats);
}

export async function PATCH(request: Request) {
  const adminCheck = await verifyAdminApi();
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { userId, role } = await request.json();
  
  if (!userId || !role) {
    return NextResponse.json({ error: "Missing userId or role" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  await logAdminAction("update_user_role", { target_user_id: userId, new_role: role }, adminCheck.user.email!);

  return NextResponse.json({ success: true });
}
