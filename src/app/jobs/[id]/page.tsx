"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MapPin, User, BadgeDollarSign, CalendarClock, Receipt, Package, Truck, ExternalLink } from "lucide-react";

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

type Receipt = {
  id: string;
  supplier_name?: string;
  total_amount?: string | number;
  receipt_url?: string;
  line_items?: any[];
  status?: string;
  created_at?: string;
};

function fmtMoney(n?: string | number | null) {
  if (n === undefined || n === null || Number.isNaN(Number(n))) return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n));
  } catch {
    return `$${n}`;
  }
}

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function statusPill(status?: string) {
  const s = (status || "Lead").toLowerCase();
  if (s.includes("complete")) return "bg-green-100 text-green-700";
  if (s.includes("progress")) return "bg-blue-100 text-blue-700";
  if (s.includes("schedule")) return "bg-purple-100 text-purple-700";
  if (s.includes("ghost")) return "bg-gray-200 text-gray-700";
  return "bg-yellow-100 text-yellow-700";
}

export default function JobDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/jobs?id=${id}`, { cache: "no-store" }).then((r) => r.json()),
      fetch(`/api/receipts?job_id=${id}`).then((r) => r.json()),
    ])
      .then(([jobData, receiptsData]) => {
        setJob(jobData.job);
        setReceipts(receiptsData.receipts || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-8 flex items-center justify-center min-h-[50vh]">
        <div className="text-gray-400">Loading job details...</div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <button onClick={() => router.back()} className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-6">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="text-center text-gray-400 py-12 bg-white rounded-xl border border-gray-200">
          Job not found.
        </div>
      </div>
    );
  }

  const customerName = `${job.customers?.first_name || ""} ${job.customers?.last_name || ""}`.trim() || "Customer";
  const totalMaterialCost = receipts.reduce((sum, r) => sum + (Number(r.total_amount) || 0), 0);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link href="/jobs" className="text-sm text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 mb-6 transition-colors">
        <ArrowLeft size={14} /> Back to Archive
      </Link>

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-100 flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className={`text-xs font-bold px-2 py-0.5 rounded ${statusPill(job.status)}`}>
                {job.status || "Lead"}
              </span>
              <span className="text-sm text-gray-500">Job {job.id.substring(0, 8)}</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{job.title || "Untitled Job"}</h1>
            <p className="text-sm text-gray-500 mt-1">Created {timeAgo(job.created_at)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500 mb-1">Quoted Amount</p>
            <p className="text-xl font-bold text-gray-900">{fmtMoney(job.quoted_amount)}</p>
          </div>
        </div>
        <div className="p-6 grid grid-cols-2 gap-6 bg-gray-50">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Customer Info</p>
            <div className="flex items-center gap-2 mb-1">
              <User size={16} className="text-gray-400" />
              <span className="font-medium text-gray-900">{customerName}</span>
            </div>
            {job.customer_id && (
              <Link
                href={`/projects/customer-profile?id=${job.customer_id}`}
                className="text-xs text-blue-600 hover:underline inline-block mt-1"
              >
                View full profile
              </Link>
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Location & Time</p>
            <div className="flex items-start gap-2 mb-2">
              <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
              {job.address ? (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(job.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-gray-700 hover:text-blue-600 hover:underline"
                >
                  {job.address}
                </a>
              ) : (
                <span className="text-sm text-gray-500">No address provided</span>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <CalendarClock size={16} className="text-gray-400" />
              {job.scheduled_start ? new Date(job.scheduled_start).toLocaleString() : "Not scheduled yet"}
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-200 shadow-sm rounded-xl overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Receipt size={18} className="text-gray-400" />
              Material Costs & Receipts
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Parsed from inbound supply house emails</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500 uppercase tracking-wider font-bold mb-1">Total Materials</p>
            <p className="text-lg font-bold text-red-600">{fmtMoney(totalMaterialCost)}</p>
          </div>
        </div>
        
        {receipts.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <Receipt size={24} className="text-gray-300" />
            </div>
            <p className="text-sm text-gray-500">No receipts have been linked to this job yet.</p>
            <p className="text-xs text-gray-400 mt-1">Receipts are automatically linked when the supplier email matches the job.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {receipts.map((r) => (
              <div key={r.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                      <Truck size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{r.supplier_name || "Unknown Supplier"}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">Processed {new Date(r.created_at || "").toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <span className="font-bold text-gray-900">{fmtMoney(r.total_amount)}</span>
                    {r.receipt_url && (
                      <a 
                        href={r.receipt_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded-md inline-flex items-center gap-1 border border-blue-100"
                      >
                        <ExternalLink size={12} /> View Original
                      </a>
                    )}
                  </div>
                </div>
                
                {r.line_items && Array.isArray(r.line_items) && r.line_items.length > 0 && (
                  <div className="mt-4 bg-white border border-gray-100 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase flex items-center gap-2">
                      <Package size={14} /> Line Items ({r.line_items.length})
                    </div>
                    <div className="divide-y divide-gray-50 text-sm">
                      {r.line_items.map((item, i) => (
                        <div key={i} className="px-4 py-3 flex justify-between gap-4">
                          <div className="flex-1">
                            <p className="font-medium text-gray-800 text-sm">{item.description || item.name || "Unknown Item"}</p>
                            {item.sku && <p className="text-xs text-gray-400 mt-0.5">SKU: {item.sku}</p>}
                          </div>
                          <div className="text-right flex items-center gap-4 text-xs">
                            <span className="text-gray-500">Qty: <span className="font-medium text-gray-700">{item.quantity || 1}</span></span>
                            <span className="text-gray-500">Price: <span className="font-medium text-gray-700">{fmtMoney(item.unit_price || item.price)}</span></span>
                            <span className="font-bold text-gray-900 w-16 text-right">{fmtMoney(item.total || ((item.unit_price || item.price || 0) * (item.quantity || 1)))}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
