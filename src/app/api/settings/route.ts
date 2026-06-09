import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

async function getCompanyId() {
  let companyId = process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID;
  if (!companyId) {
    const { data } = await sb().from("companies").select("id").order("created_at", { ascending: true }).limit(1);
    companyId = data?.[0]?.id;
  }
  return companyId;
}

export async function GET() {
  const companyId = await getCompanyId();
  if (!companyId) return NextResponse.json({ error: "No company" }, { status: 404 });

  const { data, error } = await sb()
    .from("companies")
    .select("id, name, phone_number, ai_enabled, forward_to_phone, schedule_start_minute, schedule_end_minute, webhook_secret, calendar_webhook_url, inbox_token, quickbooks_realm_id")
    .eq("id", companyId)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ settings: data });
}

export async function PATCH(req: Request) {
  const companyId = await getCompanyId();
  if (!companyId) return NextResponse.json({ error: "No company" }, { status: 404 });

  const body = await req.json();
  const allowed = ["ai_enabled", "forward_to_phone", "name", "schedule_start_minute", "schedule_end_minute", "calendar_webhook_url", "quickbooks_realm_id", "quickbooks_access_token", "quickbooks_refresh_token", "quickbooks_token_expires_at"];
  const updates: Record<string, any> = {};
  for (const key of allowed) {
    if (key in body) updates[key] = body[key];
  }

  const { error } = await sb().from("companies").update(updates).eq("id", companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}

export async function POST(req: Request) {
  // Rotate webhook secret (for website widget auth-tenant mode)
  const companyId = await getCompanyId();
  if (!companyId) return NextResponse.json({ error: "No company" }, { status: 404 });

  const secret = `oa_${Math.random().toString(36).slice(2)}_${Date.now().toString(36)}`;
  const { error } = await sb().from('companies').update({ webhook_secret: secret }).eq('id', companyId);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, webhook_secret: secret });
}
