"use client";

import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, User, MapPin, Navigation, AlertCircle, Sun, CloudRain, Zap, Truck, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
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
  estimated_minutes?: number;
  created_at?: string;
  customers?: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  }
};

type JobTicket = Job & {
  quoted_amount?: any;
};

const center = { lat: 44.9778, lng: -93.2650 };
const GRID_START_HOUR = 8; // 8am
const GRID_HOURS = 8; // 8am–3pm demo window
const GRID_HEADER_PX = 80; // h-20
const GRID_HOUR_PX = 128; // h-32
const GRID_SLOT_MINUTES = 30;
const GRID_SLOT_PX = GRID_HOUR_PX / 2;

function hourLabel(h24: number) {
  const h = ((h24 + 11) % 12) + 1;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return `${h} ${ampm}`;
}

function halfHourLabel(h24: number) {
  const h = ((h24 + 11) % 12) + 1;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return `${h}:30 ${ampm}`;
}

function minutesSinceGridStart(d: Date) {
  return (d.getHours() - GRID_START_HOUR) * 60 + d.getMinutes();
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function getLatLng(loc: any): { lat: number; lng: number } | null {
  if (!loc) return null;
  if (typeof loc === 'string') {
    try { loc = JSON.parse(loc); } catch { return null; }
  }
  const lat = Number(loc.lat ?? loc.latitude);
  const lng = Number(loc.lng ?? loc.lon ?? loc.longitude);
  if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  return null;
}

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
  const [scheduleSelection, setScheduleSelection] = useState<Record<string, { date?: string; time?: string; duration?: number }>>({});
  const [ticketOpen, setTicketOpen] = useState(false);
  const [ticketLoading, setTicketLoading] = useState(false);
  const [ticket, setTicket] = useState<JobTicket | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());

  const hours = useMemo(() => Array.from({ length: GRID_HOURS }, (_, i) => GRID_START_HOUR + i), []);
  const slots = useMemo(() => Array.from({ length: GRID_HOURS * (60 / GRID_SLOT_MINUTES) }, (_, i) => i), []);

  const timeLineTop = useMemo(() => {
    const h = now.getHours();
    const m = now.getMinutes();
    const minutesSinceStart = (h - GRID_START_HOUR) * 60 + m;
    if (minutesSinceStart < 0 || minutesSinceStart > GRID_HOURS * 60) return null;
    return GRID_HEADER_PX + (minutesSinceStart / 60) * GRID_HOUR_PX;
  }, [now]);

  const jobStyleForGrid = (job: Job, idx: number) => {
    // Fallback stack layout if no schedule
    if (!job.scheduled_start) return { top: `${50 + idx * 150}px`, height: '120px' } as any;

    const start = new Date(job.scheduled_start);
    if (Number.isNaN(start.getTime())) return { top: `${50 + idx * 150}px`, height: '120px' } as any;

    let durationMinutes = 60;
    if (job.scheduled_end) {
      const end = new Date(job.scheduled_end);
      const diff = (end.getTime() - start.getTime()) / 60000;
      if (Number.isFinite(diff) && diff > 0) durationMinutes = diff;
    } else if (job.estimated_minutes) {
      durationMinutes = job.estimated_minutes;
    }

    const mins = minutesSinceGridStart(start);
    const topPx = clamp((mins / 60) * GRID_HOUR_PX, 0, GRID_HOURS * GRID_HOUR_PX - 20);
    const heightPx = clamp((durationMinutes / 60) * GRID_HOUR_PX - 8, 52, GRID_HOURS * GRID_HOUR_PX);
    return { top: `${topPx + 8}px`, height: `${heightPx}px` } as any;
  };

  const openTicket = async (jobId: string) => {
    setTicketOpen(true);
    setTicketLoading(true);
    try {
      const res = await fetch(`/api/jobs?id=${encodeURIComponent(jobId)}`);
      const json = await res.json();
      setTicket(json.job || null);
    } catch {
      setTicket(null);
    } finally {
      setTicketLoading(false);
    }
  };

  const geocodeDemo = async () => {
    setGeoBusy(true);
    setGeoMsg(null);
    try {
      const res = await fetch('/api/technicians/geocode', { method: 'POST' });
      const json = await res.json();
      if (!res.ok || json?.ok === false) {
        setGeoMsg(json?.error || 'Geocode failed');
      } else {
        setGeoMsg(`Geocoded ${json.updated}/${json.attempted} tech addresses`);
      }
    } catch {
      setGeoMsg('Geocode failed');
    } finally {
      setGeoBusy(false);
    }
  };

  const getDefaultDuration = (job: Job) => {
    const m = job.estimated_minutes;
    if (!m || Number.isNaN(Number(m))) return 60;
    // clamp to common buckets
    if (m <= 30) return 30;
    if (m <= 60) return 60;
    if (m <= 90) return 90;
    if (m <= 120) return 120;
    if (m <= 180) return 180;
    return 240;
  };

  const toIso = (date?: string, time?: string) => {
    if (!date || !time) return null;
    // datetime-local style string; parse as local time
    const d = new Date(`${date}T${time}`);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

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
    const date = scheduleSelection[jobId]?.date;
    const time = scheduleSelection[jobId]?.time;
    const duration = scheduleSelection[jobId]?.duration;
    const startIso = toIso(date, time);
    if (!techId || !startIso || !duration) return;

    const startDt = new Date(startIso);
    const endDt = new Date(startDt.getTime() + duration * 60000);
    const endIso = endDt.toISOString();

    setAssignSaving(jobId);
    try {
      await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: jobId,
          technician_id: techId,
          scheduled_start: startIso,
          scheduled_end: endIso,
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
    const load = () => {
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
    };

    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-8 h-[calc(100vh-2rem)] flex flex-col">
      {/* Job Ticket Slide-over */}
      {ticketOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setTicketOpen(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Job Ticket</p>
                <h2 className="text-xl font-bold text-gray-900 mt-1">
                  {ticketLoading ? 'Loading…' : (ticket?.title || 'Untitled Job')}
                </h2>
                {ticket?.customers?.phone_number && (
                  <p className="text-sm text-gray-600 mt-1">
                    {ticket.customers.first_name ? `${ticket.customers.first_name} ${ticket.customers.last_name || ''}`.trim() : 'Customer'} • {ticket.customers.phone_number}
                  </p>
                )}
              </div>
              <button onClick={() => setTicketOpen(false)} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
                Close
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {ticketLoading ? (
                <div className="text-sm text-gray-500">Fetching job details…</div>
              ) : !ticket ? (
                <div className="text-sm text-gray-500">Could not load job.</div>
              ) : (
                <>
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Status</span>
                      <span className="text-xs font-bold px-2 py-1 rounded bg-blue-50 text-blue-700 border border-blue-200">{ticket.status || 'Lead'}</span>
                    </div>
                    {ticket.address && (
                      <p className="text-sm text-gray-800 mt-3 flex items-start gap-2">
                        <MapPin size={16} className="text-gray-400 mt-0.5" />
                        <span>{ticket.address}</span>
                      </p>
                    )}
                    {ticket.scheduled_start && (
                      <p className="text-sm text-gray-700 mt-2">
                        Scheduled: {new Date(ticket.scheduled_start).toLocaleString()}
                      </p>
                    )}
                    {ticket.estimated_minutes ? (
                      <p className="text-xs text-gray-500 mt-2">AI duration guess: ~{ticket.estimated_minutes} min</p>
                    ) : null}
                  </div>

                  <div className="text-xs text-gray-400">
                    Tip: for now, the full customer history + call summaries live in the Customer Profile.
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Date</label>
                      <input
                        type="date"
                        value={scheduleSelection[job.id]?.date || ""}
                        onChange={(e) => setScheduleSelection((prev) => ({
                          ...prev,
                          [job.id]: { ...(prev[job.id] || {}), date: e.target.value, duration: prev[job.id]?.duration ?? getDefaultDuration(job) },
                        }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs text-black bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Start</label>
                      <input
                        type="time"
                        value={scheduleSelection[job.id]?.time || ""}
                        onChange={(e) => setScheduleSelection((prev) => ({
                          ...prev,
                          [job.id]: { ...(prev[job.id] || {}), time: e.target.value, duration: prev[job.id]?.duration ?? getDefaultDuration(job) },
                        }))}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs text-black bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Duration</label>
                    <select
                      value={scheduleSelection[job.id]?.duration ?? getDefaultDuration(job)}
                      onChange={(e) => setScheduleSelection((prev) => ({
                        ...prev,
                        [job.id]: { ...(prev[job.id] || {}), duration: Number(e.target.value) },
                      }))}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs text-black bg-white"
                    >
                      {[30, 60, 90, 120, 180, 240].map((m) => (
                        <option key={m} value={m}>{m} min</option>
                      ))}
                    </select>
                    {job.estimated_minutes ? (
                      <p className="mt-1 text-[10px] text-gray-400">AI guess: ~{job.estimated_minutes} min</p>
                    ) : null}
                  </div>

                  <button
                    onClick={() => bookJob(job.id)}
                    disabled={!assignSelection[job.id] || !scheduleSelection[job.id]?.date || !scheduleSelection[job.id]?.time || !(scheduleSelection[job.id]?.duration ?? getDefaultDuration(job)) || assignSaving === job.id}
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

                <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                  <button
                    onClick={async () => {
                      await geocodeDemo();
                      // reload after geocoding
                      fetch("/api/technicians")
                        .then((r) => r.json())
                        .then((json) => {
                          setTechs(json.technicians || []);
                          setTechTableAvailable(json.tableAvailable !== false);
                        })
                        .catch(() => {});
                    }}
                    disabled={geoBusy}
                    className="w-full px-3 py-2 rounded-md text-xs font-semibold bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-60"
                  >
                    {geoBusy ? 'Geocoding…' : 'Geocode Demo Addresses'}
                  </button>
                  {geoMsg && <p className="text-[11px] text-gray-500">{geoMsg}</p>}
                </div>
              </div>
              {!apiKey ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-500">
                  Missing Google Maps API key. Set <span className="font-mono mx-1">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</span> in Vercel.
                </div>
              ) : (
                <APIProvider apiKey={apiKey}>
                  <div style={{ width: '100%', height: '100%' }}>
                    <Map defaultCenter={center} defaultZoom={11} disableDefaultUI={true} gestureHandling={'greedy'}>
                      {techs
                        .map((t) => ({ tech: t, pos: getLatLng((t as any).last_location) }))
                        .filter((x) => x.pos)
                        .map(({ tech, pos }: any) => (
                          <Marker key={tech.id} position={pos} title={tech.name || 'Technician'} />
                        ))}
                    </Map>
                  </div>
                </APIProvider>
              )}
            </div>
          ) : (
            <div className="flex-1 flex overflow-x-auto relative">
              <div className="w-20 border-r border-gray-200 bg-gray-50 flex flex-col sticky left-0 z-20">
                <div className="h-20 border-b border-gray-200 bg-gray-50"></div>
                {slots.map((i) => {
                  const h24 = GRID_START_HOUR + Math.floor(i / 2);
                  const isHalf = i % 2 === 1;
                  return (
                    <div
                      key={i}
                      className="border-b border-gray-200 pr-3 flex items-start justify-end"
                      style={{ height: GRID_SLOT_PX }}
                    >
                      <span className={`text-[11px] ${isHalf ? 'text-gray-300' : 'text-gray-600'} font-medium mt-1`}>
                        {isHalf ? halfHourLabel(h24) : hourLabel(h24)}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="flex-1 flex min-w-max relative bg-gray-50/30">
                {timeLineTop !== null && (
                  <div className="absolute left-0 right-0 h-0.5 bg-red-500 z-10 flex items-center" style={{ top: `${timeLineTop}px` }}>
                    <div className="h-2 w-2 rounded-full bg-red-500 -ml-1"></div>
                  </div>
                )}
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
                      {[...Array(GRID_HOURS * 2)].map((_, i) => (
                        <div
                          key={i}
                          className={`w-full absolute ${i % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-50'}`}
                          style={{ top: `${i * GRID_SLOT_PX}px`, height: GRID_SLOT_PX }}
                        />
                      ))}
                      {assignedJobs.filter(j => j.technician_id === tech.id).map((job, idx) => (
                        // Render assigned jobs (mock position for beta)
                        <div
                          key={job.id}
                          onClick={() => openTicket(job.id)}
                          className="absolute left-2 right-2 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm flex flex-col z-10 cursor-pointer hover:shadow-md"
                          style={jobStyleForGrid(job, idx)}
                        >
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
