"use client";

import { Inbox, FileText, CheckCircle2, AlertCircle, HardHat, FileSignature, ArrowRight, Settings, UploadCloud, Copy, X, BarChart3, TrendingUp, Building2, Clock, Search, RefreshCw, ChevronDown, ChevronUp, Camera, Loader2, Package } from "lucide-react";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";

type LineItem = {
  description?: string;
  trade_name?: string;
  original_part_number?: string;
  quantity?: number;
  unit_price?: number;
  total?: number;
};

type Receipt = {
  id: string;
  supplier_name?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
  line_items?: LineItem[];
  job_id?: string;
  jobs?: {
    title?: string;
  };
};

export default function InboxPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!isDemoMode);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showPermitAnalytics, setShowPermitAnalytics] = useState(false);
  const [expandedReceiptId, setExpandedReceiptId] = useState<string | null>(null);

  const [scanning, setScanning] = useState(false);
  const [scanStatus, setScanStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setScanStatus("Compressing image...");

    const reader = new FileReader();
    reader.onload = async (event) => {
      const img = new Image();
      img.onload = async () => {
        const canvas = document.createElement('canvas');
        const MAX_DIMENSION = 1200;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(async (blob) => {
          if (!blob) {
            setScanning(false);
            setScanStatus("Compression failed.");
            return;
          }

          const formData = new FormData();
          formData.append("image", blob, "receipt.jpg");

          try {
            setScanStatus("AI parsing receipt...");
            const res = await fetch("/api/receipts/scan", {
              method: "POST",
              body: formData,
            });

            if (!res.ok) throw new Error("Failed to scan receipt");

            const data = await res.json();
            if (data.receipt) {
              setReceipts(prev => [data.receipt, ...prev]);
              setScanStatus("Catalog updated!");
              setTimeout(() => setScanStatus(null), 3000);
            }
          } catch (err) {
            console.error(err);
            setScanStatus("Error scanning receipt");
            setTimeout(() => setScanStatus(null), 3000);
          } finally {
            setScanning(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
          }
        }, 'image/jpeg', 0.7);
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const forwardAddress = "bbizjgfdgr7hc1s9p1y8q2qfn7le3h81@hook.us2.make.com";

  const handleCopy = () => {
    navigator.clipboard.writeText(forwardAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isDemoMode) return;
    setLoading(true);
    fetch("/api/receipts?limit=50")
      .then((r) => r.json())
      .then((json) => {
        setReceipts(json.receipts || []);
        setLoading(false);
      })
      .catch(() => {
        setReceipts([]);
        setLoading(false);
      });
  }, [isDemoMode]);

  // Analytics Math
  const analytics = useMemo(() => {
    let totalSpend = 0;
    const supplierTotals: Record<string, number> = {};
    const itemFreq: Record<string, { count: number; spend: number }> = {};
    const priceBook: Record<string, { lastPrice: number; supplier: string; date: string }> = {};

    receipts.forEach(r => {
      const amount = Number(r.total_amount || 0);
      totalSpend += amount;

      const sup = r.supplier_name || "Unknown";
      supplierTotals[sup] = (supplierTotals[sup] || 0) + amount;

      if (r.line_items && Array.isArray(r.line_items)) {
        r.line_items.forEach(li => {
          if (!li.description && !li.trade_name) return;
          const desc = (li.trade_name || li.description || "").trim();
          
          // Track volume
          if (!itemFreq[desc]) itemFreq[desc] = { count: 0, spend: 0 };
          itemFreq[desc].count += (li.quantity || 1);
          itemFreq[desc].spend += (li.total || (li.quantity || 1) * (li.unit_price || 0));

          // Track latest price paid (since receipts are ordered descending by created_at)
          if (!priceBook[desc] && li.unit_price) {
            priceBook[desc] = {
              lastPrice: li.unit_price,
              supplier: sup,
              date: r.created_at ? new Date(r.created_at).toLocaleDateString() : "Recent"
            };
          }
        });
      }
    });

    const topSuppliers = Object.entries(supplierTotals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    const topItems = Object.entries(itemFreq)
      .sort((a, b) => b[1].spend - a[1].spend)
      .slice(0, 5);

    const latestPrices = Object.entries(priceBook).sort((a, b) => a[0].localeCompare(b[0]));

    return { totalSpend, topSuppliers, topItems, latestPrices };
  }, [receipts]);

  if (!isDemoMode) {
    return (
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-24 flex flex-col h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-2rem)] overflow-y-auto space-y-8">
        <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Material Cost Engine</h1>
            <p className="text-gray-500 mt-2">Auto-parse supply house receipts and allocate job costs.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/material-catalog" className="bg-white border border-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 shadow-sm">
              <Package size={18} /> Catalog
            </Link>
            <input 
              type="file" 
              accept="image/*" 
              capture="environment" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleScan}
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={scanning}
              className="bg-blue-600 text-white px-4 py-2.5 rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
            >
              {scanning ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
              {scanStatus || "Scan Receipt"}
            </button>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 md:p-8 text-white shadow-lg flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 flex-shrink-0">
          <div>
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <UploadCloud size={24} />
              Your Dedicated Ingestion Address
            </h2>
            <p className="text-blue-100 max-w-xl text-sm leading-relaxed">
              Set up auto-forwarding rules in your email for supply houses (Menards, Home Depot, CED). The AI will read the receipts, extract the totals, and log the job costs automatically.
            </p>
          </div>
          
          <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 w-full lg:w-auto lg:min-w-[320px]">
            <p className="text-xs text-blue-200 mb-1 font-semibold uppercase tracking-wider">Secret Forwarding Email</p>
            <div className="flex items-center gap-3 w-full overflow-hidden">
              <code className="text-sm md:text-base font-mono truncate">{forwardAddress}</code>
              <button 
                onClick={handleCopy}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
              >
                {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-shrink-0">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-center">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-2">
              <TrendingUp size={18} className="text-blue-600"/> Total Ingested Spend
            </h3>
            <p className="text-3xl font-bold text-gray-900">${analytics.totalSpend.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">Across {receipts.length} receipts</p>
          </div>

          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm md:col-span-2">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Building2 size={18} className="text-orange-600"/> Top Suppliers
            </h3>
            <div className="space-y-3">
              {analytics.topSuppliers.length === 0 && <p className="text-sm text-gray-500">No data yet.</p>}
              {analytics.topSuppliers.map(([name, total]) => (
                <div key={name} className="flex items-center justify-between text-sm">
                  <span className="font-medium text-gray-700">{name}</span>
                  <div className="flex items-center gap-3 w-2/3">
                    <div className="flex-1 bg-gray-100 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${Math.max(5, (total / analytics.totalSpend) * 100)}%` }}></div>
                    </div>
                    <span className="font-bold text-gray-900 w-20 text-right">${total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Items List */}
        {analytics.topItems.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
            <div className="p-5 border-b border-gray-200 bg-white">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><TrendingUp size={18} className="text-blue-600"/> Highest Volume Material</h2>
            </div>
            <div className="grid grid-cols-1 divide-y divide-gray-100">
              {analytics.topItems.map(([desc, data], i) => (
                <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">#{i + 1}</div>
                    <p className="font-medium text-gray-900 text-sm">{desc}</p>
                  </div>
                  <div className="text-right flex items-center gap-8">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Quantity</p>
                      <p className="text-sm font-medium text-gray-900">{data.count}</p>
                    </div>
                    <div className="w-24">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold mb-0.5">Total Spend</p>
                      <p className="text-sm font-bold text-blue-700">${data.spend.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Internal Price Book */}
        {analytics.latestPrices.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
            <div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Search size={18} className="text-emerald-600"/> Internal Price Book
              </h2>
              <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2 py-1 rounded-md border border-emerald-200">
                Auto-updated from receipts
              </span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                  <tr>
                    <th className="py-3 px-4 font-semibold text-gray-600">Material (Trade Name)</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-right">Last Price Paid</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-right">Supplier</th>
                    <th className="py-3 px-4 font-semibold text-gray-600 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {analytics.latestPrices.map(([desc, data], i) => (
                    <div key={i} className="contents hover:bg-gray-50 transition-colors">
                      <tr>
                        <td className="py-3 px-4 font-medium text-gray-900">{desc}</td>
                        <td className="py-3 px-4 text-right font-bold text-emerald-700">${data.lastPrice.toFixed(2)}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{data.supplier}</td>
                        <td className="py-3 px-4 text-right text-gray-400">{data.date}</td>
                      </tr>
                    </div>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Receipts Feed */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-shrink-0">
          <div className="p-5 border-b border-gray-200 bg-white flex items-center justify-between">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <FileText size={18} className="text-orange-500" /> Recent Receipts
            </h2>
            <button onClick={() => window.location.reload()} className="text-xs font-medium text-gray-600 hover:text-gray-900 flex items-center gap-1.5 border border-gray-200 px-3 py-1.5 rounded-lg bg-white shadow-sm hover:bg-gray-50 transition-colors">
              <RefreshCw size={14} /> Refresh
            </button>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : receipts.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No receipts yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {receipts.map((r) => {
                const isExpanded = expandedReceiptId === r.id;
                return (
                  <div key={r.id} className="flex flex-col">
                    <div 
                      onClick={() => setExpandedReceiptId(isExpanded ? null : r.id)}
                      className="p-5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-blue-50 p-3 rounded-lg text-blue-600">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{r.supplier_name || "Unknown Supplier"}</p>
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-gray-500">{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</p>
                            {r.jobs?.title && (
                              <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded border border-gray-200">
                                Job: {r.jobs.title}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <p className="font-bold text-gray-900 text-lg">{typeof r.total_amount === 'number' ? `$${r.total_amount.toFixed(2)}` : ""}</p>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 inline-block ${r.status === 'Action Required' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>{r.status}</span>
                        </div>
                        <div className="text-gray-400">
                          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>
                    </div>
                    
                    {isExpanded && r.line_items && r.line_items.length > 0 && (
                      <div className="bg-gray-50 p-6 border-t border-gray-100 overflow-x-auto">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Itemized Breakdown</h4>
                        <table className="w-full text-sm text-left">
                          <thead>
                            <tr className="text-gray-500 border-b border-gray-200">
                              <th className="pb-2 font-semibold">Description</th>
                              <th className="pb-2 font-semibold text-right">Qty</th>
                              <th className="pb-2 font-semibold text-right">Unit Price</th>
                              <th className="pb-2 font-semibold text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {r.line_items.map((li, i) => (
                              <tr key={i} className="text-gray-800">
                                <td className="py-2 pr-4">
                                  <div className="font-medium text-gray-900">{li.trade_name || li.description || "Unknown item"}</div>
                                  {li.original_part_number && <div className="text-xs text-gray-500 font-mono mt-0.5">{li.original_part_number}</div>}
                                </td>
                                <td className="py-2 text-right">{li.quantity || "-"}</td>
                                <td className="py-2 text-right">{li.unit_price ? `$${li.unit_price.toFixed(2)}` : "-"}</td>
                                <td className="py-2 text-right font-medium">{li.total ? `$${li.total.toFixed(2)}` : "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                    {isExpanded && (!r.line_items || r.line_items.length === 0) && (
                      <div className="bg-gray-50 p-6 border-t border-gray-100 text-sm text-gray-500">
                        No line items parsed from this receipt.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  return <div>Demo Mode Not Used Right Now</div>;
}
