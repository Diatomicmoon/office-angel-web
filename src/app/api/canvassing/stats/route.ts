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

  // We need to fetch the reps data to map rep_id to actual names
  // If canvassing_visits doesn't have rep_id yet in production, we can mock or use a generic field
  const { data: visits } = await supabase
    .from('canvassing_visits')
    .select('*')
    .eq('company_id', companyId);

  const stats = {
    todayKnocks: 0,
    totalKnocks: visits?.length || 0,
    hotLeads: 0,
    warmLeads: 0,
    leaderboard: [] as any[]
  };

  const repCounts: Record<string, { knocks: number, hot: number }> = {};

  if (visits) {
    for (const v of visits) {
      if (new Date(v.visited_at) >= today) stats.todayKnocks++;
      if (v.interest_level === 'hot') stats.hotLeads++;
      if (v.interest_level === 'warm') stats.warmLeads++;

      // We use "rep_name" if it exists, or fall back to "Field Rep"
      // In production, the CanvassingMode should inject the logged-in rep's name
      const rep = v.rep_name || "Christian (Owner)"; 
      if (!repCounts[rep]) repCounts[rep] = { knocks: 0, hot: 0 };
      repCounts[rep].knocks++;
      if (v.interest_level === 'hot') repCounts[rep].hot++;
    }
  }

  // Convert map to sorted array for leaderboard
  stats.leaderboard = Object.entries(repCounts)
    .map(([name, data]) => ({ name, knocks: data.knocks, hot: data.hot }))
    .sort((a, b) => b.knocks - a.knocks);

  return NextResponse.json(stats);
}
