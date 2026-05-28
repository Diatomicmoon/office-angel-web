"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

interface Props {
  onCreated: (layer: any) => void;
  territories: any[];
}

export default function TerritoryMap({ onCreated, territories }: Props) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon' || layerType === 'rectangle') {
      onCreated(layer);
      // Remove it from the drawing layer so it doesn't double-render, we'll render it via GeoJSON
      // Actually EditControl handles it, but we can clear and let GeoJSON handle
      layer.remove();
    }
  };

  if (!isReady) return null;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[44.9778, -93.265]}
        zoom={14}
        className="w-full h-full rounded-lg"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FeatureGroup>
          <EditControl
            position="topleft"
            onCreated={_onCreated}
            draw={{
              polyline: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polygon: true,
              rectangle: true,
            }}
          />
        </FeatureGroup>

        {territories.map(t => (
          <GeoJSON 
            key={t.id} 
            data={t.geoJSON} 
            style={() => ({ color: '#3b82f6', weight: 3, opacity: 0.6, fillOpacity: 0.2 })} 
          />
        ))}
      </MapContainer>
    </div>
  );
}
