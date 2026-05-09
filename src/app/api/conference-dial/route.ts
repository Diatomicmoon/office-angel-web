import { NextResponse } from "next/server";

// Called async from twilio-voice to add the dispatcher phone + Vapi AI listener to the conference
export async function POST(req: Request) {
  try {
    const { conferenceName, dispatcherPhone, vapiAssistantId, callerPhone, companyId, customerId, lookupName } = await req.json();

    const accountSid = process.env.TWILIO_ACCOUNT_SID!;
    const authToken = process.env.TWILIO_AUTH_TOKEN!;
    const twilioPhone = process.env.TWILIO_PHONE_NUMBER!;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.office-angel.com";
    const auth = "Basic " + Buffer.from(`${accountSid}:${authToken}`).toString("base64");

    // TwiML for dispatcher — they join as a regular speaker
    const dispatcherTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Incoming call from ${lookupName || "an unknown caller"}. You are now connected.</Say>
  <Dial>
    <Conference startConferenceOnEnter="true" endConferenceOnExit="true" waitUrl="">${conferenceName}</Conference>
  </Dial>
</Response>`;

    // TwiML for Vapi — joins as silent listener/note-taker
    const vapiTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Conference startConferenceOnEnter="false" endConferenceOnExit="false" muted="false" waitUrl="">${conferenceName}</Conference>
  </Dial>
</Response>`;

    // Dial the dispatcher
    const dispatcherCall = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          To: dispatcherPhone,
          From: twilioPhone,
          Twiml: dispatcherTwiml,
        }),
      }
    );
    const dispatcherResult = await dispatcherCall.json();
    console.log("[CONFERENCE] Dialed dispatcher:", dispatcherResult.sid || dispatcherResult.message);

    // Dial Vapi AI as a silent listener via SIP
    const vapiCall = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Calls.json`,
      {
        method: "POST",
        headers: { Authorization: auth, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          To: `sip:${vapiAssistantId}@sip.vapi.ai;transport=tls`,
          From: twilioPhone,
          Twiml: vapiTwiml,
        }),
      }
    );
    const vapiResult = await vapiCall.json();
    console.log("[CONFERENCE] Added Vapi listener:", vapiResult.sid || vapiResult.message);

    return NextResponse.json({ ok: true, dispatcher: dispatcherResult.sid, vapi: vapiResult.sid });
  } catch (err) {
    console.error("[CONFERENCE DIAL ERROR]", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
