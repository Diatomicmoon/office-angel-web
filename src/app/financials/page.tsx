"use client";

import { useState, useEffect } from "react";
import { DollarSign, TrendingUp, TrendingDown, Users, CreditCard, PieChart, FileText, AlertCircle, PhoneMissed, Truck, Clock } from "lucide-react";
import Link from "next/link";
import InvoicesTab from "./InvoicesTab";
import ManualLedgerModal from "./ManualLedgerModal";
import { PlusCircle } from "lucide-react";
import { FileText as FileTextIcon } from "lucide-react";
import { getCookie } from "cookies-next";

export default function FinancialsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [ghlStats, setGhlStats] = useState<any>(null);
  const [view, setView] = useState<"overview" | "invoices">("overview");
  const [showManualModal, setShowManualModal] = useState(false);
  const [isDevAccount, setIsDevAccount] = useState(false);

  useEffect(() => {
    fetch("/api/companies/mine")
      .then(res => res.json())
      .then(json => {
        const ids = json.companies?.map((c: any) => c.id) || [];
        const isDev = ids.includes("5341bfb2-8fce-4c7a-9a30-20e6aba60a8a") || ids.includes("a293eb4c-6a95-40b8-8324-bc493ec6b227");
        setIsDevAccount(isDev);
      })
      .catch(() => {});

    fetch("/api/quickbooks/test")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
    fetch("/api/ghl/stats")
      .then(res => res.json())
      .then(json => setGhlStats(json))
      .catch(() => {});
  }, []);

  return (
    <>
      {showManualModal && <ManualLedgerModal onClose={() => setShowManualModal(false)} onSuccess={() => { setShowManualModal(false); /* Ideally fetch data again */ }} />}
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8 h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-2rem)] overflow-y-auto">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between items-start md:items-end gap-4">
        <div className="w-full md:w-auto">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Financial Command</h1>
          <p className="text-gray-500 mt-2">Accounts Receivable, Profitability, and Cash Flow.</p>
        </div>
        
        {/* Navigation Pills */}
        <div className="flex bg-gray-100 p-1 rounded-xl items-center w-full md:w-auto md:mr-auto md:ml-8">
          <button 
            onClick={() => setView('overview')}
            className={`flex-1 md:flex-none px-4 py-2 text-sm font-medium rounded-lg transition ${view === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Overview
          </button>
          <button 
            onClick={() => setView('invoices')}
            className={`flex-1 md:flex-none justify-center px-4 py-2 text-sm font-medium rounded-lg transition flex items-center gap-2 ${view === 'invoices' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            <FileTextIcon className="w-4 h-4" /> Invoices
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full md:flex md:flex-wrap md:w-auto md:gap-3 md:items-center">
          {data?.error ? (
             <div className="col-span-2 md:col-span-1 bg-red-50 text-red-800 text-xs font-bold px-3 py-2 rounded-md border border-red-200 flex justify-center items-center gap-2 whitespace-nowrap">
               <AlertCircle size={14} /> <span className="hidden sm:inline">QuickBooks Error: {data.error.substring(0,30)}...</span><span className="sm:hidden">QB Error</span>
             </div>
          ) : (
             <div className="col-span-2 md:col-span-1 bg-green-50 text-green-800 text-xs font-bold px-3 py-2 rounded-md border border-green-200 flex justify-center items-center gap-2 whitespace-nowrap">
               <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div> Live Sync Active
             </div>
          )}
          <button onClick={() => setShowManualModal(true)} className="flex-1 bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all flex justify-center items-center gap-2 whitespace-nowrap">
            <PlusCircle size={16} /> <span className="hidden sm:inline">Log Manual</span><span className="sm:hidden">Log</span>
          </button>
          <button onClick={() => setView('invoices')} className="flex-1 bg-blue-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm transition-all flex justify-center items-center gap-2 whitespace-nowrap">
            <DollarSign className="w-4 h-4" /> <span className="hidden sm:inline">Invoices</span><span className="sm:hidden">Invoice</span>
          </button>
          <Link href="/settings" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm transition-all hidden lg:flex whitespace-nowrap">
            Manage Accounting
          </Link>
          {isDevAccount && (
            <a href="/api/stripe/onboard" target="_blank" rel="noopener noreferrer" className="col-span-2 bg-[#635BFF] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#5851E5] shadow-sm transition-all flex justify-center items-center gap-2 whitespace-nowrap">
              Connect Stripe
            </a>
          )}
        </div>
      </div>

      {loading ? (
         <div className="py-20 text-center text-gray-500">Loading financial data...</div>
      ) : view === 'invoices' ? (
        <InvoicesTab />
      ) : (
        <>
          {/* GHL Pipeline Banner */}
          {ghlStats && !ghlStats.error && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-100 p-2 rounded-lg"><Users size={18} className="text-indigo-600" /></div>
                <div>
                  <p className="text-sm font-semibold text-indigo-900">GHL CRM Pipeline — CR</p>
                  <p className="text-xs text-indigo-600">{ghlStats.totalLeads?.toLocaleString()} total contacts · {ghlStats.recentLeads} new this week</p>
                </div>
              </div>
              <Link href="/crm" className="text-xs font-bold text-indigo-700 hover:underline">View in CRM →</Link>
            </div>
          )}

          {/* Core KPIs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-4">
                <h3 className="font-medium text-sm">Money Outstanding (A/R)</h3>
                <div className="bg-red-50 p-2 rounded-lg"><CreditCard size={18} className="text-red-600" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">${(data.report?.accountsReceivable || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <p className="text-sm text-red-600 font-medium mt-2 flex items-center gap-1">
                <TrendingUp size={14} /> {data.report?.openInvoicesCount || 0} Open Invoices
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <div className="flex items-center justify-between text-gray-500 mb-4">
                <h3 className="font-medium text-sm">Gross Profit</h3>
                <div className="bg-blue-50 p-2 rounded-lg"><DollarSign size={18} className="text-blue-600" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">${(data.report?.grossProfit || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <p className="text-sm text-gray-400 font-medium mt-2 flex items-center gap-1">Year to date</p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-green-100 bg-green-50/30 shadow-sm">
              <div className="flex items-center justify-between text-green-700 mb-4">
                <h3 className="font-medium text-sm">Net Income</h3>
                <div className="bg-green-100 p-2 rounded-lg"><TrendingUp size={18} className="text-green-600" /></div>
              </div>
              <p className="text-3xl font-bold text-green-900">${(data.report?.netIncome || 0).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
              <p className="text-sm text-green-700 font-medium mt-2 flex items-center gap-1">After total expenses</p>
            </div>
          </div>

          {/* Operational ROI & Leaks (The "Owner's View") */}
          <div className="mt-8 mb-4">
            <h2 className="text-xl font-bold tracking-tight text-gray-900">Operational ROI & Leaks</h2>
            <p className="text-sm text-gray-500">Hidden costs and automated revenue generation (Last 30 Days).</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-green-500"></div>
              <div className="flex items-center justify-between text-gray-500 mb-4">
                <h3 className="font-medium text-sm text-green-800">AI Rescued Revenue</h3>
                <div className="bg-green-50 p-2 rounded-lg"><PhoneMissed size={18} className="text-green-600" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">${(data.report?.aiRescued?.value || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500 font-medium mt-2">
                Based on <span className="font-bold text-gray-900">{data.stats?.emergencies || data.report?.aiRescued?.calls || 0}</span> high-intent calls handled
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
              <div className="flex items-center justify-between text-gray-500 mb-4">
                <h3 className="font-medium text-sm text-red-800">Material Run Bleed</h3>
                <div className="bg-red-50 p-2 rounded-lg"><Truck size={18} className="text-red-600" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">${(data.report?.materialBleed?.lostLaborValue || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500 font-medium mt-2">
                Lost labor from <span className="font-bold text-gray-900">{data.report?.materialBleed?.runs || 0}</span> mid-day supply house runs
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl border border-yellow-200 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-2 h-full bg-yellow-500"></div>
              <div className="flex items-center justify-between text-gray-500 mb-4">
                <h3 className="font-medium text-sm text-yellow-800">Permit & Admin Drag</h3>
                <div className="bg-yellow-50 p-2 rounded-lg"><Clock size={18} className="text-yellow-600" /></div>
              </div>
              <p className="text-3xl font-bold text-gray-900">${(data.report?.permitDrag?.adminCost || 0).toLocaleString()}</p>
              <p className="text-sm text-gray-500 font-medium mt-2">
                City waiting average: <span className="font-bold text-gray-900">{data.report?.permitDrag?.avgDays || 0} days</span>
              </p>
            </div>
          </div>

          {/* Billing & Invoices Tab */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard size={18} className="text-gray-500" /> Recent Invoices
              </h2>
              <button className="text-blue-600 text-sm font-medium hover:underline">View All in Stripe ↗</button>
            </div>
            <div className="divide-y divide-gray-100 p-0 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/50 text-gray-500">
                  <tr>
                    <th className="px-6 py-3 font-medium">Customer</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                    <th className="px-6 py-3 font-medium">Status</th>
                    <th className="px-6 py-3 font-medium">Sent Via</th>
                    <th className="px-6 py-3 font-medium text-right">Payment Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">John Smith</td>
                    <td className="px-6 py-4 font-medium text-gray-900">$450.00</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                        Paid
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">Hard Hat Solutions (SMS)</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-gray-400 text-xs">Closed</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">Sarah Johnson</td>
                    <td className="px-6 py-4 font-medium text-gray-900">$1,200.00</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-xs">Hard Hat Solutions (SMS)</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-blue-600 font-medium hover:underline">Copy Link</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Canvassing Leaderboard */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-gray-500" /> Door-to-Door Leaderboard
              </h2>
            </div>
            <div className="divide-y divide-gray-100 p-0 overflow-x-auto">
              {data.canvassingLeaderboard && data.canvassingLeaderboard.length > 0 ? (
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Sales Rep</th>
                      <th className="px-6 py-3 font-medium">Total Doors Knocked</th>
                      <th className="px-6 py-3 font-medium text-right">Hot Leads Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.canvassingLeaderboard.map((rep: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                          {idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : ""} {rep.name}
                        </td>
                        <td className="px-6 py-4 text-gray-600 font-medium">{rep.knocks} doors</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${rep.hot > 0 ? 'bg-orange-100 text-orange-800' : 'bg-gray-100 text-gray-600'}`}>
                            🔥 {rep.hot} Hot
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-500">No field reps have logged visits yet.</div>
              )}
            </div>
          </div>
          
          {/* Profit by Crew Leaderboard */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users size={18} className="text-gray-500" /> Profitability by Crew
                </h2>
              </div>
              <div className="divide-y divide-gray-100 p-0 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50/50 text-gray-500">
                    <tr>
                      <th className="px-6 py-3 font-medium">Crew / Technician</th>
                      <th className="px-6 py-3 font-medium">Revenue Built</th>
                      <th className="px-6 py-3 font-medium">Labor/Material Cost</th>
                      <th className="px-6 py-3 font-medium text-right">Profit Margin</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {data.report?.profitByCrew?.map((crew: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-semibold text-gray-900">{crew.name}</td>
                        <td className="px-6 py-4 text-gray-600">${crew.revenue.toLocaleString()}</td>
                        <td className="px-6 py-4 text-red-500">${crew.cost.toLocaleString()}</td>
                        <td className="px-6 py-4 text-right">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${parseFloat(crew.margin) > 50 ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                            {crew.margin}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Expenses Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <PieChart size={18} className="text-gray-500" /> Expense Categories
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {data.report?.topExpenseCategories?.map((exp: any, idx: number) => {
                    // Quick calculation for the bar chart width relative to total expenses
                    const percentage = Math.round((exp.amount / (data.report.totalExpenses || 10000)) * 100);
                    return (
                      <div key={idx}>
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-medium text-gray-700">{exp.name}</span>
                          <span className="text-sm font-semibold text-gray-900">${exp.amount.toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div className="bg-red-400 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <Link href="/receipts" className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    <FileText size={16} /> View all scanned receipts & bills →
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </>
      )}
    </div>
    </>
  );
}
