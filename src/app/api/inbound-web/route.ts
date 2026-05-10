import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function corsHeaders(origin?: string | null) {
  // For now: permissive so the widget is easy to drop into any site.
  // When multi-tenant is live, lock this down per-company if needed.
  const o = origin || '*';
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Office-Angel-Secret',
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get('origin');
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) });
}

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

const DISPLAY_TZ = 'America/Chicago';

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
  dt = clampToBusinessHours(dt, scheduleStartMin, scheduleEndMin);
  return dt;
}

export async function POST(req: Request) {
  try {
    const origin = req.headers.get('origin');
    const payload = await req.json();
    const companyIdIn = String(payload?.company_id || '').trim();
    const secretIn = String(payload?.secret || '').trim();
    const name = String(payload?.name || '').trim();
    const phone = String(payload?.phone || '').trim();
    const message = String(payload?.message || '').trim();
    const address = String(payload?.address || '').trim();

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // If the messages table exists, prefer it over stuffing lead text into jobs.notes.
    let messagesTableOk = false;
    try {
      const probe = await supabase.from('messages').select('id').limit(1);
      messagesTableOk = !probe.error;
    } catch {
      messagesTableOk = false;
    }

    // Resolve company.
    // - In pinned-tenant mode, ALWAYS use OFFICE_ANGEL_COMPANY_ID (so inbound matches what the app is showing).
    // - In auth tenant mode, require payload.company_id (webhook integration will supply it).
    const tenantMode = process.env.OFFICE_ANGEL_TENANT_MODE;
    let companyId: string | null = null;

    if (tenantMode === 'auth') {
      companyId = companyIdIn || null;
      if (!companyId) return NextResponse.json({ ok: false, error: 'Missing company_id' }, { status: 400 });
    } else {
      companyId = process.env.OFFICE_ANGEL_COMPANY_ID || null;
    }

    if (!companyId) {
      const { data: c0 } = await supabase.from('companies').select('id').order('created_at', { ascending: true }).limit(1);
      companyId = c0?.[0]?.id || null;
    }
    if (!companyId) return NextResponse.json({ ok: false, error: 'No company configured' }, { status: 500 });

    const { data: companySettings } = await supabase
      .from('companies')
      .select('schedule_start_minute, schedule_end_minute')
      .eq('id', companyId)
      .maybeSingle();

    const scheduleStartMin = typeof (companySettings as any)?.schedule_start_minute === 'number'
      ? Number((companySettings as any).schedule_start_minute)
      : 480;
    const scheduleEndMin = typeof (companySettings as any)?.schedule_end_minute === 'number'
      ? Number((companySettings as any).schedule_end_minute)
      : 1020;

    // In auth tenant mode, require a webhook secret (prevents random internet spam).
    if (tenantMode === 'auth') {
      const headerSecret = String(req.headers.get('x-office-angel-secret') || '').trim();
      const provided = headerSecret || secretIn;
      const { data: company } = await supabase.from('companies').select('id, webhook_secret').eq('id', companyId).maybeSingle();
      const expected = String((company as any)?.webhook_secret || '').trim();
      if (!expected || provided !== expected) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401, headers: corsHeaders(origin) });
      }
    }

    // Upsert customer by phone if provided
    let customerId: string | null = null;
    if (phone) {
      const { data: existing } = await supabase
        .from('customers')
        .select('id, first_name')
        .eq('company_id', companyId)
        .eq('phone_number', phone)
        .maybeSingle();

      if (existing?.id) {
        customerId = existing.id;
      } else {
        const parts = name.split(' ').filter(Boolean);
        const first_name = parts[0] || 'New';
        const last_name = parts.slice(1).join(' ') || 'Caller';
        const { data: created } = await supabase
          .from('customers')
          .insert([{ company_id: companyId, phone_number: phone, first_name, last_name, address: address || null }])
          .select('id')
          .single();
        customerId = created?.id || null;
      }
    }

    const text = [message, address].filter(Boolean).join('\n');
    const urgencyFlag = deriveUrgency(text);
    const estimatedMinutes = heuristicDurationMinutes(text);
    const title = urgencyFlag === 'high' ? 'Emergency Web Message' : 'Website Message';
    const suggestedStart = suggestStartTime(urgencyFlag, scheduleStartMin, scheduleEndMin);
    const suggestedEnd = new Date(suggestedStart.getTime() + estimatedMinutes * 60000);

    const insertPayload: any = {
      company_id: companyId,
      customer_id: customerId,
      title,
      status: 'Lead',
      address: address || null,
      priority: urgencyFlag === 'high' ? 'high' : urgencyFlag === 'low' ? 'low' : 'normal',
      estimated_minutes: estimatedMinutes,
      scheduled_start: suggestedStart.toISOString(),
      scheduled_end: suggestedEnd.toISOString(),
      ...(messagesTableOk ? {} : { notes: message || null }),
    };

    let jobId: string | null = null;
    const ins = await supabase.from('jobs').insert([insertPayload]).select('id').single();
    if (ins.error && String(ins.error.message || '').includes('notes')) {
      delete insertPayload.notes;
      const ins2 = await supabase.from('jobs').insert([insertPayload]).select('id').single();
      jobId = (ins2.data as any)?.id || null;
    } else {
      jobId = (ins.data as any)?.id || null;
    }

    // Best-effort: store in messages table.
    try {
      await supabase.from('messages').insert([
        {
          company_id: companyId,
          customer_id: customerId,
          job_id: jobId,
          channel: 'web',
          direction: 'inbound',
          from_value: phone || name || null,
          to_value: null,
          body: [name ? `Name: ${name}` : null, phone ? `Phone: ${phone}` : null, address ? `Address: ${address}` : null, message ? `Message: ${message}` : null].filter(Boolean).join('\n'),
          meta: { raw: payload },
        } as any,
      ]);
    } catch {}

    return NextResponse.json({ ok: true }, { headers: corsHeaders(origin) });
  } catch (e) {
    console.error('[INBOUND WEB] error', e);
    const origin = req.headers.get('origin');
    return NextResponse.json({ ok: false, error: 'Failed' }, { status: 500, headers: corsHeaders(origin) });
  }
}
