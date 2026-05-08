import { NextResponse } from 'next/server';

// This webhook fires when someone calls our Twilio number (+16123245110)
// It returns TwiML that connects the caller to the Vapi AI assistant
export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const callerPhone = formData.get('From') as string;
    const twilioNumber = formData.get('To') as string;

    console.log(`[TWILIO VOICE] Incoming call from ${callerPhone} to ${twilioNumber}`);

    const vapiAssistantId = process.env.VAPI_ASSISTANT_ID || process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;

    // Connect call to Vapi via SIP — Vapi handles transcription, AI summary,
    // and fires the end-of-call webhook to /api/call-finished automatically.
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:${vapiAssistantId}@sip.vapi.ai;transport=tls</Sip>
  </Dial>
</Response>`;

    return new NextResponse(twiml, {
      headers: { 'Content-Type': 'text/xml' },
    });

  } catch (error) {
    console.error('[TWILIO VOICE ERROR]', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, something went wrong. Please try again.</Say></Response>`,
      { status: 500, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
