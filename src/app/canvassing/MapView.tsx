"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const colorMap: Record<string, string> = {
  hot: "#f97316",
  warm: "#3b82f6",
  not_interested: "#9ca3af",
  do_not_knock: "#ef4444",
};

const radiusMap: Record<string, number> = {
  hot: 14,
  warm: 11,
  not_interested: 8,
  do_not_knock: 10,
};

interface Visit {
  id: string;
  address?: string;
  resident_name?: string;
  interest_level?: string;
  latitude?: number;
  longitude?: number;
  lat?: number;
  lng?: number;
}

interface Props {
  visits: Visit[];
  center?: [number, number];
  zoom?: number;
}

export default function MapView({ visits, center = [44.9778, -93.265], zoom = 14 }: Props) {
  const hasData = visits.length > 0;

  return (
    <div className="flex-1 relative">
      {!hasData && (
        <div className="absolute top-4 right-4 z-[1000] bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
          No visit data to display
        </div>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        className="w-full h-full rounded-lg"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {hasData &&
          visits.map((visit) => {
            const lat = visit.latitude ?? visit.lat;
            const lng = visit.longitude ?? visit.lng;
            if (lat == null || lng == null) return null;
            const level = visit.interest_level || "not_interested";
            return (
              <CircleMarker
                key={visit.id}
                center={[lat, lng]}
                radius={radiusMap[level] ?? 8}
                pathOptions={{
                  color: colorMap[level] ?? "#9ca3af",
                  fillColor: colorMap[level] ?? "#9ca3af",
                  fillOpacity: 0.6,
                  weight: 2,
                }}
              >
                <Tooltip>
                  <div className="text-xs space-y-0.5">
                    {visit.address && <p className="font-semibold">{visit.address}</p>}
                    {visit.resident_name && <p className="text-muted-foreground">{visit.resident_name}</p>}
                    <p className="capitalize text-muted-foreground">
                      {level.replace(/_/g, " ")}
                    </p>
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}
