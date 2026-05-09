"use client";

import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, User, MapPin, Navigation, AlertCircle, Sun, CloudRain, Zap, Truck, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { APIProvider, Map, Marker } from '@vis.gl/react-google-maps';

type Technician = {
  id: string;
  name?: string;
  status?: string;
  last_location?: any;
};

type Job = {
  id: string;
  title?: string;
  address?: string;
  status?: string;
  priority?: string;
  technician_id?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  created_at?: string;
  customers?: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }
};

const center = { lat: 44.9778, lng: -93.2650 };

export default function Dispatch() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [viewMode, setViewMode] = useState<'day' | 'map'>('day');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  const [techs, setTechs] = useState<Technician[]>([]);
  const [unassignedJobs, setUnassignedJobs] = useState<Job[]>([]);
  const [assignedJobs, setAssignedJobs] = useState<Job[]>([]);
  const [techTableAvailable, setTechTableAvailable] = useState(true);
  const [assignSelection, setAssignSelection] = useState<Record<string, string>>({});
  const [assignSaving, setAssignSaving] = useState<string | null>(null);
  const [scheduleSelection, setScheduleSelection] = useState<Record<string, { start?: string; end?: string }>>({});

  const loadJobs = () => {
    fetch("/api/jobs?view=unassigned")
      .then((r) => r.json())
      .then((json) => setUnassignedJobs(json.jobs || []))
      .catch(() => setUnassignedJobs([]));

    fetch("/api/jobs?view=assigned")
      .then((r) => r.json())
      .then((json) => setAssignedJobs(json.jobs || []))
      .catch(() => setAssignedJobs([]));
  };

  const bookJob = async (jobId: string) => {
    const techId = assignSelection[jobId];
    const start = scheduleSelection[jobId]?.start;
    const end = scheduleSelection[jobId]?.end;
    if (!techId || !start || !end) return;

    setAssignSaving(jobId);
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: jobId,
          technician_id: techId,
          scheduled_start: new Date(start).toISOString(),
          scheduled_end: new Date(end).toISOString(),
          status: "Scheduled",
        }),
      });
      // refresh lists
      loadJobs();
    } finally {
      setAssignSaving(null);
    }
  };

  useEffect(() => {
    fetch("/api/technicians")
      .then((r) => r.json())
      .then((json) => {
        setTechs(json.technicians || []);
        setTechTableAvailable(json.tableAvailable !== false);
      })
      .catch(() => {
        setTechs([]);
        setTechTableAvailable(false);
      });

    loadJobs();
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-8 h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Dispatch & Routing</h1>
          <p className="text-gray-500 mt-2">Live truck tracking, AI routing, and schedule management.</p>
        </div>
        <div className="flex gap-4 items-center">
          <div className="bg-blue-50 border border-blue-100 px-4 py-2 rounded-lg flex items-center gap-3">
            <Sun size={20} className="text-yellow-500" />
            <div>
              <p className="text-xs font-bold text-blue-900">72° Clear</p>
              <p className="text-[10px] text-blue-700">Perfect for roof/solar work</p>
            </div>
          </div>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Users size={18} />
            Filter Crews
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2">
            <Plus size={18} />
            Manual Book
          </button>
        </div>
      </div>

      {/* Calendar Controls */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">Today</h2>
          <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight size={20} className="text-gray-600" />
          </button>
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Day View</button>
          <button onClick={() => setViewMode('map')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Map View</button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Sidebar: AI Parking Lot */}
        <div className="w-80 bg-gray-50 rounded-xl border border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">AI Parking Lot</h3>
            <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{unassignedJobs.length} Pending</span>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <p className="text-xs text-gray-500 mb-2">Jobs caught by AI needing manual assignment.</p>
            {unassignedJobs.length === 0 ? (
              <div className="text-center p-4 text-sm text-gray-500">No unassigned jobs.</div>
            ) : unassignedJobs.map(job => (
              <div key={job.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm cursor-grab hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${job.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {job.priority || 'Normal'}
                  </span>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">{job.title || 'Untitled Job'}</h4>
                {job.address && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} /> {job.address}
                  </div>
                )}

                {/* Quick book (assign + schedule) */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={assignSelection[job.id] || ""}
                      onChange={(e) => setAssignSelection((prev) => ({ ...prev, [job.id]: e.target.value }))}
                      className="flex-1 px-2 py-1.5 border border-gray-300 rounded-md text-xs text-black bg-white"
                      disabled={!techTableAvailable || techs.length === 0}
                    >
                      <option value="">Assign tech…</option>
                      {techs.map((t) => (
                        <option key={t.id} value={t.id}>{t.name || 'Technician'}</option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Start</label>
                      <input
                        type="datetime-local"
                        value={scheduleSelection[job.id]?.start || ""}
                        onChange={(e) => setScheduleSelection((prev) => ({
                          ...prev,
                          [job.id]: { ...(prev[job.id] || {}), start: e.target.value },
                        }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs text-black bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">End</label>
                      <input
                        type="datetime-local"
                        value={scheduleSelection[job.id]?.end || ""}
                        onChange={(e) => setScheduleSelection((prev) => ({
                          ...prev,
                          [job.id]: { ...(prev[job.id] || {}), end: e.target.value },
                        }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs text-black bg-white"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => bookJob(job.id)}
                    disabled={!assignSelection[job.id] || !scheduleSelection[job.id]?.start || !scheduleSelection[job.id]?.end || assignSaving === job.id}
                    className="w-full px-3 py-2 rounded-md text-xs font-semibold bg-blue-600 text-white disabled:opacity-50"
                  >
                    {assignSaving === job.id ? 'Booking…' : 'Book & Assign'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Board or Map */}
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col relative">
          {viewMode === 'map' ? (
            <div className="flex-1 relative overflow-hidden bg-gray-100">
              <div className="absolute top-4 left-4 bg-white p-3 rounded-xl shadow-md border border-gray-200 z-10 w-72">
                <h3 className="font-bold text-gray-900 text-sm mb-2 flex items-center gap-2"><Navigation size={16} className="text-blue-600"/> Live Fleet Tracking</h3>
                {!techTableAvailable ? (
                  <p className="text-xs text-gray-500">Technician table not set up yet.</p>
                ) : techs.length === 0 ? (
                  <p className="text-xs text-gray-500">No technicians yet.</p>
                ) : (
                  <div className="space-y-2">
                    {techs.map((t) => (
                      <div key={t.id} className="flex justify-between items-center text-xs">
                        <span className="flex items-center gap-1.5">
                          <div className={`w-2 h-2 rounded-full ${String(t.status || '').toLowerCase() === 'available' ? 'bg-green-500' : String(t.status || '').toLowerCase().includes('route') ? 'bg-blue-500' : String(t.status || '').toLowerCase().includes('site') ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                          {t.name || 'Technician'}
                        </span>
                        <span className="font-bold text-gray-700">{t.status || 'Unknown'}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <APIProvider apiKey={apiKey}>
                <div style={{ width: '100%', height: '100%' }}>
                  <Map defaultCenter={center} defaultZoom={11} disableDefaultUI={true} gestureHandling={'greedy'} />
                </div>
              </APIProvider>
            </div>
          ) : (
            <div className="flex-1 flex overflow-x-auto relative">
              <div className="w-20 border-r border-gray-200 bg-gray-50 flex flex-col sticky left-0 z-20">
                <div className="h-20 border-b border-gray-200 bg-gray-50"></div>
                {["8 AM", "9 AM", "10 AM", "11 AM", "12 PM", "1 PM", "2 PM", "3 PM"].map((time) => (
                  <div key={time} className="h-32 border-b border-gray-200 text-right pr-3 pt-2 relative">
                    <span className="text-xs font-medium text-gray-500 absolute -top-2.5 right-3 bg-gray-50 px-1">{time}</span>
                  </div>
                ))}
              </div>
              <div className="flex-1 flex min-w-max relative bg-gray-50/30">
                <div className="absolute left-0 right-0 top-[280px] h-0.5 bg-red-500 z-10 flex items-center">
                  <div className="h-2 w-2 rounded-full bg-red-500 -ml-1"></div>
                </div>
                {techs.length === 0 ? (
                  <div className="p-8 text-gray-500 text-sm">No technicians found. Add some in the database.</div>
                ) : techs.map(tech => (
                  <div key={tech.id} className="w-[300px] border-r border-gray-200 relative">
                    <div className="h-20 border-b border-gray-200 bg-white p-3 sticky top-0 z-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center relative">
                          <User size={18} className="text-blue-600" />
                          <div className={`absolute -bottom-1 -right-1 h-3 w-3 border-2 border-white rounded-full ${String(tech.status || '').toLowerCase() === 'available' ? 'bg-green-500' : String(tech.status || '').toLowerCase().includes('route') ? 'bg-blue-500' : String(tech.status || '').toLowerCase().includes('site') ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 leading-tight">{tech.name}</h4>
                          <p className="text-xs text-gray-500 capitalize">{tech.status}</p>
                        </div>
                      </div>
                    </div>
                    <div className="relative h-[1024px]">
                      {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-32 border-b border-gray-100 w-full absolute" style={{ top: `${i * 128}px` }}></div>
                      ))}
                      {assignedJobs.filter(j => j.technician_id === tech.id).map((job, idx) => (
                        // Render assigned jobs (mock position for beta)
                        <div key={job.id} className="absolute left-2 right-2 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm flex flex-col z-10" style={{ top: `${50 + (idx * 150)}px`, height: '120px' }}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded uppercase">{job.status || 'Scheduled'}</span>
                            {job.scheduled_start && (
                              <span className="text-[10px] font-bold text-gray-600 bg-white/70 px-2 py-0.5 rounded border border-gray-200">
                                {new Date(job.scheduled_start).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}
                              </span>
                            )}
                          </div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{job.title || 'Untitled Job'}</p>
                          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1 line-clamp-1"><MapPin size={12}/> {job.address || 'No address'}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
