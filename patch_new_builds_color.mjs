import fs from 'fs';

// 1. Update MapView.tsx color map to include 'new_build'
let mapContent = fs.readFileSync('office-angel-web/src/app/canvassing/MapView.tsx', 'utf8');
mapContent = mapContent.replace(
  /hot: "#f97316",\n  warm: "#3b82f6",/g,
  'hot: "#f97316",\n  warm: "#3b82f6",\n  new_build: "#ef4444", // Red for New Builds'
);
mapContent = mapContent.replace(
  /hot: 14,\n  warm: 11,/g,
  'hot: 14,\n  warm: 11,\n  new_build: 12,'
);
fs.writeFileSync('office-angel-web/src/app/canvassing/MapView.tsx', mapContent);

// 2. Update the API route to set interest_level to 'new_build' for County CSV Import leads
let apiContent = fs.readFileSync('office-angel-web/src/app/api/canvassing/visits/route.ts', 'utf8');
const oldLine = "interest_level: lead.status === 'new' ? 'warm' : 'not_interested',";
const newLine = "interest_level: lead.source === 'County CSV Import' ? 'new_build' : (lead.status === 'new' ? 'warm' : 'not_interested'),";
apiContent = apiContent.replace(oldLine, newLine);
fs.writeFileSync('office-angel-web/src/app/api/canvassing/visits/route.ts', apiContent);

console.log("Patched New Builds to Red on the map.");
