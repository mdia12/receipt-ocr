import { verifyAdminApi, logAdminAction } from "@/lib/admin-api-helpers";
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";
import crypto from "crypto";

export async function GET() {
  const adminCheck = await verifyAdminApi();
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const supabase = await createClient();
  const { data: keys } = await supabase
    .from("api_keys")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json(keys);
}

export async function POST(request: Request) {
  const adminCheck = await verifyAdminApi();
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { userId, name } = await request.json();
  if (!userId || !name) {
    return NextResponse.json({ error: "Missing userId or name" }, { status: 400 });
  }

  // Generate Key
  const rawKey = `sk_live_${crypto.randomBytes(24).toString("hex")}`;
  const keyHash = crypto.createHash("sha256").update(rawKey).digest("hex");
  const maskedKey = `${rawKey.substring(0, 8)}...${rawKey.substring(rawKey.length - 4)}`;

  const supabase = await createClient();
  const { data, error: dbError } = await supabase
    .from("api_keys")
    .insert({
      user_id: userId,
      name,
      key_hash: keyHash,
      masked_key: maskedKey,
      is_active: true
    })
    .select()
    .single();

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 });

  await logAdminAction("create_api_key", { key_id: data.id, target_user_id: userId }, adminCheck.user.email);

  // Return the RAW key only once!
  return NextResponse.json({ ...data, rawKey });
}

export async function DELETE(request: Request) {
  const adminCheck = await verifyAdminApi();
  if (adminCheck.error) {
    return NextResponse.json({ error: adminCheck.error }, { status: adminCheck.status });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const supabase = await createClient();
  await supabase.from("api_keys").delete().eq("id", id);

  await logAdminAction("revoke_api_key", { key_id: id }, adminCheck.user.email);

  return NextResponse.json({ success: true });
}
