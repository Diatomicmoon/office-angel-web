import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function GET() {
  try {
    // Get the current user from the session cookie
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
    if (!user) return NextResponse.json({ role: 'unknown', companyName: 'Hard Hat Solutions' });

    // Use service role key to bypass RLS and get the true role
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );

    let role = 'unknown';
    let companyId = null;
    let companyName = 'Hard Hat Solutions';

    const { data: memData } = await supabaseAdmin
      .from('company_memberships')
      .select('role, company_id')
      .eq('user_id', user.id)
      .limit(1);

    if (memData && memData.length > 0) {
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
        .select('name')
        .eq('id', companyId)
        .single();
      if (comp?.name) companyName = comp.name;
    }

    return NextResponse.json({ role, companyName });
  } catch (err) {
    console.error('Error in /api/me:', err);
    return NextResponse.json({ role: 'unknown', companyName: 'Hard Hat Solutions' });
  }
}
