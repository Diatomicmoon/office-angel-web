import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");

  let companyId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!companyId) return NextResponse.json({ customers: [] });

  if (id) {
    // Single customer + their call logs
    const { data: customer, error } = await sb()
      .from("customers")
      .select("*")
      .eq("id", id)
      .eq("company_id", companyId)
      .single();

    if (error || !customer) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const { data: calls } = await sb()
      .from("call_logs")
      .select("id, summary, urgency_flag, action_items, created_at, duration_seconds, meta, transcript, recording_url")
      .eq("customer_id", id)
      .order("created_at", { ascending: false });

    return NextResponse.json({ customer, calls: calls || [] });
  }

  // All customers with call count
  const { data, error } = await sb()
    .from("customers")
    .select("*, call_logs(id, urgency_flag, created_at, summary)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ customers: [], error }, { status: 400 });
  return NextResponse.json({ customers: data || [] });
}

export async function PATCH(req: Request) {
  const { id, property_notes, tags } = await req.json();
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const updates: any = {};
  if (property_notes !== undefined) updates.property_notes = property_notes;
  if (tags !== undefined) updates.tags = tags;

  const { error } = await sb().from("customers").update(updates).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
