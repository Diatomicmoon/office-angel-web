const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'app', 'jobs', 'page.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// Update state initialization
content = content.replace(
  /const \[newJob, setNewJob\] = useState\(\{ title: "", address: "", status: "Lead", priority: "normal" \}\);/g,
  `const [newJob, setNewJob] = useState({ title: "", address: "", status: "Lead", priority: "normal", scheduled_start: "" });`
);

// Update clearing of state
content = content.replace(
  /setNewJob\(\{ title: "", address: "", status: "Lead", priority: "normal" \}\);/g,
  `setNewJob({ title: "", address: "", status: "Lead", priority: "normal", scheduled_start: "" });`
);

// We need to inject the scheduled_start input inside the `<div className="p-5 space-y-4">`
const searchTarget = `<div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</label>`;

const replacementTarget = `<div>
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider flex items-center gap-2">
                  <CalendarClock size={14} className="text-blue-500" /> Scheduled Start
                </label>
                <input 
                  type="datetime-local" 
                  value={newJob.scheduled_start} 
                  onChange={e => setNewJob(p => ({...p, scheduled_start: e.target.value}))} 
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</label>`;

content = content.replace(searchTarget, replacementTarget);

fs.writeFileSync(filePath, content);
console.log("Patched successfully");
