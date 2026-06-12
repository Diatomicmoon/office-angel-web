import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  const { data: jobs, error } = await supabase.from('jobs').select('*').not('google_calendar_event_id', 'is', null).order('created_at', {ascending: false}).limit(10);
  const { data: comp } = await supabase.from('companies').select('id, name');
  return NextResponse.json({ jobs, error, comp });
}
