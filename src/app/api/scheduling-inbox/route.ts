import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveCompanyIdOrThrow } from '@/lib/tenant';

export async function GET() {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

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

    const items = (jobs || []).map((j: any) => ({
      job: j,
      latestMessage: latestByJob[j.id] || null,
    }));

    return NextResponse.json({ items });
  } catch (e: any) {
    return NextResponse.json({ items: [], error: e?.message || 'error' }, { status: 500 });
  }
}

