const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/crm/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Define the new filters
const replacement1 = `const captured = leads.filter((l) => l.status === "captured" || !l.status);
  const estimating = leads.filter((l) => l.status === "estimating");
  const quote_sent = leads.filter((l) => l.status === "quote_sent");
  const follow_up = leads.filter((l) => l.status === "follow_up");
  const scheduled = leads.filter((l) => l.status === "scheduled" || l.status === "won");`;

content = content.replace(
  /const captured = leads\.filter[^\n]+\n  const estimating = leads\.filter[^\n]+\n  const scheduled = leads\.filter[^\n]+/,
  replacement1
);

const replacement2 = `<Column title="New Lead" color="bg-blue-500" items={captured} />
            <Column title="Quote Sent" color="bg-purple-500" items={quote_sent} />
            <Column title="Follow-Up Needed" color="bg-orange-500" items={follow_up} />
            <Column title="Won / Scheduled" color="bg-green-500" items={scheduled} />`;

content = content.replace(
  /<Column title="AI Captured"[^\n]+\n\s*<Column title="Estimating"[^\n]+\n\s*<Column title="Scheduled"[^\n]+/,
  replacement2
);

fs.writeFileSync(pagePath, content);
console.log("Patched CRM Kanban board");
