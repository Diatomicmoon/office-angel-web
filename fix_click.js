const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/financials/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// Wait, the pills div has "hidden md:flex" which means it's hidden on mobile.
// Also check if there's any z-index or overlay issue.

// Let's remove "hidden" from the pill bar or check the mobile layout.
content = content.replace(
  'mr-auto ml-4 md:ml-8 hidden md:flex',
  'mr-auto ml-4 md:ml-8 flex-1 md:flex'
);

fs.writeFileSync(pagePath, content);
console.log("Fixed hidden class on mobile");
