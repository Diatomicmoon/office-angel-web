import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveCompanyIdOrThrow } from "@/lib/tenant";

export async function GET(req: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const url = new URL(req.url);
    const view = url.searchParams.get("view"); // 'unassigned' or 'assigned'
    const id = url.searchParams.get("id");
    const idsParam = url.searchParams.get("ids"); // comma-separated
    // In a real app we'd filter by date range, but for beta we'll just grab recent

    const base = supabase
      .from("jobs")
      .select("*, customers(first_name, last_name, phone_number)")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (id) {
      const { data, error } = await base.eq("id", id).limit(1);
      if (error) return NextResponse.json({ jobs: [], error: error.message }, { status: 400 });
      return NextResponse.json({ job: data?.[0] || null });
    }

    if (idsParam) {
      const ids = idsParam.split(",").map((s) => s.trim()).filter(Boolean);
      const { data, error } = await base.in("id", ids);
      if (error) return NextResponse.json({ jobs: [], error: error.message }, { status: 400 });
      return NextResponse.json({ jobs: data || [] });
    }

    // Prefer filtering by technician_id when the dispatch migration is present.
    // If the column doesn't exist yet, gracefully fall back to returning all jobs.
    let { data, error } = await (view === "unassigned"
      ? base.is("technician_id", null)
      : view === "assigned"
        ? base.not("technician_id", "is", null)
        : base);

    if (error && String(error.message || '').includes('technician_id')) {
      // Migration not applied yet.
      const res2 = await base;
      data = res2.data;
      error = res2.error;
    }

    if (error) return NextResponse.json({ jobs: [], error: error.message }, { status: 400 });

    return NextResponse.json({ jobs: data || [] });
  } catch (error: any) {
    return NextResponse.json({ jobs: [], error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const body = await req.json();

    // Important: on UPDATE, do not clobber existing fields with defaults.
    // Only apply defaults on INSERT.
    const isUpdate = Boolean(body.id);

    const payload: any = {
      company_id: companyId,
      customer_id: body.customer_id,
      title: body.title,
      ...(isUpdate ? {} : { status: body.status || "Lead" }),
      ...(isUpdate ? (body.status !== undefined ? { status: body.status } : {}) : {}),
      address: body.address,
      quoted_amount: body.quoted_amount,
      technician_id: body.technician_id,
      scheduled_start: body.scheduled_start,
      scheduled_end: body.scheduled_end,
      estimated_minutes: body.estimated_minutes,
      ...(isUpdate ? (body.priority !== undefined ? { priority: body.priority } : {}) : { priority: body.priority || "normal" }),
    };

    // Remove undefined
    for (const k of Object.keys(payload)) if (payload[k] === undefined) delete payload[k];

    if (body.id) {
      // Update
      const { data, error } = await supabase
        .from("jobs")
        .update(payload)
        .eq("id", body.id)
        .eq("company_id", companyId)
        .select()
        .single();
      
      if (error) throw error;

      // Best-effort: update technician live status when a job is booked/assigned.
      // This keeps the demo map/dispatch headers feeling alive even before GPS is wired.
      try {
        const techId = body.technician_id;
        if (techId) {
          const startIso = (body.scheduled_start || data.scheduled_start) as string | undefined;
          const endIso = (body.scheduled_end || data.scheduled_end) as string | undefined;
          const now = Date.now();
          const startMs = startIso ? new Date(startIso).getTime() : NaN;
          const endMs = endIso ? new Date(endIso).getTime() : NaN;
          let status = 'en_route';
          if (Number.isFinite(startMs) && Number.isFinite(endMs)) {
            if (now >= startMs && now <= endMs) status = 'on_site';
            else if (now < startMs) status = 'en_route';
            else status = 'available';
          }

          await supabase
            .from('technicians')
            .update({
              status,
              current_job_title: data.title || body.title || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', techId)
            .eq('company_id', companyId);
        }
      } catch {}

      return NextResponse.json({ job: data });
    } else {
      // Insert
      const { data, error } = await supabase
        .from("jobs")
        .insert([payload])
        .select()
        .single();

      if (error) throw error;

      // Best-effort: set technician status when inserting a booked job.
      try {
        const techId = body.technician_id;
        if (techId) {
          await supabase
            .from('technicians')
            .update({
              status: 'en_route',
              current_job_title: data.title || null,
              updated_at: new Date().toISOString(),
            })
            .eq('id', techId)
            .eq('company_id', companyId);
        }
      } catch {}

      return NextResponse.json({ job: data });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
