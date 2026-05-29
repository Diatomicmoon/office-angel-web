import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: companies } = await supabase.from('companies').select('id').limit(1);
  if (!companies || companies.length === 0) return NextResponse.json({ error: 'No company' }, { status: 400 });
  const companyId = companies[0].id;

  // Get visits from today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const { data: visits } = await supabase
    .from('canvassing_visits')
    .select('*')
    .eq('company_id', companyId);

  const stats = {
    todayKnocks: 0,
    totalKnocks: visits?.length || 0,
    hotLeads: 0,
    warmLeads: 0,
  };

  if (visits) {
    for (const v of visits) {
      if (new Date(v.visited_at) >= today) stats.todayKnocks++;
      if (v.interest_level === 'hot') stats.hotLeads++;
      if (v.interest_level === 'warm') stats.warmLeads++;
    }
  }

  return NextResponse.json(stats);
}
