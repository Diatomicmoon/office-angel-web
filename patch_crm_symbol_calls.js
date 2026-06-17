const fs = require('fs');
const file = 'src/app/crm/page.tsx';
let code = fs.readFileSync(file, 'utf8');

const oldStr = `type Lead = {
  id: string;
  customer_id: string;
  job_id: string;
  scheduled_start: string | null;
  caller_name: string;
  phone: string;
  address: string;
  job_type: string;
  job_details: string;
  urgency: string;
  summary: string;
  action_items: string;
  transcript: any;
  recording_url: string;
  status: string;
  time_ago: string;
  created_at: string;
};`;

const newStr = `type Lead = {
  id: string;
  customer_id: string;
  job_id: string;
  scheduled_start: string | null;
  caller_name: string;
  phone: string;
  address: string;
  job_type: string;
  job_details: string;
  urgency: string;
  summary: string;
  action_items: string;
  transcript: any;
  recording_url: string;
  status: string;
  time_ago: string;
  created_at: string;
  isWeb?: boolean;
};`;

if (code.includes(oldStr)) {
  code = code.replace(oldStr, newStr);
  fs.writeFileSync(file, code);
  console.log('Fixed Lead type.');
} else {
  console.log('Lead type not found');
}

// Ensure the usage actually uses lead.isWeb instead of the hacky checks
code = fs.readFileSync(file, 'utf8');
const hackyRegex = /<UrgencyBadge urgency=\{lead\.urgency\} isWeb=\{lead\.caller_name === "Web\\\/SMS Lead" \|\| lead\.job_type\.startsWith\("Web Lead"\) \|\| lead\.status === "captured"\} \/>/g;
if (code.match(hackyRegex)) {
  code = code.replace(hackyRegex, '<UrgencyBadge urgency={lead.urgency} isWeb={lead.isWeb} />');
  fs.writeFileSync(file, code);
  console.log('Fixed UrgencyBadge to use isWeb property.');
} else {
  console.log('Hacky badge usage not found.');
}
