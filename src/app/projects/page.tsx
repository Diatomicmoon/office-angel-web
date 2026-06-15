"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Phone, FolderOpen, AlertCircle, PlusCircle, ChevronRight, User } from "lucide-react";
import Link from "next/link";

type Customer = {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  address: string;
  property_notes?: string;
  tags?: string[];
  created_at: string;
  call_logs: { id: string; urgency_flag: string; created_at: string; summary: string }[];
};

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.round(diff / 86400000);
  if (days < 1) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 30) return `${days}d ago`;
  const months = Math.round(days / 30);
  return `${months}mo ago`;
}

function formatPhone(phone: string) {
  const d = phone?.replace(/\D/g, "") || "";
  if (d.length === 11 && d[0] === "1") return `(${d.slice(1,4)}) ${d.slice(4,7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  return phone || "—";
}

function initials(first?: string, last?: string) {
  return `${(first || "?")[0]}${(last || "?")[0]}`.toUpperCase();
}

const TAG_COLORS: Record<string, string> = {
  "dog in yard": "bg-orange-100 text-orange-700",
  "vip": "bg-yellow-100 text-yellow-700",
  "commercial": "bg-purple-100 text-purple-700",
  "repeat customer": "bg-green-100 text-green-700",
};

export default function JobArchive() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    fetch("/api/customers")
      .then((r) => r.json())
      .then((json) => {
        setCustomers(json.customers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = customers.filter((c) => {
    if (!q) return c.first_name !== "New"; // hide ghost "New Caller" entries by default
    const s = q.toLowerCase();
    return (
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(s) ||
      (c.phone_number || "").includes(s) ||
      (c.address || "").toLowerCase().includes(s) ||
      (c.email || "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-2rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Customer Archive</h1>
          <p className="text-gray-500 mt-2">Full history, site notes, and lifetime value for every customer.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search name, phone, address..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-72"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        {/* Table Header (Desktop Only) */}
        <div className="hidden lg:grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider sticky top-0 z-10">
          <div className="col-span-3">Customer</div>
          <div className="col-span-3">Address</div>
          <div className="col-span-2">Calls / Last Contact</div>
          <div className="col-span-2">Tags / Notes</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading customers...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No customers found.</div>
          ) : (
            filtered.map((c) => {
              const name = c.first_name && c.first_name !== "New"
                ? `${c.first_name} ${c.last_name || ""}`.trim()
                : formatPhone(c.phone_number);
              const callCount = c.call_logs?.length || 0;
              const lastCall = c.call_logs?.[0]?.created_at;
              const hasEmergency = c.call_logs?.some((l) => l.urgency_flag === "high");
              const hasDog = c.tags?.includes("dog in yard") || (c.property_notes || "").toLowerCase().includes("dog");

              return (
                <div key={c.id} className="flex flex-col lg:grid lg:grid-cols-12 gap-4 p-4 hover:bg-gray-50 transition-colors group">
                  {/* Customer (Header row on mobile) */}
                  <div className="lg:col-span-3 flex items-start sm:items-center justify-between lg:justify-start gap-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-blue-100 text-blue-700 rounded-lg flex items-center justify-center font-bold text-sm shrink-0">
                        {c.first_name !== "New" ? initials(c.first_name, c.last_name) : <User size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{name}</p>
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <Phone size={11} /> {formatPhone(c.phone_number)}
                        </p>
                      </div>
                    </div>
                    
                    {/* Mobile-only profile link top right */}
                    <div className="lg:hidden">
                      <Link
                        href={`/projects/customer-profile?id=${c.id}`}
                        className="text-xs font-medium text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full flex items-center gap-1"
                      >
                        Profile <ChevronRight size={13} />
                      </Link>
                    </div>
                  </div>

                  {/* Address */}
                  <div className="lg:col-span-3 flex items-start lg:items-center">
                    {c.address ? (
                      <p className="text-sm text-gray-700 flex items-start gap-1.5 w-full">
                        <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0 hidden lg:block" />
                        <span className="leading-snug line-clamp-2 lg:line-clamp-none">{c.address}</span>
                      </p>
                    ) : (
                      <span className="text-xs text-gray-400">No address on file</span>
                    )}
                  </div>

                  {/* Calls and Tags - Grouped on Mobile */}
                  <div className="flex flex-row lg:contents justify-between items-center lg:items-start gap-4">
                    {/* Calls */}
                    <div className="lg:col-span-2 flex flex-col justify-center">
                      <div className="flex items-center gap-2">
                        {hasEmergency ? (
                          <AlertCircle size={14} className="text-red-500 shrink-0" />
                        ) : (
                          <FolderOpen size={14} className="text-gray-400 shrink-0" />
                        )}
                        <span className="text-sm font-semibold text-gray-900">{callCount} call{callCount !== 1 ? "s" : ""}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5 hidden lg:block">{timeAgo(lastCall)}</p>
                    </div>

                    {/* Tags */}
                    <div className="lg:col-span-2 flex flex-wrap justify-end lg:justify-start gap-1">
                      {hasDog && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700">🐕 Dog in yard</span>
                      )}
                      {c.tags?.filter((t) => t !== "dog in yard").slice(0, 2).map((tag) => (
                        <span key={tag} className={`text-[10px] font-bold px-2 py-0.5 rounded ${TAG_COLORS[tag] || "bg-gray-100 text-gray-600"}`}>
                          {tag}
                        </span>
                      ))}
                      {!hasDog && (!c.tags || c.tags.length === 0) && (
                        <span className="text-xs text-gray-400 hidden lg:block">—</span>
                      )}
                    </div>
                  </div>

                  {/* Actions (Desktop Only) */}
                  <div className="hidden lg:flex lg:col-span-2 items-center justify-end gap-3">
                    <button className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 border border-blue-200">
                      <PlusCircle size={13} /> New Job
                    </button>
                    <Link
                      href={`/projects/customer-profile?id=${c.id}`}
                      className="text-xs font-medium text-gray-600 hover:text-blue-600 flex items-center gap-1 transition-colors"
                    >
                      Profile <ChevronRight size={13} />
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
