import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const { companyId } = await req.json();

    if (!companyId) {
      return NextResponse.json({ error: 'Missing companyId' }, { status: 400 });
    }

    // 1. Fetch company GHL API token from database
    const { data: companySettings } = await supabase
      .from('companies')
      .select('ghl_api_key, ghl_location_id')
      .eq('id', companyId)
      .single();

    if (!companySettings?.ghl_api_key || !companySettings?.ghl_location_id) {
      return NextResponse.json({ error: 'GHL API keys not configured for this company.' }, { status: 400 });
    }

    // 2. Fetch Contacts / Leads from GoHighLevel V2 API
    console.log(`[GHL Sync] Syncing contacts for location ${companySettings.ghl_location_id}`);

    const response = await fetch(`https://services.leadconnectorhq.com/contacts/?locationId=${companySettings.ghl_location_id}&limit=100`, {
      headers: {
        'Authorization': `Bearer ${companySettings.ghl_api_key}`,
        'Version': '2021-07-28',
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`GHL API error: ${response.statusText}`);
    }

    const ghlData = await response.json();
    const contacts = ghlData.contacts || [];

    // 3. Upsert to Supabase `customers` table
    const customersToUpsert = contacts.map((c: any) => ({
      company_id: companyId,
      first_name: c.firstName || '',
      last_name: c.lastName || '',
      phone: c.phone || '',
      email: c.email || '',
      address: c.address1 || '',
      ghl_contact_id: c.id
    }));

    if (customersToUpsert.length > 0) {
      const { error: upsertError } = await supabase
        .from('customers')
        .upsert(customersToUpsert, { onConflict: 'ghl_contact_id' });

      if (upsertError) {
        console.error('[GHL Sync] Supabase Upsert Error:', upsertError);
        throw upsertError;
      }
    }
    
    return NextResponse.json({ success: true, message: `Synced ${customersToUpsert.length} contacts from GHL.` });

  } catch (error) {
    console.error('[GHL Sync] Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
