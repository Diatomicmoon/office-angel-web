"use client";

import { Inbox, FileText, CheckCircle2, AlertCircle, HardHat, FileSignature, ArrowRight, Settings, UploadCloud, Copy, X, BarChart3, TrendingUp, Building2, Clock, Search, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

type Receipt = {
  id: string;
  supplier_name?: string;
  total_amount?: number;
  status?: string;
  created_at?: string;
};

export default function InboxPage() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!isDemoMode);
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [showPermitAnalytics, setShowPermitAnalytics] = useState(false);
  const [showSupplyDetails, setShowSupplyDetails] = useState(false);

  const forwardAddress = "inbox+hardhat@officeangel.ai";

  const handleCopy = () => {
    navigator.clipboard.writeText(forwardAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (isDemoMode) return;
    setLoading(true);
    fetch("/api/receipts?limit=25")
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

  if (!isDemoMode) {
    return (
      <div className="max-w-7xl mx-auto p-8 flex flex-col h-[calc(100vh-2rem)] overflow-y-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Inbox</h1>
          <p className="text-gray-500 mt-2">Receipts + cost intake. (Material Cost Engine — live DB)</p>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">Forward receipts to:</p>
            <p className="text-sm text-gray-600 font-mono mt-1">{forwardAddress}</p>
          </div>
          <button
            onClick={handleCopy}
            className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-semibold"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Recent Receipts</h2>
            <a href="/dashboard" className="text-xs font-bold text-blue-700 hover:text-blue-900">Back to Dashboard →</a>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading…</div>
          ) : receipts.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No receipts yet.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {receipts.map((r) => (
                <div key={r.id} className="p-5 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{r.supplier_name || "Supplier"}</p>
                    <p className="text-xs text-gray-500 mt-1">{r.created_at ? new Date(r.created_at).toLocaleString() : ""}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{typeof r.total_amount === 'number' ? `$${r.total_amount.toFixed(2)}` : ""}</p>
                    <p className="text-xs font-semibold text-gray-500 mt-1">{r.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  const inboxItems = [
    {
      id: 1,
      type: "supply",
      sender: "Home Depot Pro",
      subject: "Your eReceipt from Store #2804",
      amount: "$428.15",
      job: "1042 Elm St (Panel Upgrade)",
      status: "Mapped to Job Costing",
      date: "10 min ago",
      icon: <FileText size={20} className="text-orange-500" />
    },
    {
      id: 2,
      type: "permit",
      sender: "City of Minneapolis - Inspections",
      subject: "Permit #E-26-08192 Approved",
      amount: null,
      job: "8890 Lakeview Dr (EV Charger)",
      status: "Inspection Scheduled",
      date: "2 hrs ago",
      icon: <FileSignature size={20} className="text-blue-500" />
    },
    {
      id: 3,
      type: "supply",
      sender: "Viking Electric Supply",
      subject: "Invoice #V-901824",
      amount: "$1,240.00",
      job: "Unassigned (Truck Stock?)",
      status: "Action Required",
      date: "5 hrs ago",
      icon: <AlertCircle size={20} className="text-red-500" />
    },
    {
      id: 4,
      type: "permit",
      sender: "St. Paul Permit Portal",
      subject: "Inspection Failed - Rough In",
      amount: null,
      job: "12 Summit Ave (Remodel)",
      status: "Dispatch Alert Sent",
      date: "Yesterday",
      icon: <HardHat size={20} className="text-red-500" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-8 flex flex-col h-[calc(100vh-2rem)] overflow-y-auto space-y-8">
      
      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">AI Inbox & Forwarding</h1>
          <p className="text-gray-500 mt-2">Auto-parse supply house receipts and city permit emails into your CRM.</p>
        </div>
        <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2">
          <Settings size={18} /> Routing Rules
        </button>
      </div>

      {/* Secret Address Config */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-8 text-white shadow-lg flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
            <UploadCloud size={24} />
            Your Dedicated Ingestion Address
          </h2>
          <p className="text-blue-100 max-w-xl text-sm">
            Set up auto-forwarding rules in your Gmail/Outlook for your supply houses (Menards, Home Depot, CED) and local city inspectors. The AI will read the PDF receipts, extract the totals, and log the job costs automatically.
          </p>
        </div>
        
        <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm border border-white/10 min-w-[320px]">
          <p className="text-xs text-blue-200 mb-1 font-semibold uppercase tracking-wider">Secret Forwarding Email</p>
          <div className="flex items-center gap-3">
            <code className="text-lg font-mono">{forwardAddress}</code>
            <button 
              onClick={handleCopy}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            >
              {copied ? <CheckCircle2 size={18} className="text-green-400" /> : <Copy size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout for Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Supply Runner Stats */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-orange-100 p-2 rounded-lg">
                <FileText size={20} className="text-orange-600" />
              </div>
              <h3 className="font-bold text-gray-900">Supply Runner OCR</h3>
            </div>
            <p className="text-sm text-gray-500">Receipts processed this month</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-gray-900">142</p>
            <p className="text-sm text-green-600 font-medium mt-1">$12,450 Tracked</p>
          </div>
        </div>

        {/* Permit Tracking Stats */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-blue-100 p-2 rounded-lg">
                <FileSignature size={20} className="text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900">Permit & Inspection AI</h3>
            </div>
            <p className="text-sm text-gray-500">Active permits being tracked</p>
          </div>
          <div className="text-right flex flex-col items-end">
            <p className="text-3xl font-bold text-gray-900">18</p>
            <button 
              onClick={() => setShowPermitAnalytics(true)}
              className="text-xs text-blue-600 font-bold mt-2 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              <BarChart3 size={14} /> View Analytics Breakdown
            </button>
          </div>
        </div>

      </div>

      {/* Inbox Feed */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex-1">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Inbox size={18} /> Recent Ingested Emails
          </h2>
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
            Listening for new emails...
          </span>
        </div>
        
        <div className="divide-y divide-gray-100">
          {inboxItems.map((item) => (
            <div 
              key={item.id} 
              onClick={() => item.id === 1 ? setShowSupplyDetails(true) : null}
              className="p-4 hover:bg-gray-50 transition-colors flex items-center justify-between group cursor-pointer"
            >
              
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${
                  item.type === 'supply' ? 'bg-orange-50' : 'bg-blue-50'
                }`}>
                  {item.icon}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900">{item.sender}</h4>
                    <span className="text-xs text-gray-400 font-medium">{item.date}</span>
                  </div>
                  <p className="text-sm text-gray-600 font-medium mt-0.5">{item.subject}</p>
                  
                  <div className="flex items-center gap-3 mt-2">
                    <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                      Job: {item.job}
                    </span>
                    {item.amount && (
                      <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2 py-1 rounded border border-orange-100">
                        {item.amount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-right">
                <div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    item.status.includes('Required') || item.status.includes('Failed') 
                      ? 'bg-red-100 text-red-700' 
                      : 'bg-green-100 text-green-700'
                  }`}>
                    {item.status}
                  </span>
                </div>
                <button className="p-2 text-gray-400 group-hover:text-blue-600 transition-colors">
                  <ArrowRight size={20} />
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>

      {showPermitAnalytics && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-[slideUp_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileSignature className="text-blue-600" size={24} /> Permit & Inspection Analytics
                </h2>
                <p className="text-sm text-gray-500 mt-1">YTD breakdown of municipal fees and inspection pass rates.</p>
              </div>
              <button onClick={() => setShowPermitAnalytics(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto bg-white space-y-8">
              {/* Top Level Stats */}
              <div className="grid grid-cols-4 gap-4">
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Permits YTD</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">142</p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Avg Permit Cost</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">$125.50</p>
                </div>
                <div className="p-4 border border-orange-100 rounded-xl bg-orange-50">
                  <p className="text-xs font-semibold text-orange-700 uppercase tracking-wider">Avg Admin Time/Permit</p>
                  <p className="text-2xl font-bold text-orange-700 mt-1 flex items-center gap-2">42m <Clock size={20} className="opacity-50" /></p>
                </div>
                <div className="p-4 border border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Fees Paid</p>
                  <p className="text-2xl font-bold text-red-600 mt-1">$17,821</p>
                </div>
                <div className="p-4 border border-green-100 rounded-xl bg-green-50">
                  <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">First-Time Pass Rate</p>
                  <p className="text-2xl font-bold text-green-700 mt-1">94.2%</p>
                </div>
              </div>

              {/* City Breakdown & Inspection Types */}
              <div className="grid grid-cols-2 gap-8">
                
                {/* Municipalities List */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" /> Admin Time by Municipality (Avg)
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Minneapolis (Slowest)</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                        <span className="text-sm font-bold w-12 text-red-600">1h 15m</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">St. Paul</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div className="bg-orange-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <span className="text-sm font-bold w-12 text-orange-600">55m</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Edina</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                        </div>
                        <span className="text-sm font-bold w-12 text-yellow-600">35m</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Minnetonka</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                        </div>
                        <span className="text-sm font-bold w-12 text-green-600">15m</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">Maple Grove (Fastest)</span>
                      <div className="flex items-center gap-3">
                        <div className="w-32 bg-gray-100 rounded-full h-2">
                          <div className="bg-green-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                        </div>
                        <span className="text-sm font-bold w-12 text-green-500">10m</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspection Types */}
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-gray-500" /> Inspections by Stage (YTD)
                  </h3>
                  <div className="space-y-4">
                    <div className="p-3 border border-gray-100 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900">Rough-In Inspections</p>
                        <p className="text-xs text-gray-500">Passed: 88 • Failed: 4</p>
                      </div>
                      <span className="text-xl font-bold text-gray-700">92</span>
                    </div>
                    
                    <div className="p-3 border border-gray-100 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900">Final Inspections</p>
                        <p className="text-xs text-gray-500">Passed: 45 • Failed: 1</p>
                      </div>
                      <span className="text-xl font-bold text-gray-700">46</span>
                    </div>

                    <div className="p-3 border border-gray-100 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-gray-900">Trench / Underground</p>
                        <p className="text-xs text-gray-500">Passed: 4 • Failed: 0</p>
                      </div>
                      <span className="text-xl font-bold text-gray-700">4</span>
                    </div>
                  </div>
                </div>

              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl flex items-start gap-3">
                  <AlertCircle className="text-orange-600 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-orange-900">AI Cost Alert</h4>
                    <p className="text-sm text-orange-800 mt-1">St. Paul permit fees have increased by an average of 14% compared to last year. The AI recommends updating your default municipal fee markup in the Bid Writer to preserve margin.</p>
                  </div>
                </div>
                
                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3">
                  <Clock className="text-red-600 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-red-900">Hidden Labor Warning</h4>
                    <p className="text-sm text-red-800 mt-1">Minneapolis permits are costing you ~$55/ea in unbilled administrative time (1h 15m avg). Consider adding a specific "Minneapolis Expediter Fee" to future bids.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSupplyDetails && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-[slideUp_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <FileText className="text-orange-600" size={24} /> Receipt Parsing & Sync
                </h2>
                <p className="text-sm text-gray-500 mt-1">Home Depot Pro • Store #2804 • Mapped to: 1042 Elm St (Panel Upgrade)</p>
              </div>
              <button onClick={() => setShowSupplyDetails(false)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            <div className="flex flex-1 overflow-hidden">
              {/* Left Side: Receipt & Line Items */}
              <div className="w-3/5 border-r border-gray-200 p-6 overflow-y-auto bg-white">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Search size={16} className="text-blue-600" /> AI Line Item Extraction
                </h3>
                
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-500 uppercase bg-gray-50 rounded-lg">
                    <tr>
                      <th className="px-4 py-3 rounded-tl-lg">Item</th>
                      <th className="px-4 py-3">Qty</th>
                      <th className="px-4 py-3">Unit Cost</th>
                      <th className="px-4 py-3 rounded-tr-lg">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">Square D 200A 40-Space Panel</td>
                      <td className="px-4 py-3 text-gray-700">1</td>
                      <td className="px-4 py-3 text-gray-700">$189.00</td>
                      <td className="px-4 py-3 font-bold text-gray-900">$189.00</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">20A Single Pole Breaker HOM</td>
                      <td className="px-4 py-3 text-gray-700">12</td>
                      <td className="px-4 py-3 text-gray-700">$6.50</td>
                      <td className="px-4 py-3 font-bold text-gray-900">$78.00</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">12/2 NM-B Romex (250ft)</td>
                      <td className="px-4 py-3 text-gray-700">1</td>
                      <td className="px-4 py-3 text-gray-700">$134.50</td>
                      <td className="px-4 py-3 font-bold text-gray-900">$134.50</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-gray-900">Miscellaneous Fittings/Screws</td>
                      <td className="px-4 py-3 text-gray-700">1</td>
                      <td className="px-4 py-3 text-gray-700">$26.65</td>
                      <td className="px-4 py-3 font-bold text-gray-900">$26.65</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50">
                      <td colSpan={3} className="px-4 py-3 text-right font-bold text-gray-700">Subtotal</td>
                      <td className="px-4 py-3 font-bold text-gray-900">$428.15</td>
                    </tr>
                  </tfoot>
                </table>

                <div className="mt-6 p-4 border border-blue-100 bg-blue-50 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="text-blue-600 mt-0.5" size={18} />
                  <div>
                    <h4 className="text-sm font-bold text-blue-900">Markup Applied (7%)</h4>
                    <p className="text-sm text-blue-800 mt-1">Based on your global settings, a 7% material markup ($29.97) has been automatically calculated for the final Time & Material invoice.</p>
                  </div>
                </div>
              </div>

              {/* Right Side: Sync & Integration Status */}
              <div className="w-2/5 p-6 bg-gray-50 overflow-y-auto">
                <h3 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <RefreshCw size={16} className="text-gray-500" /> Integration Sync Status
                </h3>
                
                <div className="space-y-4">
                  {/* Internal Office Angel */}
                  <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white font-bold text-xs">OA</div>
                        <span className="font-bold text-gray-900">Office Angel Dashboard</span>
                      </div>
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Synced</span>
                    </div>
                    <p className="text-xs text-gray-500">Logged to Financials &gt; Live Job Costing for 1042 Elm St.</p>
                  </div>

                  {/* QuickBooks */}
                  <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-green-600 flex items-center justify-center text-white font-bold text-xs">qb</div>
                        <span className="font-bold text-gray-900">QuickBooks Online</span>
                      </div>
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Synced</span>
                    </div>
                    <p className="text-xs text-gray-500">Expense created ($428.15) and categorized as "Cost of Goods Sold - Materials".</p>
                  </div>

                  {/* Jobber / ServiceTitan */}
                  <div className="p-4 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">J</div>
                        <span className="font-bold text-gray-900">Jobber (Invoicing)</span>
                      </div>
                      <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full flex items-center gap-1"><CheckCircle2 size={12}/> Synced</span>
                    </div>
                    <p className="text-xs text-gray-500">Line items + 7% markup pushed to Draft Invoice #1042.</p>
                  </div>
                </div>

                <div className="mt-6 text-center">
                  <button className="text-sm font-medium text-gray-500 hover:text-gray-900 underline decoration-gray-300 underline-offset-4">
                    Configure Integration Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
// TODO: V2 Architecture Note - Permit Time Tracking
// The 'Avg Admin Time/Permit' is currently mocked. In production, this will be calculated by:
// 1. Ingesting timestamps via the inbox+hardhat email forwarding (Application Started vs Permit Approved).
// 2. Subtracting passive waiting time (city processing time) to isolate active contractor touchpoints.
// 3. For portal-based cities (no emails), introducing an active timer in the UI for office admins to clock in/out of specific permit tasks.
// 4. Aggregating these active labor blocks by municipality to automatically calculate the true "Hidden Labor Cost" and suggest bid markups.
