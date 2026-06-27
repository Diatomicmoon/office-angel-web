import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(req: NextRequest) {
  const { data: estimate, error } = await supabase
      .from('estimates')
      .select('*, companies(name), estimate_items(*)')
      .limit(1);
      
  return NextResponse.json({ estimate, error });
}
