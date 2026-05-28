import fs from 'fs';

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/api/twilio-voice/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

// Ensure Vapi Assistant ID exists before sending to SIP to avoid "phone number not found" generic Twilio message
const newAiBlock = `
    if (aiEnabled) {
      // ── AI MODE (Auto-Pilot): Forward the call instantly to Vapi via SIP ──
      console.log('[TWILIO VOICE] AI Auto-Pilot enabled. Routing call to Vapi SIP.');
      
      if (!vapiAssistantId) {
        console.error('[TWILIO VOICE ERROR] Missing vapiAssistantId!');
        const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Configuration error. Missing AI ID.</Say>
</Response>\`;
        return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
      }

      const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:\${vapiAssistantId}@sip.vapi.ai;transport=tls</Sip>
  </Dial>
</Response>\`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }
`;

code = code.replace(/if \(aiEnabled\) \{[\s\S]*?(?=\} else if \(forwardPhone\))/g, newAiBlock);

fs.writeFileSync(filePath, code);
console.log("Patched route.ts logging");
