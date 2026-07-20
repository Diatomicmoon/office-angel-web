import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    // Parse the payload from the Supabase Database Webhook
    const body = await req.json();
    const { type, record, old_record } = body;

    // Use the relevant record depending on if it's a DELETE or INSERT/UPDATE
    const job = type === 'DELETE' ? old_record : record;
    if (!job || !job.company_id) {
      return NextResponse.json({ success: true, note: 'No job data' });
    }

    // Fetch the company's Google tokens
    const { data: company } = await supabase
      .from('companies')
      .select('google_access_token, google_refresh_token, google_calendar_id')
      .eq('id', job.company_id)
      .single();

    if (!company || !company.google_access_token) {
      return NextResponse.json({ success: true, note: 'Company not configured for Google Calendar' });
    }

    // Initialize OAuth2 client
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth/google/callback`
    );

    oauth2Client.setCredentials({
      access_token: company.google_access_token,
      refresh_token: company.google_refresh_token,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const calendarId = company.google_calendar_id || 'primary';

    // Handle Delete
    if (type === 'DELETE' && job.google_calendar_event_id) {
      await calendar.events.delete({ calendarId, eventId: job.google_calendar_event_id }).catch(e => console.error('Delete error:', e.message));
      return NextResponse.json({ success: true, action: 'deleted' });
    }

    // Format event data
    const eventData = {
      summary: job.title || 'Job Event',
      location: job.address || '',
      description: job.notes || '',
      start: { dateTime: job.scheduled_start ? new Date(job.scheduled_start).toISOString() : new Date().toISOString() },
      end: { dateTime: job.scheduled_end ? new Date(job.scheduled_end).toISOString() : new Date(Date.now() + 3600000).toISOString() }, // defaults to 1 hr
    };

    // Handle Insert
    if (type === 'INSERT' || (!job.google_calendar_event_id && type === 'UPDATE')) {
      const res = await calendar.events.insert({ calendarId, requestBody: eventData });
      if (res.data.id) {
        // Update the job with the new Google Calendar Event ID so we can track it
        await supabase.from('jobs').update({ google_calendar_event_id: res.data.id }).eq('id', job.id);
      }
      return NextResponse.json({ success: true, action: 'inserted' });
    } 
    
    // Handle Update
    if (type === 'UPDATE' && job.google_calendar_event_id) {
      await calendar.events.patch({ calendarId, eventId: job.google_calendar_event_id, requestBody: eventData }).catch(e => console.error('Patch error:', e.message));
      return NextResponse.json({ success: true, action: 'updated' });
    }

    return NextResponse.json({ success: true, note: 'No action taken' });

  } catch (error: any) {
    console.error('[Calendar Outbound Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
