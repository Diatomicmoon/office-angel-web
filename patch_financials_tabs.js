const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/financials/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

if (!content.includes('InvoicesTab')) {
  content = content.replace(
    'import Link from "next/link";',
    'import Link from "next/link";\nimport InvoicesTab from "./InvoicesTab";\nimport { FileText as FileTextIcon } from "lucide-react";'
  );
  
  content = content.replace(
    'const [ghlStats, setGhlStats] = useState<any>(null);',
    'const [ghlStats, setGhlStats] = useState<any>(null);\n  const [view, setView] = useState<"overview" | "invoices">("overview");'
  );
  
  content = content.replace(
    '<p className="text-gray-500 mt-2">Accounts Receivable, Profitability, and Cash Flow.</p>',
    `<p className="text-gray-500 mt-2">Accounts Receivable, Profitability, and Cash Flow.</p>
        </div>
        
        {/* Navigation Pills */}
        <div className="flex bg-gray-100 p-1 rounded-xl items-center mr-auto ml-4 md:ml-8 hidden md:flex">
          <button 
            onClick={() => setView('overview')}
            className={\`px-4 py-2 text-sm font-medium rounded-lg transition \${view === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
          >
            Overview
          </button>
          <button 
            onClick={() => setView('invoices')}
            className={\`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 \${view === 'invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
          >
            <FileTextIcon className="w-4 h-4" /> Invoices
          </button>`
  );

  content = content.replace(
    /<button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2">[\s\S]*?<\/button>/,
    `<button onClick={() => setView('invoices')} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all flex items-center gap-2">
            <DollarSign className="w-4 h-4" /> Invoices
          </button>`
  );
  
  content = content.replace(
    '{/* Top Stats Row */}',
    `{view === 'invoices' ? <InvoicesTab /> : (\n      <>\n      {/* Top Stats Row */}`
  );
  
  // Close the fragment at the end
  content = content.replace(
    /<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*$/g,
    '</div>\n      </div>\n      </div>\n      </>\n      )}\n    </div>\n  );\n}\n'
  );

  fs.writeFileSync(pagePath, content);
  console.log("Patched financials page.tsx");
} else {
  console.log("Already patched");
}
