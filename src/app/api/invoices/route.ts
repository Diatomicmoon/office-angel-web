import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const companyId = cookieStore.get('oa_company_id')?.value;

    if (!companyId) {
      return NextResponse.json({ error: 'Not authenticated', invoices: [] }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({ invoices: data || [] });
  } catch (error: any) {
    console.error('API /invoices error:', error);
    return NextResponse.json({ error: error.message || 'Server error', invoices: [] }, { status: 500 });
  }
}
