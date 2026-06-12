import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  const { data } = await supabase.from('jobs').select('id, title, status, company_id, technician_id').eq('company_id', 'a293eb4c-6a95-40b8-8324-bc493ec6b227').is('technician_id', null).order('created_at', {ascending: false});
  return NextResponse.json({ data });
}
