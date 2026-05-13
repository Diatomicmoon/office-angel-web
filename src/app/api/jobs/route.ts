export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { resolveCompanyIdOrThrow } from "@/lib/tenant";
import twilio from "twilio";

const DISPLAY_TZ = "America/Chicago";

function fmtTimeRange(startIso?: string | null, endIso?: string | null) {
  if (!startIso) return null;
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return null;
  const startStr = start.toLocaleString([], {
    timeZone: DISPLAY_TZ,
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  if (!endIso) return startStr;
  const end = new Date(endIso);
  if (Number.isNaN(end.getTime())) return startStr;
  const endStr = end.toLocaleTimeString([], {
    timeZone: DISPLAY_TZ,
    hour: "numeric",
    minute: "2-digit",
  });
  return `${startStr}–${endStr}`;
}

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

    // Prefer most-recent activity ordering when available.
    // If updated_at doesn't exist yet in this Supabase project, fall back to created_at.
    let base = supabase
      .from("jobs")
      .select("*, customers(first_name, last_name, phone_number)")
      .eq("company_id", companyId)
      .order("updated_at", { ascending: false })
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
    // If updated_at ordering isn't migrated yet, gracefully fall back.
    let data: any = null;
    let error: any = null;

    const run = async (q: any) => {
      const res = await q;
      data = res.data;
      error = res.error;
    };

    const q0 = (view === "unassigned"
      ? base.is("technician_id", null)
      : view === "assigned"
        ? base.not("technician_id", "is", null)
        : base);

    await run(q0);

    if (error && String(error.message || '').includes('updated_at')) {
      // updated_at column not migrated yet.
      const base2 = supabase
        .from("jobs")
        .select("*, customers(first_name, last_name, phone_number)")
        .eq("company_id", companyId)
        .order("created_at", { ascending: false });

      const q1 = (view === "unassigned"
        ? base2.is("technician_id", null)
        : view === "assigned"
          ? base2.not("technician_id", "is", null)
          : base2);
      await run(q1);
    }

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
      // Fetch "before" so we can detect first-time booking (for SMS confirmations).
      const { data: before } = await supabase
        .from("jobs")
        .select("id, technician_id, customer_id, scheduled_start, scheduled_end, status")
        .eq("id", body.id)
        .eq("company_id", companyId)
        .maybeSingle();

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

      // Best-effort: send customer SMS confirmation when a job is booked for the first time.
      try {
        const wasUnassigned = !before?.technician_id;
        const nowAssigned = Boolean(data?.technician_id);
        const nowScheduled = String(data?.status || "").toLowerCase() === "scheduled";

        if (wasUnassigned && nowAssigned && nowScheduled && data?.customer_id) {
          const { data: company } = await supabase
            .from("companies")
            .select("id, name, phone_number, sms_booking_confirmation_enabled, twilio_subaccount_sid, twilio_messaging_service_sid")
            .eq("id", companyId)
            .maybeSingle();

          if (company?.sms_booking_confirmation_enabled !== false && company?.phone_number) {
            const { data: cust } = await supabase
              .from("customers")
              .select("id, first_name, phone_number")
              .eq("id", data.customer_id)
              .eq("company_id", companyId)
              .maybeSingle();

            const toPhone = cust?.phone_number;
            if (toPhone && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
              const when = fmtTimeRange(data.scheduled_start, data.scheduled_end) || "your scheduled time";
              const who = cust?.first_name && cust.first_name !== "New" ? cust.first_name : "there";
              const fromPhone = company.phone_number;
              const bodyText = `Hi ${who} — you're scheduled for ${when}. Reply YES to confirm or NO to reschedule.`;

              const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
              const acct = company.twilio_subaccount_sid || process.env.TWILIO_ACCOUNT_SID;

              const msg = await client.api.accounts(acct).messages.create({
                to: toPhone,
                ...(company.twilio_messaging_service_sid
                  ? { messagingServiceSid: company.twilio_messaging_service_sid }
                  : { from: fromPhone }),
                body: bodyText,
              });

              // Best-effort: log outbound message
              try {
                await supabase.from("messages").insert([
                  {
                    company_id: companyId,
                    customer_id: data.customer_id,
                    job_id: data.id,
                    channel: "sms",
                    direction: "outbound",
                    from_value: fromPhone,
                    to_value: toPhone,
                    body: bodyText,
                    meta: { twilio: { sid: msg.sid } },
                  } as any,
                ]);
              } catch {}
            }
          }
        }
      } catch {}

      // Best-effort: Calendar webhook (Zapier/Make → Google Calendar)
      try {
        const { data: company } = await supabase
          .from('companies')
          .select('calendar_webhook_url, name')
          .eq('id', companyId)
          .maybeSingle();

        const hook = (company as any)?.calendar_webhook_url as string | undefined;
        if (hook) {
          await fetch(hook, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              event: 'job.scheduled',
              company_id: companyId,
              company_name: (company as any)?.name || null,
              job_id: data.id,
              customer_id: data.customer_id,
              technician_id: data.technician_id,
              title: data.title,
              address: data.address,
              scheduled_start: data.scheduled_start,
              scheduled_end: data.scheduled_end,
              status: data.status,
              priority: data.priority,
              estimated_minutes: data.estimated_minutes,
              created_at: data.created_at,
              updated_at: data.updated_at,
            }),
          }).catch(() => {});
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
