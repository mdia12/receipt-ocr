import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

// Helper for API routes to verify admin access
export async function verifyAdminApi() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Unauthorized", status: 401, user: null };
  }

  let role = user.user_metadata?.role;
  if (!role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role;
  }

  if (role !== "admin") {
    return { error: "Forbidden: Admin access required", status: 403, user: null };
  }

  return { error: null, status: 200, user };
}

export async function logAdminAction(action: string, metadata: any = {}, adminEmail: string) {
  const supabase = await createClient();
  await supabase.from("admin_logs").insert({
    action,
    metadata,
    admin_email: adminEmail
  });
}
