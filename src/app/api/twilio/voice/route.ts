import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    
    // SIP forward to Vapi
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${vapiAssistantId}@sip.vapi.ai</Sip>
  </Dial>
</Response>`;
    
    console.log("Twilio Inbound Call -> Forwarding to Vapi");
    
    return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
  } catch (error) {
    console.error('Error in Twilio voice webhook:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>An error occurred connecting your call.</Say></Response>`,
      { status: 500, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
