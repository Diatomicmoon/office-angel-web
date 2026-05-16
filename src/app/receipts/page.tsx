"use client";

import { useState, useEffect } from "react";
import { DollarSign, FileText, CheckCircle2, Mail, AlertCircle, RefreshCw, Inbox, ExternalLink } from "lucide-react";

type Receipt = {
  id: string;
  supplier_name: string;
  total_amount: number | null;
  status: string;
  line_items: any[];
  receipt_url: string | null;
  created_at: string;
};

function statusBadge(status: string) {
  if (status === "Action Required") return "bg-yellow-50 text-yellow-800 border-yellow-200";
  if (status === "Reviewed") return "bg-green-50 text-green-700 border-green-200";
  if (status === "Archived") return "bg-gray-50 text-gray-500 border-gray-200";
  return "bg-gray-50 text-gray-600 border-gray-200";
}

export default function ReceiptsPage() {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [totalSpend, setTotalSpend] = useState(0);

  const fetchReceipts = async () => {
    setLoading(true);
    const res = await fetch("/api/receipts?limit=50");
    const json = await res.json();
    const data: Receipt[] = json.receipts || [];
    setReceipts(data);
    setTotalSpend(data.reduce((sum, r) => sum + (r.total_amount || 0), 0));
    setLoading(false);
  };

  useEffect(() => { fetchReceipts(); }, []);

  const markReviewed = async (id: string) => {
    setUpdating(id);
    await fetch(`/api/receipts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: "Reviewed" }),
    });
    setReceipts(prev => prev.map(r => r.id === id ? { ...r, status: "Reviewed" } : r));
    setUpdating(null);
  };

  const actionRequired = receipts.filter(r => r.status === "Action Required").length;
  const reviewed = receipts.filter(r => r.status === "Reviewed").length;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 h-[calc(100vh-2rem)] overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Receipts & Financials</h1>
          <p className="text-gray-500 mt-1">Supply invoices parsed from email. QuickBooks sync coming soon.</p>
        </div>
        <button
          onClick={fetchReceipts}
          className="flex items-center gap-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </button>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <h3 className="font-medium text-sm">Total Supply Spend</h3>
            <div className="bg-blue-50 p-2 rounded-lg"><DollarSign size={18} className="text-blue-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? "..." : `$${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="text-sm text-gray-400 mt-2">From {receipts.length} parsed invoices</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm">
          <div className="flex items-center justify-between text-yellow-600 mb-3">
            <h3 className="font-medium text-sm">Action Required</h3>
            <div className="bg-yellow-50 p-2 rounded-lg"><AlertCircle size={18} className="text-yellow-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? "..." : actionRequired}</p>
          <p className="text-sm text-gray-400 mt-2">Invoices needing review</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm">
          <div className="flex items-center justify-between text-green-600 mb-3">
            <h3 className="font-medium text-sm">Reviewed</h3>
            <div className="bg-green-50 p-2 rounded-lg"><CheckCircle2 size={18} className="text-green-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{loading ? "..." : reviewed}</p>
          <p className="text-sm text-gray-400 mt-2">Invoices confirmed</p>
        </div>
      </div>

      {/* Email Setup Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <Mail size={20} className="text-blue-600 mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold text-blue-900">Auto-ingest supply invoices via email</p>
            <p className="text-sm text-blue-700 mt-0.5">
              Forward invoices from your supply house to your unique inbox address and they'll appear here automatically — parsed by AI.
            </p>
          </div>
        </div>
        <a
          href="/settings"
          className="shrink-0 text-sm font-bold text-blue-700 bg-white border border-blue-200 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors flex items-center gap-2"
        >
          Get My Inbox Address <ExternalLink size={14} />
        </a>
      </div>

      {/* QuickBooks Banner */}
      <div className="bg-gray-900 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-white">Connect QuickBooks</p>
          <p className="text-sm text-gray-400 mt-0.5">Pull live invoices, revenue, and A/R directly from your QuickBooks account.</p>
        </div>
        <a
          href="/settings#quickbooks"
          className="shrink-0 text-sm font-bold bg-green-500 hover:bg-green-400 text-white px-5 py-2.5 rounded-lg transition-colors"
        >
          Connect QuickBooks →
        </a>
      </div>

      {/* Receipts Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <FileText size={18} className="text-gray-500" /> Parsed Supply Invoices
          </h2>
          <span className="text-sm text-gray-500">{receipts.length} total</span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-gray-500">Loading invoices...</div>
        ) : receipts.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Inbox size={36} className="text-gray-300" />
            <p className="font-semibold text-gray-900">No invoices yet</p>
            <p className="text-sm text-gray-500 max-w-sm">
              Forward a supply house invoice email to your inbox address and it'll show up here automatically, parsed by AI.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {receipts.map((r) => (
              <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-gray-900">{r.supplier_name}</h4>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${statusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">
                      {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      {r.line_items?.length > 0 && ` · ${r.line_items.length} line item${r.line_items.length !== 1 ? "s" : ""}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 sm:gap-6">
                  <p className="text-xl font-bold text-gray-900">
                    {r.total_amount != null ? `$${r.total_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
                  </p>

                  {r.status === "Action Required" ? (
                    <button
                      onClick={() => markReviewed(r.id)}
                      disabled={updating === r.id}
                      className="text-sm font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                      <CheckCircle2 size={15} />
                      {updating === r.id ? "Saving..." : "Mark Reviewed"}
                    </button>
                  ) : (
                    <span className="text-sm text-gray-400 font-medium">✓ Done</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
