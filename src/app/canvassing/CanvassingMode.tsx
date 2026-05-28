"use client";

import { useEffect, useState, useRef } from "react";
import dynamic from "next/dynamic";
import { X, Crosshair, MapPin } from "lucide-react";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function CanvassingMode({ onExit, onLogVisit, visits }: { onExit: () => void, onLogVisit: (lat: number, lng: number) => void, visits: any[] }) {
  const [center, setCenter] = useState<[number, number]>([44.9778, -93.265]);
  const [zoom, setZoom] = useState(18);
  const [tracking, setTracking] = useState(false);
  const watchId = useRef<number | null>(null);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
  }, []);

  const startTracking = () => {
    if (navigator.geolocation) {
      setTracking(true);
      
      navigator.geolocation.getCurrentPosition((pos) => {
        setCenter([pos.coords.latitude, pos.coords.longitude]);
      }, undefined, { enableHighAccuracy: true });

      watchId.current = navigator.geolocation.watchPosition(
        (pos) => {
          setCenter([pos.coords.latitude, pos.coords.longitude]);
        },
        (err) => console.error(err),
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 5000 }
      );
    }
  };

  const stopTracking = () => {
    setTracking(false);
    if (watchId.current !== null) {
      navigator.geolocation.clearWatch(watchId.current);
      watchId.current = null;
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-background flex flex-col h-[100dvh]">
      <div className="flex items-center justify-between p-4 bg-primary text-primary-foreground shadow-md z-[10001]">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          <h1 className="font-bold text-lg">Active Canvassing</h1>
        </div>
        <button onClick={onExit} className="p-2 hover:bg-primary-foreground/20 rounded-full">
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden bg-gray-100">
        {/* Render map without pointer-events restriction so they can pan/click freely */}
        <MapView visits={visits} center={center} zoom={zoom} onMapClick={onLogVisit} />
        
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-[1000] flex flex-col gap-4 items-center w-full max-w-sm px-6">
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  onLogVisit(pos.coords.latitude, pos.coords.longitude);
                }, (err) => {
                  onLogVisit(center[0], center[1]);
                }, { enableHighAccuracy: true });
              } else {
                onLogVisit(center[0], center[1]);
              }
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-lg active:scale-95 transition-transform"
          >
            <MapPin className="w-6 h-6" />
            Log Visit Here
          </button>
          
          <button 
            onClick={() => {
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition((pos) => {
                  setCenter([pos.coords.latitude, pos.coords.longitude]);
                }, undefined, { enableHighAccuracy: true });
              }
            }} 
            className="bg-white text-gray-800 font-medium px-5 py-2.5 rounded-full shadow-lg border flex items-center gap-2 text-sm active:bg-gray-50"
          >
            <Crosshair className="w-4 h-4" /> Recenter GPS
          </button>
        </div>

        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 px-5 py-2.5 rounded-full shadow-md text-sm font-semibold border text-center pointer-events-none text-gray-800">
          Tap the map to drop a pin anywhere
        </div>
      </div>
    </div>
  );
}
