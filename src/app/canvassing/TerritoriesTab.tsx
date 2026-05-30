"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Crosshair, MapPin } from "lucide-react";

const TerritoryMap = dynamic(() => import("./TerritoryMap"), { ssr: false });

export default function TerritoriesTab() {
  const [territories, setTerritories] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);

  useEffect(() => {
    // Fetch territories from local storage
    const saved = localStorage.getItem("oa_territories");
    if (saved) {
      setTerritories(JSON.parse(saved));
    }

    // Fetch technicians (reps)
    fetch("/api/technicians")
      .then(res => res.json())
      .then(data => {
        if (data.technicians) {
          setTechs(data.technicians);
        }
      })
      .catch(console.error);
  }, []);

  const saveTerritories = (updated: any[]) => {
    setTerritories(updated);
    localStorage.setItem("oa_territories", JSON.stringify(updated));
  };

  const handleCreated = (layer: any) => {
    const newTerritory = {
      id: Date.now().toString(),
      name: `Territory ${territories.length + 1}`,
      geoJSON: layer.toGeoJSON(),
      assignedRep: ""
    };
    const updated = [...territories, newTerritory];
    saveTerritories(updated);
  };

  const deleteTerritory = (id: string) => {
    const updated = territories.filter(t => t.id !== id);
    saveTerritories(updated);
  };

  const updateTerritoryName = (id: string, newName: string) => {
    const updated = territories.map(t => t.id === id ? { ...t, name: newName } : t);
    saveTerritories(updated);
  };

  const updateTerritoryRep = (id: string, newRepId: string) => {
    const updated = territories.map(t => t.id === id ? { ...t, assignedRep: newRepId } : t);
    saveTerritories(updated);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[600px]">
      <div className="w-full md:w-1/3 bg-card border rounded-xl p-4 overflow-y-auto shadow-sm flex flex-col">
        <h2 className="font-semibold text-lg mb-4">Saved Territories</h2>
        {territories.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8 px-4 bg-gray-50 border border-dashed rounded-xl">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            No territories drawn yet. Use the polygon tool on the map to define a new zone.
          </div>
        ) : (
          <div className="space-y-3">
            {territories.map(t => (
              <div key={t.id} className="p-4 border border-gray-200 rounded-xl bg-white shadow-sm flex flex-col gap-3 transition hover:border-gray-300">
                <div className="flex justify-between items-center">
                  <input 
                    type="text" 
                    value={t.name}
                    onChange={(e) => updateTerritoryName(t.id, e.target.value)}
                    className="font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-blue-500 focus:outline-none px-1 py-0.5 -ml-1 text-base w-3/4"
                    placeholder="Territory Name"
                  />
                  <button onClick={() => deleteTerritory(t.id)} className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-md transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-500">Assigned Rep</label>
                  <select 
                    value={t.assignedRep || ""}
                    onChange={(e) => updateTerritoryRep(t.id, e.target.value)}
                    className="text-sm border border-gray-200 rounded-md p-1.5 bg-gray-50 text-gray-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">-- Unassigned --</option>
                    {techs.map(tech => (
                      <option key={tech.id} value={tech.id}>{tech.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-full md:w-2/3 bg-card border rounded-xl shadow-sm overflow-hidden relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 px-5 py-2.5 rounded-full shadow-lg text-sm font-semibold border border-gray-200 text-gray-800 text-center pointer-events-none tracking-tight">
          Use the drawing tool on the left to create a territory
        </div>
        <TerritoryMap onCreated={handleCreated} territories={territories} techs={techs} />
      </div>
    </div>
  );
}
