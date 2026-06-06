import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveCompanyIdOrThrow } from '@/lib/tenant';

export async function GET(req: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const url = new URL(req.url);
    const jobId = url.searchParams.get('job_id');
    const customerId = url.searchParams.get('customer_id');
    const limit = Math.min(100, Math.max(1, Number(url.searchParams.get('limit') || 50)));

    let q = supabase
      .from('messages')
      .select('id, company_id, customer_id, job_id, channel, direction, from_value, to_value, body, meta, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (jobId) q = q.eq('job_id', jobId);
    if (customerId) q = q.eq('customer_id', customerId);

    const { data, error } = await q;
    if (error) return NextResponse.json({ messages: [], error: error.message }, { status: 400 });
    return NextResponse.json({ messages: data || [] });
  } catch (e: any) {
    return NextResponse.json({ messages: [], error: e?.message || 'error' }, { status: 500 });
  }
}
