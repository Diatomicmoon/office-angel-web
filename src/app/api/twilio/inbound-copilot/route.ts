import { NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const callSid = formData.get('CallSid') as string;
    
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const client = twilio(accountSid, authToken);
    
    const confName = `Copilot_${callSid}`;
    
    // Vapi SIP URI we generated for the AI Co-Pilot
    const vapiSipUri = 'sip:+16123245110@a5132085-ff8f-4034-ae10-2be6bfee21d2.sip.vapi.ai';
    // Your personal cell phone
    const myCell = '+16125986260';
    // The Twilio Business Number
    const twilioNumber = '+16123245110';

    // 1. Call your personal cell and drop you into the conference
    client.calls.create({
      to: myCell,
      from: twilioNumber,
      twiml: `<Response><Dial><Conference>${confName}</Conference></Dial></Response>`
    }).catch(err => console.error("Error calling Jakob:", err));

    // 2. Call Vapi and drop the AI into the conference (muted so it can only listen)
    client.calls.create({
      to: vapiSipUri,
      from: twilioNumber,
      twiml: `<Response><Dial><Conference muted="true">${confName}</Conference></Dial></Response>`
    }).catch(err => console.error("Error calling Vapi:", err));

    // 3. Drop the customer (the inbound caller) into the conference
    const twiml = `
      <Response>
        <Say>Please hold while we connect you to our team.</Say>
        <Dial>
          <Conference>${confName}</Conference>
        </Dial>
      </Response>
    `;

    return new NextResponse(twiml, {
      status: 200,
      headers: {
        'Content-Type': 'text/xml',
      },
    });
  } catch (error) {
    console.error("Twilio Webhook Error:", error);
    return new NextResponse(
      '<Response><Say>Sorry, an error occurred.</Say></Response>', 
      { status: 500, headers: { 'Content-Type': 'text/xml' } }
    );
  }
}
