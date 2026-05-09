"use client";

import { Kanban, List, MapPin, Phone, X, Clock, Zap, FileText, ChevronRight, User } from "lucide-react";
import { useState, useEffect } from "react";

type Lead = {
  id: string;
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

function UrgencyBadge({ urgency }: { urgency: string }) {
  const u = (urgency || "low").toLowerCase();
  if (u === "high") return <span className="text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">🚨 Emergency</span>;
  if (u === "medium") return <span className="text-xs font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded">📋 Estimate</span>;
  return <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">📞 Standard</span>;
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
              <UrgencyBadge urgency={lead.urgency} />
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
        <div className="p-4 border-t border-gray-200 bg-gray-50 flex gap-3">
          <a
            href={`tel:${lead.phone}`}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2.5 rounded-lg text-center transition-colors flex items-center justify-center gap-2"
          >
            <Phone size={16} /> Call Back
          </a>
          <button className="flex-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-sm font-medium py-2.5 rounded-lg transition-colors">
            Schedule Job
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main CRM Page ─────────────────────────────────────────────────────────
export default function CRM() {
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Lead | null>(null);

  useEffect(() => {
    fetch("/api/call-logs?limit=50")
      .then((r) => r.json())
      .then((json) => {
        const mapped: Lead[] = (json.calls || []).map((c: any) => {
          const norm = extractNormalized(c.meta);

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

          return {
            id: c.id,
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
        setLeads(mapped);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const captured = leads.filter((l) => l.status === "captured");
  const estimating = leads.filter((l) => l.status === "estimating");
  const scheduled = leads.filter((l) => l.status === "scheduled");

  const LeadCard = ({ lead }: { lead: Lead }) => (
    <div
      onClick={() => setSelected(lead)}
      className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:border-blue-400 hover:shadow-md transition-all group"
    >
      <div className="flex justify-between items-start mb-2">
        <UrgencyBadge urgency={lead.urgency} />
        <span className="text-xs text-gray-400">{lead.time_ago}</span>
      </div>
      <h4 className="font-semibold text-gray-900 mt-2 group-hover:text-blue-700 transition-colors">{lead.job_type}</h4>
      <p className="text-sm text-gray-500 mt-0.5">{lead.caller_name}</p>
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

      <div className="max-w-7xl mx-auto p-8 flex flex-col h-screen">
        <div className="flex justify-between items-end mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Leads &amp; CRM</h1>
            <p className="text-gray-500 mt-2">AI-captured leads from every inbound call, auto-sorted by urgency.</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-gray-100 p-1 rounded-lg flex items-center">
              <button
                onClick={() => setViewMode("board")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === "board" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              >
                <Kanban size={16} /> Board
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`px-4 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-gray-900" : "text-gray-500 hover:text-gray-900"}`}
              >
                <List size={16} /> List
              </button>
            </div>
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              + New Lead
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex-1 flex items-center justify-center text-gray-500">Loading leads...</div>
        ) : viewMode === "board" ? (
          <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
            <Column title="AI Captured" color="bg-blue-500" items={captured} />
            <Column title="Estimating" color="bg-yellow-500" items={estimating} />
            <Column title="Scheduled" color="bg-green-500" items={scheduled} />
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
                  <div><UrgencyBadge urgency={lead.urgency} /></div>
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
