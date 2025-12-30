import { verifyAdminApi } from "@/lib/admin-api-helpers";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const adminCheck = await verifyAdminApi();
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const supabase = await createClient();

  // 1. Total Users
  const { count: totalUsers } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  // 2. Total Scans (Jobs)
  const { count: totalScans } = await supabase
    .from("jobs_processing")
    .select("*", { count: "exact", head: true });

  // 3. Active Users (Last 30 days) - Proxy: users who created a job in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data: activeUserIds } = await supabase
    .from("jobs_processing")
    .select("user_id")
    .gte("created_at", thirtyDaysAgo.toISOString());
    
  const activeUsers = new Set(activeUserIds?.map(j => j.user_id)).size;

  // 4. API Tokens
  const { count: totalTokens } = await supabase
    .from("api_keys")
    .select("*", { count: "exact", head: true });

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    totalScans: totalScans || 0,
    activeUsers: activeUsers || 0,
    totalTokens: totalTokens || 0
  });
}
