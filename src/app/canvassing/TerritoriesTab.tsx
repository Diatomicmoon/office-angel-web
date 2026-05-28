"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Crosshair } from "lucide-react";

const TerritoryMap = dynamic(() => import("./TerritoryMap"), { ssr: false });

export default function TerritoriesTab() {
  const [territories, setTerritories] = useState<any[]>([]);

  useEffect(() => {
    // We could fetch territories from DB here
    const saved = localStorage.getItem("oa_territories");
    if (saved) {
      setTerritories(JSON.parse(saved));
    }
  }, []);

  const handleCreated = (layer: any) => {
    const newTerritory = {
      id: Date.now().toString(),
      name: `Territory ${territories.length + 1}`,
      geoJSON: layer.toGeoJSON(),
      assignedRep: "Unassigned"
    };
    const updated = [...territories, newTerritory];
    setTerritories(updated);
    localStorage.setItem("oa_territories", JSON.stringify(updated));
  };

  const deleteTerritory = (id: string) => {
    const updated = territories.filter(t => t.id !== id);
    setTerritories(updated);
    localStorage.setItem("oa_territories", JSON.stringify(updated));
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[600px]">
      <div className="w-full md:w-1/3 bg-card border rounded-xl p-4 overflow-y-auto shadow-sm flex flex-col">
        <h2 className="font-semibold text-lg mb-4">Saved Territories</h2>
        {territories.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-8">
            No territories drawn yet. Use the polygon tool on the map to draw a new territory.
          </div>
        ) : (
          <div className="space-y-3">
            {territories.map(t => (
              <div key={t.id} className="p-3 border rounded-lg bg-background flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{t.name}</span>
                  <button onClick={() => deleteTerritory(t.id)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-xs text-muted-foreground">
                  Rep: {t.assignedRep}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="w-full md:w-2/3 bg-card border rounded-xl shadow-sm overflow-hidden relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-4 py-2 rounded-full shadow-md text-sm font-medium border text-center pointer-events-none">
          Use the drawing tool on the left to create a territory
        </div>
        <TerritoryMap onCreated={handleCreated} territories={territories} />
      </div>
    </div>
  );
}
