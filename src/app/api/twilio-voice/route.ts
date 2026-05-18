import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;
    
    // Simplest possible SIP forward to prove Twilio -> Vapi works
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${vapiAssistantId}@sip.vapi.ai</Sip>
  </Dial>
</Response>`;
    
    console.log("Generating TwiML:", twiml);
    
    return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
  } catch (error) {
    console.error('Error:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Error.</Say></Response>`,
      { status: 500, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
