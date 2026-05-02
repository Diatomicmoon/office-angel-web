import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. Parse the incoming webhook from Twilio when someone calls the number
    const formData = await req.formData();
    const callerPhone = formData.get('From') as string;
    const twilioNumber = formData.get('To') as string;
    
    console.log(`[TWILIO VOICE] Incoming call from ${callerPhone} to ${twilioNumber}`);

    // 2. Generate TwiML (Twilio Markup Language) to tell Twilio what to do.
    // We will use the <Connect> verb to open a WebSocket stream to our AI server (or Bland AI / Retell)
    
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
      <Response>
        <Say>Please wait while we connect you to the Office Angel AI dispatcher.</Say>
        <Connect>
          <!-- In production, this points to your websocket server or Bland AI -->
          <Stream url="wss://${req.headers.get('host')}/api/voice-stream" />
        </Connect>
      </Response>`;

    return new NextResponse(twiml, {
      headers: {
        'Content-Type': 'text/xml',
      },
    });

  } catch (error) {
    console.error("[TWILIO VOICE ERROR]", error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?><Response><Say>Sorry, an error occurred.</Say></Response>`,
      { status: 500, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
