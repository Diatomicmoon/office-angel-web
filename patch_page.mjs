import fs from 'fs';
const path = './src/app/canvassing/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /function handleMapClick\(lat: number, lng: number\) \{/,
  `function handleMapClick(lat: number, lng: number) {`
);

const pinHandler = `
  function handlePinClick(visit: any) {
    setNewVisit({
      id: visit.id,
      resident_name: visit.resident_name || "",
      address: visit.address || "",
      interest_level: visit.interest_level || "not_interested",
      notes: visit.notes || "",
      latitude: visit.latitude || visit.lat,
      longitude: visit.longitude || visit.lng,
      property_size: "",
      existing_system: "",
      water_hardness: ""
    });
    setShowAdd(true);
  }
`;

code = code.replace(
  /function handleMapClick\(lat: number, lng: number\) \{/,
  pinHandler + `\n  function handleMapClick(lat: number, lng: number) {`
);

code = code.replace(
  /<MapView visits=\{visits\} onMapClick=\{handleMapClick\} \/>/g,
  `<MapView visits={visits} onMapClick={handleMapClick} onPinClick={handlePinClick} />`
);

// We need to replace the modal fields to be more generic/electrical focused
code = code.replace(
  /<option value="None">None \/ Hard Water<\/option>\s*<option value="Old Softener">Old Softener \(Needs Replace\)<\/option>\s*<option value="Iron Filter">Iron Filter Only<\/option>\s*<option value="Modern Softener">Modern Softener \(Good\)<\/option>/,
  `<option value="Unknown">Unknown</option>
                      <option value="Older Home">Older Home (Likely needs updates)</option>
                      <option value="Remodeling">Actively Remodeling</option>
                      <option value="New Build">New Construction</option>`
);

code = code.replace(
  /<label className="text-sm font-medium">Existing Water System<\/label>/,
  `<label className="text-sm font-medium">Property Status</label>`
);

code = code.replace(
  /<div className="space-y-2">\s*<label className="text-sm font-medium">Water Hardness \(Test Results\)<\/label>\s*<input className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. 15 GPG" value=\{newVisit.water_hardness\} onChange=\{e => setNewVisit\(\{\.\.\.newVisit, water_hardness: e.target.value\}\)\} \/>\s*<\/div>/,
  `` // remove water hardness field
);

code = code.replace(
  /const systemInfo = \`\\n\\n--- Property Details ---\\nProperty Size: \$\{newVisit\.property_size \|\| 'N\/A'}\\nExisting System: \$\{newVisit\.existing_system \|\| 'Unknown'}\\nWater Hardness: \$\{newVisit\.water_hardness \|\| 'Unknown'}\`;/,
  `const systemInfo = \`\\n\\n--- Property Details ---\\nProperty Status: \$\{newVisit.existing_system || 'Unknown'}\`;`
);

fs.writeFileSync(path, code);
console.log("Patched page");
