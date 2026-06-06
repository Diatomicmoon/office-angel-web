import fs from 'fs';

let content = fs.readFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', 'utf8');

// replace: const isCountyRecord = lead.notes && lead.notes.includes('County Tax Record');
// with: const isCountyRecord = lead.permit_date === '2026-01-01';

content = content.replace(
  "const isCountyRecord = lead.notes && lead.notes.includes('County Tax Record');",
  "const isCountyRecord = lead.permit_date === '2026-01-01';"
);

fs.writeFileSync('/home/jakob/.openclaw/workspace/office-angel-web/src/components/dashboard/NewBuildsTab.tsx', content);
console.log("Patched NewBuildsTab.tsx");
