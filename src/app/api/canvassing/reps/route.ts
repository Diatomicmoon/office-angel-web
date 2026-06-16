import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveCompanyIdOrThrow } from '@/lib/tenant';

export async function GET() {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    // Get all company members + their profile names
    const { data: mems, error } = await supabase
      .from('company_memberships')
      .select('user_id, role, profiles(id, first_name, last_name)')
      .eq('company_id', companyId);

    if (error) throw error;

    const reps = (mems || [])
      .filter((m: any) => m.profiles)
      .map((m: any) => ({
        id: m.user_id,
        name: `${m.profiles.first_name || ''} ${m.profiles.last_name || ''}`.trim() || 'Unknown',
        role: m.role
      }));

    return NextResponse.json({ reps });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
