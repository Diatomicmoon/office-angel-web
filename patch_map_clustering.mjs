import fs from 'fs';

const filePath = 'office-angel-web/src/app/canvassing/MapView.tsx';
let code = fs.readFileSync(filePath, 'utf8');

// 1. Imports: Add Marker, MarkerClusterGroup, and L
code = code.replace(
  'import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents, useMap, LayersControl, ZoomControl, LayerGroup } from "react-leaflet";',
  'import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents, useMap, LayersControl, ZoomControl, LayerGroup, Marker } from "react-leaflet";\nimport MarkerClusterGroup from "react-leaflet-cluster";\nimport L from "leaflet";'
);

// 2. Add custom icon generator function just above MapEventsHandler
const iconGenCode = `
const getCustomIcon = (level: string) => {
  const color = colorMap[level] ?? "#9ca3af";
  const radius = radiusMap[level] ?? 8;
  const size = radius * 2;
  
  return L.divIcon({
    className: "custom-div-icon",
    html: \`<div style="background-color: \${color}; width: \${size}px; height: \${size}px; border-radius: 50%; opacity: 0.8; border: 2px solid white; box-shadow: 0 1px 3px rgba(0,0,0,0.3);"></div>\`,
    iconSize: [size, size],
    iconAnchor: [radius, radius]
  });
};

function MapEventsHandler`;

code = code.replace('function MapEventsHandler', iconGenCode);

// 3. Replace <LayerGroup>...</LayerGroup> with <MarkerClusterGroup maxClusterRadius={40} chunkedLoading>...</MarkerClusterGroup> for the 3 groups
code = code.replaceAll('<LayerGroup>', '<MarkerClusterGroup maxClusterRadius={40} chunkedLoading>');
code = code.replaceAll('</LayerGroup>', '</MarkerClusterGroup>');

// 4. Replace CircleMarker with Marker and icon inside the 3 groups.
// It's a bit tricky because CircleMarker has radius/pathOptions. 
// We will replace `<CircleMarker` with `<Marker` and the properties.

code = code.replace(/<CircleMarker([\s\S]*?)radius={.*?}([\s\S]*?)pathOptions={[\s\S]*?}[\s\S]*?>/g, (match, p1, p2) => {
  if (match.includes('radius={6}') && match.includes('color: "#ffffff"')) {
    // This is the "You" marker at the very bottom, let's leave it as CircleMarker.
    return match;
  }
  return `<Marker${p1}${p2}icon={getCustomIcon(level)}>`;
});

code = code.replace(/<\/CircleMarker>/g, (match, offset, str) => {
  // If it's near "You", keep it.
  const lookBack = str.substring(offset - 150, offset);
  if (lookBack.includes('You')) {
    return match;
  }
  return '</Marker>';
});

fs.writeFileSync(filePath, code);
console.log('Patched MapView.tsx');
