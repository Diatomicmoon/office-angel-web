import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ visits: [] }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', session.user.id)
    .single();

  if (!profile?.company_id) return NextResponse.json({ visits: [] });

  // Fetch manually logged visits
  const { data: manualVisits } = await supabase
    .from('canvassing_visits')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('visited_at', { ascending: false });

  // Fetch automatically scraped leads
  const { data: scrapedLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('company_id', profile.company_id)
    .order('created_at', { ascending: false });

  // Format scraped leads to match the UI expectations of canvassing_visits
  const formattedLeads = (scrapedLeads || []).map(lead => ({
    id: lead.id,
    address: lead.property_address + (lead.city ? `, ${lead.city}` : ''),
    resident_name: lead.new_owner_name,
    interest_level: lead.status === 'new' ? 'warm' : 'not_interested', // Treating new scraped leads as warm by default
    visited_at: lead.sale_date || lead.created_at, // Use sale date as the primary anchor
    notes: `Source: Auto-Scraped Property Sale\nSale Date: ${lead.sale_date || 'Unknown'}\nStatus: ${lead.status.toUpperCase()}`,
    latitude: null, // Reverse geocoding required later for pins
    longitude: null
  }));

  // Combine and sort by date
  const combined = [...(manualVisits || []), ...formattedLeads].sort((a, b) => {
    return new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
  });

  return NextResponse.json({ visits: combined });
}

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('company_id')
    .eq('id', session.user.id)
    .single();

  const body = await request.json();
  
  const { error } = await supabase
    .from('canvassing_visits')
    .insert([{
      ...body,
      company_id: profile.company_id
    }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
