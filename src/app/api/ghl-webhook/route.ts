import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client to bypass RLS for system operations
// We use the service role key because this is a server-to-server webhook
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    // Log the incoming webhook for debugging
    console.log('[GHL Webhook] Received payload:', JSON.stringify(body).substring(0, 200) + '...');

    // Extract essential GoHighLevel event data
    const type = body.type; // e.g., 'ContactCreate', 'InboundMessage', 'AppointmentCreate'
    const locationId = body.locationId; // This tells us WHICH contractor this belongs to
    
    if (!locationId) {
      return NextResponse.json({ error: 'Missing locationId' }, { status: 400 });
    }

    // 1. Find the Hard Hat company associated with this GHL Location ID
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('id, name')
      .eq('ghl_location_id', locationId)
      .single();

    if (companyError || !company) {
      console.log(`[GHL Webhook] Ignored. No matching company found for GHL location: ${locationId}`);
      return NextResponse.json({ status: 'Ignored - Unknown Location' });
    }

    // 2. Handle specific GHL Events
    
    if (type === 'InboundMessage') {
      // The customer texted the contractor. We could trigger AI triage here.
      console.log(`[GHL Webhook] Inbound text for ${company.name} from ${body.phone}`);
      
      // Save inbound lead conversation to Supabase so it shows up in AI Inbox
      await supabase.from('call_logs').insert({
        company_id: company.id,
        phone_number: body.phone,
        direction: 'inbound',
        type: 'sms',
        status: 'completed',
        transcription: body.message?.body || body.body || '',
        start_time: new Date().toISOString()
      });
    } 
    
    else if (type === 'ContactCreate') {
      console.log(`[GHL Webhook] New contact created for ${company.name}`);
      // Save contact to our customers table
      await supabase.from('customers').insert({
        company_id: company.id,
        first_name: body.firstName || '',
        last_name: body.lastName || '',
        phone: body.phone || '',
        email: body.email || '',
        ghl_contact_id: body.id
      }).select('id').single();
    }

    else if (type === 'AppointmentCreate') {
      // A job was booked in GHL calendar. We should trigger the Fleet Radar / Dispatch prep.
      console.log(`[GHL Webhook] New job booked for ${company.name}`);
      
      // Upsert job into Supabase
      await supabase.from('jobs').insert({
        company_id: company.id,
        status: 'scheduled',
        title: body.title || 'Service Call',
        scheduled_start: body.startTime,
        scheduled_end: body.endTime,
        address: body.address || 'TBD',
        ghl_appointment_id: body.id
      });
    }

    return NextResponse.json({ success: true, company: company.name });

  } catch (error) {
    console.error('[GHL Webhook] Error processing payload:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
