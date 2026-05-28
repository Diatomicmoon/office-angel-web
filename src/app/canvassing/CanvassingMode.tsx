"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { X, Crosshair, MapPin } from "lucide-react";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function CanvassingMode({ onExit, onLogVisit, visits }: { onExit: () => void, onLogVisit: (lat: number, lng: number) => void, visits: any[] }) {
  const [center, setCenter] = useState<[number, number]>([44.9778, -93.265]);
  const [zoom, setZoom] = useState(16);
  const [tracking, setTracking] = useState(false);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  const startTracking = () => {
    if (navigator.geolocation) {
      setTracking(true);
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  };

  const stopTracking = () => {
    setTracking(false);
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col">
      <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground shadow-md">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <h1 className="font-bold text-lg">Active Canvassing</h1>
        </div>
        <button onClick={onExit} className="p-2 hover:bg-primary-foreground/20 rounded-full">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 relative">
        <MapView visits={visits} center={center} zoom={zoom} onMapClick={onLogVisit} />
        
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-3 items-center w-full max-w-sm px-4">
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  onLogVisit(pos.coords.latitude, pos.coords.longitude);
                });
              } else {
                alert("Geolocation not supported by this browser.");
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg"
          >
            <MapPin className="w-6 h-6" />
            Log Visit at Current Location
          </button>
          
          <button onClick={startTracking} className="bg-white text-gray-800 font-medium px-4 py-2 rounded-full shadow-md border flex items-center gap-2 text-sm">
            <Crosshair className="w-4 h-4" /> Recenter
          </button>
        </div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-4 py-2 rounded-full shadow-md text-sm font-medium border text-center pointer-events-none">
          Click the map or use the button below to drop a pin
        </div>
      </div>
    </div>
  );
}
