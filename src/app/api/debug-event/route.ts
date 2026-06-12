import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export const dynamic = 'force-dynamic';
export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  const { data: jobs, error } = await supabase.from('jobs').select('id, title, status, technician_id').eq('company_id', '8e53126d-d9a7-414c-8291-8657fbf43123').is('technician_id', null).order('updated_at', {ascending: false});
  return NextResponse.json({ jobs, error });
}
