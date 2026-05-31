"use client";

import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents, useMap, LayersControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const colorMap: Record<string, string> = {
  hot: "#f97316", // Orange
  warm: "#3b82f6", // Blue (Knocked/Warm)
  unknocked_lead: "#a855f7", // Purple for unknocked movers
  new_build: "#ef4444", // Red for New Builds
  not_interested: "#9ca3af", // Gray
  do_not_knock: "#000000", // Black
};

const radiusMap: Record<string, number> = {
  hot: 14,
  warm: 11,
  new_build: 12,
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
  notes?: string;
  lng?: number;
}

interface Props {
  visits: Visit[];
  center?: [number, number];
  userLocation?: [number, number] | null;
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  onPinClick?: (visit: Visit) => void;
}

function MapEventsHandler({ onMapClick }: { onMapClick?: (lat: number, lng: number) => void }) {
  const map = useMapEvents({
    baselayerchange(e) {
      localStorage.setItem("oa_map_layer", e.name);
    },
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

// Custom hook to update center when props change without causing a full unmount
function MapUpdater({ center, zoom }: { center?: [number, number], zoom?: number }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom || map.getZoom());
    }
  }, [center, zoom, map]);
  return null;
}

export default function MapView({ visits, center = [44.9778, -93.265], userLocation, zoom = 14, onMapClick, onPinClick }: Props) {
  const hasData = visits.length > 0;
  
  // Map State Persistence
  const [initialCenter, setInitialCenter] = useState<[number, number]>(center);
  const [initialZoom, setInitialZoom] = useState<number>(zoom);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Only load from localStorage if we weren't explicitly passed a center (like in CanvassingMode)
    if (!center || (center[0] === 44.9778 && center[1] === -93.265)) {
      const savedLat = localStorage.getItem("oa_map_lat");
      const savedLng = localStorage.getItem("oa_map_lng");
      const savedZoom = localStorage.getItem("oa_map_zoom");

      if (savedLat && savedLng) {
        setInitialCenter([parseFloat(savedLat), parseFloat(savedLng)]);
      }
      if (savedZoom) {
        setInitialZoom(parseInt(savedZoom, 10));
      }
    }
    setIsReady(true);
  }, []);

  if (!isReady) return null;

  return (
    <div className="w-full h-full relative" style={{ minHeight: "100%" }}>
      {!hasData && (
        <div className="absolute top-4 right-4 z-[1000] bg-black/80 text-white text-xs px-3 py-1.5 rounded-full backdrop-blur-md">
          No visit data to display
        </div>
      )}
      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        className="w-full h-full"
        style={{ height: "100%", width: "100%", position: "absolute", inset: 0 }}
        scrollWheelZoom={true}
      >
        <MapUpdater center={center} zoom={zoom} />
        <LayersControl position="topright">
          <LayersControl.BaseLayer checked={typeof window !== 'undefined' ? localStorage.getItem('oa_map_layer') !== 'Satellite View' : true} name="Street View">
            <TileLayer
              attribution='&copy; CARTO'
              url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
            />
          </LayersControl.BaseLayer>
          <LayersControl.BaseLayer checked={typeof window !== 'undefined' ? localStorage.getItem('oa_map_layer') === 'Satellite View' : false} name="Satellite View">
            <TileLayer
              attribution='&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
              url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            />
          </LayersControl.BaseLayer>
        </LayersControl>
        <MapEventsHandler onMapClick={onMapClick} />
        
        {/* Current user location dot (uses userLocation prop instead of center) */}
        {(userLocation || center) && (
          <CircleMarker
            center={userLocation || center}
            radius={6}
            pathOptions={{
              color: "#ffffff",
              fillColor: "#3b82f6",
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Tooltip permanent direction="top" offset={[0, -10]}>
              <span className="text-xs font-bold">You</span>
            </Tooltip>
          </CircleMarker>
        )}

        {hasData &&
          visits.map((visit) => {
            const lat = visit.latitude ?? visit.lat;
            const lng = visit.longitude ?? visit.lng;
            if (lat == null || lng == null) return null;
            const level = visit.interest_level || "not_interested";
            return (
              <CircleMarker
                key={visit.id}
                eventHandlers={{ click: () => { if (onPinClick) onPinClick(visit); } }}
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
                    {visit.notes && (
                      <p className="mt-1 border-t pt-1 text-[10px] text-muted-foreground whitespace-pre-wrap max-w-[200px]">
                        {visit.notes}
                      </p>
                    )}
                  </div>
                </Tooltip>
              </CircleMarker>
            );
          })}
      </MapContainer>
    </div>
  );
}
