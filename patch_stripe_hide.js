const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'financials', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Hide it again for non-dev accounts to prevent trial users from getting stuck in Stripe onboarding
content = content.replace(/\{!hasStripe && \(/g, '{isDevAccount && !hasStripe && (');
// Optionally hide the "Stripe Connected" badge for non-devs too just in case
content = content.replace(/\{hasStripe && \(/g, '{isDevAccount && hasStripe && (');

fs.writeFileSync(filePath, content);
console.log("Patched Stripe Button to Dev only");
