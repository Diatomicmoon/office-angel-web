import fs from 'fs';

// 1. We need to add 'sales_rep_name' to the canvassing_visits table schema mentally,
// but for the UI, we can just pass it in the POST payload.
let pageContent = fs.readFileSync('office-angel-web/src/app/canvassing/page.tsx', 'utf8');

// Currently, we don't have a login system for individual reps yet, 
// so the simplest way to add "rep tracking" right now is to add a dropdown or input 
// to the "Log Visit" modal so they can select their name before saving.
const oldFormFields = `<div className="space-y-2">
                <Label>Interest Level</Label>`;

const newFormFields = `<div className="space-y-2">
                <Label>Sales Rep Name</Label>
                <Input 
                  placeholder="Your Name (e.g. Christian)" 
                  value={newVisit.sales_rep_name || ""} 
                  onChange={e => setNewVisit({ ...newVisit, sales_rep_name: e.target.value })} 
                />
              </div>
              <div className="space-y-2">
                <Label>Interest Level</Label>`;

if (!pageContent.includes('Sales Rep Name')) {
  pageContent = pageContent.replace(oldFormFields, newFormFields);
}

// Add sales_rep_name to the final notes or payload
const oldSubmit = `const systemInfo = \`\\n\\n--- Property Details ---\\nProperty Size: \${newVisit.property_size || 'N/A'}\\nExisting System: \${newVisit.existing_system || 'Unknown'}\\nWater Hardness: \${newVisit.water_hardness || 'Unknown'}\`;
    const finalNotes = (newVisit.notes || '') + systemInfo;

    await fetch("/api/canvassing/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newVisit, notes: finalNotes })
    });`;

const newSubmit = `const systemInfo = \`\\n\\n--- Property Details ---\\nProperty Size: \${newVisit.property_size || 'N/A'}\\nExisting System: \${newVisit.existing_system || 'Unknown'}\\nWater Hardness: \${newVisit.water_hardness || 'Unknown'}\`;
    const repInfo = newVisit.sales_rep_name ? \`\\n\\nLogged By: \${newVisit.sales_rep_name}\` : '';
    const finalNotes = (newVisit.notes || '') + systemInfo + repInfo;

    await fetch("/api/canvassing/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newVisit, notes: finalNotes, sales_rep_name: newVisit.sales_rep_name })
    });`;

if (!pageContent.includes('Logged By:')) {
  pageContent = pageContent.replace(oldSubmit, newSubmit);
}

// Clear it out on reset
pageContent = pageContent.replace(
  'existing_system: "", water_hardness: "",',
  'existing_system: "", water_hardness: "", sales_rep_name: "",'
);

fs.writeFileSync('office-angel-web/src/app/canvassing/page.tsx', pageContent);

console.log("Patched UI to include Sales Rep Name.");
