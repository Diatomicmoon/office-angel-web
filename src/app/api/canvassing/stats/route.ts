import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { resolveCompanyIdOrThrow } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const { data: visits } = await supabase
      .from('door_knocking_visits')
      .select('*')
      .eq('company_id', companyId);

    const { data: leads } = await supabase
      .from('leads')
      .select('*')
      .eq('company_id', companyId);

    const stats = {
      todayKnocks: 0,
      totalKnocks: 0,
      hotLeads: 0,
      warmLeads: 0,
      leaderboard: [] as any[]
    };

    const repCounts: Record<string, { knocks: number, hot: number }> = {};

    function processVisit(v: any, dateField: string, isLead: boolean) {
      // If it's a lead, we only count it as "knocked" if it has interest_level other than unknocked_lead/not_interested
      // Or if it has a Rep note.
      const hasRepNote = v.notes?.includes('[Rep:');
      if (isLead && !hasRepNote && !['demo_set', 'hot', 'go_back', 'warm'].includes(v.interest_level)) {
        return; // Skip unknocked leads
      }

      stats.totalKnocks++;

      const vDate = new Date(v[dateField]);
      if (vDate >= today) stats.todayKnocks++;

      if (['demo_set', 'hot', 'contacted'].includes(v.interest_level)) stats.hotLeads++;
      if (['go_back', 'warm'].includes(v.interest_level)) stats.warmLeads++;

      // Extract rep name
      let rep = v.rep_name || "Unknown";
      const match = v.notes?.match(/\[Rep:\s*(.*?)\]/);
      if (match && match[1]) {
        rep = match[1];
      }

      if (!repCounts[rep]) repCounts[rep] = { knocks: 0, hot: 0 };
      repCounts[rep].knocks++;
      if (['demo_set', 'hot', 'contacted'].includes(v.interest_level)) {
        repCounts[rep].hot++;
      }
    }

    if (visits) {
      for (const v of visits) processVisit(v, 'visited_at', false);
    }
    
    if (leads) {
      for (const l of leads) {
         // leads table usually uses created_at or updated_at for tracking the interaction
         // Since we don't have a specific visited_at column consistently updated, we use the timestamp of the pin drop/update if possible.
         // fallback to created_at
         processVisit(l, 'created_at', true);
      }
    }

    stats.leaderboard = Object.entries(repCounts)
      .map(([name, data]) => ({ name, knocks: data.knocks, hot: data.hot }))
      .sort((a, b) => b.knocks - a.knocks);

    return NextResponse.json(stats);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
