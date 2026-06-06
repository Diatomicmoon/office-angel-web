import fs from 'fs';
const path = './src/app/canvassing/MapView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /import \{ MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents, useMap, LayersControl \} from "react-leaflet";/,
  `import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents, useMap, LayersControl, ZoomControl } from "react-leaflet";`
);

code = code.replace(
  /<MapContainer\s*center=\{initialCenter\}\s*zoom=\{initialZoom\}\s*className="w-full h-full"\s*style=\{\{ height: "100%", width: "100%", position: "absolute", inset: 0 \}\}\s*scrollWheelZoom=\{true\}\s*>/,
  `<MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full"
        style={{ height: "100%", width: "100%", position: "absolute", inset: 0, zIndex: 0 }}
        scrollWheelZoom={true}
        zoomControl={false}
      >
        <ZoomControl position="bottomright" />`
);

code = code.replace(
  /<LayersControl position="topright">/,
  `<LayersControl position="bottomright">`
);

fs.writeFileSync(path, code);
console.log("Moved controls");
