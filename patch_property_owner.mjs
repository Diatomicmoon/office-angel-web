import fs from 'fs';
import path from 'path';

const file = path.resolve('/home/jakob/.openclaw/workspace/office-angel-web/src/app/canvassing/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace the reverse geocode handler to also fetch property owner details
const newHandleMapClick = `
  async function handleMapClick(lat: number, lng: number) {
    setNewVisit({ ...newVisit, latitude: lat, longitude: lng, address: "Fetching address and owner...", resident_name: "Looking up..." });
    setShowAdd(true);
    
    try {
      // 1. Reverse Geocode the Address
      const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}&zoom=18&addressdetails=1\`);
      const data = await res.json();
      let cleanAddress = "Unknown Address";
      
      if (data && data.display_name) {
        cleanAddress = data.display_name.split(', United States')[0];
      }

      // 2. Fetch Property Owner Data (Mock API for now)
      let ownerName = "";
      try {
        const propRes = await fetch(\`/api/property?lat=\${lat}&lng=\${lng}&address=\${encodeURIComponent(cleanAddress)}\`);
        const propData = await propRes.json();
        if (propData && propData.owner_name) {
          ownerName = propData.owner_name;
        }
      } catch (err) {
        console.error("Property lookup failed", err);
      }

      setNewVisit(prev => ({ 
        ...prev, 
        address: cleanAddress,
        resident_name: ownerName || ""
      }));
      
    } catch (e) {
      console.error("Reverse geocoding failed", e);
      setNewVisit(prev => ({ ...prev, address: "Failed to fetch address", resident_name: "" }));
    }
  }
`;

content = content.replace(
  /async function handleMapClick\(lat: number, lng: number\) \{[\s\S]*?setNewVisit\(prev => \(\{ \.\.\.prev, address: "Failed to fetch address" \}\)\);\n    \}\n  \}/,
  newHandleMapClick.trim()
);

fs.writeFileSync(file, content);
console.log("Patched Map Click Property Owner lookup in page.tsx");
