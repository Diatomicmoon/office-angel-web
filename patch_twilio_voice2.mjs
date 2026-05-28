import fs from 'fs';

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/api/twilio-voice/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

// Replace the fallback Co-Pilot check that might be causing a loop
const newFallback = `
    } else {
      // ── CO-PILOT MODE but no forward number set: Play a generic message ──
      console.warn('[TWILIO VOICE] AI disabled but no forward_to_phone set');
      const twiml = \`<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>Thank you for calling. No agents are available to take your call.</Say>
</Response>\`;
      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }
`;

code = code.replace(/\s*\} else \{\s*\/\/ ── CO-PILOT MODE but no forward number set[\s\S]*?\}(?=\s*\} catch)/g, newFallback);

fs.writeFileSync(filePath, code);
console.log("Patched route.ts fallback");
