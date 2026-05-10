"use client";

import { Calendar as CalendarIcon, Clock, Users, Plus, ChevronLeft, ChevronRight, User, MapPin, Navigation, AlertCircle, Sun, CloudRain, Zap, Truck, CheckCircle2 } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { APIProvider, Map as GMap, Marker } from '@vis.gl/react-google-maps';

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
  notes?: string;
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

type Msg = {
  id: string;
  channel?: string;
  direction?: string;
  from_value?: string | null;
  to_value?: string | null;
  body?: string | null;
  created_at?: string;
};

type Suggestion = {
  techId: string;
  techName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  duration: number;
};

const center = { lat: 44.9778, lng: -93.2650 };
const GRID_START_HOUR = 0; // 12am
const GRID_HOURS = 24; // full day
const GRID_HEADER_PX = 80; // h-20
const GRID_HOUR_PX = 128; // h-32
const GRID_SLOT_MINUTES = 30;
const GRID_SLOT_PX = GRID_HOUR_PX / 2;
const GRID_TOTAL_PX = GRID_HOURS * GRID_HOUR_PX;

// UI
const GUTTER_W = 112; // px (w-28-ish)

// Timezone handling
// Force the timeline to a single business timezone so “now”, the red line, and job cards agree.
const DISPLAY_TZ = "America/Chicago";

function hourLabel(h24: number) {
  const h = ((h24 + 11) % 12) + 1;
  const ampm = h24 >= 12 ? 'PM' : 'AM';
  return `${h} ${ampm}`;
}

function halfHourLabel(h24: number) {
  const h = ((h24 + 11) % 12) + 1;
  // Keep this compact so it doesn't wrap in the gutter.
  return `${h}:30`;
}

function fmtTime(d: Date, timeZone: string) {
  return d.toLocaleTimeString([], { timeZone, hour: 'numeric', minute: '2-digit' });
}

function tzParts(d: Date, timeZone: string): { y: number; mo: number; day: number; h: number; mi: number } {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return { y: get('year'), mo: get('month'), day: get('day'), h: get('hour'), mi: get('minute') };
}

function minutesSinceGridStart(d: Date) {
  const { h, mi } = tzParts(d, DISPLAY_TZ);
  return (h - GRID_START_HOUR) * 60 + mi;
}

function isSameTzDay(a: Date, b: Date, timeZone: string) {
  const pa = tzParts(a, timeZone);
  const pb = tzParts(b, timeZone);
  return pa.y === pb.y && pa.mo === pb.mo && pa.day === pb.day;
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

function fmtPhone(p?: string) {
  if (!p) return '';
  const d = String(p).replace(/\D/g, '');
  if (d.length === 11 && d[0] === '1') return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return p;
}

function customerLabel(job: Job) {
  const c = job.customers;
  const first = (c?.first_name || '').trim();
  const last = (c?.last_name || '').trim();
  const full = `${first} ${last}`.trim();
  if (full && first.toLowerCase() !== 'new') return full;
  const phone = fmtPhone(c?.phone_number);
  if (phone) return phone;
  return 'Unknown customer';
}

function statusPill(status?: string) {
  const s = String(status || '').toLowerCase();
  if (s.includes('reschedule')) return 'text-orange-800 bg-orange-100 border-orange-200';
  if (s.includes('confirm')) return 'text-green-800 bg-green-100 border-green-200';
  if (s.includes('scheduled')) return 'text-blue-700 bg-blue-100 border-blue-200';
  if (s.includes('lead')) return 'text-gray-700 bg-gray-100 border-gray-200';
  return 'text-blue-700 bg-blue-100 border-blue-200';
}

function toDateInputValue(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function toTimeInputValue(d: Date) {
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function minToTimeStr(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function ceilToSlot(min: number, slot = 30) {
  return Math.ceil(min / slot) * slot;
}

export default function Dispatch() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  const [viewMode, setViewMode] = useState<'day' | 'map'>('day');
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  
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
  const [ticketMessages, setTicketMessages] = useState<Msg[]>([]);
  const [ticketMessagesLoading, setTicketMessagesLoading] = useState(false);
  const [scheduleHours, setScheduleHours] = useState<{ startMin: number; endMin: number }>({ startMin: 480, endMin: 1020 });
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, Suggestion[]>>({});
  const [geoBusy, setGeoBusy] = useState(false);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [now, setNow] = useState<Date>(() => new Date());
  const dayScrollRef = useRef<HTMLDivElement | null>(null);
  const didAutoScrollRef = useRef(false);
  const dragRef = useRef<{ active: boolean; x: number; y: number; left: number; top: number }>({ active: false, x: 0, y: 0, left: 0, top: 0 });

  const panLeft = () => {
    const el = dayScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: -320, top: 0, behavior: 'smooth' });
  };

  const panRight = () => {
    const el = dayScrollRef.current;
    if (!el) return;
    el.scrollBy({ left: 320, top: 0, behavior: 'smooth' });
  };

  const todayKey = useMemo(() => {
    const p = tzParts(new Date(), DISPLAY_TZ);
    return `${p.y}-${String(p.mo).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
  }, []);

  const jumpToNow = () => {
    const el = dayScrollRef.current;
    if (!el) return;
    const n = new Date();
    const isToday = isSameTzDay(n, selectedDate, DISPLAY_TZ);
    const minutes = isToday ? minutesSinceGridStart(n) : scheduleHours.startMin;
    // +GRID_HEADER_PX because the timeline body starts after the header row in the scroll container.
    const y = clamp(GRID_HEADER_PX + (minutes / 60) * GRID_HOUR_PX - 2 * GRID_HOUR_PX, 0, GRID_HEADER_PX + GRID_TOTAL_PX);
    // Wait for layout; Safari can ignore immediate scrollTop on first paint.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.scrollTo({ top: y, behavior: 'auto' });
    }));
  };

  const hours = useMemo(() => Array.from({ length: GRID_HOURS }, (_, i) => GRID_START_HOUR + i), []);
  const slots = useMemo(() => Array.from({ length: GRID_HOURS * (60 / GRID_SLOT_MINUTES) }, (_, i) => i), []);

  const timeLineTop = useMemo(() => {
    // Only show the red line on the selected day.
    if (!isSameTzDay(now, selectedDate, DISPLAY_TZ)) return null;
    const minutesSinceStart = minutesSinceGridStart(now);
    if (minutesSinceStart < 0 || minutesSinceStart > GRID_HOURS * 60) return null;
    return (minutesSinceStart / 60) * GRID_HOUR_PX;
  }, [now, selectedDate]);

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
    return { top: `${topPx}px`, height: `${heightPx}px` } as any;
  };

  const openTicket = async (jobId: string) => {
    setTicketOpen(true);
    setTicketLoading(true);
    setTicketMessagesLoading(true);

    // persist in URL for deep-linking
    try {
      if (typeof window !== 'undefined') {
        const u = new URL(window.location.href);
        u.searchParams.set('job', jobId);
        window.history.replaceState({}, '', u.toString());
      }
    } catch {}

    try {
      const [resJob, resMsg] = await Promise.all([
        fetch(`/api/jobs?id=${encodeURIComponent(jobId)}`),
        fetch(`/api/messages?job_id=${encodeURIComponent(jobId)}&limit=50`),
      ]);

      const json = await resJob.json();
      setTicket(json.job || null);

      if (resMsg.ok) {
        const mj = await resMsg.json();
        setTicketMessages(mj.messages || []);
      } else {
        setTicketMessages([]);
      }
    } catch {
      setTicket(null);
      setTicketMessages([]);
    } finally {
      setTicketLoading(false);
      setTicketMessagesLoading(false);
    }
  };

  const closeTicket = () => {
    setTicketOpen(false);
    try {
      if (typeof window !== 'undefined') {
        const u = new URL(window.location.href);
        u.searchParams.delete('job');
        window.history.replaceState({}, '', u.toString());
      }
    } catch {}
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

  const recommendSlots = (job: Job): Suggestion[] => {
    if (!techs.length) return [];

    const duration = scheduleSelection[job.id]?.duration ?? getDefaultDuration(job);

    // Choose the day we’re trying to schedule.
    const baseDate =
      scheduleSelection[job.id]?.date ||
      (job.scheduled_start ? toDateInputValue(new Date(job.scheduled_start)) : toDateInputValue(selectedDate));

    const businessStart = new Date(`${baseDate}T${minToTimeStr(scheduleHours.startMin)}`);
    const businessEnd = new Date(`${baseDate}T${minToTimeStr(scheduleHours.endMin)}`);
    const startOfDay = new Date(`${baseDate}T00:00`);
    const endOfDay = new Date(`${baseDate}T23:59`);

    const durMin = Math.max(30, Number(duration) || 60);
    const businessStartMin = Math.round((businessStart.getTime() - startOfDay.getTime()) / 60000);
    const businessEndMin = Math.round((businessEnd.getTime() - startOfDay.getTime()) / 60000);

    const suggestions: Suggestion[] = [];

    for (const tech of techs) {
      // Gather this tech’s scheduled blocks for that date.
      const blocks = assignedJobs
        .filter((j) => j.technician_id === tech.id && j.scheduled_start)
        .map((j) => {
          const st = new Date(j.scheduled_start!);
          if (Number.isNaN(st.getTime()) || st < startOfDay || st > endOfDay) return null;
          let et: Date;
          if (j.scheduled_end) et = new Date(j.scheduled_end);
          else if (j.estimated_minutes) et = new Date(st.getTime() + j.estimated_minutes * 60000);
          else et = new Date(st.getTime() + 60 * 60000);
          if (Number.isNaN(et.getTime())) et = new Date(st.getTime() + 60 * 60000);
          const sMin = Math.round((st.getTime() - startOfDay.getTime()) / 60000);
          const eMin = Math.round((et.getTime() - startOfDay.getTime()) / 60000);
          return { sMin, eMin };
        })
        .filter(Boolean) as { sMin: number; eMin: number }[];

      blocks.sort((a, b) => a.sMin - b.sMin);

      let cursor = businessStartMin;
      cursor = ceilToSlot(cursor, GRID_SLOT_MINUTES);

      for (const b of blocks) {
        // skip blocks outside business hours
        if (b.eMin <= businessStartMin) continue;
        if (b.sMin >= businessEndMin) break;

        // if gap fits
        if (cursor + durMin <= b.sMin) break;
        // move cursor past this block
        cursor = Math.max(cursor, b.eMin);
        cursor = ceilToSlot(cursor, GRID_SLOT_MINUTES);
      }

      if (cursor + durMin <= businessEndMin) {
        const dt = new Date(startOfDay.getTime() + cursor * 60000);
        suggestions.push({
          techId: tech.id,
          techName: tech.name || 'Technician',
          date: baseDate,
          time: toTimeInputValue(dt),
          duration: durMin,
        });
      }
    }

    // Prefer available techs, then earliest time.
    const statusRank = (t: Technician) => {
      const s = String(t.status || '').toLowerCase();
      if (s === 'available') return 0;
      if (s.includes('route')) return 1;
      if (s.includes('site')) return 2;
      return 3;
    };
    const techById = new Map<string, Technician>(techs.map((t) => [t.id, t]));

    suggestions.sort((a, b) => {
      const ra = statusRank(techById.get(a.techId) as Technician);
      const rb = statusRank(techById.get(b.techId) as Technician);
      if (ra !== rb) return ra - rb;
      const ta = new Date(`${a.date}T${a.time}`).getTime();
      const tb = new Date(`${b.date}T${b.time}`).getTime();
      return ta - tb;
    });

    return suggestions.slice(0, 3);
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
      .then((json) => {
        const jobs = (json.jobs || []) as Job[];
        setUnassignedJobs(jobs);

        // Pre-fill scheduling controls from suggested schedule on the job.
        setScheduleSelection((prev) => {
          const next = { ...prev };
          for (const j of jobs) {
            if (!j.id) continue;
            if (next[j.id]?.date || next[j.id]?.time) continue;
            if (!j.scheduled_start) continue;
            const start = new Date(j.scheduled_start);
            if (Number.isNaN(start.getTime())) continue;

            let duration = j.estimated_minutes ? getDefaultDuration(j) : 60;
            if (j.scheduled_end) {
              const end = new Date(j.scheduled_end);
              const diff = (end.getTime() - start.getTime()) / 60000;
              if (Number.isFinite(diff) && diff > 0) duration = Math.round(diff);
            }

            next[j.id] = {
              date: toDateInputValue(start),
              time: toTimeInputValue(start),
              duration,
            };
          }
          return next;
        });

        // If a company only has one tech (or one available), preselect it for true 1-click booking.
        setAssignSelection((prev) => {
          const next = { ...prev };
          const preferred = techs.find((t) => String(t.status || '').toLowerCase() === 'available') || techs[0];
          if (!preferred) return next;
          for (const j of jobs) {
            if (!j.id) continue;
            if (next[j.id]) continue;
            next[j.id] = preferred.id;
          }
          return next;
        });
      })
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

  const bookJobWithSuggestion = async (jobId: string, sug: Suggestion) => {
    const startIso = toIso(sug.date, sug.time);
    if (!startIso || !sug.techId || !sug.duration) return;

    const startDt = new Date(startIso);
    const endDt = new Date(startDt.getTime() + sug.duration * 60000);
    const endIso = endDt.toISOString();

    // Optimistically reflect in the UI controls
    setAssignSelection((prev) => ({ ...prev, [jobId]: sug.techId }));
    setScheduleSelection((prev) => ({ ...prev, [jobId]: { date: sug.date, time: sug.time, duration: sug.duration } }));

    setAssignSaving(jobId);
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jobId,
          technician_id: sug.techId,
          scheduled_start: startIso,
          scheduled_end: endIso,
          status: 'Scheduled',
        }),
      });
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
    // Pull company scheduling hours (fallback 8–5)
    fetch('/api/settings')
      .then((r) => r.json())
      .then((json) => {
        const s = json?.settings || {};
        const startMin = typeof s.schedule_start_minute === 'number' ? s.schedule_start_minute : 480;
        const endMin = typeof s.schedule_end_minute === 'number' ? s.schedule_end_minute : 1020;
        setScheduleHours({ startMin, endMin });
      })
      .catch(() => {});
  }, []);

  // Deep-link: /dispatch?job=<id>
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const jobId = new URLSearchParams(window.location.search).get('job');
    if (jobId) openTicket(jobId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(t);
  }, []);

  // Auto-scroll Day View to around "now" (so you don’t land at midnight).
  useLayoutEffect(() => {
    if (viewMode !== 'day') return;
    const storageKey = `dispatch:autoScroll:${todayKey}`;
    const already = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : '1';
    if (already === '1') return;
    if (didAutoScrollRef.current) return;
    didAutoScrollRef.current = true;
    // Try a few times in case Safari hasn't fully laid out yet.
    jumpToNow();
    setTimeout(jumpToNow, 50);
    setTimeout(jumpToNow, 250);
    try { window.localStorage.setItem(storageKey, '1'); } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewMode]);

  // If the tech/job columns pop in after fetch, re-center once.
  useEffect(() => {
    if (viewMode !== 'day') return;
    if (!didAutoScrollRef.current) return;
    if (techs.length === 0) return;
    setTimeout(jumpToNow, 50);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [techs.length]);

  return (
    <div className="max-w-[1600px] mx-auto space-y-6 p-8 h-[calc(100vh-2rem)] flex flex-col">
      {/* Job Ticket Slide-over */}
      {ticketOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={closeTicket} />
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
              <button onClick={closeTicket} className="text-sm font-semibold text-gray-600 hover:text-gray-900">
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
                      <span className={`text-xs font-bold px-2 py-1 rounded border ${statusPill(ticket.status)}`}>{ticket.status || 'Lead'}</span>
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

                  {/* Messages / Notes */}
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-gray-500 uppercase">Messages</span>
                      {ticketMessagesLoading ? (
                        <span className="text-xs text-gray-400">Loading…</span>
                      ) : (
                        <span className="text-xs text-gray-400">{ticketMessages.length} items</span>
                      )}
                    </div>

                    {ticket.notes && ticketMessages.length === 0 ? (
                      <div className="mt-3">
                        <p className="text-[11px] text-gray-500 font-bold uppercase">Notes</p>
                        <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{ticket.notes}</p>
                      </div>
                    ) : null}

                    {ticketMessages.length === 0 ? (
                      <p className="text-sm text-gray-500 mt-3">No messages yet.</p>
                    ) : (
                      <div className="mt-3 space-y-2">
                        {ticketMessages.map((m) => (
                          <div key={m.id} className="border border-gray-200 rounded-lg p-2 bg-gray-50">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-gray-600 uppercase">{m.direction || 'inbound'} {m.channel ? `• ${m.channel}` : ''}</span>
                              <span className="text-[11px] text-gray-500">{m.created_at ? new Date(m.created_at).toLocaleString() : ''}</span>
                            </div>
                            <p className="text-sm text-gray-800 whitespace-pre-wrap mt-1">{m.body || ''}</p>
                          </div>
                        ))}
                      </div>
                    )}
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
          <button
            onClick={() => setSelectedDate((d) => new Date(d.getTime() - 24 * 60 * 60 * 1000))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Previous day"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <h2 className="text-lg font-semibold text-gray-900">
            {selectedDate.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </h2>
          <button
            onClick={() => setSelectedDate((d) => new Date(d.getTime() + 24 * 60 * 60 * 1000))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Next day"
          >
            <ChevronRight size={20} className="text-gray-600" />
          </button>
          <button
            onClick={() => {
              setSelectedDate(new Date());
              setTimeout(() => jumpToNow(), 0);
            }}
            className="ml-2 px-3 py-1.5 rounded-lg text-sm font-semibold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700"
          >
            Today
          </button>

          {viewMode === 'day' ? (
            <div className="ml-2 flex items-center gap-2">
              <button onClick={panLeft} className="px-2 py-1.5 rounded-lg text-sm font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700">◀</button>
              <button onClick={panRight} className="px-2 py-1.5 rounded-lg text-sm font-bold border border-gray-200 bg-white hover:bg-gray-50 text-gray-700">▶</button>
            </div>
          ) : null}
        </div>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button onClick={() => setViewMode('day')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'day' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Day View</button>
          <button onClick={() => setViewMode('map')} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${viewMode === 'map' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-900'}`}>Map View</button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0 overflow-hidden">
        {/* Left Sidebar: AI Parking Lot */}
        <div className="w-80 bg-gray-50 rounded-xl border border-gray-200 flex flex-col flex-shrink-0 min-h-0">
          <div className="p-4 border-b border-gray-200 bg-white rounded-t-xl flex justify-between items-center">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">AI Parking Lot</h3>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  // manual refresh
                  fetch("/api/technicians")
                    .then((r) => r.json())
                    .then((json) => {
                      setTechs(json.technicians || []);
                      setTechTableAvailable(json.tableAvailable !== false);
                    })
                    .catch(() => {});
                  loadJobs();
                }}
                className="text-[10px] font-bold text-gray-600 hover:text-gray-900 underline"
              >
                Refresh
              </button>
              <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">{unassignedJobs.length} Pending</span>
            </div>
          </div>
          <div className="p-4 flex-1 overflow-y-auto space-y-4">
            <p className="text-xs text-gray-500 mb-2">Jobs caught by AI needing manual assignment.</p>
            {unassignedJobs.length === 0 ? (
              <div className="text-center p-4 text-sm text-gray-500">No unassigned jobs.</div>
            ) : unassignedJobs.map(job => (
              <div key={job.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all">
                <div className="flex justify-between items-start mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${job.priority === 'high' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                    {job.priority || 'Normal'}
                  </span>
                  <button
                    onClick={() => openTicket(job.id)}
                    className="text-[10px] font-bold text-gray-600 hover:text-gray-900 underline"
                  >
                    View
                  </button>
                </div>
                <h4 className="font-semibold text-gray-900 text-sm">{job.title || 'Untitled Job'}</h4>
                <div className="mt-1 text-xs text-gray-600 flex items-center gap-2">
                  <User size={12} className="text-gray-400" />
                  <span className="truncate">{customerLabel(job)}</span>
                </div>
                {job.address && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                    <MapPin size={12} /> {job.address}
                  </div>
                )}

                {/* Quick book (assign + schedule) */}
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => {
                        const recs = recommendSlots(job);
                        setAiSuggestions((prev) => ({ ...prev, [job.id]: recs }));
                      }}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline"
                    >
                      AI Recommend Times (click to book)
                    </button>
                    {aiSuggestions[job.id]?.length ? (
                      <span className="text-[10px] font-bold text-gray-400">{aiSuggestions[job.id].length} suggestions</span>
                    ) : null}
                  </div>

                  {aiSuggestions[job.id]?.length ? (
                    <div className="flex flex-col gap-2">
                      {aiSuggestions[job.id].map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => bookJobWithSuggestion(job.id, sug)}
                          className="w-full text-left px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50"
                        >
                          <div className="text-xs font-bold text-gray-900">{sug.techName} • {sug.date} {sug.time}</div>
                          <div className="text-[11px] text-gray-500">{sug.duration} min</div>
                        </button>
                      ))}
                    </div>
                  ) : null}

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
        <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col relative min-h-0 min-w-0">
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
                    <GMap defaultCenter={center} defaultZoom={11} disableDefaultUI={true} gestureHandling={'greedy'}>
                      {techs
                        .map((t) => ({ tech: t, pos: getLatLng((t as any).last_location) }))
                        .filter((x) => x.pos)
                        .map(({ tech, pos }: any) => (
                          <Marker key={tech.id} position={pos} title={tech.name || 'Technician'} />
                        ))}
                    </GMap>
                  </div>
                </APIProvider>
              )}
            </div>
          ) : (
            <div
              ref={dayScrollRef}
              className="flex-1 overflow-x-scroll overflow-y-scroll relative"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', scrollbarGutter: 'stable both-edges', cursor: 'grab' as any }}
              onPointerDown={(e) => {
                // Click+drag to pan (helps trackpads/mice when horizontal scroll is finicky)
                const el = dayScrollRef.current;
                if (!el) return;
                // only left-click / primary touch
                if ((e as any).button !== undefined && (e as any).button !== 0) return;
                dragRef.current = {
                  active: true,
                  x: e.clientX,
                  y: e.clientY,
                  left: el.scrollLeft,
                  top: el.scrollTop,
                };
                (e.currentTarget as any).setPointerCapture?.(e.pointerId);
              }}
              onPointerMove={(e) => {
                const el = dayScrollRef.current;
                if (!el) return;
                if (!dragRef.current.active) return;
                const dx = e.clientX - dragRef.current.x;
                const dy = e.clientY - dragRef.current.y;
                el.scrollLeft = dragRef.current.left - dx;
                el.scrollTop = dragRef.current.top - dy;
              }}
              onPointerUp={() => { dragRef.current.active = false; }}
              onPointerCancel={() => { dragRef.current.active = false; }}
            >
              {/* Sticky header row (single, reliable) */}
              <div className="sticky top-0 z-40 bg-white border-b border-gray-200 flex">
                <div className="bg-gray-50 border-r border-gray-200" style={{ width: GUTTER_W, height: GRID_HEADER_PX }} />
                <div className="flex min-w-max">
                  {techs.map((tech) => (
                    <div key={tech.id} className="w-[300px] border-r border-gray-200 bg-white p-3 flex items-center" style={{ height: GRID_HEADER_PX }}>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center relative flex-shrink-0">
                          <User size={18} className="text-blue-600" />
                          <div className={`absolute -bottom-1 -right-1 h-3 w-3 border-2 border-white rounded-full ${String(tech.status || '').toLowerCase() === 'available' ? 'bg-green-500' : String(tech.status || '').toLowerCase().includes('route') ? 'bg-blue-500' : String(tech.status || '').toLowerCase().includes('site') ? 'bg-purple-500' : 'bg-gray-400'}`}></div>
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-bold text-gray-900 leading-tight truncate">{tech.name}</h4>
                          <p className="text-xs text-gray-500 capitalize truncate">{tech.status}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Body */}
              <div className="flex min-w-max relative" style={{ paddingTop: 0 }}>
                {/* Time gutter */}
                <div className="border-r border-gray-200 bg-gray-50 flex flex-col sticky left-0 z-30" style={{ width: GUTTER_W }}>
                  {slots.map((i) => {
                    const h24 = GRID_START_HOUR + Math.floor(i / 2);
                    const isHalf = i % 2 === 1;
                    return (
                      <div
                        key={i}
                        className="border-b border-gray-200 pr-3 flex items-start justify-end"
                        style={{ height: GRID_SLOT_PX }}
                      >
                        <span
                          className={`whitespace-nowrap leading-tight mt-1 ${
                            isHalf
                              ? 'text-[11px] text-gray-500 font-medium'
                              : 'text-[12px] text-gray-900 font-bold'
                          }`}
                        >
                          {isHalf ? halfHourLabel(h24) : hourLabel(h24)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Columns */}
                <div className="flex-1 flex min-w-max relative bg-gray-50/30">
                  {timeLineTop !== null && (
                    <div className="absolute left-0 right-0 z-10" style={{ top: `${timeLineTop}px` }}>
                      <div className="h-0.5 bg-red-500 w-full" />
                      <div className="absolute -top-2 left-0 flex items-center">
                        <div className="h-2 w-2 rounded-full bg-red-500 -ml-1"></div>
                        <span className="ml-2 text-[10px] font-bold text-red-600 bg-white/90 border border-red-200 px-2 py-0.5 rounded">
                          {fmtTime(now, DISPLAY_TZ)}
                        </span>
                      </div>
                    </div>
                  )}

                  {techs.length === 0 ? (
                    <div className="p-8 text-gray-500 text-sm">No technicians found. Add some in the database.</div>
                  ) : techs.map((tech) => {
                    // Only render jobs scheduled for the selected day in DISPLAY_TZ.
                    const day = selectedDate;

                    const jobsForTech = assignedJobs.filter((j) => {
                      if (j.technician_id !== tech.id) return false;
                      if (!j.scheduled_start) return false;
                      const start = new Date(j.scheduled_start);
                      if (Number.isNaN(start.getTime())) return false;
                      return isSameTzDay(start, day, DISPLAY_TZ);
                    });

                    return (
                      <div key={tech.id} className="w-[300px] border-r border-gray-200 relative">
                        <div className="relative" style={{ height: GRID_TOTAL_PX }}>
                          {[...Array(GRID_HOURS * 2)].map((_, i) => (
                            <div
                              key={i}
                              className={`w-full absolute ${i % 2 === 0 ? 'border-b border-gray-100' : 'border-b border-gray-50'}`}
                              style={{ top: `${i * GRID_SLOT_PX}px`, height: GRID_SLOT_PX }}
                            />
                          ))}

                          {jobsForTech.map((job, idx) => (
                            <div
                              key={job.id}
                              onClick={() => openTicket(job.id)}
                              className="absolute left-2 right-2 bg-blue-50 border border-blue-200 rounded-lg p-3 shadow-sm flex flex-col z-10 cursor-pointer hover:shadow-md"
                              style={jobStyleForGrid(job, idx)}
                            >
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase border ${statusPill(job.status)}`}>{job.status || 'Scheduled'}</span>
                                {job.scheduled_start && (
                                  <span className="text-[10px] font-bold text-gray-600 bg-white/70 px-2 py-0.5 rounded border border-gray-200">
                                    {new Date(job.scheduled_start).toLocaleTimeString([], { timeZone: DISPLAY_TZ, hour: 'numeric', minute: '2-digit' })}
                                  </span>
                                )}
                              </div>
                          <p className="text-sm font-bold text-gray-900 line-clamp-1">{job.title || 'Untitled Job'}</p>
                          <p className="text-xs text-gray-700 mt-1 flex items-center gap-1 line-clamp-1"><User size={12}/> {customerLabel(job)}</p>
                          <p className="text-xs text-gray-600 mt-1 flex items-center gap-1 line-clamp-1"><MapPin size={12}/> {job.address || 'No address'}</p>
                        </div>
                      ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
