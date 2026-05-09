import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function deriveUrgency(text?: string) {
  const s = (text || '').toLowerCase();
  if (s.match(/(emergency|sparking|spark|fire|smoke|smoking|burning smell|burning|burn|arcing|arc|shock|electrocution|power out|no power|flood)/)) return 'high';
  if (s.match(/(breaker tripping|tripping|flicker|panel upgrade|estimate|quote|outlet|power loss|outage)/)) return 'medium';
  return 'low';
}

function heuristicDurationMinutes(text: string) {
  const s = (text || '').toLowerCase();
  if (s.match(/(burning|smoke|sparking|arcing|fire|no power|power out|outage)/)) return 120;
  if (s.match(/(panel upgrade|service upgrade|200a|100a|service change)/)) return 480;
  if (s.match(/(ev charger|tesla|charger)/)) return 240;
  if (s.match(/(recessed|can light|lighting install|fixtures)/)) return 180;
  if (s.match(/(breaker tripping|tripping)/)) return 120;
  return 90;
}

function roundUpToNextSlot(d: Date, slotMinutes = 30) {
  const ms = d.getTime();
  const slotMs = slotMinutes * 60 * 1000;
  return new Date(Math.ceil(ms / slotMs) * slotMs);
}

function suggestStartTime(urgencyFlag: string) {
  const bufferMin = urgencyFlag === 'high' ? 0 : urgencyFlag === 'medium' ? 60 : 180;
  return roundUpToNextSlot(new Date(Date.now() + bufferMin * 60000), 30);
}

function twiml(message?: string) {
  const body = message ? `<Message>${String(message).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')}</Message>` : '';
  return `<?xml version="1.0" encoding="UTF-8"?><Response>${body}</Response>`;
}

function normalizeBody(s: string) {
  return (s || '').trim().replace(/\s+/g, ' ');
}

function isYes(s: string) {
  return /^(yes|yep|yeah|yup|confirm|confirmed|ok|okay)\b/i.test(s);
}

function isNo(s: string) {
  return /^(no|nope|nah|can't|cant|cannot|reschedule|change)\b/i.test(s);
}

export async function POST(req: Request) {
  try {
    const url = new URL(req.url);
    const debug = url.searchParams.get('debug') === '1';

    const form = await req.formData();
    const from = String(form.get('From') || '');
    const to = String(form.get('To') || '');
    const body = String(form.get('Body') || '');
    const bodyNorm = normalizeBody(body);

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Resolve company.
    // - In pinned-tenant mode, ALWAYS use OFFICE_ANGEL_COMPANY_ID (so inbound matches what the app is showing).
    // - In auth tenant mode, map by inbound "To" number.
    let companyId: string | null = null;

    const tenantMode = process.env.OFFICE_ANGEL_TENANT_MODE;
    if (tenantMode !== 'auth') {
      companyId = process.env.OFFICE_ANGEL_COMPANY_ID || null;
    } else if (to) {
      const { data } = await supabase.from('companies').select('id').eq('phone_number', to).limit(1);
      companyId = data?.[0]?.id || null;
    }

    if (!companyId) companyId = process.env.OFFICE_ANGEL_COMPANY_ID || null;
    if (!companyId) {
      const { data: c0 } = await supabase.from('companies').select('id').order('created_at', { ascending: true }).limit(1);
      companyId = c0?.[0]?.id || null;
    }
    if (!companyId) {
      return new NextResponse(twiml('Office Angel is not configured yet.'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    let debugErr: string | null = null;
    let jobIdForMessage: string | null = null;

    // If the messages table exists, prefer it over stuffing SMS into jobs.notes.
    // (jobs.notes remains as a fallback for older DBs.)
    let messagesTableOk = false;
    try {
      const probe = await supabase.from('messages').select('id').limit(1);
      messagesTableOk = !probe.error;
    } catch {
      messagesTableOk = false;
    }

    // Upsert customer by phone
    let customerId: string | null = null;
    if (from) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id')
        .eq('company_id', companyId)
        .eq('phone_number', from)
        .maybeSingle();

      if (existing?.id) {
        customerId = existing.id;
      } else {
        const { data: created } = await supabase
          .from('customers')
          .insert([{ company_id: companyId, phone_number: from, first_name: 'New', last_name: 'Caller' }])
          .select('id')
          .single();
        customerId = created?.id || null;
      }
    }

    const urgencyFlag = deriveUrgency(body);
    const estimatedMinutes = heuristicDurationMinutes(body);
    const title = urgencyFlag === 'high' ? 'Emergency Text Message' : 'Inbound Text Message';
    const suggestedStart = suggestStartTime(urgencyFlag);
    const suggestedEnd = new Date(suggestedStart.getTime() + estimatedMinutes * 60000);

    // 0) Handle confirmation replies (YES/NO) for the most recent scheduled job.
    // This keeps the workflow dead-simple for customers.
    if (customerId && (isYes(bodyNorm) || isNo(bodyNorm))) {
      const cutoff = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();
      let recentScheduled: any[] | null = null;
      {
        const q0 = await supabase
          .from('jobs')
          .select('id, status, scheduled_start, scheduled_end, created_at, updated_at')
          .eq('company_id', companyId)
          .eq('customer_id', customerId)
          .gte('created_at', cutoff)
          .order('updated_at', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(10);

        if (q0.error && String(q0.error.message || '').includes('updated_at')) {
          const q1 = await supabase
            .from('jobs')
            .select('id, status, scheduled_start, scheduled_end, created_at')
            .eq('company_id', companyId)
            .eq('customer_id', customerId)
            .gte('created_at', cutoff)
            .order('created_at', { ascending: false })
            .limit(10);
          recentScheduled = q1.data as any;
        } else {
          recentScheduled = q0.data as any;
        }
      }

      const target = (recentScheduled || []).find((j: any) => {
        const st = String(j.status || '').toLowerCase();
        return st === 'scheduled' || st === 'confirmed' || st.includes('reschedule');
      }) as any;

      if (target?.id) {
        if (isYes(bodyNorm)) {
          const upd1 = await supabase.from('jobs').update({
            confirmation_status: 'confirmed',
            confirmed_at: new Date().toISOString(),
            status: 'Confirmed',
            updated_at: new Date().toISOString(),
          } as any).eq('id', target.id);

          // If confirmation columns aren't migrated yet, still flip status.
          if (upd1.error && String(upd1.error.message || '').match(/confirmation_status|confirmed_at/)) {
            await supabase.from('jobs').update({
              status: 'Confirmed',
              updated_at: new Date().toISOString(),
            } as any).eq('id', target.id);
          }

          try {
            await supabase.from('messages').insert([
              {
                company_id: companyId,
                customer_id: customerId,
                job_id: target.id,
                channel: 'sms',
                direction: 'inbound',
                from_value: from || null,
                to_value: to || null,
                body: bodyNorm,
                meta: { kind: 'confirm_yes' },
              } as any,
            ]);
          } catch {}

          return new NextResponse(
            twiml('Perfect — you’re confirmed. See you then.'),
            { status: 200, headers: { 'Content-Type': 'text/xml' } }
          );
        }

        const upd2 = await supabase.from('jobs').update({
          confirmation_status: 'reschedule_requested',
          reschedule_requested_at: new Date().toISOString(),
          status: 'Reschedule Requested',
          updated_at: new Date().toISOString(),
        } as any).eq('id', target.id);

        if (upd2.error && String(upd2.error.message || '').match(/confirmation_status|reschedule_requested_at/)) {
          await supabase.from('jobs').update({
            status: 'Reschedule Requested',
            updated_at: new Date().toISOString(),
          } as any).eq('id', target.id);
        }

        try {
          await supabase.from('messages').insert([
            {
              company_id: companyId,
              customer_id: customerId,
              job_id: target.id,
              channel: 'sms',
              direction: 'inbound',
              from_value: from || null,
              to_value: to || null,
              body: bodyNorm,
              meta: { kind: 'confirm_no' },
            } as any,
          ]);
        } catch {}

        return new NextResponse(
          twiml("No problem — reply with a new time window that works (example: 'tomorrow 9-11am')."),
          { status: 200, headers: { 'Content-Type': 'text/xml' } }
        );
      }
      // If we can't find a target job, fall through to normal job creation.
    }

    // De-dupe: if the customer is already mid-conversation, update the most recent Lead job instead of creating new jobs.
    let updatedExisting = false;
    let existingJobId: string | null = null;
    if (customerId) {
      const cutoff = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      const { data: recent } = await supabase
        .from('jobs')
        .select('id, notes, status, created_at')
        .eq('company_id', companyId)
        .eq('customer_id', customerId)
        .gte('created_at', cutoff)
        .order('created_at', { ascending: false })
        .limit(1);

      const r0 = recent?.[0];
      if (r0?.id && String(r0.status || '').toLowerCase() === 'lead') {
        existingJobId = r0.id;
        const updatePayload: any = {
          updated_at: new Date().toISOString(),
        };
        if (!messagesTableOk) {
          const nextNotes = [r0.notes, `SMS from ${from}: ${body}`].filter(Boolean).join('\n\n');
          updatePayload.notes = nextNotes;
        }

        const upd = await supabase.from('jobs').update(updatePayload).eq('id', r0.id);

        if (!upd.error) {
          updatedExisting = true;
        } else {
          // If the table doesn't have notes/updated_at yet, fall back to creating a new job.
          console.error('[INBOUND SMS] Could not update existing lead job:', upd.error);
          debugErr = debugErr || String(upd.error.message || upd.error);
        }
      }
    }

    jobIdForMessage = updatedExisting ? existingJobId : null;

    if (!updatedExisting) {
      // Create job (drops into AI Parking Lot because technician_id is null)
      const insertPayload: any = {
        company_id: companyId,
        customer_id: customerId,
        title,
        status: 'Lead',
        priority: urgencyFlag === 'high' ? 'high' : urgencyFlag === 'low' ? 'low' : 'normal',
        estimated_minutes: estimatedMinutes,
        scheduled_start: suggestedStart.toISOString(),
        scheduled_end: suggestedEnd.toISOString(),
        ...(messagesTableOk ? {} : { notes: body || null }),
      };

      const ins = await supabase.from('jobs').insert([insertPayload]).select('id').single();
      if (ins.error && String(ins.error.message || '').includes('notes')) {
        delete insertPayload.notes;
        const ins2 = await supabase.from('jobs').insert([insertPayload]).select('id').single();
        if (ins2.error) debugErr = debugErr || String(ins2.error.message || ins2.error);
        jobIdForMessage = (ins2.data as any)?.id || null;
      } else {
        if (ins.error) debugErr = debugErr || String(ins.error.message || ins.error);
        jobIdForMessage = ((ins.data as any)?.id as string) || null;
      }
    }

    // Best-effort: store the message in messages table (scalable history).
    // If the table doesn't exist yet, ignore errors.
    try {
      const minsert = await supabase.from('messages').insert([
        {
          company_id: companyId,
          customer_id: customerId,
          job_id: jobIdForMessage,
          channel: 'sms',
          direction: 'inbound',
          from_value: from || null,
          to_value: to || null,
          body: body || null,
          meta: { raw: { From: from, To: to } },
        } as any,
      ]);
      if (minsert.error) debugErr = debugErr || String(minsert.error.message || minsert.error);
    } catch {}

    const reply = debug
      ? `DEBUG ok. companyId=${companyId} customerId=${customerId || 'null'} jobId=${jobIdForMessage || 'null'} updatedExisting=${updatedExisting} err=${debugErr || 'none'}`
      : "Got it — we’re logging your request now. Reply with: Name, Address, Best time window, and what’s going on. Example: 'Jordan, 123 Main St, today 3-5pm, breaker keeps tripping.' If this is an emergency, call 911.";

    return new NextResponse(twiml(reply), { status: 200, headers: { 'Content-Type': 'text/xml' } });
  } catch (e) {
    console.error('[INBOUND SMS] error', e);
    return new NextResponse(twiml(), { status: 200, headers: { 'Content-Type': 'text/xml' } });
  }
}
