import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const DISPLAY_TZ = 'America/Chicago';

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

function clampToBusinessHours(d: Date, scheduleStartMin: number, scheduleEndMin: number) {
  const p = tzParts(d, DISPLAY_TZ);
  const localMin = p.h * 60 + p.mi;

  const setLocal = (y: number, mo: number, day: number, minuteOfDay: number) => {
    const h = Math.floor(minuteOfDay / 60);
    const mi = minuteOfDay % 60;
    const utc = zonedTimeToUtcMs({ y, mo, day, h, mi, timeZone: DISPLAY_TZ });
    return new Date(utc);
  };

  if (localMin < scheduleStartMin) return setLocal(p.y, p.mo, p.day, scheduleStartMin);
  if (localMin >= scheduleEndMin) {
    const tomorrow = tzParts(new Date(d.getTime() + 24 * 60 * 60 * 1000), DISPLAY_TZ);
    return setLocal(tomorrow.y, tomorrow.mo, tomorrow.day, scheduleStartMin);
  }
  return d;
}

function suggestStartTime(urgencyFlag: string, scheduleStartMin: number, scheduleEndMin: number) {
  const bufferMin = urgencyFlag === 'high' ? 0 : urgencyFlag === 'medium' ? 60 : 180;
  let dt = new Date(Date.now() + bufferMin * 60000);
  dt = clampToBusinessHours(dt, scheduleStartMin, scheduleEndMin);
  dt = roundUpToNextSlot(dt, 30);
  // If rounding pushed us past end, bump to next day start.
  dt = clampToBusinessHours(dt, scheduleStartMin, scheduleEndMin);
  return dt;
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

function tzParts(d: Date, timeZone: string): { y: number; mo: number; day: number; h: number; mi: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get('year'), mo: get('month'), day: get('day'), h: get('hour'), mi: get('minute') };
}

function zonedTimeToUtcMs({ y, mo, day, h, mi, timeZone }: { y: number; mo: number; day: number; h: number; mi: number; timeZone: string }) {
  // Iteratively adjust a UTC guess until it formats to the desired local time in the timezone.
  let guess = Date.UTC(y, mo - 1, day, h, mi, 0);
  for (let i = 0; i < 4; i++) {
    const p = tzParts(new Date(guess), timeZone);
    const desired = Date.UTC(y, mo - 1, day, h, mi, 0);
    const got = Date.UTC(p.y, p.mo - 1, p.day, p.h, p.mi, 0);
    const delta = desired - got;
    if (Math.abs(delta) < 60000) break;
    guess += delta;
  }
  return guess;
}

function parseTimeWindow(text: string): { startIso: string; endIso: string } | null {
  const s = (text || '').toLowerCase();

  // Require an explicit day hint for safety.
  let dayOffset: number | null = null;
  if (s.includes('tomorrow')) dayOffset = 1;
  else if (s.includes('today')) dayOffset = 0;
  else return null;

  // Range like 9-11am, 3:30-5pm, 9 to 11
  const m = s.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\s*(?:-|to|–)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/);
  if (!m) return null;

  let sh = Number(m[1]);
  let sm = Number(m[2] || '0');
  let sap = (m[3] || '').toLowerCase();
  let eh = Number(m[4]);
  let em = Number(m[5] || '0');
  let eap = (m[6] || '').toLowerCase();

  // Need am/pm at least once.
  if (!sap && !eap) return null;
  if (!sap && eap) sap = eap;
  if (!eap && sap) eap = sap;

  const to24 = (h: number, ap: string) => {
    let out = h % 12;
    if (ap === 'pm') out += 12;
    return out;
  };

  sh = to24(sh, sap);
  eh = to24(eh, eap);

  const now = new Date();
  const base = tzParts(now, DISPLAY_TZ);
  const targetDay = new Date(Date.UTC(base.y, base.mo - 1, base.day));
  targetDay.setUTCDate(targetDay.getUTCDate() + (dayOffset || 0));

  const y = targetDay.getUTCFullYear();
  const mo = targetDay.getUTCMonth() + 1;
  const day = targetDay.getUTCDate();

  const startUtc = zonedTimeToUtcMs({ y, mo, day, h: sh, mi: sm, timeZone: DISPLAY_TZ });
  const endUtc = zonedTimeToUtcMs({ y, mo, day, h: eh, mi: em, timeZone: DISPLAY_TZ });

  if (!Number.isFinite(startUtc) || !Number.isFinite(endUtc) || endUtc <= startUtc) return null;
  return { startIso: new Date(startUtc).toISOString(), endIso: new Date(endUtc).toISOString() };
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
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    // MMS Receipt Interception
    const numMedia = Number(form.get('NumMedia') || '0');
    if (numMedia > 0) {
      const mediaUrl = String(form.get('MediaUrl0') || '');
      const mediaContentType = String(form.get('MediaContentType0') || 'image/jpeg');
      
      if (mediaUrl && mediaContentType.startsWith('image/')) {
        try {
          const imgRes = await fetch(mediaUrl);
          const imgBuffer = await imgRes.arrayBuffer();
          
          const fileName = `${Date.now()}_${from.replace(/\D/g,'')}.jpg`;
          
          const { data: uploadData, error: uploadErr } = await supabase.storage
            .from('receipts')
            .upload(fileName, imgBuffer, { contentType: mediaContentType });
            
          if (!uploadErr && uploadData) {
            const { data: publicUrlData } = supabase.storage.from('receipts').getPublicUrl(fileName);
            const finalUrl = publicUrlData.publicUrl;
            
            const baseUrl = req.url.split('/api/')[0];
            // Fire and forget to our receipts ingestion endpoint
            fetch(`${baseUrl}/api/receipts-inbound`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                from: from,
                to: to,
                subject: `SMS Receipt from ${from}`,
                text: body,
                imageUrl: finalUrl
              })
            }).catch(e => console.error("[INBOUND SMS] Error forwarding MMS to receipts:", e));
            
            return new NextResponse(twiml("Receipt image received! We are analyzing it now and adding it to your Material Cost Engine."), { status: 200, headers: { 'Content-Type': 'text/xml' } });
          }
        } catch (e) {
          console.error("[INBOUND SMS] Failed to process MMS receipt", e);
        }
      }
    }

    // Resolve company.
    // - In pinned-tenant mode, ALWAYS use OFFICE_ANGEL_COMPANY_ID (so inbound matches what the app is showing).
    // - In auth tenant mode, map by inbound "To" number.
    let companyId: string | null = null;

    const tenantMode = process.env.HARD_HAT_TENANT_MODE || process.env.OFFICE_ANGEL_TENANT_MODE;
    if (tenantMode !== 'auth') {
      companyId = process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID || null;
    } else if (to) {
      const { data } = await supabase.from('companies').select('id').eq('phone_number', to).limit(1);
      companyId = data?.[0]?.id || null;
    }

    if (!companyId) companyId = process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID || null;
    if (!companyId) {
      const { data: c0 } = await supabase.from('companies').select('id').order('created_at', { ascending: true }).limit(1);
      companyId = c0?.[0]?.id || null;
    }
    if (!companyId) {
      return new NextResponse(twiml('Hard Hat Solutions is not configured yet.'), {
        status: 200,
        headers: { 'Content-Type': 'text/xml' },
      });
    }

    // Load per-company scheduling rules (fallback to 8–5).
    const { data: companySettings } = await supabase
      .from('companies')
      .select('schedule_start_minute, schedule_end_minute, sms_auto_reply_enabled')
      .eq('id', companyId)
      .maybeSingle();

    const scheduleStartMin = typeof (companySettings as any)?.schedule_start_minute === 'number'
      ? Number((companySettings as any).schedule_start_minute)
      : 480;
    const scheduleEndMin = typeof (companySettings as any)?.schedule_end_minute === 'number'
      ? Number((companySettings as any).schedule_end_minute)
      : 1020;

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
    const suggestedStart = suggestStartTime(urgencyFlag, scheduleStartMin, scheduleEndMin);
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
          // Kick it back to Parking Lot
          technician_id: null,
          scheduled_start: null,
          scheduled_end: null,
          updated_at: new Date().toISOString(),
        } as any).eq('id', target.id);

        if (upd2.error && String(upd2.error.message || '').match(/confirmation_status|reschedule_requested_at/)) {
          await supabase.from('jobs').update({
            status: 'Reschedule Requested',
            technician_id: null,
            scheduled_start: null,
            scheduled_end: null,
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
      const status0 = String(r0?.status || '').toLowerCase();
      if (r0?.id && (status0 === 'lead' || status0.includes('reschedule'))) {
        existingJobId = r0.id;
        const updatePayload: any = {
          updated_at: new Date().toISOString(),
        };

        // If the customer text contains a reschedule window, store it on the job so dispatch can 1-click book.
        const win = parseTimeWindow(bodyNorm);
        if (win) {
          const start0 = clampToBusinessHours(new Date(win.startIso), scheduleStartMin, scheduleEndMin);
          const durationMin = Math.max(30, Math.round((new Date(win.endIso).getTime() - new Date(win.startIso).getTime()) / 60000));
          const end0 = new Date(start0.getTime() + durationMin * 60000);
          updatePayload.scheduled_start = start0.toISOString();
          updatePayload.scheduled_end = end0.toISOString();
        }

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
        // Omit scheduled_start and scheduled_end so it defaults to AI Captured/Estimating
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
      : ((companySettings as any)?.sms_auto_reply_enabled === false
        ? ''
        : "Got it — we’re logging your request now. Reply with: Name, Address, Best time window (example: 'tomorrow 9-11am'), and what’s going on. If this is an emergency, call 911.");

    return new NextResponse(twiml(reply), { status: 200, headers: { 'Content-Type': 'text/xml' } });
  } catch (e) {
    console.error('[INBOUND SMS] error', e);
    return new NextResponse(twiml(), { status: 200, headers: { 'Content-Type': 'text/xml' } });
  }
}
