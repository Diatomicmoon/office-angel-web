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

type JobMapData = {
  job: any;
  pos: { lat: number; lng: number };
};

// Custom icons
const getTechIcon = (speed?: number) => {
  // If moving faster than 3 mph, turn the icon green (Active Driving)
  const isDriving = speed && speed > 3;
  return new L.Icon({
    iconUrl: isDriving 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const jobIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function DispatchMap({ 
  center, 
  techsData, 
  jobsData = [] 
}: { 
  center: {lat: number, lng: number}, 
  techsData: TechMapData[],
  jobsData?: JobMapData[]
}) {
  return (
    <div className="relative w-full h-full">
      <MapContainer 
        center={[center.lat, center.lng]} 
        zoom={10} 
        style={{ width: "100%", height: "100%", zIndex: 0 }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {techsData.map(({ tech, pos }) => {
          const speed = tech.last_location?.speed || 0;
          return (
            <Marker key={`tech-${tech.id}`} position={[pos.lat, pos.lng]} icon={getTechIcon(speed)}>
              <Popup>
                <div className="text-xs">
                  <strong className={speed > 3 ? "text-green-700" : "text-blue-700"}>{tech.name || 'Technician'}</strong><br/>
                  <span className="text-gray-600">Status: {speed > 3 ? `Driving (${Math.round(speed)} mph)` : 'Parked / On Site'}</span>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {jobsData.map(({ job, pos }) => (
          <Marker key={`job-${job.id}`} position={[pos.lat, pos.lng]} icon={jobIcon}>
            <Popup>
              <div className="text-xs w-48">
                <strong className="text-red-700">{job.title || 'Service Call'}</strong><br/>
                <span className="text-gray-600 block truncate">{job.customer?.first_name} {job.customer?.last_name}</span>
                <span className="text-gray-500 block truncate mt-1">{job.address}</span>
                <span className="mt-2 inline-block px-2 py-0.5 bg-red-50 text-red-700 rounded text-[10px] uppercase font-bold tracking-wider">
                  {job.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Territory / Legend Overlay */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm shadow-xl rounded-lg border border-gray-200 p-3 z-[1000] w-48">
        <h3 className="text-[11px] font-bold text-gray-800 uppercase tracking-wider mb-2 border-b border-gray-100 pb-1">Territories</h3>
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
            <span className="text-xs text-gray-700 font-medium">Technicians</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500 shadow-sm"></div>
            <span className="text-xs text-gray-700 font-medium">Active Jobs</span>
          </div>
          <div className="flex items-center gap-2 pt-1 mt-1 border-t border-gray-100">
            <div className="w-3 h-3 rounded bg-indigo-100 border border-indigo-300"></div>
            <span className="text-xs text-gray-600">North Metro (Jake)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300"></div>
            <span className="text-xs text-gray-600">South Metro (Sarah)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-amber-100 border border-amber-300"></div>
            <span className="text-xs text-gray-600">West Metro (Mike)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
