export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || '', process.env.SUPABASE_SERVICE_ROLE_KEY || '');
  const { data } = await supabase.from('jobs').select('id, title, company_id').order('created_at', {ascending: false}).limit(20);
  return NextResponse.json({ data, cId: process.env.HARD_HAT_COMPANY_ID });
}
