import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
  
  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1);

  if (!companies || companies.length === 0) {
    return NextResponse.json({ visits: [] });
  }

  const companyId = companies?.[0]?.id;

  // Fetch manually logged visits
  const { data: manualVisits } = await supabase
    .from('canvassing_visits')
    .select('*')
    .eq('company_id', companyId)
    .order('visited_at', { ascending: false });

  // Fetch automatically scraped leads
  const { data: scrapedLeads } = await supabase
    .from('leads')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  // Fetch new build permits to drop on the map
  const { data: newBuilds } = await supabase
    .from('new_build_permits')
    .select('*')
    .eq('company_id', companyId);

  // Format scraped leads
  const formattedLeads = (scrapedLeads || []).map((lead: any) => ({
    id: lead.id,
    address: lead.property_address + (lead.city ? `, ${lead.city}` : ''),
    resident_name: lead.new_owner_name,
    interest_level: lead.source === 'County CSV Import' ? 'new_build' : (lead.status === 'new' ? 'warm' : 'not_interested'),
    visited_at: lead.sale_date || lead.created_at,
    notes: `Source: ${lead.source || 'Auto-Scraped'}\n${lead.notes ? lead.notes + '\n' : ''}Sale Date: ${lead.sale_date || 'Unknown'}\nStatus: ${lead.status.toUpperCase()}`,
    phone: lead.phone || null,
    latitude: lead.latitude || null,
    longitude: lead.longitude || null
  }));

  // Format new build permits specifically for the heat map
  const formattedBuilds = (newBuilds || []).map((build: any) => ({
    id: build.id,
    address: build.property_address + (build.city ? `, ${build.city}` : ''),
    resident_name: build.contractor_name || 'New Build',
    interest_level: 'new_build',
    visited_at: build.permit_date || build.created_at || new Date().toISOString(),
    notes: `Builder: ${build.contractor_name || 'Unknown'}\nStatus: ${build.status}\n${build.notes || ''}`,
    latitude: build.latitude || null,
    longitude: build.longitude || null
  }));

  // Combine and sort by date
  const combined = [...(manualVisits || []), ...formattedLeads, ...formattedBuilds].sort((a, b) => {
    return new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
  });

  return NextResponse.json({ visits: combined });
}

export async function POST(request: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: companies } = await supabase
    .from('companies')
    .select('id')
    .limit(1);

  if (!companies || companies.length === 0) {
    return NextResponse.json({ error: 'No company found' }, { status: 400 });
  }

  const body = await request.json();
  const { id, ...visitData } = body; // remove id to prevent uuid collision
  
  // Also try to update the lead/new_build if they exist to keep statuses synced
  if (id) {
    // Try updating leads
    await supabase.from('leads').update({ interest_level: visitData.interest_level, notes: visitData.notes, status: visitData.interest_level === 'hot' ? 'contacted' : 'new' }).eq('id', id);
    // Try updating new builds
    await supabase.from('new_build_permits').update({ status: visitData.interest_level === 'hot' ? 'contacted' : 'knocked' }).eq('id', id);
  }

  const { error } = await supabase
    .from('canvassing_visits')
    .insert([{
      ...visitData,
      company_id: companies?.[0]?.id
    }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
