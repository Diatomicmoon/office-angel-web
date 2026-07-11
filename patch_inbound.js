const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'api', 'receipts-inbound', 'route.ts');
let content = fs.readFileSync(filePath, 'utf8');

const replacement = `
    let companyId = null;

    // 1. Try matching by Inbox Token (if we ever use SendGrid inbound parse)
    if (toEmail) {
      const uuidMatch = toEmail.match(/inbox_([a-f0-9-]{36})@/i);
      if (uuidMatch) {
        const { data: co } = await supabase.from('companies').select('id').eq('inbox_token', uuidMatch[1]).single();
        if (co) companyId = co.id;
      }
    }

    // 2. Try matching by Sender Email (if the user forwarded the receipt from their own email)
    if (!companyId && sender) {
      const emailMatch = sender.match(/<([^>]+)>/);
      const cleanEmail = emailMatch ? emailMatch[1].toLowerCase().trim() : sender.toLowerCase().trim();
      
      const { data: user } = await supabase.from('users').select('company_id').eq('email', cleanEmail).single();
      if (user && user.company_id) {
        companyId = user.company_id;
      }
    }

    // 3. Fallback to Hard Hat Demo Company
    if (!companyId) {
      companyId = process.env.HARD_HAT_COMPANY_ID || process.env.OFFICE_ANGEL_COMPANY_ID;
    }
`;

content = content.replace(/let companyId = process\.env\.HARD_HAT_COMPANY_ID[\s\S]*?companyId = co\?\.id;\s*\}\s*\}/, replacement);

fs.writeFileSync(filePath, content);
console.log("Patched receipts-inbound");
