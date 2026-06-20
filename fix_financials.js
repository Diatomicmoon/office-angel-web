const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/financials/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

// The replacement should be around the "Loading financial data..." or right after the GHL Pipeline Banner
// Actually, it's easiest to replace:
//      ) : (
//        <>
//          {/* GHL Pipeline Banner */}

const target = `      ) : (
        <>
          {/* GHL Pipeline Banner */}`;

const replacement = `      ) : view === 'invoices' ? (
        <InvoicesTab />
      ) : (
        <>
          {/* GHL Pipeline Banner */}`;

if (content.includes(target)) {
    content = content.replace(target, replacement);
    fs.writeFileSync(pagePath, content);
    console.log("Fixed Invoices tab rendering");
} else {
    console.log("Target string not found in financials/page.tsx");
}
