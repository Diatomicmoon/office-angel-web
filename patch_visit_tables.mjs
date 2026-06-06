import fs from 'fs';

function patchFile(path) {
  let code = fs.readFileSync(path, 'utf8');
  code = code.replace(/from\('canvassing_visits'\)/g, "from('door_knocking_visits')");
  fs.writeFileSync(path, code);
  console.log("Patched", path);
}

patchFile('./src/app/api/canvassing/visits/route.ts');
patchFile('./src/app/api/canvassing/stats/route.ts');
