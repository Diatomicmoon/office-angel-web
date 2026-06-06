import fs from 'fs';

function addSatellite(file) {
  let content = fs.readFileSync(file, 'utf8');

  if (content.includes('LayersControl')) return;

  const importReplace = `import { MapContainer, TileLayer, FeatureGroup, GeoJSON, Tooltip, LayersControl } from "react-leaflet";`;
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
              attribution='&copy; Esri'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>`;

  content = content.replace(tileLayerOld, tileLayerNew);
  fs.writeFileSync(file, content);
}

addSatellite('office-angel-web/src/app/canvassing/TerritoryMap.tsx');
console.log("Patched TerritoryMap");
