import fs from 'fs';

let content = fs.readFileSync('office-angel-web/src/app/api/canvassing/visits/route.ts', 'utf8');

// Change the notes formatting to include the database notes (so we can see 'Year Built: 2024')
content = content.replace(
  /\`Source: Auto-Scraped Property Sale\\nSale Date: \${lead.sale_date \|\| 'Unknown'}\\nStatus: \${lead.status.toUpperCase\(\)}\`/,
  "\`Source: \${lead.source || 'Auto-Scraped'}\\n\${lead.notes ? lead.notes + '\\n' : ''}Sale Date: \${lead.sale_date || 'Unknown'}\\nStatus: \${lead.status.toUpperCase()}\`"
);

fs.writeFileSync('office-angel-web/src/app/api/canvassing/visits/route.ts', content);
console.log("Patched API route.");
