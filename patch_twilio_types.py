import re

with open('src/app/api/twilio-voice/route.ts', 'r') as f:
    content = f.read()

content = content.replace(
    "const phones = forwardPhone.split(',').map(p => p.trim()).filter(Boolean);",
    "const phones = forwardPhone.split(',').map((p: string) => p.trim()).filter(Boolean);"
)

content = content.replace(
    "const dialContent = phones.map(p => `<Number>${p}</Number>`).join('\\n    ');",
    "const dialContent = phones.map((p: string) => `<Number>${p}</Number>`).join('\\n    ');"
)

with open('src/app/api/twilio-voice/route.ts', 'w') as f:
    f.write(content)
