import fs from 'fs';
const path = './src/app/canvassing/MapView.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  /onMapClick\?: \(lat: number, lng: number\) => void;/,
  `onMapClick?: (lat: number, lng: number) => void;\n  onPinClick?: (visit: Visit) => void;`
);

code = code.replace(
  /export default function MapView\(\{ visits, center = \[44.9778, -93.265\], userLocation, zoom = 14, onMapClick \}: Props\) \{/,
  `export default function MapView({ visits, center = [44.9778, -93.265], userLocation, zoom = 14, onMapClick, onPinClick }: Props) {`
);

code = code.replace(
  /<CircleMarker\n                key=\{visit\.id\}/,
  `<CircleMarker
                key={visit.id}
                eventHandlers={{ click: () => { if (onPinClick) onPinClick(visit); } }}`
);

fs.writeFileSync(path, code);
console.log("Patched MapView");
