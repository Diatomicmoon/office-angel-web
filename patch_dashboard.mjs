import fs from 'fs';

let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

// Add imports
content = content.replace('"use client";\n', '"use client";\n\nimport { useState, useEffect } from "react";\n');

// Add state and fetch
const stateInject = `
  const [data, setData] = useState<any>({ calls: [], stats: { totalCalls: 0, emergencies: 0, actionItemsCount: 0 } });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);
`;

content = content.replace('export default function Dashboard() {\n', 'export default function Dashboard() {\n' + stateInject);

// Replace hardcoded stats
content = content.replace('<p className="text-3xl font-bold text-gray-900">142</p>', '{loading ? <p className="text-3xl font-bold text-gray-400">...</p> : <p className="text-3xl font-bold text-gray-900">{data.stats.totalCalls}</p>}');
content = content.replace('<p className="text-3xl font-bold text-red-900">2</p>', '{loading ? <p className="text-3xl font-bold text-gray-400">...</p> : <p className="text-3xl font-bold text-red-900">{data.stats.emergencies}</p>}');

// We'll leave the Missed Calls Rescued and Auto-Scheduled as hardcoded for now or hook them up later if we add those to the schema.

// Replace Recent AI Calls list with a dynamic map
const dynamicCalls = `
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-5 text-gray-500">Loading recent calls...</div>
              ) : data.calls.length === 0 ? (
                <div className="p-5 text-gray-500">No calls yet.</div>
              ) : (
                data.calls.slice(0, 3).map((call: any) => (
                  <div key={call.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={\`h-10 w-10 rounded-full flex items-center justify-center \${call.urgency_flag === 'high' ? 'bg-red-100' : 'bg-green-100'}\`}>
                        {call.urgency_flag === 'high' ? <AlertTriangle size={18} className="text-red-600" /> : <CheckCircle2 size={18} className="text-green-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {call.customers?.first_name ? \`\${call.customers.first_name} \${call.customers.last_name || ''}\` : call.customers?.phone_number || 'Unknown Caller'}
                          <span className={\`ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border \${call.urgency_flag === 'high' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}\`}>
                            {call.urgency_flag || 'Standard'}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{call.summary}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <Link href="/call-logs" className="text-xs text-blue-700 hover:text-blue-900 font-bold mt-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1">Transcript <ArrowRight size={12}/></Link>
                    </div>
                  </div>
                ))
              )}
            </div>
`;

// Extract the exact block of the old divide-y divide-gray-100 and replace it.
const regex = /<div className="divide-y divide-gray-100">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*<\!-- Right Column/m;
const match = content.match(/<div className="divide-y divide-gray-100">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Right Column/);

if (match) {
  content = content.replace(match[0], dynamicCalls + '\n          </div>\n        </div>\n\n        {/* Right Column');
} else {
    console.log("Could not find replacement block for calls");
}

fs.writeFileSync('src/app/dashboard/page.tsx', content);
console.log("Patched dashboard");
