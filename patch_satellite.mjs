import fs from 'fs';

function addSatellite(file) {
  let content = fs.readFileSync(file, 'utf8');

  // We add an Esri World Imagery URL as an option. Since they might want to toggle,
  // the easiest quick fix is to just use Esri World Imagery as the default TileLayer for the field app,
  // or wrap it in a LayersControl so they can choose.

  // Let's add LayersControl to MapView.tsx
  if (content.includes('LayersControl')) return;

  const importReplace = `import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents, useMap, LayersControl } from "react-leaflet";`;
  content = content.replace(/import { MapContainer.*} from "react-leaflet";/, importReplace);

  const tileLayerOld = `<TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />`;

  const tileLayerNew = `<LayersControl position="topright">
          <LayersControl.BaseLayer checked name="Street View">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer name="Satellite View">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>`;

  content = content.replace(tileLayerOld, tileLayerNew);
  fs.writeFileSync(file, content);
}

addSatellite('office-angel-web/src/app/canvassing/MapView.tsx');
console.log("Patched MapView");
