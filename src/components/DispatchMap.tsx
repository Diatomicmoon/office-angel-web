"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in Leaflet with webpack/Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

type TechMapData = {
  tech: any;
  pos: { lat: number; lng: number };
};

export default function DispatchMap({ center, techsData }: { center: {lat: number, lng: number}, techsData: TechMapData[] }) {
  return (
    <MapContainer 
      center={[center.lat, center.lng]} 
      zoom={11} 
      style={{ width: "100%", height: "100%", zIndex: 0 }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
      />
      {techsData.map(({ tech, pos }) => (
        <Marker key={tech.id} position={[pos.lat, pos.lng]}>
          <Popup>
            <div className="text-xs">
              <strong className="text-gray-900">{tech.name || 'Technician'}</strong><br/>
              <span className="text-gray-600">Status: {tech.status || 'Unknown'}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
