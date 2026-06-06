import fs from 'fs';
const path = './src/app/api/vapi/assistant-request/route.ts';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('call_status: "incoming"')) {
  const insertCode = `
    // Log the incoming call so the dashboard "Active Call" banner works
    if (company) {
      await supabase.from('call_logs').insert([{
        company_id: company.id,
        call_status: 'incoming',
        meta: {
          phone: customerPhoneNumber,
          provider: 'vapi',
          lookup_name: 'Unknown Caller'
        }
      }]);
    }
  `;
  
  code = code.replace(
    /const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;/,
    `${insertCode}\n    const vapiAssistantId = process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID;`
  );
  fs.writeFileSync(path, code);
  console.log("Patched!");
} else {
  console.log("Already patched.");
}
