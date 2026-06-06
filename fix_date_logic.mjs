import fs from 'fs';
const path = './src/components/dashboard/NewBuildsTab.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const completion = new Date\(estimatedCompletion\);/,
  `const completion = new Date(estimatedCompletion);\n    const statusLower = (lead?.status || '').toLowerCase();`
);

code = code.replace(
  /if \(today > completion\) return \{ status: 'Completed \/ Move-in', color: 'bg-green-100 text-green-800' \};/,
  `if (statusLower.includes('complete') || statusLower.includes('final') || today > completion) return { status: 'Completed / Move-in', color: 'bg-green-100 text-green-800' };\n    if (statusLower.includes('rough')) return { status: 'Rough-Ins / Drywall', color: 'bg-blue-100 text-blue-800' };`
);

// We need to pass the whole lead to the function now to check status
code = code.replace(
  /const calculateTimeline = \(permitDate: string, estimatedCompletion: string\) => \{/,
  `const calculateTimeline = (permitDate: string, estimatedCompletion: string, lead: any) => {`
);

code = code.replace(
  /const phase = calculateTimeline\(lead.permit_date, lead.estimated_completion_date\);/,
  `const phase = calculateTimeline(lead.permit_date, lead.estimated_completion_date, lead);`
);

fs.writeFileSync(path, code);
console.log("Patched Timeline Logic");
