import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(req: Request) {
  try {
    const textBody = await req.text();
    const params = new URLSearchParams(textBody);
    const toPhone = params.get('To');
    const fromPhone = params.get('From');
    
    console.log(`[TWILIO VOICE] Incoming call to: ${toPhone} from: ${fromPhone}`);

    let aiEnabled = true;
    let forwardPhone = null;

    if (toPhone) {
      const { data: company, error } = await supabase
        .from('companies')
        .select('ai_enabled, forward_to_phone')
        .eq('phone_number', toPhone)
        .single();
        
      if (!error && company) {
        aiEnabled = company.ai_enabled ?? true;
        forwardPhone = company.forward_to_phone;
      } else {
        console.warn(`[TWILIO VOICE] Company not found for phone: ${toPhone}`);
      }
    }

    
    
    
    if (aiEnabled) {
      const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
      console.log('[TWILIO VOICE] AI Auto-Pilot enabled. Routing call to Vapi SIP.');
      // Vapi SIP routing: format is sip:assistantId@sip.vapi.ai
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${vapiAssistantId}@sip.vapi.ai</Sip>
  </Dial>
</Response>`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    } else if (forwardPhone) {
      console.log(`[TWILIO VOICE] AI disabled. Forwarding to human: ${forwardPhone}`);
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Number>${forwardPhone}</Number>
  </Dial>
</Response>`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    } else {
      console.warn('[TWILIO VOICE] AI disabled but no forward_to_phone set');
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling. No agents are available to take your call at this time.</Say>
</Response>`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }
  } catch (error) {
    console.error('[TWILIO VOICE] Error:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred connecting your call.</Say></Response>`,
      { status: 500, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
