import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveCompanyIdOrThrow } from '@/lib/tenant';

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

function isSameTzDay(a: Date, b: Date, timeZone: string) {
  const pa = tzParts(a, timeZone);
  const pb = tzParts(b, timeZone);
  return pa.y === pb.y && pa.mo === pb.mo && pa.day === pb.day;
}

function ceilToSlot(min: number, slot = 30) {
  return Math.ceil(min / slot) * slot;
}

function minToTimeStr(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function statusRank(s?: string) {
  const v = String(s || '').toLowerCase();
  if (v === 'available') return 0;
  if (v.includes('route')) return 1;
  if (v.includes('site')) return 2;
  return 3;
}

export async function GET() {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const { data: company } = await supabase
      .from('companies')
      .select('schedule_start_minute, schedule_end_minute')
      .eq('id', companyId)
      .maybeSingle();

    const scheduleStartMin = typeof (company as any)?.schedule_start_minute === 'number' ? Number((company as any).schedule_start_minute) : 480;
    const scheduleEndMin = typeof (company as any)?.schedule_end_minute === 'number' ? Number((company as any).schedule_end_minute) : 1020;

    // Jobs that need dispatcher attention.
    const { data: jobs, error: jErr } = await supabase
      .from('jobs')
      .select('*, customers(first_name, last_name, phone_number)')
      .eq('company_id', companyId)
      .is('technician_id', null)
      .in('status', ['Lead', 'Reschedule Requested'])
      .order('updated_at', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(50);

    if (jErr) return NextResponse.json({ items: [], error: jErr.message }, { status: 400 });

    // Techs for suggestions
    const { data: techs } = await supabase
      .from('technicians')
      .select('id, name, status')
      .eq('company_id', companyId)
      .order('created_at', { ascending: true });

    const jobIds = (jobs || []).map((j: any) => j.id).filter(Boolean);

    // Pull recent messages and compute latest message per job.
    let latestByJob: Record<string, any> = {};
    if (jobIds.length) {
      const { data: msgs } = await supabase
        .from('messages')
        .select('id, job_id, direction, channel, body, created_at')
        .eq('company_id', companyId)
        .in('job_id', jobIds)
        .order('created_at', { ascending: false })
        .limit(200);

      for (const m of (msgs || []) as any[]) {
        if (!m.job_id) continue;
        if (!latestByJob[m.job_id]) latestByJob[m.job_id] = m;
      }
    }

    const items = await Promise.all((jobs || []).map(async (j: any) => {
      const durationMin = Number(j.estimated_minutes || 60);

      // Pick a base scheduling day: if job already has a suggested scheduled_start, use its day; else today.
      const base = j.scheduled_start ? new Date(j.scheduled_start) : new Date();
      const bp = tzParts(base, DISPLAY_TZ);

      // Business start/end for that day in DISPLAY_TZ converted to UTC.
      const startUtc = zonedTimeToUtcMs({ y: bp.y, mo: bp.mo, day: bp.day, h: Math.floor(scheduleStartMin / 60), mi: scheduleStartMin % 60, timeZone: DISPLAY_TZ });
      const endUtc = zonedTimeToUtcMs({ y: bp.y, mo: bp.mo, day: bp.day, h: Math.floor(scheduleEndMin / 60), mi: scheduleEndMin % 60, timeZone: DISPLAY_TZ });

      // Load scheduled jobs for that day (all techs), then compute gaps.
      const { data: dayJobs } = await supabase
        .from('jobs')
        .select('id, technician_id, scheduled_start, scheduled_end, estimated_minutes')
        .eq('company_id', companyId)
        .not('technician_id', 'is', null)
        .gte('scheduled_start', new Date(startUtc - 6 * 60 * 60 * 1000).toISOString())
        .lte('scheduled_start', new Date(endUtc + 6 * 60 * 60 * 1000).toISOString())
        .limit(500);

      const suggestions: any[] = [];

      for (const t of (techs || []) as any[]) {
        const blocks = (dayJobs || [])
          .filter((x: any) => x.technician_id === t.id && x.scheduled_start)
          .map((x: any) => {
            const st = new Date(x.scheduled_start);
            if (!isSameTzDay(st, base, DISPLAY_TZ)) return null;
            let et = x.scheduled_end ? new Date(x.scheduled_end) : new Date(st.getTime() + Number(x.estimated_minutes || 60) * 60000);
            if (Number.isNaN(et.getTime())) et = new Date(st.getTime() + 60 * 60000);
            const stLocal = tzParts(st, DISPLAY_TZ);
            const etLocal = tzParts(et, DISPLAY_TZ);
            const sMin = stLocal.h * 60 + stLocal.mi;
            const eMin = etLocal.h * 60 + etLocal.mi;
            return { sMin, eMin };
          })
          .filter(Boolean) as { sMin: number; eMin: number }[];

        blocks.sort((a, b) => a.sMin - b.sMin);

        let cursor = ceilToSlot(scheduleStartMin, 30);
        for (const b of blocks) {
          if (b.eMin <= scheduleStartMin) continue;
          if (b.sMin >= scheduleEndMin) break;
          if (cursor + durationMin <= b.sMin) break;
          cursor = ceilToSlot(Math.max(cursor, b.eMin), 30);
        }

        if (cursor + durationMin <= scheduleEndMin) {
          const startIso = new Date(zonedTimeToUtcMs({ y: bp.y, mo: bp.mo, day: bp.day, h: Math.floor(cursor / 60), mi: cursor % 60, timeZone: DISPLAY_TZ })).toISOString();
          const endIso = new Date(new Date(startIso).getTime() + durationMin * 60000).toISOString();
          suggestions.push({
            techId: t.id,
            techName: t.name || 'Technician',
            startIso,
            endIso,
            duration: durationMin,
            score: statusRank(t.status) * 100000 + cursor,
          });
        }
      }

      suggestions.sort((a, b) => a.score - b.score);

      return {
        job: j,
        latestMessage: latestByJob[j.id] || null,
        suggestions: suggestions.slice(0, 3).map(({ score, ...rest }) => rest),
      };
    }));

    return NextResponse.json({ items, scheduleStartMin, scheduleEndMin });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message || 'error' }, { status: 500 });
  }
}
