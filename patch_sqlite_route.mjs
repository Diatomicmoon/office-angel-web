import fs from 'fs';

let content = fs.readFileSync('office-angel-web/src/app/api/property/route.ts', 'utf8');

// Vercel/NextJS doesn't like the template literal syntax inside db.all for some reason with Turbopack,
// or it's interpreting the backticks weirdly because of my previous script injection.
content = content.replace(
  /db.all\(\s*`SELECT \* FROM parcels WHERE lat BETWEEN \? AND \? AND lon BETWEEN \? AND \?`,\s*/,
  'db.all("SELECT * FROM parcels WHERE lat BETWEEN ? AND ? AND lon BETWEEN ? AND ?",\n          '
);

fs.writeFileSync('office-angel-web/src/app/api/property/route.ts', content);
console.log("Patched SQLite syntax error.");
