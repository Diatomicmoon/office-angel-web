"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Crosshair, MapPin, Smartphone, Edit2, Check } from "lucide-react";

const TerritoryMap = dynamic(() => import("./TerritoryMap"), { ssr: false });

export default function TerritoriesTab() {
  const [territories, setTerritories] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [showMobileAdd, setShowMobileAdd] = useState(false);
  const [mobileName, setMobileName] = useState("");
  const [mobileNotes, setMobileNotes] = useState("");
  const [mobileRep, setMobileRep] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    // Fetch territories from DB
    fetch("/api/canvassing/territories")
      .then(res => res.json())
      .then(data => {
        if (data.territories) {
          // Map DB format to UI format
          setTerritories(data.territories.map((t: any) => ({
            id: t.id,
            name: t.name,
            geoJSON: t.geo_json,
            assignedRep: t.assigned_rep
          })));
        }
      })
      .catch(console.error);

    // Fetch company reps/members
    fetch("/api/canvassing/reps")
      .then(res => res.json())
      .then(data => {
        if (data.reps) {
          setTechs(data.reps);
        }
      })
      .catch(console.error);
  }, []);

  const saveTerritoryDB = async (t: any, isNew: boolean = false) => {
    try {
       await fetch("/api/canvassing/territories", {
          method: isNew ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
             id: t.id,
             name: t.name,
             geo_json: t.geoJSON,
             assigned_rep: t.assignedRep
          })
       });
    } catch(err) {
       console.error("Failed to save territory:", err);
    }
  };

  const handleCreated = async (layer: any) => {
    const geoJSON = layer.toGeoJSON();
    const newTerritory = {
      name: `Territory ${territories.length + 1}`,
      geoJSON: geoJSON,
      assignedRep: ""
    };
    
    // Optimistic UI update could be tricky with missing DB ID, so we fetch the saved one back
    try {
      const res = await fetch("/api/canvassing/territories", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTerritory.name, geo_json: newTerritory.geoJSON })
      });
      const data = await res.json();
      if (data.territory) {
         setTerritories([...territories, {
            id: data.territory.id,
            name: data.territory.name,
            geoJSON: data.territory.geo_json,
            assignedRep: data.territory.assigned_rep
         }]);
      }
    } catch(err) {
      console.error(err);
    }
  };

  const deleteTerritory = async (id: string) => {
    setTerritories(territories.filter(t => t.id !== id));
    await fetch(`/api/canvassing/territories?id=${id}`, { method: 'DELETE' });
  };

  const updateTerritoryName = (id: string, newName: string) => {
    const updated = territories.map(t => t.id === id ? { ...t, name: newName } : t);
    setTerritories(updated);
    const target = updated.find(t => t.id === id);
    if (target) saveTerritoryDB(target, false);
  };

  const updateTerritoryRep = (id: string, newRepId: string) => {
    const updated = territories.map(t => t.id === id ? { ...t, assignedRep: newRepId } : t);
    setTerritories(updated);
    const target = updated.find(t => t.id === id);
    if (target) saveTerritoryDB(target, false);
  };

  const handleMobileCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileName) return;
    try {
      const res = await fetch("/api/canvassing/territories", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: mobileName, geo_json: { type: 'Point', notes: mobileNotes }, assigned_rep: mobileRep || null })
      });
      const data = await res.json();
      if (data.territory) {
        setTerritories([...territories, {
          id: data.territory.id,
          name: data.territory.name,
          geoJSON: data.territory.geo_json,
          assignedRep: data.territory.assigned_rep
        }]);
      }
      setShowMobileAdd(false);
      setMobileName("");
      setMobileNotes("");
      setMobileRep("");
    } catch(err) { console.error(err); }
  };

  return (
    <div className="flex flex-col md:flex-row gap-6 h-[600px]">
      {showMobileAdd && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="bg-white w-full md:max-w-md rounded-t-3xl md:rounded-2xl shadow-2xl p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Create Territory</h2>
            <form onSubmit={handleMobileCreate} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Territory Name *</label>
                <input required value={mobileName} onChange={e => setMobileName(e.target.value)} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500" placeholder="e.g. Northside Neighborhood" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Assign Rep</label>
                <select value={mobileRep} onChange={e => setMobileRep(e.target.value)} className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="">-- Unassigned --</option>
                  {techs.map(tech => <option key={tech.id} value={tech.id}>{tech.name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Notes / Street Boundaries</label>
                <textarea value={mobileNotes} onChange={e => setMobileNotes(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[70px] resize-none" placeholder="e.g. Oak St to Main St, north of Highway 7" />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Pin a Location (Optional)</label>
                <p className="text-xs text-gray-400 mb-2">Open in Google Maps to drop a center point for this territory.</p>
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-700 transition-colors"
                >
                  <MapPin className="w-4 h-4 text-purple-600" /> Open Google Maps
                </a>
                <p className="text-xs text-gray-400 mt-2">💡 Tip: On desktop you can draw an exact polygon boundary on the map.</p>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowMobileAdd(false)} className="flex-1 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600">Cancel</button>
                <button type="submit" className="flex-[2] py-3.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-bold shadow-sm">Save Territory</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="w-full md:w-1/3 bg-card border rounded-xl p-4 overflow-y-auto shadow-sm flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">Saved Territories</h2>
          <button onClick={() => setShowMobileAdd(true)} className="flex items-center gap-1.5 text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-full transition-colors">
            <Plus className="w-3.5 h-3.5" /> Add Territory
          </button>
        </div>
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
      <div className="hidden md:block md:w-2/3 bg-card border rounded-xl shadow-sm overflow-hidden relative">
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/95 px-5 py-2.5 rounded-full shadow-lg text-sm font-semibold border border-gray-200 text-gray-800 text-center pointer-events-none tracking-tight">
          Draw a polygon on the map to create a territory boundary
        </div>
        <TerritoryMap onCreated={handleCreated} territories={territories} techs={techs} />
      </div>
    </div>
  );
}
