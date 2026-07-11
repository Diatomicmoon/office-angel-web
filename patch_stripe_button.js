const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'financials', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// The issue is:
// {isDevAccount && !hasStripe && (
// It is hiding the Stripe connect button for non-dev accounts (like Greenside Glass Co).
// Let's remove the isDevAccount restriction so anyone can connect Stripe.

content = content.replace(/\{isDevAccount && !hasStripe && \(/g, '{!hasStripe && (');
content = content.replace(/\{isDevAccount && hasStripe && \(/g, '{hasStripe && (');

fs.writeFileSync(filePath, content);
console.log("Patched Stripe Button successfully");
