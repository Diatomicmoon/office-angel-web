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

  // Format scraped leads to match the UI expectations of canvassing_visits
  const formattedLeads = (scrapedLeads || []).map((lead: any) => ({
    id: lead.id,
    address: lead.property_address + (lead.city ? `, ${lead.city}` : ''),
    resident_name: lead.new_owner_name,
    interest_level: lead.status === 'new' ? 'warm' : 'not_interested',
    visited_at: lead.sale_date || lead.created_at,
    notes: `Source: Auto-Scraped Property Sale\nSale Date: ${lead.sale_date || 'Unknown'}\nStatus: ${lead.status.toUpperCase()}`,
    phone: lead.phone || null,
    latitude: lead.latitude || null,
    longitude: lead.longitude || null
  }));

  // Combine and sort by date (We removed formattedBuilds so they stop doubling up in the "New Movers" list)
  const combined = [...(manualVisits || []), ...formattedLeads].sort((a, b) => {
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
  
  const { error } = await supabase
    .from('canvassing_visits')
    .insert([{
      ...body,
      company_id: companies?.[0]?.id
    }]);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
