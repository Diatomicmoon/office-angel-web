const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/financials/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

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

  content = content.replace(
    'return (',
    `return (
    <>
      {showManualModal && <ManualLedgerModal onClose={() => setShowManualModal(false)} onSuccess={() => { setShowManualModal(false); /* Ideally fetch data again */ }} />}`
  );
  
  content = content.replace(/<\/div>\s*$/g, '</div>\n    </>\n');
  
  fs.writeFileSync(pagePath, content);
  console.log("Patched financials page to add ManualLedgerModal");
} else {
  console.log("Already patched");
}
