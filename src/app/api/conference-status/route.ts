import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const sb = () =>
  createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder'
  );

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const statusCallbackEvent = formData.get('StatusCallbackEvent') as string;
    const callSid = formData.get('CallSid') as string;
    const confName = formData.get('FriendlyName') as string;
    
    console.log(`[CONFERENCE STATUS] Event: ${statusCallbackEvent} for ${confName} (CallSid: ${callSid})`);

    // In a full implementation we'd use this to update the active-call UI to "live" vs "ringing"
    // and when the conference ends, trigger the Vapi transcript pull.

    return new NextResponse('OK', { headers: { 'Content-Type': 'text/plain' } });
  } catch (error) {
    console.error('[CONFERENCE STATUS ERROR]', error);
    return new NextResponse('Error', { status: 500 });
  }
}
