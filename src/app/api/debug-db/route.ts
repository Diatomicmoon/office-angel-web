import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  const { data: companies } = await supabase.from('companies').select('id, name');
  const { data: jobs } = await supabase.from('jobs').select('id, title, company_id, technician_id').order('created_at', {ascending: false}).limit(5);
  return NextResponse.json({ companies, jobs, env: process.env.HARD_HAT_COMPANY_ID });
}
