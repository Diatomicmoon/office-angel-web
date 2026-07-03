import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll() {}
        }
      }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return NextResponse.json({ role: 'unknown', companyName: 'Hard Hat Solutions', tier: 1, isTrial: false });

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    let role = 'unknown';
    let companyId = null;
    let companyName = 'Hard Hat Solutions';
    let tier = 1;
    let isTrial = false;

    const { data: memData } = await supabaseAdmin
      .from('company_memberships')
      .select('role, company_id')
      .eq('user_id', user.id);

    // Prefer the cookie selected company if present, else fallback to first membership
    let selectedCompanyId = cookieStore.get('oa_company_id')?.value;
    const memMatch = memData?.find(m => m.company_id === selectedCompanyId);
    if (memMatch) {
      role = memMatch.role;
      companyId = memMatch.company_id;
    } else if (memData && memData.length > 0) {
      role = memData[0].role;
      companyId = memData[0].company_id;
    }

    if (!role || role === 'unknown') {
      const { data: profData } = await supabaseAdmin
        .from('profiles')
        .select('role, company_id')
        .eq('id', user.id)
        .limit(1);
      if (profData && profData.length > 0) {
        role = profData[0].role;
        companyId = profData[0].company_id;
      }
    }

    if (companyId) {
      const { data: comp } = await supabaseAdmin
        .from('companies')
        .select('name, ai_enabled, module_door_to_door, is_trial')
        .eq('id', companyId)
        .single();
      if (comp?.name) {
        companyName = comp.name;
        // Infer tier for test UI
        if (comp.is_trial) isTrial = true;
        if (comp.name.includes("Tier 3")) tier = 3;
        else if (comp.name.includes("Tier 2")) tier = 2;
        else if (comp.ai_enabled) tier = 2;
      }
    }

    return NextResponse.json({ role, companyName, tier, isTrial });
  } catch (err) {
    console.error('Error in /api/me:', err);
    return NextResponse.json({ role: 'unknown', companyName: 'Hard Hat Solutions', tier: 1, isTrial: false });
  }
}
