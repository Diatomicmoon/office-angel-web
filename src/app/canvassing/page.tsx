"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus, Map, List, Flame, Snowflake, AlertCircle, XCircle, Phone, HardHat } from "lucide-react";
import NewBuildsTab from "@/components/dashboard/NewBuildsTab";
import TerritoriesTab from "./TerritoriesTab";
import CanvassingMode from "./CanvassingMode";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

function CanvassingStats() {
  const [stats, setStats] = useState({ todayKnocks: 0, totalKnocks: 0, hotLeads: 0, warmLeads: 0 });

  useEffect(() => {
    fetch("/api/canvassing/stats")
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(console.error);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-card border rounded-xl p-4 shadow-sm">
        <div className="text-sm text-muted-foreground font-medium mb-1">Knocked Today</div>
        <div className="text-2xl font-bold">{stats.todayKnocks}</div>
      </div>
      <div className="bg-card border rounded-xl p-4 shadow-sm">
        <div className="text-sm text-muted-foreground font-medium mb-1">Total Knocks</div>
        <div className="text-2xl font-bold">{stats.totalKnocks}</div>
      </div>
      <div className="bg-card border rounded-xl p-4 shadow-sm bg-orange-50/50">
        <div className="text-sm text-orange-600 font-medium mb-1 flex items-center gap-1"><Flame className="w-4 h-4"/> Hot Leads</div>
        <div className="text-2xl font-bold text-orange-700">{stats.hotLeads}</div>
      </div>
      <div className="bg-card border rounded-xl p-4 shadow-sm bg-blue-50/50">
        <div className="text-sm text-blue-600 font-medium mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Warm Pipeline</div>
        <div className="text-2xl font-bold text-blue-700">{stats.warmLeads}</div>
      </div>
    </div>
  );
}

export default function CanvassingPage() {
  const [view, setView] = useState<"list" | "map" | "builds" | "territories">("list");
  const [canvassingActive, setCanvassingActive] = useState(false);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [showAdd, setShowAdd] = useState(false);
  const [newVisit, setNewVisit] = useState({
    resident_name: "", address: "", interest_level: "not_interested", notes: "", property_size: "", existing_system: "", water_hardness: "", latitude: null as number | null, longitude: null as number | null
  });

  useEffect(() => {
    fetchVisits();
  }, []);

  async function fetchVisits() {
    setLoading(true);
    const res = await fetch("/api/canvassing/visits");
    const data = await res.json();
    setVisits(data.visits || []);
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const systemInfo = `\n\n--- Property Details ---\nProperty Size: ${newVisit.property_size || 'N/A'}\nExisting System: ${newVisit.existing_system || 'Unknown'}\nWater Hardness: ${newVisit.water_hardness || 'Unknown'}`;
    const finalNotes = (newVisit.notes || '') + systemInfo;

    await fetch("/api/canvassing/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newVisit, notes: finalNotes })
    });
    setShowAdd(false);
    setNewVisit({ resident_name: "", address: "", interest_level: "not_interested", notes: "", property_size: "", existing_system: "", water_hardness: "", latitude: null, longitude: null });
    fetchVisits();
  }

  function handleMapClick(lat: number, lng: number) {
    setNewVisit({ ...newVisit, latitude: lat, longitude: lng, address: "Loading details..." });
    setShowAdd(true);

    fetch(`/api/property?lat=${lat}&lng=${lng}`)
      .then(res => res.json())
      .then(data => {
        setNewVisit(prev => ({ 
            ...prev, 
            address: data.address || prev.address || "Unknown Address",
            resident_name: data.owner_name || prev.resident_name,
            notes: (data.year_built ? `Year Built: ${data.year_built}\n` : '') + 
                   (data.beds ? `Beds/Baths: ${data.beds}/${data.baths || '-'}\n` : '') +
                   (data.sqft ? `SqFt: ${data.sqft}\n` : '') +
                   (data.last_sale_price ? `Last Sale: ${data.last_sale_price.toLocaleString()} (${data.last_sale_date || 'Unknown Date'})\n\n` : '') + 
                   prev.notes
        }));
      })
      .catch(err => {
        console.error("Property error:", err);
        setNewVisit(prev => ({ ...prev, address: "Manual Address Entry" }));
      });
  }

  return (
    <div className="p-4 md:p-8">
      {canvassingActive && (
        <CanvassingMode 
          onExit={() => { setCanvassingActive(false); fetchVisits(); }} 
          onLogVisit={handleMapClick} 
          visits={visits}
        />
      )}
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Door-to-Door CRM</h1>
            <p className="text-muted-foreground">Track field visits and predictive heat maps.</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-muted p-1 rounded-lg flex items-center">
              <button 
                onClick={() => setView("list")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "list" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                <List className="w-4 h-4" /> New Movers
              </button>
              <button 
                onClick={() => setView("builds")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "builds" ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground"}`}
              >
                <HardHat className="w-4 h-4" /> New Builds
              </button>
              <button 
                onClick={() => setView("map")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "map" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                <Map className="w-4 h-4" /> Heat Map
              </button>
              <button 
                onClick={() => setView("territories")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "territories" ? "bg-background shadow-sm text-green-600" : "text-muted-foreground"}`}
              >
                <Map className="w-4 h-4" /> Territories
              </button>
            </div>
            <button 
              onClick={() => setCanvassingActive(true)}
              className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm shadow-sm"
            >
              Start Canvassing
            </button>
            <button 
              onClick={() => setShowAdd(!showAdd)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Log Visit
            </button>
          </div>
        </div>

        <CanvassingStats />

        {showAdd && (
          <div className="fixed inset-0 z-[10000] bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
            <div className="bg-white dark:bg-card border rounded-xl p-6 shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 relative">
              <button 
                onClick={() => setShowAdd(false)}
                className="absolute top-4 right-4 text-gray-500 hover:bg-gray-100 p-1 rounded-full"
              >
                <XCircle className="w-5 h-5" />
              </button>
              <h2 className="font-semibold mb-4 text-lg">Log House Visit</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Address *</label>
                    <input required className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="123 Example St" value={newVisit.address} onChange={e => setNewVisit({...newVisit, address: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Resident Name</label>
                    <input className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Current Resident" value={newVisit.resident_name} onChange={e => setNewVisit({...newVisit, resident_name: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Interest Level</label>
                    <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newVisit.interest_level} onChange={e => setNewVisit({...newVisit, interest_level: e.target.value})}>
                      <option value="hot">🔥 Hot Lead (Ready to buy)</option>
                      <option value="warm">⭐ Warm (Interested, needs follow up)</option>
                      <option value="not_interested">❄️ Not Interested</option>
                      <option value="do_not_knock">🚫 Do Not Knock</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Existing Water System</label>
                    <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newVisit.existing_system} onChange={e => setNewVisit({...newVisit, existing_system: e.target.value})}>
                      <option value="">Select...</option>
                      <option value="None">None / Hard Water</option>
                      <option value="Old Softener">Old Softener (Needs Replace)</option>
                      <option value="Iron Filter">Iron Filter Only</option>
                      <option value="Modern Softener">Modern Softener (Good)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Water Hardness (Test Results)</label>
                    <input className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="e.g. 15 GPG or High Iron" value={newVisit.water_hardness} onChange={e => setNewVisit({...newVisit, water_hardness: e.target.value})} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">General Notes / Follow Up Time</label>
                    <textarea className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="Any details from the conversation..." value={newVisit.notes} onChange={e => setNewVisit({...newVisit, notes: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-4 border-t mt-4">
                  <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium shadow-sm">Save Visit</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {view === "builds" ? (
          <NewBuildsTab />
        ) : view === "territories" ? (
          <TerritoriesTab />
        ) : view === "list" ? (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading visits...</div>
            ) : visits.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Map className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No visits logged yet</h3>
                <p className="text-muted-foreground max-w-sm">When Christian's reps log house visits, they will show up here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {visits.slice(0, 50).map((v) => (
                  <div key={v.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-muted/50 transition-colors gap-4">
                    <div className="flex-1">
                      <p className="font-semibold text-base text-foreground text-blue-600">
                        {v.resident_name && v.resident_name !== 'Current Resident' ? v.resident_name : 'Homeowner'}
                      </p>
                      <div className="text-sm text-foreground font-medium mt-0.5 flex items-center gap-2">
                        <span>{v.address}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>Visited / Scraped: {new Date(v.visited_at).toLocaleDateString()}</span>
                      </div>
                      {v.notes && (
                        <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md whitespace-pre-line border border-border/50">
                          {v.notes}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {v.interest_level === 'hot' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><Flame className="w-3.5 h-3.5"/> Hot</span>}
                      {v.interest_level === 'warm' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><AlertCircle className="w-3.5 h-3.5"/> Warm</span>}
                      {v.interest_level === 'not_interested' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><Snowflake className="w-3.5 h-3.5"/> Cold</span>}
                      {v.interest_level === 'do_not_knock' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3.5 h-3.5"/> DND</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden h-[600px] flex flex-col relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-white/90 px-4 py-2 rounded-full shadow-md text-sm font-medium border text-center pointer-events-none">
              Click anywhere on the map to drop a pin and log a lead
            </div>
            <MapView visits={visits} onMapClick={handleMapClick} />
          </div>
        )}
      </div>
    </div>
  );
}
