"use client";

import { Kanban, List, MapPin, Phone, X, Clock, Zap, FileText, ChevronRight, User, ExternalLink, Users, Search, Tag } from "lucide-react";
import { useRef, useCallback, useEffect as useEffectPanel } from "react";
import Link from "next/link";
import { useState, useEffect } from "react";

type Lead = {
  id: string;
  customer_id: string;
  job_id?: string;
  scheduled_start?: string | null;
  caller_name: string;
  phone: string;
  address: string;
  job_type: string;
  job_details: string;
  urgency: string;
  summary: string;
  action_items: string;
  transcript: any;
  recording_url: string;
  status: string;
  time_ago: string;
  created_at: string;
  isWeb?: boolean;
};

type JobLite = {
  id: string;
  status?: string;
  scheduled_start?: string | null;
};

function formatPhone(phone: string) {
  const d = phone.replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return phone;
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function fmtDate(iso?: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
}

function UrgencyBadge({ urgency, isWeb }: { urgency: string, isWeb?: boolean }) {
  const u = (urgency || "low").toLowerCase();
  const icon = isWeb ? "🌐" : "📞";
  if (u === "high") return <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">🚨 Emergency</span>;
  if (u === "medium") return <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">📋 Estimate</span>;
  return <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">{icon} Standard</span>;
}

function extractAddressFromSummary(summary: string): string | null {
  if (!summary) return null;
  // Match "at [number] [street...], [city], [state]" patterns
  const match = summary.match(
    /\bat\s+(\d+\s+[^.]+?(?:Street|St|Drive|Dr|Avenue|Ave|Boulevard|Blvd|Road|Rd|Lane|Ln|Way|Court|Ct|Place|Pl)[^,]*(?:,\s*[^,\n]+)?(?:,\s*(?:Minnesota|MN|Wisconsin|WI|Iowa|IA))?)/i
  );
  return match ? match[1].trim().replace(/[,.]$/, "") : null;
}

function extractNormalized(meta: any) {
  const structured = meta?.structured || {};
  const out: Record<string, any> = {};
  // UUID-keyed objects first
  Object.values(structured).forEach((item: any) => {
    if (item?.name && item?.result !== undefined && item.result !== "") out[item.name] = item.result;
  });
  // Flat keys (non-null) override
  const flatKeys = ["caller_name", "address", "job_type", "job_details", "urgency"];
  flatKeys.forEach((k) => {
    if (structured[k] !== null && structured[k] !== undefined && structured[k] !== "") out[k] = structured[k];
  });
  return out;
}

function normalizeTranscript(t: any): { speaker: string; text: string }[] {
  if (!t) return [];
  if (Array.isArray(t)) return t.map((l: any) => ({ speaker: l.speaker || l.role || "?", text: l.text || l.message || "" }));
  if (typeof t === "string") {
    return t.split("\n").filter(Boolean).map((line) => {
      const idx = line.indexOf(":");
      if (idx > 0) return { speaker: line.slice(0, idx).trim(), text: line.slice(idx + 1).trim() };
      return { speaker: "?", text: line };
    });
  }
  return [];
}

// ─── Detail Slide-Over Panel ─────────────────────────────────────────────────
function LeadDetail({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const transcript = normalizeTranscript(lead.transcript);

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <UrgencyBadge urgency={lead.urgency} isWeb={lead.isWeb} />
              <span className="text-xs text-gray-500">{fmtDate(lead.created_at)}</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{lead.caller_name}</h2>
            {lead.phone && (
              <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-1">
                <Phone size={14} /> {formatPhone(lead.phone)}
              </a>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {/* Job Info */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm uppercase tracking-wider">
              <Zap size={14} /> Job Details
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Job Type</p>
                <p className="font-medium text-gray-900">{lead.job_type || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Status</p>
                <p className="font-medium text-gray-900 capitalize">{lead.status}</p>
              </div>
            </div>
            {lead.job_details && (
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Details</p>
                <p className="text-sm text-gray-800 leading-relaxed">{lead.job_details}</p>
              </div>
            )}
          </div>

          {/* Address */}
          {lead.address && lead.address !== "Address unknown" && (
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Service Address</p>
                <p className="text-sm font-medium text-gray-900">{lead.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(lead.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                >
                  Open in Maps <ChevronRight size={12} />
                </a>
              </div>
            </div>
          )}

          {/* AI Summary */}
          {lead.summary && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <FileText size={14} /> AI Summary
              </div>
              <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4 border border-gray-200">
                {lead.summary}
              </p>
            </div>
          )}

          {/* Action Items */}
          {lead.action_items && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <Clock size={14} /> Action Items
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-900">
                {lead.action_items}
              </div>
            </div>
          )}

          {/* Transcript */}
          {transcript.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <User size={14} /> Transcript
              </div>
              <div className="space-y-2 max-h-64 overflow-y-auto bg-gray-50 rounded-xl border border-gray-200 p-4">
                {transcript.map((line, i) => (
                  <div key={i} className={`text-sm ${line.speaker?.toLowerCase() === "ai" || line.speaker?.toLowerCase() === "bot" ? "text-blue-800" : "text-gray-800"}`}>
                    <span className="font-semibold mr-1">{line.speaker}:</span>
                    {line.text}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex flex-col gap-3">
          <div className="flex gap-3">
            <a
              href={`tel:${lead.phone}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={16} /> Call Back
            </a>
            {lead.customer_id && (
              <Link
                href={`/projects/customer-profile?id=${lead.customer_id}`}
                className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <User size={16} /> Profile
              </Link>
            )}
          </div>
          <Link
            href={`/portal/${lead.job_id || lead.id.slice(0,6).toUpperCase()}`}
            target="_blank"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <ExternalLink size={16} /> Open Customer Magic Portal
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── GHL Contact Detail Panel ───────────────────────────────────────────────
const STAGE_COLOR: Record<string, string> = {
  "New Lead": "bg-blue-50 text-blue-700 border-blue-200",
  "Contacted": "bg-yellow-50 text-yellow-700 border-yellow-200",
  "Declined Appointment": "bg-red-50 text-red-700 border-red-200",
  "Appointment Set": "bg-purple-50 text-purple-700 border-purple-200",
  "Demo Ran": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "Limbo": "bg-gray-50 text-gray-600 border-gray-200",
  "Closed": "bg-green-50 text-green-700 border-green-200",
  "Declined Offer": "bg-orange-50 text-orange-700 border-orange-200",
  "Installed": "bg-emerald-50 text-emerald-700 border-emerald-200",
};

function GhlContactDetail({ contact, onClose }: { contact: any; onClose: () => void }) {
  const [full, setFull] = useState<any | null>(null);
  const [detailLoading, setDetailLoading] = useState(true);

  useEffectPanel(() => {
    setDetailLoading(true);
    fetch(`/api/ghl/contact/${contact.id}`)
      .then(r => r.json())
      .then(json => setFull(json.contact || null))
      .catch(console.error)
      .finally(() => setDetailLoading(false));
  }, [contact.id]);

  const c = full || contact;
  const ghlUrl = `https://app.gohighlevel.com/location/${process.env.NEXT_PUBLIC_GHL_LOCATION_ID || "sQBA4sP42sWkqxf1pZsY"}/contacts/detail/${contact.id}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* panel */}
      <div className="relative z-10 w-full max-w-lg bg-white shadow-2xl flex flex-col h-full overflow-hidden animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-indigo-200 bg-indigo-50 text-indigo-700">GHL Contact</span>
              {!detailLoading && c.pipelineStage && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STAGE_COLOR[c.pipelineStage] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {c.pipelineStage}
                </span>
              )}
              {c.dateAdded && <span className="text-xs text-gray-500">Added {new Date(c.dateAdded).toLocaleDateString()}</span>}
            </div>
            <h2 className="text-xl font-bold text-gray-900 mt-2">{c.name}</h2>
            {c.phone && (
              <a href={`tel:${c.phone}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-1">
                <Phone size={14} /> {c.phone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-sm text-blue-600 hover:underline mt-0.5">
                <ExternalLink size={14} /> {c.email}
              </a>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a href={ghlUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1 border border-indigo-200 bg-indigo-50 px-2 py-1 rounded-lg">
              GHL <ExternalLink size={11} />
            </a>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-200 transition-colors text-gray-500">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">

          {detailLoading && (
            <div className="text-center text-gray-400 text-sm py-4">Loading full profile...</div>
          )}

          {/* Pipeline Stage Card */}
          {!detailLoading && c.pipelineStage && (
            <div className={`rounded-xl p-4 border flex items-center justify-between ${STAGE_COLOR[c.pipelineStage] || "bg-gray-50 border-gray-200"}`}>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider opacity-70">Pipeline Stage</p>
                <p className="text-base font-bold mt-0.5">{c.pipelineStage}</p>
                {c.opportunityCount > 0 && <p className="text-xs opacity-70 mt-0.5">{c.opportunityCount} opportunit{c.opportunityCount === 1 ? "y" : "ies"}</p>}
              </div>
              {c.opportunityValue > 0 && (
                <p className="text-lg font-bold">${c.opportunityValue.toLocaleString()}</p>
              )}
            </div>
          )}

          {/* Address */}
          {c.address && (
            <div className="flex items-start gap-3 bg-gray-50 rounded-xl p-4 border border-gray-200">
              <MapPin size={18} className="text-gray-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Address</p>
                <p className="text-sm font-medium text-gray-900">{c.address}</p>
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(c.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:underline mt-1 inline-flex items-center gap-1"
                >
                  Open in Maps <ChevronRight size={12} />
                </a>
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm uppercase tracking-wider">
              <User size={14} /> Contact Info
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Type</p>
                <p className="font-medium text-gray-900 capitalize">{c.type || "—"}</p>
              </div>
              <div>
                <p className="text-gray-500 text-xs mb-0.5">Source</p>
                <p className="font-medium text-gray-900">{c.source || "—"}</p>
              </div>
              {c.city && <div><p className="text-gray-500 text-xs mb-0.5">City</p><p className="font-medium text-gray-900">{c.city}</p></div>}
              {c.state && <div><p className="text-gray-500 text-xs mb-0.5">State</p><p className="font-medium text-gray-900">{c.state}</p></div>}
              {c.zip && <div><p className="text-gray-500 text-xs mb-0.5">Zip</p><p className="font-medium text-gray-900">{c.zip}</p></div>}
              {c.dateUpdated && <div><p className="text-gray-500 text-xs mb-0.5">Last Updated</p><p className="font-medium text-gray-900">{new Date(c.dateUpdated).toLocaleDateString()}</p></div>}
            </div>
          </div>

          {/* Tags */}
          {c.tags?.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-gray-700 font-semibold text-sm">
                <Tag size={14} /> Tags
              </div>
              <div className="flex flex-wrap gap-2">
                {c.tags.map((t: string) => (
                  <span key={t} className="text-xs px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">{t}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          {c.phone && (
            <a
              href={`tel:${c.phone}`}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
            >
              <Phone size={16} /> Call
            </a>
          )}
          <a
            href={ghlUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <ExternalLink size={16} /> Open in GHL
          </a>
          <Link
            href={`/jobs?ghl_contact=${contact.id}&name=${encodeURIComponent(c.name)}&phone=${encodeURIComponent(c.phone || '')}&address=${encodeURIComponent(c.address || '')}`}
            className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <FileText size={16} /> Create Job
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main CRM Page ─────────────────────────────────────────────────────────
export default function CRM() {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [activeTab, setActiveTab] = useState<"calls" | "ghl">("calls");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);
  const [selectedGhl, setSelectedGhl] = useState<any | null>(null);

  // GHL state
  const [ghlContacts, setGhlContacts] = useState<any[]>([]);
  const [ghlTotal, setGhlTotal] = useState(0);
  const [ghlLoading, setGhlLoading] = useState(false);
  const [ghlQuery, setGhlQuery] = useState("");
  const [ghlPage, setGhlPage] = useState<{ startAfter: string; startAfterId: string } | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchGhl = useCallback((query = "", pagination: { startAfter: string; startAfterId: string } | null = null) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setGhlLoading(true);
    const params = new URLSearchParams({ limit: "20", ...(query ? { query } : {}), ...(pagination?.startAfter ? { startAfter: pagination.startAfter, startAfterId: pagination.startAfterId } : {}) });
    fetch(`/api/ghl/contacts?${params}`, { signal: controller.signal })
      .then(r => r.json())
      .then(json => {
        if (pagination) {
          setGhlContacts(prev => [...prev, ...(json.contacts || [])]);
        } else {
          setGhlContacts(json.contacts || []);
        }
        setGhlTotal(json.total || 0);
        setGhlPage(json.startAfterId ? { startAfter: String(json.startAfter), startAfterId: json.startAfterId } : null);
      })
      .catch(err => { if (err.name !== "AbortError") console.error(err); })
      .finally(() => setGhlLoading(false));
  }, []);

  const debouncedSearch = useCallback((value: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setGhlContacts([]);
      fetchGhl(value);
    }, 350);
  }, [fetchGhl]);

  useEffect(() => {
    if (activeTab === "ghl" && ghlContacts.length === 0) fetchGhl();
  }, [activeTab]);

  useEffect(() => {
    Promise.all([
      fetch("/api/call-logs?limit=50", { cache: "no-store" }).then(r => r.json()),
      fetch("/api/jobs?limit=100", { cache: "no-store" }).then(r => r.json())
    ])
      .then(([callsJson, jobsJson]) => {
        const calls = callsJson.calls || [];
        const jobs = (jobsJson.jobs || []) as any[];
        
        // Find jobs that have a call log linked
        const callJobIds = new Set<string>();
        
        const callLeads: Lead[] = calls.map((c: any) => {
          const norm = extractNormalized(c.meta);
          if (norm.job_id) callJobIds.add(norm.job_id);

          const phone = c.customers?.phone_number || "";
          const customerName = c.customers?.first_name && c.customers.first_name !== "New"
            ? `${c.customers.first_name} ${c.customers.last_name || ""}`.trim() : "";
          const callerName = norm.caller_name || customerName || (phone ? formatPhone(phone) : "Unknown Caller");

          const address =
            norm.address ||
            c.customers?.address ||
            extractAddressFromSummary(c.summary || "") ||
            "Address unknown";

          let jobType = norm.job_type || "";
          if (!jobType || jobType.toLowerCase() === "electrical") {
            const details = norm.job_details || "";
            if (details) {
              jobType = details.replace(/^The caller (is |wants |requested? |need[s]? )*/i, "")
                .split(/[,.]/)[0].slice(0, 50).trim();
            } else {
              jobType = c.urgency_flag === "high" ? "Emergency" : "Service Call";
            }
          }

          const urgency = c.urgency_flag || "low";
          const status = urgency === "medium" ? "estimating" : "captured";

          const jobId = norm.job_id || null;

          return {
            id: c.id,
            customer_id: c.customer_id || "",
            job_id: jobId || undefined,
            scheduled_start: null,
            caller_name: callerName,
            phone,
            address,
            job_type: jobType,
            job_details: norm.job_details || "",
            urgency,
            summary: c.summary || "",
            action_items: c.action_items || "",
            transcript: c.transcript || null,
            recording_url: c.recording_url || "",
            status,
            time_ago: timeAgo(c.created_at),
            created_at: c.created_at,
          };
        });

        // Pull linked jobs so we can show real Scheduled status/time.
        const jobIds = Array.from(new Set(callLeads.map((l) => l.job_id).filter(Boolean) as string[]));

        // Map the calls with job data
        const jobMap = new Map(jobs.map((x) => [x.id, x]));
        const mergedCalls = callLeads.map((l) => {
          const job = l.job_id ? jobMap.get(l.job_id) : null;
          const scheduledStart = job?.scheduled_start || null;
          const jobStatus = String(job?.status || '').toLowerCase();
          const isScheduled = Boolean(scheduledStart) || jobStatus === 'scheduled';
          return {
            ...l,
            scheduled_start: scheduledStart,
            status: isScheduled ? 'scheduled' : l.status,
          };
        });

        // Now find jobs that ARE NOT linked to a call log (like Web/SMS leads)
        // and map them into the board
        const webLeads: Lead[] = jobs
          .filter((j) => !callJobIds.has(j.id))
          .filter((j) => j.status?.toLowerCase() === 'lead' || j.status?.toLowerCase() === 'estimating' || j.status?.toLowerCase() === 'scheduled')
          .map((job) => {
            const customerName = job.customers?.first_name && job.customers.first_name !== "New"
              ? `${job.customers.first_name} ${job.customers.last_name || ""}`.trim() : "";
            const phone = job.customers?.phone_number || "";
            const isScheduled = Boolean(job.scheduled_start) || job.status?.toLowerCase() === 'scheduled';
            
            // Mark it as a web/sms lead for the UI
            const isWeb = true;

            return {
              id: job.id,
              customer_id: job.customer_id || "",
              job_id: job.id,
              scheduled_start: job.scheduled_start || null,
              caller_name: customerName || (phone ? formatPhone(phone) : "Web/SMS Lead"),
              phone,
              address: job.address || "Address unknown",
              job_type: job.title || "Job Request",
              job_details: job.notes || "",
              urgency: job.priority || "low",
              summary: job.notes || "",
              action_items: "",
              transcript: null,
              recording_url: "",
              status: isScheduled ? "scheduled" : (job.status?.toLowerCase() === "estimating" ? "estimating" : "captured"),
              time_ago: timeAgo(job.created_at),
              created_at: job.created_at,
              isWeb,
            };
          });

        const allLeads = [...mergedCalls, ...webLeads].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        console.log("Merged Calls:", mergedCalls.length, "Web Leads:", webLeads.length, "All Leads:", allLeads.length);
        setLeads(allLeads);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const captured = leads.filter((l) => l.status === "captured" || !l.status);
  const estimating = leads.filter((l) => l.status === "estimating");
  const quote_sent = leads.filter((l) => l.status === "quote_sent");
  const follow_up = leads.filter((l) => l.status === "follow_up");
  const scheduled = leads.filter((l) => l.status === "scheduled" || l.status === "won");

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div
      onClick={() => setSelected(lead)}
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <UrgencyBadge urgency={lead.urgency} isWeb={lead.isWeb} />
        <span className="text-xs text-gray-400">{lead.time_ago}</span>
      </div>
      <h4 className="font-semibold text-gray-900 mt-2 group-hover:text-blue-700 transition-colors">{lead.job_type}</h4>
      <p className="text-sm text-gray-500 mt-0.5">{lead.caller_name}</p>
      {lead.scheduled_start && (
        <p className="text-xs font-semibold text-green-700 mt-1">
          Scheduled: {fmtDate(lead.scheduled_start)}
        </p>
      )}
      {lead.summary && (
        <p className="text-xs text-gray-400 mt-2 leading-snug" style={{display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical", overflow:"hidden"}}>
          {lead.summary}
        </p>
      )}
      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin size={11} />
          <span className="truncate">{lead.address}</span>
        </div>
        <ChevronRight size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-blue-500" />
      </div>
    </div>
  );

  const Column = ({ title, color, items }: { title: string; color: string; items: Lead[] }) => (
    <div className="flex-1 min-w-72 flex flex-col bg-gray-50 rounded-xl border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex items-center gap-2 bg-white rounded-t-xl">
        <span className={`h-2 w-2 rounded-full ${color}`}></span>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <span className="ml-auto text-xs font-bold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{items.length}</span>
      </div>
      <div className="p-4 space-y-4 overflow-y-auto flex-1">
        {items.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-8">Empty</p>
        ) : (
          items.map((l) => <LeadCard key={l.id} lead={l} />)
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Detail Panel */}
      {selected && <LeadDetail lead={selected} onClose={() => setSelected(null)} />}
      {selectedGhl && <GhlContactDetail contact={selectedGhl} onClose={() => setSelectedGhl(null)} />}

      <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-screen">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leads &amp; CRM</h1>
            <p className="text-gray-500 mt-2">AI-captured leads from every inbound call, auto-sorted by urgency.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {/* Tab switcher */}
            <div className="bg-gray-100 p-1 rounded-lg flex items-center">
              <button onClick={() => setActiveTab("calls")} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === "calls" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>
                <Phone size={16} /> AI Calls
              </button>
              <button onClick={() => setActiveTab("ghl")} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${activeTab === "ghl" ? "bg-white shadow-sm text-indigo-700" : "text-gray-500 hover:text-gray-900"}`}>
                <Users size={16} /> GHL Contacts {ghlTotal > 0 && <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full font-bold">{ghlTotal.toLocaleString()}</span>}
              </button>
            </div>
            {activeTab === "calls" && (
              <div className="bg-gray-100 p-1 rounded-lg flex items-center">
                <button onClick={() => setViewMode("board")} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === "board" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>
                  <Kanban size={16} /> Board
                </button>
                <button onClick={() => setViewMode("list")} className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}>
                  <List size={16} /> List
                </button>
              </div>
            )}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">+ New Lead</button>
          </div>
        </div>

        {activeTab === "ghl" ? (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* GHL Search */}
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search contacts by name, email, or phone..."
                  value={ghlQuery}
                  onChange={e => {
                    setGhlQuery(e.target.value);
                    debouncedSearch(e.target.value);
                  }}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
              <span className="text-xs text-gray-400 font-medium whitespace-nowrap">{ghlTotal.toLocaleString()} total contacts</span>
            </div>
            {/* GHL Contact List */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <div className="col-span-2">Contact</div>
                <div>Location</div>
                <div>Tags / Source</div>
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
                {ghlLoading && ghlContacts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">Loading GHL contacts...</div>
                ) : ghlContacts.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm">No contacts found.</div>
                ) : (
                  ghlContacts.map((c: any) => (
                    <div key={c.id} onClick={() => setSelectedGhl(c)} className="grid grid-cols-4 gap-4 p-4 items-center hover:bg-indigo-50 transition-colors cursor-pointer">
                      <div className="col-span-2 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                          <span className="text-indigo-700 font-bold text-sm">{c.name?.charAt(0)?.toUpperCase() || "?"}</span>
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                          <p className="text-xs text-gray-500">{c.phone || c.email || "—"}</p>
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 truncate">{c.city && c.state ? `${c.city}, ${c.state}` : c.address || "—"}</div>
                      <div className="flex flex-wrap gap-1">
                        {c.tags?.slice(0, 2).map((t: string) => (
                          <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center gap-1">
                            <Tag size={9} />{t}
                          </span>
                        ))}
                        {!c.tags?.length && c.source && <span className="text-[10px] text-gray-400">{c.source}</span>}
                      </div>
                    </div>
                  ))
                )}
                {ghlPage && !ghlLoading && (
                  <div className="p-4 text-center">
                    <button onClick={() => fetchGhl(ghlQuery, ghlPage)} className="text-sm text-indigo-600 font-medium hover:underline">Load more</button>
                  </div>
                )}
                {ghlLoading && ghlContacts.length > 0 && (
                  <div className="p-4 text-center text-gray-400 text-sm">Loading...</div>
                )}
              </div>
            </div>
          </div>
        ) : loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">Loading leads...</div>
        ) : viewMode === "board" ? (
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
            <Column title="New Lead" color="bg-blue-500" items={captured} />
            <Column title="Quote Sent" color="bg-purple-500" items={quote_sent} />
            <Column title="Follow-Up Needed" color="bg-orange-500" items={follow_up} />
            <Column title="Won / Scheduled" color="bg-green-500" items={scheduled} />
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-hidden flex flex-col">
            <div className="grid grid-cols-5 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <div className="col-span-2">Customer</div>
              <div>Urgency</div>
              <div>Job Type / Address</div>
              <div className="text-right">Time</div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
              {leads.map((lead) => (
                <div
                  key={lead.id}
                  onClick={() => setSelected(lead)}
                  className="grid grid-cols-5 gap-4 p-4 items-center hover:bg-blue-50 cursor-pointer transition-colors group"
                >
                  <div className="col-span-2">
                    <h4 className="text-sm font-bold text-gray-900 group-hover:text-blue-700">{lead.caller_name}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone size={12} /> {formatPhone(lead.phone) || "—"}
                    </p>
                  </div>
                  <div><UrgencyBadge urgency={lead.urgency} isWeb={lead.isWeb} /></div>
                  <div>
                    <p className="text-sm text-gray-900">{lead.job_type}</p>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{lead.address}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500 flex items-center justify-end gap-1">
                    {lead.time_ago}
                    <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 text-blue-500 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
