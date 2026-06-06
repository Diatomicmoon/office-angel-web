import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /setNewVisit\(\{ resident_name: "", address: "", interest_level: "not_interested", notes: "", property_size: "", existing_system: "", water_hardness: "", latitude: null, longitude: null \}\);/,
  `setNewVisit({ id: undefined, resident_name: "", address: "", interest_level: "not_interested", notes: "", property_size: "", existing_system: "", water_hardness: "", latitude: null, longitude: null });`
);

fs.writeFileSync(path, code);
console.log("Fixed type 2");
