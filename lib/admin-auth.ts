import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function requireAdmin() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return { error: "Unauthorized", status: 401, user: null };
  }

  // Check role in metadata (fastest)
  let role = user.user_metadata?.role;

  // Double check in DB if not in metadata (safety net)
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

export async function logAdminAction(action: string, metadata: any = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (user) {
    await supabase.from("admin_logs").insert({
      action,
      metadata,
      admin_email: user.email
    });
  }
}
