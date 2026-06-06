import fs from 'fs';
const path = './src/app/api/canvassing/visits/route.ts';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /const body = await request\.json\(\);\s*const \{ error \} = await supabase\s*\.from\('canvassing_visits'\)\s*\.insert\(\[\{\s*\.\.\.body,\s*company_id: companies\?\.\[0\]\?\.id\s*\}\]\);/,
  `const body = await request.json();
  const { id, ...visitData } = body; // remove id to prevent uuid collision
  
  // Also try to update the lead/new_build if they exist to keep statuses synced
  if (id) {
    // Try updating leads
    await supabase.from('leads').update({ interest_level: visitData.interest_level, notes: visitData.notes, status: visitData.interest_level === 'hot' ? 'contacted' : 'new' }).eq('id', id);
    // Try updating new builds
    await supabase.from('new_build_permits').update({ status: visitData.interest_level === 'hot' ? 'contacted' : 'knocked' }).eq('id', id);
  }

  const { error } = await supabase
    .from('canvassing_visits')
    .insert([{
      ...visitData,
      company_id: companies?.[0]?.id
    }]);`
);

fs.writeFileSync(path, code);
console.log("Patched Visits POST");
