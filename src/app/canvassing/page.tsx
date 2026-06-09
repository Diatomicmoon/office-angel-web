"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Plus, Map, List, Flame, Snowflake, AlertCircle, XCircle, Phone, HardHat, Home, Search, CheckSquare } from "lucide-react";
import Link from "next/link";
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
        <div className="text-sm text-orange-600 font-medium mb-1 flex items-center gap-1"><Flame className="w-4 h-4"/> Demos Set</div>
        <div className="text-2xl font-bold text-orange-700">{stats.hotLeads}</div>
      </div>
      <div className="bg-card border rounded-xl p-4 shadow-sm bg-blue-50/50">
        <div className="text-sm text-blue-600 font-medium mb-1 flex items-center gap-1"><AlertCircle className="w-4 h-4"/> Go Backs</div>
        <div className="text-2xl font-bold text-blue-700">{stats.warmLeads}</div>
      </div>
    </div>
  );
}

export default function CanvassingPage() {
  const [mapFilter, setMapFilter] = useState<'all' | 'unknocked' | 'knocked'>('all');
  const [view, setView] = useState<"list" | "logged" | "map" | "builds" | "expected" | "territories">("list");
  const [canvassingActive, setCanvassingActive] = useState(false);
  const [searchAddress, setSearchAddress] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(undefined);
  const [mapZoom, setMapZoom] = useState<number>(14);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Form State
  const [showAdd, setShowAdd] = useState(false);
  const [newVisit, setNewVisit] = useState({
    id: "" as string | undefined,
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
    const systemInfo = `\n\n--- Property Details ---\nProperty Status: ${newVisit.existing_system || 'Unknown'}`;
    const finalNotes = (newVisit.notes || '') + systemInfo;

    await fetch("/api/canvassing/visits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newVisit, notes: finalNotes })
    });
    setShowAdd(false);
    setNewVisit({ id: undefined, resident_name: "", address: "", interest_level: "not_interested", notes: "", property_size: "", existing_system: "", water_hardness: "", latitude: null, longitude: null });
    fetchVisits();
  }

  
  
  function selectSearchResult(result: any) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setSearchAddress(result.display_name.split(',')[0]);
    setSearchResults([]);
    
    localStorage.setItem("oa_map_lat", lat.toString());
    localStorage.setItem("oa_map_lng", lng.toString());
    localStorage.setItem("oa_map_zoom", "18");
    
    setMapCenter([lat, lng]);
    setMapZoom(18);
    handleMapClick(lat, lng);
  }

  function handleLocateOnMap(lat: number, lng: number) {
    localStorage.setItem("oa_map_lat", lat.toString());
    localStorage.setItem("oa_map_lng", lng.toString());
    localStorage.setItem("oa_map_zoom", "18");
    
    setMapCenter([lat, lng]);
    setMapZoom(18);
    setView("map");
  }

  function handlePinClick(visit: any) {
    setNewVisit({
      id: visit.id,
      resident_name: visit.resident_name || "",
      address: visit.address || "",
      interest_level: visit.interest_level || "not_interested",
      notes: visit.notes || "",
      latitude: visit.latitude || visit.lat,
      longitude: visit.longitude || visit.lng,
      property_size: "",
      existing_system: "",
      water_hardness: ""
    });
    setShowAdd(true);
  }

  
  function handleSearchInput(val: string) {
    setSearchAddress(val);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (val.length < 4) {
      setSearchResults([]);
      return;
    }
    
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val + ', MN')}&countrycodes=us&addressdetails=1&limit=5`);
        const data = await res.json();
        setSearchResults(data || []);
      } catch (err) {
        console.error(err);
      }
    }, 500); // 500ms debounce to protect Nominatim API rate limits
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
                   (data.last_sale_price ? `Last Sale: ${data.last_sale_price.toLocaleString()} (${data.last_sale_date || 'Unknown Date'})\n\n` : '') 
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
          onPinClick={handlePinClick} 
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
            <div className="bg-muted p-1 rounded-lg flex flex-wrap items-center">
              <button 
                onClick={() => setView("logged")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "logged" ? "bg-background shadow-sm text-green-600" : "text-muted-foreground"}`}
              >
                <CheckSquare className="w-4 h-4" /> Logged Knocks
              </button>
              <button 
                onClick={() => setView("list")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "list" ? "bg-background shadow-sm" : "text-muted-foreground"}`}
              >
                <List className="w-4 h-4" /> New Movers
              </button>
              <button 
                onClick={() => setView("expected")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "expected" ? "bg-background shadow-sm text-blue-600" : "text-muted-foreground"}`}
              >
                <HardHat className="w-4 h-4" /> Expected Builds
              </button>
              <button 
                onClick={() => setView("builds")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "builds" ? "bg-background shadow-sm text-green-600" : "text-muted-foreground"}`}
              >
                <Home className="w-4 h-4" /> New Builds
              </button>
              <button 
                onClick={() => setView("map")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "map" ? "bg-background shadow-sm text-orange-600" : "text-muted-foreground"}`}
              >
                <Map className="w-4 h-4" /> D2D Map
              </button>
            </div>
            <button onClick={() => setCanvassingActive(true)}
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
                    <label className="text-sm font-medium">Rep Name</label>
                    <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={(newVisit as any).sales_rep_name || ''} onChange={e => setNewVisit({...newVisit, sales_rep_name: e.target.value} as any)}>
                      <option value="">-- Select Rep --</option>
                      <option value="Jake">Jake</option>
                      <option value="Sarah">Sarah</option>
                      <option value="Mike">Mike</option>
                      <option value="Christian">Christian</option>
                      <option value="Jakob">Jakob</option>
                    </select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-medium">Interest Level</label>
                    <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newVisit.interest_level} onChange={e => setNewVisit({...newVisit, interest_level: e.target.value})}>
                      
                      
                      <option value="demo_set">📅 Demo Set</option>
                      <option value="go_back">✅ Go Back</option>
                      <option value="not_home">🏠 Not Home</option>
                      <option value="not_interested">❄️ Not Interested</option>
                      <option value="do_not_knock">🚫 Do Not Knock</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Property Status</label>
                    <select className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm" value={newVisit.existing_system} onChange={e => setNewVisit({...newVisit, existing_system: e.target.value})}>
                      <option value="">Select...</option>
                      <option value="Unknown">Unknown</option>
                      <option value="Older Home">Older Home (Likely needs updates)</option>
                      <option value="Remodeling">Actively Remodeling</option>
                      <option value="New Build">New Construction</option>
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
          <NewBuildsTab onLocateOnMap={handleLocateOnMap} />
        ) : view === "territories" ? (
          <TerritoriesTab />
        ) : view === "logged" ? (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading logged knocks...</div>
            ) : visits.filter(v => v.interest_level === 'demo_set' || v.interest_level === 'go_back' || v.interest_level === 'hot' || v.interest_level === 'warm' || v.interest_level === 'not_interested' || v.interest_level === 'do_not_knock').length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <CheckSquare className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No knocks logged yet</h3>
                <p className="text-muted-foreground max-w-sm">When field reps log house visits, they will show up here.</p>
              </div>
            ) : (
              <div className="divide-y">
                {[...visits].filter(v => ['hot', 'warm', 'demo_set', 'not_interested', 'do_not_knock', 'not_home', 'go_back'].includes(v.interest_level || '')).sort((a, b) => {
                  return new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
                }).map((v) => (
                  <div key={v.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-muted/50 transition-colors gap-4 cursor-pointer" onClick={() => handlePinClick(v)}>
                    <div className="flex-1">
                      <p className="font-semibold text-base text-foreground text-blue-600">
                        {v.resident_name && v.resident_name !== 'Current Resident' ? v.resident_name : 'Homeowner'}
                      </p>
                      <div className="text-sm text-foreground font-medium mt-0.5 flex items-center gap-2">
                        <span>{v.address}</span>
                        {v.latitude == null ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Not on Map
                          </span>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleLocateOnMap(v.latitude, v.longitude); }}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors ml-2"
                          >
                            View on Map
                          </button>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                        <span>Logged: {new Date(v.visited_at).toLocaleString()}</span>
                        {v.sales_rep_name && <span className="ml-2 font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-700">Rep: {v.sales_rep_name}</span>}
                      </div>
                      {v.notes && (
                        <div className="mt-2 text-xs text-muted-foreground bg-muted/30 p-2 rounded-md whitespace-pre-line border border-border/50">
                          {v.notes}
                        </div>
                      )}
                    </div>
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {v.interest_level === 'demo_set' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><Flame className="w-3.5 h-3.5"/> Demo Set</span>}
                        {v.interest_level === 'hot' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><Flame className="w-3.5 h-3.5"/> Hot</span>}
                        {v.interest_level === 'warm' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><AlertCircle className="w-3.5 h-3.5"/> Warm</span>}
                        {v.interest_level === 'go_back' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><AlertCircle className="w-3.5 h-3.5"/> Go Back</span>}
                        {v.interest_level === 'not_home' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Home className="w-3.5 h-3.5"/> Not Home</span>}
                        {v.interest_level === 'not_interested' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><Snowflake className="w-3.5 h-3.5"/> Cold</span>}
                        {v.interest_level === 'do_not_knock' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3.5 h-3.5"/> DND</span>}
                      </div>
                      <Link 
                        href={`/crm?new=true&name=${encodeURIComponent(v.resident_name || 'Homeowner')}&address=${encodeURIComponent(v.address || '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Make Customer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
                {[...visits].sort((a, b) => {
                  const aUnmapped = a.latitude == null ? 1 : 0;
                  const bUnmapped = b.latitude == null ? 1 : 0;
                  return bUnmapped - aUnmapped;
                }).slice(0, 50).map((v) => (
                  <div key={v.id} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between hover:bg-muted/50 transition-colors gap-4 cursor-pointer" onClick={() => handlePinClick(v)}>
                    <div className="flex-1">
                      <p className="font-semibold text-base text-foreground text-blue-600">
                        {v.resident_name && v.resident_name !== 'Current Resident' ? v.resident_name : 'Homeowner'}
                      </p>
                      <div className="text-sm text-foreground font-medium mt-0.5 flex items-center gap-2">
                        <span>{v.address}</span>
                        {v.latitude == null ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                            Not on Map
                          </span>
                        ) : (
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleLocateOnMap(v.latitude, v.longitude); }}
                            className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors ml-2"
                          >
                            View on Map
                          </button>
                        )}
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
                    <div className="shrink-0 flex flex-col items-end gap-2">
                      <div className="flex items-center gap-2">
                        {v.interest_level === 'demo_set' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><Flame className="w-3.5 h-3.5"/> Demo Set</span>}
                        {v.interest_level === 'hot' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-700"><Flame className="w-3.5 h-3.5"/> Hot</span>}
                        {v.interest_level === 'warm' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><AlertCircle className="w-3.5 h-3.5"/> Warm</span>}
                        {v.interest_level === 'go_back' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700"><AlertCircle className="w-3.5 h-3.5"/> Go Back</span>}
                        {v.interest_level === 'not_home' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Home className="w-3.5 h-3.5"/> Not Home</span>}
                        {v.interest_level === 'not_interested' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"><Snowflake className="w-3.5 h-3.5"/> Cold</span>}
                        {v.interest_level === 'do_not_knock' && <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700"><XCircle className="w-3.5 h-3.5"/> DND</span>}
                      </div>
                      <Link 
                        href={`/crm?new=true&name=${encodeURIComponent(v.resident_name || 'Homeowner')}&address=${encodeURIComponent(v.address || '')}`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-bold bg-gray-900 text-white hover:bg-gray-800 transition-colors shadow-sm"
                      >
                        <Plus className="w-3.5 h-3.5" /> Make Customer
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden h-[600px] flex flex-col relative">
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[2000] w-full max-w-md px-4 flex flex-col gap-2">
              <div className="relative w-full shadow-lg rounded-xl bg-white">
                <div className="flex items-center px-3 border-b border-gray-100">
                  <Search className="w-5 h-5 text-gray-400" />
                  <input 
                    type="text" 
                    placeholder="Search address to log visit..." 
                    value={searchAddress}
                    onChange={(e: any) => handleSearchInput(e.target.value)}
                    className="w-full h-12 px-3 text-sm focus:outline-none bg-transparent text-gray-900 placeholder:text-gray-400"
                  />
                  {searchAddress.length > 0 && (
                     <button onClick={() => {setSearchAddress(''); setSearchResults([]);}}><XCircle className="w-4 h-4 text-gray-400" /></button>
                  )}
                </div>
                
                {searchResults.length > 0 && (
                  <div className="max-h-60 overflow-y-auto bg-white rounded-b-xl border-t border-gray-100 shadow-xl">
                    {searchResults.map((res: any, idx) => (
                      <button 
                        key={idx}
                        onClick={() => selectSearchResult(res)}
                        className="w-full text-left px-4 py-3 hover:bg-blue-50 border-b border-gray-50 last:border-0 flex flex-col"
                      >
                        <span className="text-sm font-medium text-gray-900 truncate">{res.display_name.split(',')[0]}</span>
                        <span className="text-xs text-gray-500 truncate">{res.display_name.split(',').slice(1).join(',')}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <MapView 
              center={mapCenter}
              zoom={mapZoom}
              visits={visits} 
              onMapClick={handleMapClick} 
              onPinClick={handlePinClick} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
