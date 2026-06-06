import fs from 'fs';

let pageContent = fs.readFileSync('office-angel-web/src/app/canvassing/page.tsx', 'utf8');

const oldReset = `setNewVisit({ resident_name: "", address: "", interest_level: "not_interested", notes: "", property_size: "", existing_system: "", water_hardness: "", latitude: null, longitude: null });`;
const newReset = `setNewVisit({ resident_name: "", address: "", interest_level: "not_interested", notes: "", property_size: "", existing_system: "", water_hardness: "", sales_rep_name: "", latitude: null, longitude: null });`;

pageContent = pageContent.replace(oldReset, newReset);

fs.writeFileSync('office-angel-web/src/app/canvassing/page.tsx', pageContent);

console.log("Patched UI type error.");
