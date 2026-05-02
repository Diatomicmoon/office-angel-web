import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with Service Role key (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const payload = await req.json();
    console.log(`[CALL FINISHED] Webhook received from AI Voice Engine`);

    // Bland AI specific payload mapping
    const customerPhone = payload.to || payload.from || "Unknown";
    const duration = payload.call_length || 0;
    const summary = payload.summary || "No summary provided.";
    const transcript = payload.transcripts || []; // Bland returns an array of transcript objects
    
    // Check for high urgency keywords in the summary
    const isEmergency = summary.toLowerCase().includes('emergency') || 
                        summary.toLowerCase().includes('urgent') || 
                        summary.toLowerCase().includes('outage') ||
                        summary.toLowerCase().includes('damage');
    
    const urgencyFlag = isEmergency ? 'high' : 'low';

    // 1. Check if the customer already exists in our CRM based on Phone Number
    let customerId = null;
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('phone_number', customerPhone)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create a new "Lead" customer record
      const { data: newCustomer, error: custError } = await supabase
        .from('customers')
        .insert([{ phone_number: customerPhone, first_name: 'New Caller' }])
        .select()
        .single();
        
      if (!custError && newCustomer) {
        customerId = newCustomer.id;
      }
    }

    // 2. Insert into the call_logs table
    const { error: logError } = await supabase
      .from('call_logs')
      .insert([
        {
          customer_id: customerId,
          call_status: payload.completed ? 'completed' : 'missed',
          duration_seconds: Math.floor(duration * 60), // Convert Bland's minutes to seconds if necessary
          transcript: transcript,
          summary: summary,
          urgency_flag: urgencyFlag,
          action_items: "Requires Review" // Default action item for the dashboard
        }
      ]);

    if (logError) throw logError;

    // 3. OPTIONAL: If it's an emergency, we could trigger an SMS out to the on-call tech here

    return NextResponse.json({ success: true, message: "Call log and CRM synced successfully." });
  } catch (error) {
    console.error("[CALL FINISHED ERROR]", error);
    return NextResponse.json({ success: false, error: "Failed to process call finished webhook" }, { status: 500 });
  }
}
