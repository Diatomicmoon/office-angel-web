const fs = require('fs');
const file = 'src/app/crm/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldBadge = `function UrgencyBadge({ urgency }: { urgency: string }) {
  const u = (urgency || "low").toLowerCase();
  if (u === "high") return <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">🚨 Emergency</span>;
  if (u === "medium") return <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">📋 Estimate</span>;
  return <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">📞 Standard</span>;
}`;

const newBadge = `function UrgencyBadge({ urgency, isWeb }: { urgency: string, isWeb?: boolean }) {
  const u = (urgency || "low").toLowerCase();
  const icon = isWeb ? "🌐" : "📞";
  if (u === "high") return <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">🚨 Emergency</span>;
  if (u === "medium") return <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">📋 Estimate</span>;
  return <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{icon} Standard</span>;
}`;

if (code.includes(oldBadge)) {
  code = code.replace(oldBadge, newBadge);
  fs.writeFileSync(file, code);
  console.log('Fixed UrgencyBadge signature.');
} else {
  console.log('Badge not found');
}
