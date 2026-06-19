const fs = require('fs');
const path = require('path');

const sidebarPath = path.join(__dirname, 'src/components/Sidebar.tsx');
let content = fs.readFileSync(sidebarPath, 'utf8');

if (!content.includes('href="/invoices"')) {
  content = content.replace(
    /<Link href="\/financials" className=\{itemClass\('\/financials'\)\}>\s*<DollarSign className="mr-3 w-5 h-5" \/>\s*Financials\s*<\/Link>/g,
    `<Link href="/financials" className={itemClass('/financials')}>
              <DollarSign className="mr-3 w-5 h-5" />
              Financials
            </Link>
            {role === 'owner' && (
              <Link href="/invoices" className={itemClass('/invoices')}>
                <FileText className="mr-3 w-5 h-5" />
                Invoices
              </Link>
            )}`
  );
  fs.writeFileSync(sidebarPath, content);
  console.log("Invoices link added to Sidebar!");
} else {
  console.log("Invoices link already exists.");
}
