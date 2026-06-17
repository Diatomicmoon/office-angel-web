const fs = require('fs');
const file = 'src/app/crm/page.tsx';
let code = fs.readFileSync(file, 'utf8');

let newCode = code.replace(/<UrgencyBadge urgency={lead.urgency} \/>/g, '<UrgencyBadge urgency={lead.urgency} isWeb={lead.caller_name === "Web\\/SMS Lead" || lead.job_type.startsWith("Web Lead") || lead.status === "captured"} />');

fs.writeFileSync(file, newCode);
console.log('Fixed UrgencyBadge usage.');
