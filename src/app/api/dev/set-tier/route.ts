import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: Request) {
  try {
    const { tier } = await req.json();
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
    if (!user || !user.email?.toLowerCase().includes('jakob')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (tier) {
      cookieStore.set('oa_dev_tier', tier.toString(), { path: '/' });
    } else {
      cookieStore.delete('oa_dev_tier');
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json({ error: 'Failed' }, { status: 500 });
  }
}
