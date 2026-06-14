import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);
  const status = url.searchParams.get("status") || undefined;
  const jobId = url.searchParams.get("job_id") || undefined;

  let companyId;
  try {
    const res = await resolveCompanyIdOrThrow();
    companyId = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let q = supabase
    .from("receipts")
    .select("id, company_id, job_id, supplier_name, total_amount, receipt_url, line_items, status, created_at, jobs(title)")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) q = q.eq("status", status);
  if (jobId) q = q.eq("job_id", jobId);

  const { data, error } = await q;
  if (error) return NextResponse.json({ receipts: [], error }, { status: 400 });
  return NextResponse.json({ receipts: data || [] });
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

  const body = await req.json().catch(() => ({}));

  let company_id;
  try {
    const res = await resolveCompanyIdOrThrow();
    company_id = res.companyId;
  } catch (err) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload: any = {
    company_id,
    job_id: body.job_id,
    supplier_name: body.supplier_name,
    total_amount: body.total_amount,
    receipt_url: body.receipt_url,
    line_items: body.line_items,
    status: body.status || "Action Required",
  };

  for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k];

  // If an id is provided, treat as a status update (PATCH-style via POST)
  if (body.id && body.status && Object.keys(body).length <= 2) {
    const { data, error } = await supabase
      .from("receipts")
      .update({ status: body.status })
      .eq("id", body.id)
      .select()
      .single();
    if (error) return NextResponse.json({ error }, { status: 400 });
    return NextResponse.json({ receipt: data });
  }

  const { data, error } = await supabase.from("receipts").insert([payload]).select().single();
  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ receipt: data });
}
