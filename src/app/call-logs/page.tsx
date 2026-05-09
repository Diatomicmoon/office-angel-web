"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Filter, Phone, AlertTriangle, CheckCircle2, Play, Pause, FastForward, RotateCcw, User, MapPin, Briefcase, Calendar, FileText } from "lucide-react";

type TranscriptLine = { speaker?: string; text?: string };
type Call = {
  id: string;
  call_status?: string;
  duration_seconds?: number;
  transcript?: any;
  summary?: string;
  urgency_flag?: "high" | "medium" | "low" | string;
  action_items?: string;
  created_at?: string;
  recording_url?: string;
  meta?: any;
  customers?: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
  };
};

function timeAgo(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso).getTime();
  const diff = Date.now() - d;
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} mins ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs} hrs ago`;
  const days = Math.round(hrs / 24);
  return `${days} days ago`;
}

function fmtDuration(sec?: number) {
  if (!sec && sec !== 0) return "";
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}m ${s}s`;
}

function normalizeTranscript(t: any): TranscriptLine[] {
  if (!t) return [];
  if (Array.isArray(t)) return t;
  if (typeof t === "string") {
    // Handle "AI: ...\nUser: ..." string format from Vapi
    if (t.includes("\n") || t.includes("AI:") || t.includes("User:")) {
      return t.split("\n").filter(Boolean).map((line) => {
        const colonIdx = line.indexOf(":");
        if (colonIdx > 0) {
          return { speaker: line.slice(0, colonIdx).trim(), text: line.slice(colonIdx + 1).trim() };
        }
        return { speaker: "Unknown", text: line.trim() };
      });
    }
    try {
      const parsed = JSON.parse(t);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function CallLogs() {
  const [calls, setCalls] = useState<Call[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/call-logs?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((json) => {
        const next = (json.calls || []) as Call[];
        setCalls(next);
        setSelectedId((prev) => prev || next?.[0]?.id || null);
        setLoading(false);
      })
      .catch(() => {
        setCalls([]);
        setSelectedId(null);
        setLoading(false);
      });
  }, [q]);

  const selectedCall = useMemo(() => calls.find((c) => c.id === selectedId) || calls[0], [calls, selectedId]);
  const transcript = useMemo(() => normalizeTranscript(selectedCall?.transcript), [selectedCall]);

  // Normalize structured outputs (Vapi sends UUID-keyed objects)
  const normalizedStructured = useMemo(() => {
    const raw = selectedCall?.meta?.structured;
    if (!raw) return {};
    const out: Record<string, any> = {};
    Object.values(raw).forEach((item: any) => {
      if (item?.name && item?.result !== undefined && item.result !== '') out[item.name] = item.result;
    });
    // Also include already-flat keys
    Object.entries(raw).forEach(([k, v]: any) => {
      if (typeof v !== 'object' && v) out[k] = v;
    });
    return out;
  }, [selectedCall]);

  // Extract address from summary text as fallback
  const extractedAddress = useMemo(() => {
    if (normalizedStructured?.address) return normalizedStructured.address;
    if (selectedCall?.customers?.address) return selectedCall.customers.address;
    // Parse from summary
    const s = selectedCall?.summary || '';
    const match = s.match(/(?:at|located at|address[:\s]+)([\d]+[^,.]+(?:Drive|Dr|Street|St|Ave|Avenue|Blvd|Road|Rd|Lane|Ln|Way|Court|Ct|Place|Pl)[^,.]*(?:,\s*[^,.]+)?)/i);
    return match ? match[1].trim() : null;
  }, [selectedCall]);

  const extractedJobType = useMemo(() => {
    if (normalizedStructured?.job_type) return normalizedStructured.job_type;
    if (selectedCall?.urgency_flag === 'high') return 'Emergency';
    return 'Standard';
  }, [selectedCall, normalizedStructured]);

  const callerName = useMemo(() => {
    if (normalizedStructured?.caller_name) return normalizedStructured.caller_name;
    const c = selectedCall?.customers;
    if (c?.first_name && c.first_name !== 'New') return `${c.first_name} ${c.last_name || ''}`.trim();
    return null;
  }, [selectedCall, normalizedStructured]);

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Call Logs & Transcripts</h1>
          <p className="text-gray-500 mt-2">Review AI summaries, playback audio, and audit transcripts.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search phone, name..." 
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
            />
          </div>
          <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
            <Filter size={18} />
            Filters
          </button>
        </div>
      </div>

      {/* Main Split View */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        
        {/* Left Column: Call List */}
        <div className="w-1/3 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Recent Calls (Today)</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-sm text-gray-500">Loading calls…</div>
            ) : calls.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-500">No call logs yet.</div>
            ) : calls.map(call => {
              const phone = call.customers?.phone_number || "Unknown";
              const name = (call.meta?.structured?.caller_name) || (call.customers?.first_name && call.customers.first_name !== 'New' ? `${call.customers.first_name} ${call.customers.last_name || ""}`.trim() : null) || "Unregistered Caller";
              const urgency = (call.urgency_flag || "low").toString().toLowerCase();
              const isHigh = urgency === "high";
              return (
              <div 
                key={call.id} 
                onClick={() => setSelectedId(call.id)}
                className={`p-4 border-b border-gray-100 cursor-pointer transition-colors ${selectedCall?.id === call.id ? 'bg-blue-50 border-l-4 border-l-blue-600' : 'hover:bg-gray-50 border-l-4 border-l-transparent'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-900">{phone}</span>
                  <span className="text-xs text-gray-500">{timeAgo(call.created_at)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm text-gray-600 truncate pr-4">{name}</span>
                  {isHigh ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded">
                      <AlertTriangle size={12} /> High
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded">
                      <CheckCircle2 size={12} /> {urgency}
                    </span>
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Right Column: Call Detail View */}
        <div className="w-2/3 bg-white border border-gray-200 rounded-xl shadow-sm flex flex-col overflow-hidden">
          
          {/* Detail Header & Audio Player */}
          <div className="p-6 border-b border-gray-200 bg-gray-50">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCall?.customers?.phone_number || "Unknown"}</h2>
                <p className="text-gray-500 mt-1">
                  {callerName || 'Unregistered Caller'}
                  {selectedCall?.created_at ? ` • ${timeAgo(selectedCall.created_at)}` : ""}
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-gray-200 text-gray-800 text-sm font-semibold rounded-full mb-2">
                  {selectedCall?.call_status || "logged"}
                </span>
              </div>
            </div>

            <div className="bg-gray-900 rounded-lg p-3 flex items-center justify-between gap-4">
              {selectedCall?.recording_url ? (
                <audio controls src={selectedCall.recording_url} className="w-full h-8" style={{filter: 'invert(1)'}} />
              ) : (
                <div className="text-sm text-gray-400 font-medium">No recording available</div>
              )}
              <div className="text-white text-sm font-mono whitespace-nowrap">{fmtDuration(selectedCall?.duration_seconds) || ""}</div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* AI Summary & Extraction Grid */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={18} className="text-blue-600"/> 
                  AI Call Summary
                </h3>
                <p className="text-sm text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-100">
                  {selectedCall?.summary || "(No summary yet)"}
                </p>
              </div>
              
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <CheckCircle2 size={18} className="text-green-600"/> 
                  Extracted Data
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Address</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {extractedAddress || "(Not captured yet)"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Briefcase size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Job Type</p>
                      <p className="text-sm text-gray-900 font-semibold">
                        {extractedJobType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Calendar size={16} className="text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-xs text-gray-500 font-medium">Timeline / Booking</p>
                      <p className="text-sm text-gray-900 font-semibold">{selectedCall?.action_items || "Requires review"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Transcript */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Full Transcript</h3>
              <div className="space-y-4">
                {transcript.length === 0 ? (
                  <div className="text-sm text-gray-500">No transcript saved for this call yet.</div>
                ) : transcript.map((line, idx) => (
                  <div key={idx} className={`flex gap-4 ${line.speaker === 'AI' ? 'bg-gray-50 p-3 rounded-lg border border-gray-100' : ''}`}>
                    <div className="w-16 flex-shrink-0">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${line.speaker === 'AI' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
                        {line.speaker || "UNK"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-relaxed">{line.text || ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
