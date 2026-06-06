import fs from 'fs';
const path = './src/app/canvassing/MapView.tsx';
let code = fs.readFileSync(path, 'utf8');

if (!code.includes('oa_map_layer')) {
  // Add map layer persistance to MapEventsHandler
  code = code.replace(
    /function MapEventsHandler\(\{ onMapClick \}: \{ onMapClick\?: \(lat: number, lng: number\) => void \}\) \{/,
    `function MapEventsHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    baselayerchange(e) {
      localStorage.setItem("oa_map_layer", e.name);
    },`
  );
  
  // Apply saved layer on mount
  code = code.replace(
    /<LayersControl\.BaseLayer checked name="Street View">/g,
    `<LayersControl.BaseLayer checked={typeof window !== 'undefined' ? localStorage.getItem('oa_map_layer') !== 'Satellite View' : true} name="Street View">`
  );
  
  code = code.replace(
    /<LayersControl\.BaseLayer name="Satellite View">/g,
    `<LayersControl.BaseLayer checked={typeof window !== 'undefined' ? localStorage.getItem('oa_map_layer') === 'Satellite View' : false} name="Satellite View">`
  );
  
  fs.writeFileSync(path, code);
  console.log("Patched MapView Settings");
}
