export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  
  const { data: companies } = await supabase.from('companies').select('id, name');
  const { data: memberships } = await supabase.from('company_memberships').select('*');
  const { data: techs } = await supabase.from('technicians').select('*');
  
  return NextResponse.json({ companies, memberships, techs });
}