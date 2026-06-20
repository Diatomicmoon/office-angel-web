const fs = require('fs');
const path = require('path');

const pagePath = path.join(__dirname, 'src/app/settings/page.tsx');
let content = fs.readFileSync(pagePath, 'utf8');

content = content.replace(
  'import { createClient } from "@/lib/supabase";',
  'import { createClient } from "@/lib/supabase";\nimport TeamTab from "./TeamTab";\nimport { Users } from "lucide-react";'
);

content = content.replace(
  'const [resetMsg, setResetMsg] = useState<string | null>(null);',
  'const [resetMsg, setResetMsg] = useState<string | null>(null);\n  const [activeTab, setActiveTab] = useState<"general" | "team">("general");'
);

content = content.replace(
  '<div className="max-w-3xl mx-auto p-8 space-y-8">',
  `<div className="max-w-4xl mx-auto p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-2">Manage your company, team, and integrations.</p>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-xl items-center hidden md:flex">
          <button 
            onClick={() => setActiveTab('general')}
            className={\`px-4 py-2 text-sm font-medium rounded-lg transition \${activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
          >
            General Settings
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={\`px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 \${activeTab === 'team' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}\`}
          >
            <Users className="w-4 h-4" /> Team & Roles
          </button>
        </div>
      </div>
      
      <div className="md:hidden flex bg-gray-100 p-1 rounded-xl items-center mb-6">
          <button 
            onClick={() => setActiveTab('general')}
            className={\`flex-1 py-2 text-sm font-medium rounded-lg transition \${activeTab === 'general' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}\`}
          >
            General
          </button>
          <button 
            onClick={() => setActiveTab('team')}
            className={\`flex-1 py-2 text-sm font-medium rounded-lg transition flex items-center justify-center gap-2 \${activeTab === 'team' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}\`}
          >
            <Users className="w-4 h-4" /> Team
          </button>
      </div>
      
      {activeTab === 'team' ? <TeamTab /> : (
      <>`
);

const lastIndex = content.lastIndexOf('</div>');
content = content.substring(0, lastIndex) + '      </>\n      )}\n    </div>';

fs.writeFileSync(pagePath, content);
