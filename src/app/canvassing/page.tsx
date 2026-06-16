"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { Plus, Map, List, Flame, Snowflake, AlertCircle, XCircle, Phone, HardHat, Home, Search, CheckSquare } from "lucide-react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";
import NewBuildsTab from "@/components/dashboard/NewBuildsTab";
import TerritoriesTab from "./TerritoriesTab";
import CanvassingMode from "./CanvassingMode";

const MapView = dynamic(() => import("./MapView"), { ssr: false });

import { Trophy, Target, X, MapPin, Calendar, User as UserIcon } from "lucide-react";

function CanvassingStatsComponent({ visits }: { visits: any[] }) {
  const [activeModal, setActiveModal] = useState<'today' | 'total' | 'demos' | 'gobacks' | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const stats = { todayKnocks: 0, totalKnocks: 0, hotLeads: 0, warmLeads: 0 };
  const repCounts: Record<string, { knocks: number, hot: number }> = {};
  
  const todayList: any[] = [];
  const totalList: any[] = [];
  const demosList: any[] = [];
  const gobacksList: any[] = [];

  visits.forEach(v => {
    const isNewBuild = v.interest_level === 'new_build' || (v.notes && v.notes.includes('Source: County CSV Import'));
    const isUnknockedLead = v.interest_level === 'unknocked_lead';
    
    // Determine if it was actually knocked by a rep
    const hasRepNote = v.notes?.includes('[Rep:');
    const isManuallyLogged = !isNewBuild && !isUnknockedLead;

    if (!hasRepNote && !['demo_set', 'hot', 'go_back', 'warm', 'not_interested'].includes(v.interest_level) && !isManuallyLogged) {
      return; // Skip unknocked leads and untouched new builds
    }

    stats.totalKnocks++;
    totalList.push(v);
    
    const vDate = new Date(v.visited_at || v.created_at);
    if (vDate >= today) {
      stats.todayKnocks++;
      todayList.push(v);
    }

    if (['demo_set', 'hot', 'contacted'].includes(v.interest_level)) {
      stats.hotLeads++;
      demosList.push(v);
    }
    
    if (['go_back', 'warm'].includes(v.interest_level)) {
      stats.warmLeads++;
      gobacksList.push(v);
    }

    let rep = v.rep_name || "Unknown Rep";
    const match = v.notes?.match(/\[Rep:\s*(.*?)\]/);
    if (match && match[1]) {
      rep = match[1];
    } else if (v.sales_rep_name) {
      rep = v.sales_rep_name;
    }

    if (!repCounts[rep]) repCounts[rep] = { knocks: 0, hot: 0 };
    repCounts[rep].knocks++;
    if (['demo_set', 'hot', 'contacted'].includes(v.interest_level)) {
      repCounts[rep].hot++;
    }
  });

  const leaderboard = Object.entries(repCounts)
    .map(([name, data]) => ({ name, knocks: data.knocks, hot: data.hot }))
    .sort((a, b) => b.knocks - a.knocks);
    
  const renderModalList = (title: string, list: any[]) => {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <h2 className="text-xl font-bold text-gray-900">{title} <span className="text-gray-500 text-sm ml-2">({list.length})</span></h2>
            <button onClick={() => setActiveModal(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            {list.length === 0 ? (
              <p className="text-center text-gray-500 py-10">No records found.</p>
            ) : (
              <div className="space-y-3">
                {list.map((v, i) => {
                  let rep = "Unknown Rep";
                  const match = v.notes?.match(/\[Rep:\s*(.*?)\]/);
                  if (match && match[1]) rep = match[1];
                  else if (v.sales_rep_name) rep = v.sales_rep_name;

                  return (
                    <div key={v.id || i} className="border border-gray-100 rounded-xl p-4 hover:border-blue-100 hover:bg-blue-50/30 transition-colors">
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <div className="font-bold text-gray-900 text-base">{v.resident_name || 'Resident'}</div>
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 mt-1">
                            <MapPin className="w-3.5 h-3.5 text-gray-400" /> {v.address}
                          </div>
                          {v.notes && !v.notes.includes('Source: County CSV') && (
                            <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100">
                              {v.notes.replace(/\[Rep:\s*.*?\]/, '').trim()}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <div className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded-md text-xs font-semibold mb-2">
                            <UserIcon className="w-3 h-3" /> {rep.replace('Efficiency', '').trim()}
                          </div>
                          <div className="flex items-center justify-end gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" /> {new Date(v.visited_at || v.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 mb-6">
      {activeModal === 'today' && renderModalList("Knocked Today", todayList)}
      {activeModal === 'total' && renderModalList("Total Knocks", totalList)}
      {activeModal === 'demos' && renderModalList("Demos Set", demosList)}
      {activeModal === 'gobacks' && renderModalList("Go Backs", gobacksList)}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button onClick={() => setActiveModal('today')} className="text-left bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all rounded-xl p-4 shadow-sm flex flex-col justify-between group cursor-pointer">
          <div className="text-sm text-gray-500 font-medium mb-1 group-hover:text-blue-600 transition-colors">Knocked Today</div>
          <div className="text-3xl font-extrabold text-gray-900 group-hover:text-blue-700">{stats.todayKnocks}</div>
        </button>
        <button onClick={() => setActiveModal('total')} className="text-left bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all rounded-xl p-4 shadow-sm flex flex-col justify-between group cursor-pointer">
          <div className="text-sm text-gray-500 font-medium mb-1 group-hover:text-blue-600 transition-colors">Total Knocks</div>
          <div className="text-3xl font-extrabold text-gray-900 group-hover:text-blue-700">{stats.totalKnocks}</div>
        </button>
        <button onClick={() => setActiveModal('demos')} className="text-left bg-orange-50 border border-orange-100 hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group cursor-pointer">
          <Flame className="absolute -right-4 -bottom-4 w-16 h-16 text-orange-500/10 group-hover:scale-110 transition-transform duration-300" />
          <div className="text-sm text-orange-700 font-bold mb-1 flex items-center gap-1.5"><Flame className="w-4 h-4"/> Demos Set</div>
          <div className="text-3xl font-extrabold text-orange-600">{stats.hotLeads}</div>
        </button>
        <button onClick={() => setActiveModal('gobacks')} className="text-left bg-blue-50 border border-blue-100 hover:border-blue-300 hover:shadow-md hover:-translate-y-0.5 transition-all rounded-xl p-4 shadow-sm flex flex-col justify-between relative overflow-hidden group cursor-pointer">
          <AlertCircle className="absolute -right-4 -bottom-4 w-16 h-16 text-blue-500/10 group-hover:scale-110 transition-transform duration-300" />
          <div className="text-sm text-blue-700 font-bold mb-1 flex items-center gap-1.5"><AlertCircle className="w-4 h-4"/> Go Backs</div>
          <div className="text-3xl font-extrabold text-blue-600">{stats.warmLeads}</div>
        </button>
      </div>

      {leaderboard.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-yellow-500" /> Rep Leaderboard
            </h3>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Top Performers</span>
          </div>
          <div className="divide-y divide-gray-100">
            {leaderboard.map((rep, idx) => (
              <div key={rep.name} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-gray-200 text-gray-700' : idx === 2 ? 'bg-amber-100 text-amber-700' : 'bg-blue-50 text-blue-600'}`}>
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{rep.name.replace('Efficiency', '').trim() || 'Unknown Rep'}</div>
                  </div>
                </div>
                <div className="flex gap-6 text-right">
                  <div>
                    <div className="text-xs text-gray-500 font-medium uppercase">Doors Hit</div>
                    <div className="font-bold text-gray-900">{rep.knocks}</div>
                  </div>
                  <div>
                    <div className="text-xs text-orange-600 font-medium uppercase flex items-center gap-1"><Target className="w-3 h-3"/> Demos Set</div>
                    <div className="font-bold text-orange-600">{rep.hot}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
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
  const [currentUser, setCurrentUser] = useState<any>(null);

  const [newVisit, setNewVisit] = useState({
    sales_rep_name: undefined as string | undefined,
    id: "" as string | undefined,
    resident_name: "", address: "", interest_level: "not_interested", notes: "", property_size: "", existing_system: "", water_hardness: "", latitude: null as number | null, longitude: null as number | null
  });

  useEffect(() => {
    fetchVisits();
    fetchUser();

    // Add Supabase Realtime subscription
    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    const subscription = supabase
      .channel('public:leads_and_visits')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'door_knocking_visits' }, () => {
        fetchVisits();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, () => {
        fetchVisits();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'new_build_permits' }, () => {
        fetchVisits();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchUser() {
    const supabase = createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");
    const { data: sessionRes } = await supabase.auth.getUser();
    
    // Attempt to fetch profile name
    if (sessionRes?.user) {
       const { data: profile } = await supabase.from('profiles').select('first_name, last_name').eq('id', sessionRes.user.id).single();
       if (profile && profile.first_name) {
          setCurrentUser({ ...sessionRes.user, user_metadata: { ...sessionRes.user.user_metadata, full_name: `${profile.first_name} ${profile.last_name || ''}`.trim() } });
          return;
       }
    }
    setCurrentUser(sessionRes?.user || null);
  }

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
    setNewVisit({ id: undefined, resident_name: "", address: "", interest_level: "not_interested", notes: "", property_size: "", existing_system: "", water_hardness: "", latitude: null, longitude: null, sales_rep_name: undefined });
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
      sales_rep_name: visit.sales_rep_name || currentUser?.user_metadata?.full_name || currentUser?.email || "Logged In Rep",
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
    setNewVisit({ ...newVisit, sales_rep_name: currentUser?.user_metadata?.full_name || currentUser?.email || "Logged In Rep", latitude: lat, longitude: lng, address: "Loading details..." } as any);
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

  const handleGenerateRoute = () => {
    // Filter active high-priority pins assigned to/logged by this user or general
    const highPriority = visits.filter(v => 
       v.interest_level === 'go_back' || 
       v.interest_level === 'hot' || 
       v.interest_level === 'demo_set'
    );

    if (highPriority.length === 0) {
       alert("No high-priority pins (Hot, Demo Set, Go Back) found to route.");
       return;
    }

    // Limit to 9 waypoints (Google Maps free tier limit for optimize)
    const routePins = highPriority.slice(0, 9);
    
    // Origin is the first pin, destination is the last pin
    const origin = `${routePins[0].latitude},${routePins[0].longitude}`;
    const dest = `${routePins[routePins.length - 1].latitude},${routePins[routePins.length - 1].longitude}`;
    
    // Waypoints
    const waypoints = routePins.slice(1, routePins.length - 1)
       .map(p => `${p.latitude},${p.longitude}`)
       .join('|');
       
    // Build Google Maps Dir URL
    let mapUrl = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}`;
    if (waypoints) {
       mapUrl += `&waypoints=${waypoints}`;
    }
    
    window.open(mapUrl, "_blank");
  };

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
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "builds" ? "bg-background shadow-sm text-red-600" : "text-muted-foreground"}`}
              >
                <Home className="w-4 h-4" /> New Builds
              </button>
              <button 
                onClick={() => setView("territories")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "territories" ? "bg-background shadow-sm text-purple-600" : "text-muted-foreground"}`}
              >
                <MapPin className="w-4 h-4" /> Territories
              </button>
              <button 
                onClick={() => setView("map")}
                className={`px-3 py-1.5 text-sm font-medium rounded-md flex items-center gap-2 ${view === "map" ? "bg-background shadow-sm text-orange-600" : "text-muted-foreground"}`}
              >
                <Map className="w-4 h-4" /> D2D Map
              </button>
            </div>
            <button onClick={handleGenerateRoute}
              className="bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-md font-medium flex items-center gap-2 text-sm shadow-sm"
            >
              <MapPin className="w-4 h-4" /> Smart Route
            </button>
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

        <CanvassingStatsComponent visits={visits} />

        {showAdd && (
          <div className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex justify-end md:justify-center items-end md:items-center p-0 md:p-4">
            <div className="bg-white w-full md:max-w-lg rounded-t-3xl md:rounded-2xl shadow-2xl animate-in slide-in-from-bottom md:zoom-in-95 max-h-[95vh] overflow-y-auto">
              
              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Log House Visit</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Rep auto-stamped from your account</p>
                </div>
                <button onClick={() => setShowAdd(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">

                {/* Interest Level - Big Tap Buttons */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 block">What happened at the door?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'demo_set', label: 'Demo Set', emoji: '📅', color: 'border-orange-400 bg-orange-50 text-orange-700' },
                      { value: 'go_back', label: 'Go Back', emoji: '✅', color: 'border-blue-400 bg-blue-50 text-blue-700' },
                      { value: 'not_home', label: 'Not Home', emoji: '🏠', color: 'border-yellow-400 bg-yellow-50 text-yellow-700' },
                      { value: 'not_interested', label: 'Not Interested', emoji: '❄️', color: 'border-gray-300 bg-gray-50 text-gray-600' },
                      { value: 'do_not_knock', label: 'Do Not Knock', emoji: '🚫', color: 'border-red-400 bg-red-50 text-red-700' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setNewVisit({...newVisit, interest_level: opt.value})}
                        className={`flex items-center gap-2 px-3 py-3 rounded-xl border-2 font-semibold text-sm transition-all active:scale-95 ${
                          newVisit.interest_level === opt.value
                            ? opt.color + ' shadow-sm scale-[1.02]'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg">{opt.emoji}</span>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Address + Resident */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Address *</label>
                    <input
                      required
                      className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      placeholder="123 Example St"
                      value={newVisit.address}
                      onChange={e => setNewVisit({...newVisit, address: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Resident Name</label>
                    <input
                      className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                      placeholder="Current Resident"
                      value={newVisit.resident_name}
                      onChange={e => setNewVisit({...newVisit, resident_name: e.target.value})}
                    />
                  </div>
                </div>

                {/* Water Hardness */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Water Hardness (Test Results)</label>
                  <input
                    className="w-full h-11 rounded-xl border border-gray-200 bg-gray-50 px-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    placeholder="e.g. 15 GPG or High Iron"
                    value={newVisit.water_hardness}
                    onChange={e => setNewVisit({...newVisit, water_hardness: e.target.value})}
                  />
                </div>

                {/* Notes */}
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5 block">Notes / Follow Up Time</label>
                  <textarea
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition min-h-[80px] resize-none"
                    placeholder="Any details from the conversation..."
                    value={newVisit.notes}
                    onChange={e => setNewVisit({...newVisit, notes: e.target.value})}
                  />
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-2 pb-2">
                  <button type="button" onClick={() => setShowAdd(false)} className="flex-1 py-3.5 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-2 flex-grow-[2] py-3.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white rounded-xl text-sm font-bold shadow-sm transition-all">
                    Save Visit ✓
                  </button>
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
              <div className="p-8 text-center text-muted-foreground">Loading new movers...</div>
            ) : visits.filter(v => v._type === 'new_mover').length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center space-y-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <List className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">No New Movers Yet</h3>
                <p className="text-muted-foreground max-w-sm">Upload Carver County or Hennepin County CSV data to populate this list with homeowners who moved in the last year.</p>
              </div>
            ) : (
              <div>
                <div className="px-5 py-3 bg-green-50 border-b border-green-100 flex items-center justify-between">
                  <span className="text-sm font-bold text-green-800">🏡 {visits.filter(v => v._type === 'new_mover').length} New Homeowners — Moved Within Last 12 Months</span>
                </div>
                <div className="divide-y">
                {[...visits].filter(v => v._type === 'new_mover').sort((a, b) => {
                  return new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime();
                }).slice(0, 100).map((v) => (
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
