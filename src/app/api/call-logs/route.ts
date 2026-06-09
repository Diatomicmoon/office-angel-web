export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") || "").trim();
  const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);

  // Scope to company
  let companyId = process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID;
  if (!companyId) {
    const { data: c0 } = await supabase.from("companies").select("id").order("created_at", { ascending: true }).limit(1);
    companyId = c0?.[0]?.id;
  }

  if (!companyId) return NextResponse.json({ calls: [] });

  let query = supabase
    .from("call_logs")
    .select("id, company_id, customer_id, call_status, duration_seconds, transcript, summary, urgency_flag, action_items, recording_url, meta, created_at, customers(*)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (q) {
    // Basic text search across summary + action_items.
    // (Foreign table filters in OR can be finicky; keep this reliable.)
    query = query.or(
      `summary.ilike.%${q}%,action_items.ilike.%${q}%`
    );
  }

  let { data, error } = await query;
  if (error && q) {
    // Fallback: run without OR filter if PostgREST rejects the expression.
    const retry = await supabase
      .from("call_logs")
      .select("id, company_id, customer_id, call_status, duration_seconds, transcript, summary, urgency_flag, action_items, recording_url, meta, created_at, customers(*)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false })
      .limit(limit);
    data = retry.data;
    error = retry.error;
  }

  if (error) return NextResponse.json({ calls: [], error }, { status: 400 });

  return NextResponse.json({ calls: data || [] });
}
