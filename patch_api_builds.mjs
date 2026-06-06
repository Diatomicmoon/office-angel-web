import fs from 'fs';
const path = './src/app/api/canvassing/visits/route.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /interest_level: 'new_build',/,
  `interest_level: build.status === 'contacted' ? 'hot' : (build.status === 'knocked' ? 'warm' : 'new_build'),`
);

fs.writeFileSync(path, code);
console.log("Patched builds API");
