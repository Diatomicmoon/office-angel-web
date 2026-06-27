import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ztknhbilfergfwoxjzvb.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  );
  
  const { data, error } = await supabase.from('estimates').select('id').limit(1);
  return NextResponse.json({ data, error });
}
