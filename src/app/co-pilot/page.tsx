"use client";

import { useState, useEffect } from "react";
import { Mic, PhoneCall, User, MapPin, Zap, CheckCircle2, AlertCircle, Phone, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";

type ActiveCall = {
  call_id: string;
  caller_name: string | null;
  phone: string | null;
  address: string | null;
  customer: {
    id?: string;
    first_name?: string;
    last_name?: string;
    phone_number?: string;
    address?: string;
    call_logs?: { id: string; summary: string; created_at: string }[];
  } | null;
};

function formatPhone(phone?: string | null) {
  const d = (phone || "").replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return phone || "—";
}

function timeAgo(iso?: string) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.round(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

export default function CoPilot() {
  const [active, setActive] = useState<ActiveCall | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const poll = async () => {
      try {
        const r = await fetch("/api/active-call");
        const json = await r.json();
        setActive(json.active);
      } catch { /* silent */ }
      setLoading(false);
    };
    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, []);

  const callerName =
    active?.caller_name ||
    (active?.customer?.first_name && active.customer.first_name !== "New"
      ? `${active.customer.first_name} ${active.customer.last_name || ""}`.trim()
      : null) ||
    formatPhone(active?.phone) ||
    "Unknown Caller";

  const priorCalls = active?.customer?.call_logs || [];
  const customerId = active?.customer?.id;

  return (
    <div className="max-w-7xl mx-auto p-8 h-[calc(100vh-2rem)] flex flex-col">
      {/* Header */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            Dispatcher Co-Pilot
            {active ? (
              <span className="flex items-center gap-1.5 text-xs font-bold text-red-600 bg-red-100 px-3 py-1 rounded-full animate-pulse border border-red-200">
                <Mic size={14} /> LIVE CALL
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full border border-gray-200">
                <PhoneCall size={14} /> STANDING BY
              </span>
            )}
          </h1>
          <p className="text-gray-500 mt-2">
            {active ? "Active call in progress — caller ID and history pulled automatically." : "Waiting for next inbound call. Sarah is live on your number."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex items-center justify-center text-gray-400">Checking for active calls...</div>
      ) : active ? (
        /* ── ACTIVE CALL VIEW ── */
        <div className="flex-1 flex gap-8 overflow-hidden">

          {/* Left: Caller ID Card */}
          <div className="w-1/2 flex flex-col gap-6">

            {/* Caller Identity */}
            <div className="bg-white rounded-xl border-2 border-blue-300 shadow-lg p-6">
              <div className="flex items-center gap-2 text-blue-600 font-bold text-sm mb-4 uppercase tracking-wider">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-ping" />
                Incoming Caller Identified
              </div>
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-2xl font-bold shrink-0">
                  {callerName[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{callerName}</h2>
                  <a href={`tel:${active.phone}`} className="flex items-center gap-1.5 text-blue-600 hover:underline text-sm mt-1">
                    <Phone size={14} /> {formatPhone(active.phone)}
                  </a>
                </div>
              </div>
              {(active.address || active.customer?.address) && (
                <div className="mt-4 flex items-start gap-2 bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
                  <MapPin size={15} className="text-gray-400 mt-0.5 shrink-0" />
                  <span>{active.address || active.customer?.address}</span>
                </div>
              )}
              {customerId && (
                <Link
                  href={`/projects/customer-profile?id=${customerId}`}
                  className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 py-2.5 rounded-lg transition-colors w-full"
                >
                  View Full Customer Profile <ChevronRight size={14} />
                </Link>
              )}
            </div>

            {/* Repeat caller badge */}
            {priorCalls.length > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                <p className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                  🔁 Repeat Caller — {priorCalls.length} previous call{priorCalls.length > 1 ? "s" : ""}
                </p>
                <div className="space-y-2">
                  {priorCalls.slice(0, 3).map((c) => (
                    <div key={c.id} className="text-sm text-yellow-900 bg-white rounded-lg border border-yellow-100 p-3">
                      <div className="flex justify-between text-xs text-yellow-600 mb-1">
                        <Clock size={11} className="inline mr-1" />{timeAgo(c.created_at)}
                      </div>
                      <p className="text-xs leading-snug">{c.summary?.slice(0, 120)}{(c.summary?.length || 0) > 120 ? "…" : ""}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right: Live job ticket */}
          <div className="w-1/2 bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-4 border-b border-gray-200 bg-gray-50 rounded-t-xl">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Zap size={18} className="text-yellow-500" />
                Auto-Filling Job Ticket
              </h2>
            </div>
            <div className="p-6 space-y-6 flex-1">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Caller ID</label>
                  <div className="bg-green-50 border border-green-200 px-4 py-2.5 rounded-lg text-sm font-medium text-green-900">
                    {callerName}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Phone</label>
                  <div className="bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-900">
                    {formatPhone(active.phone)}
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Service Address</label>
                <div className={`border px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${active.address || active.customer?.address ? "bg-green-50 border-green-200 text-green-900" : "bg-blue-50 border-blue-200 text-blue-600 animate-pulse"}`}>
                  <MapPin size={15} />
                  {active.address || active.customer?.address || "Sarah is asking for address..."}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Issue / Job Scope</label>
                <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded-lg text-sm text-blue-700 animate-pulse min-h-16 flex items-center">
                  Sarah is transcribing in real-time...
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500 text-center">
                Full transcript &amp; AI summary will save automatically when the call ends.
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end gap-3">
              <Link
                href="/call-logs"
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors flex items-center gap-2"
              >
                <CheckCircle2 size={16} /> View Call Log After
              </Link>
            </div>
          </div>
        </div>
      ) : (
        /* ── STANDBY VIEW ── */
        <div className="flex-1 flex flex-col items-center justify-center gap-6 text-center">
          <div className="h-24 w-24 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
            <PhoneCall size={40} className="text-gray-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-700">Standing By</h2>
            <p className="text-gray-400 mt-1 max-w-sm">
              When a call comes in to <span className="font-mono font-semibold text-gray-600">(612) 324-5110</span>, Sarah answers automatically and this screen will update with the caller's identity and history.
            </p>
          </div>
          <div className="flex gap-4">
            <Link href="/call-logs" className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
              <Phone size={15} /> Recent Calls
            </Link>
            <Link href="/crm" className="text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 border border-gray-300 px-5 py-2.5 rounded-lg transition-colors flex items-center gap-2">
              <User size={15} /> CRM
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
