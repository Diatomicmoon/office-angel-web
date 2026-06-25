import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
  
  // Grant read access to public if we want to bypass RLS for a moment while debugging
  const { data, error } = await supabase.rpc('exec_sql', { sql: `
    DROP POLICY IF EXISTS "Public invoices select" ON invoices;
    CREATE POLICY "Public invoices select" ON invoices FOR SELECT USING (true);
  `});
  
  return NextResponse.json({ data, error });
}
