import fs from 'fs';
import path from 'path';

const file = path.resolve('/home/jakob/.openclaw/workspace/office-angel-web/src/app/canvassing/page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace handleMapClick to include reverse geocoding
const newHandleMapClick = `
  async function handleMapClick(lat: number, lng: number) {
    setNewVisit({ ...newVisit, latitude: lat, longitude: lng, address: "Fetching address..." });
    setShowAdd(true);
    
    try {
      const res = await fetch(\`https://nominatim.openstreetmap.org/reverse?format=json&lat=\${lat}&lon=\${lng}&zoom=18&addressdetails=1\`);
      const data = await res.json();
      if (data && data.display_name) {
        // Strip out the country and long zip code formats to keep it clean
        let cleanAddress = data.display_name.split(', United States')[0];
        setNewVisit(prev => ({ ...prev, address: cleanAddress }));
      } else {
        setNewVisit(prev => ({ ...prev, address: "Unknown Address (Manual Entry Required)" }));
      }
    } catch (e) {
      console.error("Reverse geocoding failed", e);
      setNewVisit(prev => ({ ...prev, address: "Failed to fetch address" }));
    }
  }
`;

content = content.replace(
  /function handleMapClick\(lat: number, lng: number\) \{[\s\S]*?setShowAdd\(true\);\n  \}/,
  newHandleMapClick.trim()
);

fs.writeFileSync(file, content);
console.log("Patched Map Click Reverse Geocoding in page.tsx");
