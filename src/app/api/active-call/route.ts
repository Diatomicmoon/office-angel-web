import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

export async function GET() {
  let companyId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!companyId) return NextResponse.json({ active: null });

  // Look for a call_log with status 'incoming' very recently.
  // This is a lightweight “ringing right now” indicator, not a historical state.
  // Keep the window tight so stale rows don’t look like phantom calls.
  const cutoff = new Date(Date.now() - 60 * 1000).toISOString();
  const { data } = await sb()
    .from("call_logs")
    .select("id, meta, customers(id, first_name, last_name, phone_number, address, call_logs(id, summary, created_at))")
    .eq("company_id", companyId)
    .eq("call_status", "incoming")
    .gte("created_at", cutoff)
    .order("created_at", { ascending: false })
    .limit(1);

  const call = data?.[0];
  if (!call) return NextResponse.json({ active: null });

  const cust = Array.isArray(call.customers) ? call.customers[0] : call.customers;

  return NextResponse.json({
    active: {
      call_id: call.id,
      caller_name: call.meta?.lookup_name || null,
      phone: call.meta?.phone || null,
      address: cust?.address || null,
      customer: cust || null,
    },
  });
}

// Called by twilio-voice to register/clear active call
export async function POST(req: Request) {
  const body = await req.json();
  const { action, call_id } = body;

  if (action === "clear" && call_id) {
    await sb()
      .from("call_logs")
      .update({ call_status: "abandoned" })
      .eq("id", call_id)
      .eq("call_status", "incoming");
  }

  return NextResponse.json({ ok: true });
}
