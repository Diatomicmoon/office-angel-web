import fs from 'fs';

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/api/twilio-voice/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

const newAiBlock = `
    if (aiEnabled) {
      console.log('[TWILIO VOICE] AI Auto-Pilot enabled. Routing call to Vapi SIP.');
      // Dialing the Vapi Phone Number via SIP properly authenticates the call to your Org's wallet
      // and triggers the Phone Number's server.url (the assistant-request webhook).
      const sipTarget = toPhone || '+16123245110';
      const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:\${sipTarget}@sip.vapi.ai</Sip>
  </Dial>
</Response>\`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
`;

code = code.replace(/if \(aiEnabled\) \{[\s\S]*?(?=    \} else if \(forwardPhone\))/g, newAiBlock);

fs.writeFileSync(filePath, code);
console.log("Patched route.ts to use SIP with Phone Number routing");
