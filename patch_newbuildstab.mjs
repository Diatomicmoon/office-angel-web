import fs from 'fs';
const path = './src/components/dashboard/NewBuildsTab.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /export default function NewBuildsTab\(\{ companyId: initialCompanyId \}: \{ companyId\?: string \}\) \{/,
  `export default function NewBuildsTab({ companyId: initialCompanyId, fixedMode }: { companyId?: string, fixedMode?: 'csv' | 'permits' | null }) {`
);

code = code.replace(
  /const \[viewMode, setViewMode\] = useState\<'all' \| 'csv' \| 'permits'\>\('all'\);/,
  `const [viewMode, setViewMode] = useState<'all' | 'csv' | 'permits'>(fixedMode || 'all');`
);

code = code.replace(
  /<div className="flex flex-wrap gap-2">[\s\S]*?<\/div>\s*<\/div>\s*<div className="relative">/m,
  `{!fixedMode && (<div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setViewMode('all')}
            className={\`px-4 py-2 text-sm font-medium rounded-lg transition-colors \${viewMode === 'all' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}\`}
          >
            All Leads
          </button>
          <button 
            onClick={() => setViewMode('permits')}
            className={\`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 \${viewMode === 'permits' ? 'bg-blue-600 text-white' : 'bg-blue-50 text-blue-700 hover:bg-blue-100'}\`}
          >
            <HardHat className="w-4 h-4" /> Live Permits
          </button>
          <button 
            onClick={() => setViewMode('csv')}
            className={\`px-4 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-2 \${viewMode === 'csv' ? 'bg-green-600 text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}\`}
          >
            <CalendarDays className="w-4 h-4" /> County CSV Records
          </button>
        </div>)}
        <div className="relative">`
);

code = code.replace(
  /<h2>[\s\S]*?<\/h2>/,
  `<h2>{fixedMode === 'permits' ? 'Expected Builds (Live Permits)' : fixedMode === 'csv' ? 'New Builds (2025+ CSV)' : 'New Construction Leads'}</h2>`
);

fs.writeFileSync(path, code);
console.log("Patched NewBuildsTab");
