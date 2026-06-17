const fs = require('fs');
const file = 'src/app/projects/customer-profile/page.tsx';
let code = fs.readFileSync(file, 'utf8');

// 1. Total Calls -> Total Requests
code = code.replace(
  '<p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Calls</p>',
  '<p className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">Total Requests</p>'
);

// 2. Button -> Link
const oldBtn = `<button className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ml-auto">
            <PlusCircle size={16} /> Book New Job
          </button>`;
const newBtn = `<Link href={\`/jobs?ghl_contact=1&name=\${encodeURIComponent(name || "")}&phone=\${encodeURIComponent(customer?.phone_number || "")}&address=\${encodeURIComponent(customer?.address || "")}\`} className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-2 ml-auto">
            <PlusCircle size={16} /> Book New Job
          </Link>`;
code = code.replace(oldBtn, newBtn);

// 3. Call & Job History
code = code.replace(
  'Call & Job History',
  'Interaction & Job History'
);

// 4. No calls recorded yet
code = code.replace(
  'No calls recorded yet.',
  'No requests recorded yet.'
);

// 5. Preset tags
const oldTags = 'const PRESET_TAGS = ["Dog in yard", "VIP", "Commercial", "Repeat customer", "Gate code needed", "Call before arriving"];';
const newTags = 'const PRESET_TAGS = ["Dog in yard", "VIP", "Commercial", "Repeat customer", "Gate code needed", "Call before arriving", "Weekly Mowing", "Bi-Weekly Mowing", "Seasonal Cleanup"];';
code = code.replace(oldTags, newTags);

fs.writeFileSync(file, code);
console.log('Patched customer profile.');
