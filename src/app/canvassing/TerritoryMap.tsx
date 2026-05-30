"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, FeatureGroup, GeoJSON, Tooltip } from "react-leaflet";
import { EditControl } from "react-leaflet-draw";
import "leaflet/dist/leaflet.css";
import "leaflet-draw/dist/leaflet.draw.css";

interface Props {
  onCreated: (layer: any) => void;
  territories: any[];
  techs?: any[];
}

export default function TerritoryMap({ onCreated, territories, techs = [] }: Props) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  const _onCreated = (e: any) => {
    const { layerType, layer } = e;
    if (layerType === 'polygon' || layerType === 'rectangle') {
      onCreated(layer);
      layer.remove(); // Remove drawn layer so GeoJSON can take over
    }
  };

  const getRepName = (repId: string) => {
    if (!repId) return "Unassigned";
    const rep = techs.find(t => t.id === repId);
    return rep ? rep.name : "Unassigned";
  };

  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  if (!isReady) return null;

  return (
    <div className="w-full h-full relative">
      <MapContainer
        center={[44.9778, -93.265]}
        zoom={13}
        className="w-full h-full"
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

        {territories.map((t, i) => {
          const repName = getRepName(t.assignedRep);
          const color = colors[i % colors.length];
          return (
            <GeoJSON 
              key={t.id} 
              data={t.geoJSON} 
              style={() => ({ color: color, weight: 3, opacity: 0.8, fillOpacity: 0.2 })}
            >
              <Tooltip direction="center" permanent className="bg-white/90 border-none shadow-sm rounded px-2 py-1 text-xs font-bold text-center">
                <span className="block text-gray-900">{t.name}</span>
                <span className="block text-gray-500 font-medium">{repName}</span>
              </Tooltip>
            </GeoJSON>
          );
        })}
      </MapContainer>
    </div>
  );
}
