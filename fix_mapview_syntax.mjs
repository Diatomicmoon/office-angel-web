import fs from 'fs';
const path = './src/app/canvassing/MapView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /function MapEventsHandler\(\{ onMapClick \}: \{ onMapClick\?: \(lat: number, lng: number\) => void \}\) \{\s*const map = useMapEvents\(\{\s*baselayerchange\(e\) \{\s*localStorage\.setItem\("oa_map_layer", e\.name\);\s*\},/,
  `function MapEventsHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {\n  const map = useMapEvents({\n    baselayerchange(e) {\n      localStorage.setItem("oa_map_layer", e.name);\n    },`
);

// We need to fix the duplicate const map definition that we accidentally created
code = code.replace(
  /function MapEventsHandler\(\{ onMapClick \}: \{ onMapClick\?: \(lat: number, lng: number\) => void \}\) \{\s*const map = useMapEvents\(\{\s*baselayerchange\(e\) \{\s*localStorage\.setItem\("oa_map_layer", e\.name\);\s*\},\s*const map = useMapEvents\(\{/,
  `function MapEventsHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {\n  const map = useMapEvents({\n    baselayerchange(e) {\n      localStorage.setItem("oa_map_layer", e.name);\n    },`
);

fs.writeFileSync(path, code);
console.log("Fixed MapView Syntax");
