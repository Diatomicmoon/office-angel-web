"use client";

import { useEffect, useState } from "react";
import { Phone, MapPin, ChevronRight, X } from "lucide-react";
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
  return phone || "";
}

export default function IncomingCallBanner() {
  const [active, setActive] = useState<ActiveCall | null>(null);
  const [dismissed, setDismissed] = useState<string | null>(null);
  const [ring, setRing] = useState(false);

  useEffect(() => {
    let prev: string | null = null;

    const poll = async () => {
      try {
        const r = await fetch("/api/active-call");
        const json = await r.json();
        const call = json.active as ActiveCall | null;

        if (call && call.call_id !== dismissed) {
          setActive(call);
          if (call.call_id !== prev) {
            setRing(true);
            setTimeout(() => setRing(false), 3000);
            prev = call.call_id;
          }
        } else {
          setActive(null);
        }
      } catch {
        // silent
      }
    };

    poll();
    const interval = setInterval(poll, 4000);
    return () => clearInterval(interval);
  }, [dismissed]);

  if (!active) return null;

  const name =
    active.caller_name ||
    (active.customer?.first_name && active.customer.first_name !== "New"
      ? `${active.customer.first_name} ${active.customer.last_name || ""}`.trim()
      : null) ||
    formatPhone(active.phone) ||
    "Unknown Caller";

  const priorCalls = active.customer?.call_logs?.length || 0;
  const customerId = active.customer?.id;

  return (
    <div className={`fixed top-4 right-4 z-50 w-96 bg-white rounded-xl shadow-2xl border-2 transition-all ${ring ? "border-blue-500 animate-pulse" : "border-blue-300"}`}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 bg-blue-600 rounded-t-xl">
        <div className="flex items-center gap-2">
          <div className={`h-2.5 w-2.5 rounded-full bg-green-400 ${ring ? "animate-ping" : ""}`} />
          <span className="text-white text-sm font-bold tracking-wide">📞 INCOMING CALL</span>
        </div>
        <button onClick={() => setDismissed(active.call_id)} className="text-blue-200 hover:text-white transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-3">
        {/* Caller ID */}
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xl font-bold shrink-0">
            {name[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500 flex items-center gap-1">
              <Phone size={12} /> {formatPhone(active.phone)}
            </p>
          </div>
        </div>

        {/* Address */}
        {(active.address || active.customer?.address) && (
          <div className="flex items-start gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg px-3 py-2">
            <MapPin size={14} className="text-gray-400 mt-0.5 shrink-0" />
            <span>{active.address || active.customer?.address}</span>
          </div>
        )}

        {/* History */}
        {priorCalls > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-sm text-yellow-800 font-medium">
            🔁 Repeat caller — {priorCalls} prior call{priorCalls > 1 ? "s" : ""} on file
          </div>
        )}

        {/* Footer */}
        <div className="flex gap-2 pt-1">
          {customerId && (
            <Link
              href={`/projects/customer-profile?id=${customerId}`}
              className="flex-1 text-center text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 py-2 rounded-lg transition-colors flex items-center justify-center gap-1"
            >
              View Profile <ChevronRight size={14} />
            </Link>
          )}
          <Link
            href="/co-pilot"
            className="flex-1 text-center text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 py-2 rounded-lg transition-colors"
          >
            Open Co-Pilot
          </Link>
        </div>
      </div>
    </div>
  );
}
