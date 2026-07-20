import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { google } from 'googleapis';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const channelId = req.headers.get('x-goog-channel-id');
    const resourceState = req.headers.get('x-goog-resource-state');

    // 1. Identify if this is a Google Calendar Webhook Ping
    if (!channelId) {
      // Fallback for manual sync trigger (or old make.com testing)
      return NextResponse.json({ error: 'Missing x-goog-channel-id header' }, { status: 400 });
    }

    // 2. Find which company this channel belongs to
    const { data: company, error: companyErr } = await supabase
      .from('companies')
      .select('id, google_access_token, google_refresh_token, google_calendar_id, google_sync_token')
      .eq('google_channel_id', channelId)
      .single();

    if (companyErr || !company) {
      console.error('[Calendar Sync] Unknown channel ID:', channelId);
      // Return 200 so Google stops retrying for dead channels
      return NextResponse.json({ success: false, note: 'Unknown channel' }, { status: 200 }); 
    }

    // Google sends a "sync" event when you first register the webhook
    if (resourceState === 'sync') {
      console.log(`[Calendar Sync] Webhook registered successfully for company ${company.id}`);
      return NextResponse.json({ success: true });
    }

    // 3. Auth with Google
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

    // 4. Fetch ONLY the changed events since the last ping
    let syncToken = company.google_sync_token;
    let changedEvents: any[] = [];
    let pageToken = undefined;

    try {
      do {
        const res: any = await calendar.events.list({
          calendarId,
          syncToken: syncToken || undefined,
          pageToken: pageToken,
          // If we have no sync token (first run), just grab upcoming events so we don't sync 10 years of history
          timeMin: !syncToken ? new Date().toISOString() : undefined, 
        });
        
        if (res.data.items) {
          changedEvents.push(...res.data.items);
        }
        pageToken = res.data.nextPageToken;
        syncToken = res.data.nextSyncToken || syncToken;
      } while (pageToken);
    } catch (syncError: any) {
      if (syncError.code === 410) {
        // 410 Gone means our sync token expired (haven't synced in a long time). 
        // We need to clear it and run a full fresh sync next time.
        console.warn(`[Calendar Sync] Sync token expired for company ${company.id}`);
        await supabase.from('companies').update({ google_sync_token: null }).eq('id', company.id);
        return NextResponse.json({ error: 'Sync token expired, resetting for next run' }, { status: 200 });
      }
      throw syncError;
    }

    // 5. Save the new sync token so the next webhook only gets new changes
    if (syncToken !== company.google_sync_token) {
      await supabase.from('companies').update({ google_sync_token: syncToken }).eq('id', company.id);
    }

    console.log(`[Calendar Sync] Processing ${changedEvents.length} updates for company ${company.id}`);

    // 6. Update Jobs in Supabase
    for (const event of changedEvents) {
      if (event.status === 'cancelled') {
        await supabase.from('jobs').update({ status: 'cancelled' }).eq('google_calendar_event_id', event.id);
        continue;
      }

      const jobData = {
        company_id: company.id,
        title: event.summary || 'Untitled Event',
        scheduled_start: event.start?.dateTime || event.start?.date || null,
        scheduled_end: event.end?.dateTime || event.end?.date || null,
        address: event.location || null,
        notes: event.description || null,
        google_calendar_event_id: event.id,
      };

      // Check if job exists
      const { data: existingJob } = await supabase
        .from('jobs')
        .select('id')
        .eq('google_calendar_event_id', event.id)
        .single();

      if (existingJob) {
        await supabase.from('jobs').update(jobData).eq('id', existingJob.id);
      } else {
        await supabase.from('jobs').insert([{ ...jobData, status: 'scheduled' }]);
      }
    }

    return NextResponse.json({ success: true, processed: changedEvents.length });

  } catch (error: any) {
    console.error('[Calendar Sync Error]:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
