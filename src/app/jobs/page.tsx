"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, MapPin, User, ChevronRight, BadgeDollarSign, CalendarClock, X } from "lucide-react";

type Job = {
  id: string;
  title?: string;
  status?: string;
  priority?: string;
  address?: string;
  quoted_amount?: string | number | null;
  created_at?: string;
  scheduled_start?: string;
  scheduled_end?: string;
  customer_id?: string;
  customers?: {
    first_name?: string;
    last_name?: string;
    phone_number?: string;
  };
};

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function fmtMoney(n?: string | number | null) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
  } catch {
    return `$${n}`;
  }
}

function statusPill(status?: string) {
  const s = (status || "Lead").toLowerCase();
  if (s.includes("complete")) return "bg-green-100 text-green-700";
  if (s.includes("progress")) return "bg-blue-100 text-blue-700";
  if (s.includes("schedule")) return "bg-purple-100 text-purple-700";
  if (s.includes("ghost")) return "bg-gray-200 text-gray-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function JobsArchivePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [ghlBanner, setGhlBanner] = useState<{ name: string; phone: string; address: string } | null>(null);

  useEffect(() => {
    // Pre-fill banner if coming from a GHL contact
    const params = new URLSearchParams(window.location.search);
    if (params.get("ghl_contact")) {
      setGhlBanner({
        name: params.get("name") || "",
        phone: params.get("phone") || "",
        address: params.get("address") || "",
      });
    }
  }, []);

  useEffect(() => {
    fetch("/api/jobs", { cache: "no-store" })
      .then((r) => r.json())
      .then((json) => {
        setJobs(json.jobs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return jobs.filter((j) => {
      if (status !== "all" && String(j.status || "Lead").toLowerCase() !== status) return false;
      if (!s) return true;
      const customerName = `${j.customers?.first_name || ""} ${j.customers?.last_name || ""}`.trim();
      return (
        (j.title || "").toLowerCase().includes(s) ||
        (j.address || "").toLowerCase().includes(s) ||
        customerName.toLowerCase().includes(s)
      );
    });
  }, [jobs, q, status]);

  const statuses = useMemo(() => {
    const set = new Set<string>();
    jobs.forEach((j) => set.add(String(j.status || "Lead").toLowerCase()));
    return ["all", ...Array.from(set).sort()];
  }, [jobs]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-2rem)]">
      {/* GHL Contact Pre-fill Banner */}
      {ghlBanner && (
        <div className="mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-900">Creating job for GHL contact: <span className="font-bold">{ghlBanner.name}</span></p>
            <p className="text-xs text-indigo-600 mt-0.5">{ghlBanner.phone}{ghlBanner.address ? ` · ${ghlBanner.address}` : ""}</p>
          </div>
          <button onClick={() => setGhlBanner(null)} className="text-indigo-400 hover:text-indigo-700 p-1">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Job Archive</h1>
          <p className="text-gray-500 mt-2">Every job, status, and customer tied together — in one place.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-stretch sm:items-center">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search job, customer, address..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-black w-72"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-black bg-white"
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s[0].toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex-1 overflow-x-auto flex flex-col">
        <div className="grid grid-cols-12 gap-4 p-4 border-b border-gray-200 bg-gray-50 text-xs font-bold text-gray-500 uppercase tracking-wider">
          <div className="col-span-4">Job</div>
          <div className="col-span-3">Customer</div>
          <div className="col-span-3">Address</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-gray-100">
          {loading ? (
            <div className="p-12 text-center text-gray-400">Loading jobs...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-400">No jobs found.</div>
          ) : (
            filtered.map((j) => {
              const customerName = `${j.customers?.first_name || ""} ${j.customers?.last_name || ""}`.trim() || "Customer";
              return (
                <div key={j.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-gray-50 transition-colors">
                  <div className="col-span-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${statusPill(j.status)}`}>
                        {j.status || "Lead"}
                      </span>
                      <span className="text-xs text-gray-500">· created {timeAgo(j.created_at)}</span>
                    </div>
                    <Link href={`/jobs/${j.id}`} className="hover:text-blue-600 hover:underline">
                      <p className="text-sm font-bold text-gray-900 mt-1 hover:text-blue-600 transition-colors">{j.title || "Untitled Job"}</p>
                    </Link>
                    <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                      <span className="inline-flex items-center gap-1"><BadgeDollarSign size={12} /> {fmtMoney(j.quoted_amount)}</span>
                      {j.scheduled_start && (
                        <span className="inline-flex items-center gap-1"><CalendarClock size={12} /> Scheduled</span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3">
                    <p className="text-sm text-gray-900 font-semibold flex items-center gap-2">
                      <User size={14} className="text-gray-400" /> {customerName}
                    </p>
                    {j.customer_id && (
                      <Link
                        className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1 mt-1"
                        href={`/projects/customer-profile?id=${j.customer_id}`}
                      >
                        View profile <ChevronRight size={12} />
                      </Link>
                    )}
                  </div>

                  <div className="col-span-3">
                    {j.address ? (
                      <a
                        href={`https://maps.google.com/?q=${encodeURIComponent(j.address)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-700 flex items-start gap-1.5 hover:text-blue-600"
                      >
                        <MapPin size={13} className="text-gray-400 mt-0.5 shrink-0" />
                        <span className="leading-snug">{j.address}</span>
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No address</span>
                    )}
                  </div>

                  <div className="col-span-2 flex items-center justify-end gap-2">
                    <Link
                      href={`/jobs/${j.id}`}
                      className="text-xs font-medium text-gray-700 bg-white hover:bg-gray-50 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 border border-gray-300 shadow-sm"
                    >
                      View
                    </Link>
                    <Link
                      href="/dispatch"
                      className="text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-1 border border-blue-200"
                    >
                      Assign
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
