import fs from 'fs';

const filePath = '/home/jakob/.openclaw/workspace/office-angel-web/src/app/api/twilio-voice/route.ts';
let code = fs.readFileSync(filePath, 'utf8');

// The error on Vercel is at line 149, likely a mismatched brace from the previous patch.
// Let's fix the specific block.
const badBlock = `      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    }
} else if (forwardPhone) {`;

const goodBlock = `      return new NextResponse(twiml, { headers: { 'Content-Type': 'text/xml' } });
    } else if (forwardPhone) {`;

code = code.replace(badBlock, goodBlock);
fs.writeFileSync(filePath, code);
console.log("Patched syntax error");
