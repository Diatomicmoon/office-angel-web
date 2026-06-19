const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, 'src/components/Sidebar.tsx');
let content = fs.readFileSync(sidebarPath, 'utf8');

const replacement = `<Link href="/financials" className={itemClass('/financials')}>
              <DollarSign className="mr-3 w-5 h-5" />
              Financials
            </Link>`;

const pattern = /<Link href="\/financials" className=\{itemClass\('\/financials'\)\}>\s*<DollarSign className="mr-3 w-5 h-5" \/>\s*Financials\s*<\/Link>\s*\{role === 'owner' && \(\s*<Link href="\/invoices" className=\{itemClass\('\/invoices'\)\}>\s*<FileText className="mr-3 w-5 h-5" \/>\s*Invoices\s*<\/Link>\s*\)\}/g;

content = content.replace(pattern, replacement);
fs.writeFileSync(sidebarPath, content);
console.log("Reverted sidebar invoices link.");
