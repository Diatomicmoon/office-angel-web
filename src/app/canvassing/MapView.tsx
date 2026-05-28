"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents, useMap } from "react-leaflet";
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
  onMapClick?: (lat: number, lng: number) => void;
}

function MapEventsHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng.lat, e.latlng.lng);
    },
    moveend() {
      const center = map.getCenter();
      localStorage.setItem("oa_map_lat", center.lat.toString());
      localStorage.setItem("oa_map_lng", center.lng.toString());
      localStorage.setItem("oa_map_zoom", map.getZoom().toString());
    },
    zoomend() {
      const center = map.getCenter();
      localStorage.setItem("oa_map_lat", center.lat.toString());
      localStorage.setItem("oa_map_lng", center.lng.toString());
      localStorage.setItem("oa_map_zoom", map.getZoom().toString());
    }
  });
  return null;
}

export default function MapView({ visits, center = [44.9778, -93.265], zoom = 14, onMapClick }: Props) {
  const hasData = visits.length > 0;
  
  // Map State Persistence
  const [initialCenter, setInitialCenter] = useState<[number, number]>(center);
  const [initialZoom, setInitialZoom] = useState<number>(zoom);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const savedLat = localStorage.getItem("oa_map_lat");
    const savedLng = localStorage.getItem("oa_map_lng");
    const savedZoom = localStorage.getItem("oa_map_zoom");

    if (savedLat && savedLng) {
      setInitialCenter([parseFloat(savedLat), parseFloat(savedLng)]);
    }
    if (savedZoom) {
      setInitialZoom(parseInt(savedZoom, 10));
    }
    setIsReady(true);
  }, []);

  if (!isReady) return null; // Avoid hydration mismatch on map render

  return (
    <div className="flex-1 relative">
      {!hasData && (
        <div className="absolute top-4 right-4 z-[1000] bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
          No visit data to display
        </div>
      )}
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full rounded-lg"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MapEventsHandler onMapClick={onMapClick} />
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
