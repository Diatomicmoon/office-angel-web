import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const url = new URL(req.url);
  const limit = Math.min(Number(url.searchParams.get("limit") || 50), 200);
  const status = url.searchParams.get("status") || undefined;

  let companyId = process.env.OFFICE_ANGEL_COMPANY_ID;
  if (!companyId) {
    const { data: c0 } = await supabase.from("companies").select("id").order("created_at", { ascending: true }).limit(1);
    companyId = c0?.[0]?.id;
  }
  if (!companyId) return NextResponse.json({ receipts: [] });

  let q = supabase
    .from("receipts")
    .select("id, company_id, job_id, supplier_name, total_amount, receipt_url, line_items, status, created_at")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (status) q = q.eq("status", status);

  const { data, error } = await q;
  if (error) return NextResponse.json({ receipts: [], error }, { status: 400 });
  return NextResponse.json({ receipts: data || [] });
}

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json().catch(() => ({}));

  let company_id = body.company_id as string | undefined;
  if (!company_id) company_id = process.env.OFFICE_ANGEL_COMPANY_ID;
  if (!company_id) {
    const { data: c0 } = await supabase.from("companies").select("id").order("created_at", { ascending: true }).limit(1);
    company_id = c0?.[0]?.id;
  }

  if (!company_id) return NextResponse.json({ error: "No company configured." }, { status: 400 });

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

  const { data, error } = await supabase.from("receipts").insert([payload]).select().single();
  if (error) return NextResponse.json({ error }, { status: 400 });

  return NextResponse.json({ receipt: data });
}
