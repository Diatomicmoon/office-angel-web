"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Plus, Map, List, Flame, Snowflake, AlertCircle, XCircle, Phone } from "lucide-react";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

export default function CanvassingPage() {
  const [view, setView] = useState<"list" | "map">("list");
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
    setNewVisit({ ...newVisit, latitude: lat, longitude: lng, address: "Dropped Pin (Will Auto-Reverse Geocode)" });
    setShowAdd(true);
  }

  return (
    <div className="p-8">
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
                <List className="w-4 h-4" /> List
              </button>
              <button 
                onClick={() => setView("map")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "map" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                <Map className="w-4 h-4" /> Heat Map
              </button>
            </div>
            <button 
              onClick={() => setShowAdd(!showAdd)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm"
            >
              <Plus className="w-4 h-4" /> Log Visit
            </button>
          </div>
        </div>

        {showAdd && (
          <div className="bg-card border rounded-xl p-4 shadow-sm animate-in fade-in slide-in-from-top-4">
            <h2 className="font-semibold mb-4 text-lg">Log New House Visit</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Address *</label>
                  <input required className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="123 Example St" value={newVisit.address} onChange={e => setNewVisit({...newVisit, address: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Resident Name</label>
                  <input className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" placeholder="John Doe" value={newVisit.resident_name} onChange={e => setNewVisit({...newVisit, resident_name: e.target.value})} />
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
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 border rounded-md text-sm font-medium">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium">Save Visit</button>
              </div>
            </form>
          </div>
        )}

        {view === "list" ? (
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
