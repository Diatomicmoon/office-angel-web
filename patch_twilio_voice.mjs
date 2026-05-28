import fs from 'fs';

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/api/twilio-voice/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

// Replace the complicated Vapi fetch block with a simple SIP forward for AI mode
const newAiBlock = `
    if (aiEnabled) {
      // ── AI MODE (Auto-Pilot): Forward the call instantly to Vapi via SIP ──
      console.log('[TWILIO VOICE] AI Auto-Pilot enabled. Routing call to Vapi SIP.');
      const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Dial>
    <Sip>sip:\${vapiAssistantId}@sip.vapi.ai;transport=tls</Sip>
  </Dial>
</Response>\`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
`;

code = code.replace(/if \(aiEnabled\) \{[\s\S]*?(?=    \} else if \(forwardPhone\))/g, newAiBlock);

fs.writeFileSync(filePath, code);
console.log("Patched route.ts");
