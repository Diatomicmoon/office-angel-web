const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/financials/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(
  'mr-auto ml-4 md:ml-8 hidden md:flex',
  'mr-auto ml-4 md:ml-8 flex-1 md:flex'
);

if (!content.includes('ManualLedgerModal')) {
  content = content.replace(
    'import InvoicesTab from "./InvoicesTab";',
    'import InvoicesTab from "./InvoicesTab";\nimport ManualLedgerModal from "./ManualLedgerModal";\nimport { PlusCircle } from "lucide-react";'
  );

  content = content.replace(
    'const [view, setView] = useState<"overview" | "invoices">("overview");',
    'const [view, setView] = useState<"overview" | "invoices">("overview");\n  const [showManualModal, setShowManualModal] = useState(false);'
  );

  content = content.replace(
    '<Link href="/settings" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all">',
    `<button onClick={() => setShowManualModal(true)} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all flex items-center gap-2">
            <PlusCircle size={16} /> Log Manual
          </button>
          <Link href="/settings" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all hidden lg:flex">`
  );

  const returnIndex = content.indexOf('return (');
  if (returnIndex !== -1) {
    const splitIndex = returnIndex + 'return ('.length;
    let pre = content.substring(0, splitIndex);
    let post = content.substring(splitIndex);
    
    pre = pre + `\n    <>\n      {showManualModal && <ManualLedgerModal onClose={() => setShowManualModal(false)} onSuccess={() => { setShowManualModal(false); /* Ideally fetch data again */ }} />}`;
    
    const lastClosingIndex = post.lastIndexOf('  );\n}');
    if (lastClosingIndex !== -1) {
      post = post.substring(0, lastClosingIndex) + `    </>\n` + post.substring(lastClosingIndex);
    }
    content = pre + post;
  }
}

fs.writeFileSync(pagePath, content);
console.log("Patched correctly");
