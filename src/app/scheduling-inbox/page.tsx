"use client";

import { useEffect, useMemo, useState } from "react";
import { Inbox, RefreshCw, ArrowRight, User, Phone, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

type Item = {
  job: any;
  latestMessage: any;
  suggestions?: any[];
};

function fmtPhone(p?: string) {
  if (!p) return "";
  const d = String(p).replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") return `(${d.slice(1, 4)}) ${d.slice(4, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
  return p;
}

function who(job: any) {
  const c = job?.customers;
  const first = (c?.first_name || "").trim();
  const last = (c?.last_name || "").trim();
  const full = `${first} ${last}`.trim();
  if (full && first.toLowerCase() !== "new") return full;
  return fmtPhone(c?.phone_number) || "Unknown customer";
}

function pillClass(status?: string) {
  const s = String(status || "").toLowerCase();
  if (s.includes("reschedule")) return "bg-orange-100 text-orange-800 border-orange-200";
  if (s.includes("confirm")) return "bg-green-100 text-green-800 border-green-200";
  if (s.includes("lead")) return "bg-gray-100 text-gray-800 border-gray-200";
  return "bg-blue-100 text-blue-800 border-blue-200";
}

export default function SchedulingInbox() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<string | null>(null);

  const refresh = () => {
    setLoading(true);
    fetch("/api/scheduling-inbox")
      .then((r) => r.json())
      .then((json) => setItems(json.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  };

  const book = async (jobId: string, sug: any) => {
    setBooking(jobId);
    try {
      await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: jobId,
          technician_id: sug.techId,
          scheduled_start: sug.startIso,
          scheduled_end: sug.endIso,
          status: 'Scheduled',
        }),
      });
      refresh();
    } finally {
      setBooking(null);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const counts = useMemo(() => {
    let lead = 0;
    let res = 0;
    for (const it of items) {
      const s = String(it?.job?.status || "");
      if (s === "Lead") lead++;
      if (s.includes("Reschedule")) res++;
    }
    return { lead, res, total: items.length };
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 flex flex-col min-h-screen pb-20 space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-2"><Inbox size={24}/> Scheduling Inbox</h1>
          <p className="text-gray-500 mt-2">Texts + website leads that need dispatch attention.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refresh} className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-50 flex items-center gap-2">
            <RefreshCw size={16}/> Refresh
          </button>
          <Link href="/dispatch" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 flex items-center gap-2">
            Open Dispatch <ArrowRight size={16}/>
          </Link>
        </div>
      </div>

      <div className="flex gap-3 text-sm">
        <span className="px-3 py-1 rounded-full border bg-white">Total: <b>{counts.total}</b></span>
        <span className="px-3 py-1 rounded-full border bg-white">Leads: <b>{counts.lead}</b></span>
        <span className="px-3 py-1 rounded-full border bg-white">Reschedules: <b>{counts.res}</b></span>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="font-semibold text-gray-900">Needs Action</h2>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Live</span>
        </div>

        {loading ? (
          <div className="p-6 text-sm text-gray-500">Loading…</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No items.</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((it) => (
              <div key={it.job.id} className="p-5 flex items-start justify-between gap-6">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`text-[11px] font-bold px-2 py-1 rounded-full border ${pillClass(it.job.status)}`}>{it.job.status}</span>
                    {it.job.priority === 'high' ? (
                      <span className="text-[11px] font-bold px-2 py-1 rounded-full border bg-red-100 text-red-700 border-red-200 flex items-center gap-1"><AlertCircle size={12}/> High</span>
                    ) : null}
                  </div>
                  <p className="mt-2 font-bold text-gray-900 truncate">{it.job.title || 'Untitled Job'}</p>
                  <p className="mt-1 text-sm text-gray-700 flex items-center gap-2 truncate"><User size={14} className="text-gray-400"/> {who(it.job)}</p>
                  {it.latestMessage?.body ? (
                    <p className="mt-2 text-sm text-gray-600 truncate">“{it.latestMessage.body}”</p>
                  ) : null}
                  {it.latestMessage?.created_at ? (
                    <p className="mt-1 text-xs text-gray-500 flex items-center gap-1"><Clock size={12}/> {new Date(it.latestMessage.created_at).toLocaleString()}</p>
                  ) : null}

                  {it.suggestions?.length ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {it.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => book(it.job.id, sug)}
                          disabled={booking === it.job.id}
                          className="px-3 py-2 rounded-lg border border-gray-200 bg-white hover:bg-blue-50 text-left"
                        >
                          <div className="text-[11px] font-bold text-gray-900">{sug.techName}</div>
                          <div className="text-[11px] text-gray-600">{new Date(sug.startIso).toLocaleString([], { hour: 'numeric', minute: '2-digit', month: 'short', day: 'numeric' })}</div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 text-[11px] text-gray-400">No AI suggestions yet (add techs + schedules).</div>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Link href={`/dispatch?job=${encodeURIComponent(it.job.id)}`} className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-800">Open</Link>
                  {booking === it.job.id ? (
                    <div className="text-xs text-gray-500">Booking…</div>
                  ) : null}
                  {it.job.customers?.phone_number ? (
                    <div className="text-xs text-gray-500 flex items-center gap-1"><Phone size={12}/> {fmtPhone(it.job.customers.phone_number)}</div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
