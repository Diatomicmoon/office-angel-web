import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming webhook payload from Make.com
    const body = await req.json();
    
    // Make.com should send us:
    // { event_id, event_title, start_time, end_time, location, description, technician_id (optional), action: 'created' | 'updated' | 'deleted' }
    const { event_id, event_title, start_time, end_time, location, description, technician_id, action } = body;

    if (!event_id || !event_title || !start_time || !end_time) {
      return NextResponse.json(
        { error: 'Missing required calendar event fields (event_id, event_title, start_time, end_time)' },
        { status: 400 }
      );
    }

    console.log(`[Calendar Sync] Received ${action} for event ${event_id}`);

    // Handle Deletions
    if (action === 'deleted') {
      const { error } = await supabase
        .from('jobs')
        .update({ status: 'cancelled' })
        .eq('google_calendar_event_id', event_id);
        
      if (error) throw error;
      return NextResponse.json({ success: true, message: 'Job cancelled from calendar sync' });
    }

    // Determine company_id
    let company_id = body.company_id || process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID;
    if (!company_id) {
      // Force it to Christian's Demo Company if env var is missing on Vercel
      company_id = '8e53126d-d9a7-414c-8291-8657fbf43123';
    }

    if (!company_id) {
      return NextResponse.json(
        { error: 'No company configured in the system.' },
        { status: 400 }
      );
    }

    // 2. Map Google Calendar data to Hard Hat Solutions Job schema
    const jobData = {
      company_id,
      title: event_title,
      scheduled_start: start_time,
      scheduled_end: end_time,
      address: location || null,
      notes: description || null,
      google_calendar_event_id: event_id,
      // If no tech is specified, maybe it goes to an unassigned queue or default
      technician_id: technician_id || null, 
      status: 'scheduled'
    };

    // 3. Insert or Update the job in Supabase
    const { data: existingJob } = await supabase
      .from('jobs')
      .select('id')
      .eq('google_calendar_event_id', event_id)
      .single();

    if (existingJob) {
      // Update existing
      const { error } = await supabase
        .from('jobs')
        .update(jobData)
        .eq('id', existingJob.id);
      if (error) throw error;
      console.log(`[Calendar Sync] Updated job ${existingJob.id}`);
    } else {
      // Create new
      const { error } = await supabase
        .from('jobs')
        .insert([jobData]);
      if (error) throw error;
      console.log(`[Calendar Sync] Created new job`);
    }

    return NextResponse.json({ success: true, message: 'Sync complete' });

  } catch (error: any) {
    console.error('[Calendar Sync Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
