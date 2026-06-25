import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Calculate today's bounds
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const { data: leads, error } = await supabase
      .from('leads')
      .select('interest_level, notes')
      .gte('updated_at', todayIso);

    if (error) throw error;

    let totalKnocks = leads?.length || 0;
    let hotLeads = leads?.filter(l => l.interest_level === 'hot').length || 0;
    
    // In a real scenario, we'd fire the Twilio text here using TWILIO_ACCOUNT_SID
    // For now we just return the counts
    
    // Note: To make the text actually go out, Twilio needs to be active.

    return NextResponse.json({ 
      success: true, 
      stats: { totalKnocks, hotLeads },
      message: `Daily Recap generated. Knocks: ${totalKnocks}, Hot Leads: ${hotLeads}`
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
