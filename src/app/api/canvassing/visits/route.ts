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

  // Format scraped leads
  const formattedLeads = (scrapedLeads || []).map((lead: any) => ({
    id: lead.id,
    address: lead.property_address + (lead.city ? `, ${lead.city}` : ''),
    resident_name: lead.new_owner_name,
    interest_level: lead.interest_level || (lead.source === 'County CSV Import' ? 'new_build' : (lead.status === 'new' ? 'unknocked_lead' : 'not_interested')),
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
    interest_level: build.status === 'contacted' ? 'hot' : (build.status === 'knocked' ? 'warm' : 'new_build'),
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
    
    if (id) {
      const { data: leadData, error: lErr } = await supabase.from('leads').update({ interest_level: visitData.interest_level, notes: `[Rep: ${visitData.sales_rep_name || 'Unknown'}] ${visitData.notes || ''}`, status: visitData.interest_level === 'hot' ? 'contacted' : 'new' }).eq('id', id).eq('company_id', companyId).select();
      const { data: buildData, error: bErr } = await supabase.from('new_build_permits').update({ status: visitData.interest_level === 'hot' ? 'contacted' : 'knocked' }).eq('id', id).eq('company_id', companyId).select();
      const { data: manualData, error: mErr } = await supabase.from('door_knocking_visits').update({
         interest_level: visitData.interest_level,
         notes: `[Rep: ${visitData.sales_rep_name || 'Unknown'}] ${visitData.notes || ''}`
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
    notes: `[Rep: ${visitData.sales_rep_name || 'Unknown'}] ${visitData.notes || ''}`,
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
