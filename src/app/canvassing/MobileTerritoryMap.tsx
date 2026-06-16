"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  onDrawn: (geoJSON: any) => void;
}

export default function MobileTerritoryMap({ onDrawn }: Props) {
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const drawnLayerRef = useRef<any>(null);
  const [drawn, setDrawn] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;
    
    // Dynamic import to avoid SSR issues
    const initMap = async () => {
      const L = (await import("leaflet")).default;
      await import("leaflet/dist/leaflet.css");
      await import("leaflet-draw");
      await import("leaflet-draw/dist/leaflet.draw.css");

      if (mapRef.current) return; // Already initialized

      const map = L.map(mapContainerRef.current!, {
        center: [44.9778, -93.265],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "© OpenStreetMap",
      }).addTo(map);

      const drawnItems = new (L as any).FeatureGroup();
      map.addLayer(drawnItems);

      const drawControl = new (L as any).Control.Draw({
        edit: { featureGroup: drawnItems },
        draw: {
          polygon: { shapeOptions: { color: "#7c3aed" } },
          rectangle: { shapeOptions: { color: "#7c3aed" } },
          polyline: false,
          circle: false,
          circlemarker: false,
          marker: false,
        },
      });
      map.addControl(drawControl);

      map.on((L as any).Draw.Event.CREATED, (e: any) => {
        const layer = e.layer;
        // Clear any previous drawing
        drawnItems.clearLayers();
        drawnLayerRef.current = layer;
        drawnItems.addLayer(layer);
        setDrawn(true);
        onDrawn(layer.toGeoJSON());
      });

      mapRef.current = map;

      // Try to center on user's location
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          map.setView([pos.coords.latitude, pos.coords.longitude], 14);
        });
      }
    };

    initMap();

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="w-full h-[280px] rounded-xl overflow-hidden border border-purple-200 z-0" />
      {!drawn && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-gray-900/80 text-white text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-none z-[500]">
          Use the ▱ Draw tool on the map to outline this territory
        </div>
      )}
      {drawn && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full pointer-events-none z-[500]">
          ✓ Territory outline saved
        </div>
      )}
    </div>
  );
}
