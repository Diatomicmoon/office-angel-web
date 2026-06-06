import fs from 'fs';
const path = './src/app/api/canvassing/visits/route.ts';
let code = fs.readFileSync(path, 'utf8');

const newInsert = `
  const dbVisit = {
    company_id: companies?.[0]?.id,
    resident_name: visitData.resident_name,
    address: visitData.address,
    latitude: visitData.latitude,
    longitude: visitData.longitude,
    interest_level: visitData.interest_level,
    notes: visitData.notes,
    visited_at: new Date().toISOString()
  };

  const { error } = await supabase
    .from('door_knocking_visits')
    .insert([dbVisit]);
`;

code = code.replace(
  /const \{ error \} = await supabase\s*\.from\('door_knocking_visits'\)\s*\.insert\(\[\{\s*\.\.\.visitData,\s*company_id: companies\?\.\[0\]\?\.id\s*\}\]\);/,
  newInsert
);

fs.writeFileSync(path, code);
console.log("Patched schema mapping");
