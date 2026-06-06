import fs from 'fs';
const path = './src/app/api/canvassing/visits/route.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /interest_level: lead\.source === 'County CSV Import' \? 'new_build' : \(lead\.status === 'new' \? 'warm' : 'not_interested'\),/,
  `interest_level: lead.interest_level || (lead.source === 'County CSV Import' ? 'new_build' : (lead.status === 'new' ? 'unknocked_lead' : 'not_interested')),`
);

fs.writeFileSync(path, code);
console.log("Patched visits API");
