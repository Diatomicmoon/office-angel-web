"use client";

import { useState, useEffect } from "react";
import { DollarSign, FileText, CheckCircle2, Mail, AlertCircle, RefreshCw, Inbox, ExternalLink, X, PieChart, Building } from "lucide-react";

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
  const [showBreakdown, setShowBreakdown] = useState(false);

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

  // Breakdown calculations
  const spendBySupplier = receipts.reduce((acc, r) => {
    const name = r.supplier_name || "Unknown Supplier";
    acc[name] = (acc[name] || 0) + (r.total_amount || 0);
    return acc;
  }, {} as Record<string, number>);
  
  const sortedSuppliers = Object.entries(spendBySupplier)
    .sort((a, b) => b[1] - a[1])
    .filter(([_, amount]) => amount > 0);

  type ItemPurchase = { supplier: string; unitPrice: number; qty: number; total: number };
  
  const spendByItem = receipts.reduce((acc, r) => {
    const supplier = r.supplier_name || "Unknown Supplier";
    if (r.line_items && Array.isArray(r.line_items)) {
      r.line_items.forEach(item => {
        const desc = item.description || "Unknown Item";
        const total = Number(item.total) || 0;
        const qty = Number(item.quantity) || 1;
        const unitPrice = Number(item.unit_price) || (total / qty);
        
        if (!acc[desc]) acc[desc] = { total: 0, purchases: [] as ItemPurchase[] };
        acc[desc].total += total;
        
        const existing = acc[desc].purchases.find((p: ItemPurchase) => p.supplier === supplier && Math.abs(p.unitPrice - unitPrice) < 0.01);
        if (existing) {
          existing.qty += qty;
          existing.total += total;
        } else {
          acc[desc].purchases.push({ supplier, unitPrice, qty, total });
        }
      });
    }
    return acc;
  }, {} as Record<string, { total: number; purchases: ItemPurchase[] }>);

  const sortedItems = Object.entries(spendByItem)
    .sort((a, b) => b[1].total - a[1].total)
    .filter(([_, data]) => data.total > 0)
    .slice(0, 15); // Show top 15 items

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 h-[calc(100vh-2rem)] overflow-y-auto">

      {/* Breakdown Modal */}
      {showBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowBreakdown(false)} />
          <div className="relative z-10 w-full max-w-4xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[85vh] animate-slide-in">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-lg"><PieChart size={20} className="text-blue-600" /></div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Spend Breakdown</h2>
                  <p className="text-sm text-gray-500">Analytics across all parsed supply receipts</p>
                </div>
              </div>
              <button onClick={() => setShowBreakdown(false)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Supplier Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building size={16} className="text-gray-400" /> Where are we spending?
                </h3>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-3">
                  {sortedSuppliers.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No supplier data yet.</p>
                  ) : (
                    sortedSuppliers.map(([name, amount]) => (
                      <div key={name} className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">{name}</span>
                        <span className="text-sm font-bold text-gray-900">${amount.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Item Breakdown */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <FileText size={16} className="text-gray-400" /> What are we buying? (Top 15)
                </h3>
                <div className="bg-gray-50 rounded-xl border border-gray-100 p-4 space-y-4">
                  {sortedItems.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-4">No item data yet.</p>
                  ) : (
                    sortedItems.map(([desc, data]) => (
                      <div key={desc} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                        <div className="flex items-start justify-between gap-4">
                          <span className="text-sm font-bold text-gray-900 break-words">{desc}</span>
                          <span className="text-sm font-bold text-gray-900 shrink-0">${data.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="mt-2 space-y-1.5">
                          {data.purchases.map((p, i) => (
                            <div key={i} className="flex justify-between items-center text-xs text-gray-600 bg-white px-2 py-1.5 rounded border border-gray-100 shadow-sm">
                              <span className="truncate pr-2">{p.supplier} <span className="text-gray-400 px-1">•</span> {p.qty} @ ${p.unitPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                              <span className="font-medium shrink-0">${p.total.toLocaleString(undefined, {minimumFractionDigits: 2})}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-end">
              <button onClick={() => setShowBreakdown(false)} className="px-6 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

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
        <div 
          onClick={() => setShowBreakdown(true)}
          className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center justify-between text-gray-500 mb-3">
            <h3 className="font-medium text-sm group-hover:text-blue-600 transition-colors">Total Supply Spend</h3>
            <div className="bg-blue-50 p-2 rounded-lg group-hover:bg-blue-100 transition-colors"><DollarSign size={18} className="text-blue-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">
            {loading ? "..." : `$${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          </p>
          <p className="text-sm text-gray-400 mt-2 flex items-center justify-between">
            <span>From {receipts.length} parsed invoices</span>
            <span className="text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">View Breakdown <PieChart size={12}/></span>
          </p>
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
