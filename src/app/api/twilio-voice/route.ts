import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = () => createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || ""
);

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
      const { data: company, error } = await supabase()
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
      console.log('[TWILIO VOICE] AI Auto-Pilot enabled. Routing call to Vapi SIP.');
      const sipTarget = toPhone || '+16123245110';
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${sipTarget}@sip.vapi.ai</Sip>
  </Dial>
</Response>`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    } else if (forwardPhone) {
      console.log(`[TWILIO VOICE] AI disabled (Co-Pilot Mode). Forwarding to human(s): ${forwardPhone} with recording enabled.`);
      
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.hardhat-solutions.com";
      const recordingCallbackUrl = `${baseUrl}/api/twilio-recording`;
      
      // Support simulring if forwardPhone has multiple comma-separated numbers
      const phones = forwardPhone.split(',').map((p: string) => p.trim()).filter(Boolean);
      
      const dialContent = phones.map((p: string) => `<Number>${p}</Number>`).join('\n    ');
      
      const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial record="record-from-answer-dual" recordingStatusCallback="${recordingCallbackUrl}" action="${baseUrl}/api/twilio-voice-status">
    ${dialContent}
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
