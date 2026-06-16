import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { resolveCompanyIdOrThrow } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

  // Fetch manually logged visits
  const { data: manualVisits } = await supabase
    .from('door_knocking_visits')
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

  // One year ago threshold for "new movers"
  const oneYearAgo = new Date();
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

  // New Movers = leads from CSV/realestateapi sources with a recent sale date
  const newMoverLeads = (scrapedLeads || []).filter((lead: any) => {
    const isRecentSale = lead.sale_date && new Date(lead.sale_date) >= oneYearAgo;
    return isRecentSale;
  }).map((lead: any) => ({
    id: lead.id,
    address: lead.property_address + (lead.city ? `, ${lead.city}` : ''),
    resident_name: lead.new_owner_name,
    interest_level: lead.status === 'contacted' ? 'warm' : 'unknocked_lead',
    visited_at: lead.sale_date || lead.created_at,
    notes: `Sale Date: ${lead.sale_date || 'Unknown'}\nSource: ${lead.source || 'County CSV'}\n${lead.notes || ''}`,
    phone: lead.phone || null,
    latitude: lead.latitude || null,
    longitude: lead.longitude || null,
    _type: 'new_mover'
  }));

  // Format new build permits specifically for the heat map + Expected Builds tab
  const formattedBuilds = (newBuilds || []).map((build: any) => ({
    id: build.id,
    address: build.property_address + (build.city ? `, ${build.city}` : ''),
    resident_name: build.contractor_name || 'New Build',
    interest_level: build.status === 'contacted' ? 'demo_set' : (build.status === 'knocked' ? 'go_back' : 'new_build'),
    visited_at: build.permit_date || build.created_at || new Date().toISOString(),
    notes: `Builder: ${build.contractor_name || 'Unknown'}\nStatus: ${build.status}\n${build.notes || ''}`,
    latitude: build.latitude || null,
    longitude: build.longitude || null,
    _type: 'new_build'
  }));

  // Combine: manual visits + new movers + builds (for map/heatmap)
  const combined = [...(manualVisits || []), ...newMoverLeads, ...formattedBuilds].sort((a, b) => {
    return new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
  });

  return NextResponse.json({ visits: combined, newMoverCount: newMoverLeads.length, newBuildCount: formattedBuilds.length });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await supabase.from('door_knocking_visits').delete().eq('id', id).eq('company_id', companyId);
    await supabase.from('leads').delete().eq('id', id).eq('company_id', companyId);
    await supabase.from('new_build_permits').delete().eq('id', id).eq('company_id', companyId);

  return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { companyId } = await resolveCompanyIdOrThrow();
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
    );

    const body = await request.json();
    const { id, ...visitData } = body; 
    
    let repName = visitData.sales_rep_name || 'Unknown Rep';
    // If the frontend passed "Logged In Rep", or we want to enforce backend logic:
    const { userId } = await resolveCompanyIdOrThrow();
    if (userId) {
       const { data: profile } = await supabase.from('profiles').select('first_name, last_name').eq('id', userId).single();
       if (profile && profile.first_name) {
          repName = `${profile.first_name} ${profile.last_name || ''}`.trim();
       }
    }
    
    // Strip out the manual rep name appending on the client side since we now append it via the server
    const rawNotes = (visitData.notes || '').replace(/\[Rep:\s*.*?\]/g, '').trim();

    if (id) {
      const { data: leadData, error: lErr } = await supabase.from('leads').update({ interest_level: visitData.interest_level, notes: `[Rep: ${repName}] ${rawNotes}`, status: ['hot', 'demo_set'].includes(visitData.interest_level) ? 'contacted' : 'new' }).eq('id', id).eq('company_id', companyId).select();
      const { data: buildData, error: bErr } = await supabase.from('new_build_permits').update({ status: ['hot', 'demo_set'].includes(visitData.interest_level) ? 'contacted' : 'knocked' }).eq('id', id).eq('company_id', companyId).select();
      const { data: manualData, error: mErr } = await supabase.from('door_knocking_visits').update({
         interest_level: visitData.interest_level,
         notes: `[Rep: ${repName}] ${rawNotes}`
      }).eq('id', id).eq('company_id', companyId).select();

    // If it was successfully updated in one of the tables, return success.
    // Do NOT create a new duplicate row.
    if ((leadData && leadData.length > 0) || (buildData && buildData.length > 0) || (manualData && manualData.length > 0)) {
       return NextResponse.json({ success: true, updated: true });
    }
  }

  // If it has no ID, it's a brand new pin dropped on an empty spot on the map
  const dbVisit = {
    company_id: companyId,
    resident_name: visitData.resident_name,
    address: visitData.address,
    latitude: visitData.latitude,
    longitude: visitData.longitude,
    interest_level: visitData.interest_level,
    // Add sales rep name into the notes since the column doesn't exist yet
    notes: `[Rep: ${repName}] ${rawNotes}`,
    visited_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('door_knocking_visits')
    .insert([dbVisit]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true, inserted: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
