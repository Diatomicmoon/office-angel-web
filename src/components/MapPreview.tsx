"use client";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MapPreview({ lat, lng }: { lat: number; lng: number }) {
  return (
    <MapContainer 
      center={[lat, lng]} 
      zoom={16} 
      scrollWheelZoom={false} 
      zoomControl={false}
      dragging={false}
      className="h-full w-full"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OSM'
      />
      <Marker position={[lat, lng]} icon={customIcon} />
    </MapContainer>
  );
}
