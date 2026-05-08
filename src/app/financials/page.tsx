"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, Clock, ArrowUpRight, FileText, CheckCircle2, Mail, Star, RefreshCw, AlertCircle, ShieldCheck, Wallet, HardHat, Award, BarChart3, PieChart, Activity, PhoneMissed, X } from "lucide-react";
import { NotWired } from "@/components/NotWired";

export default function Financials() {
  const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
  if (!isDemoMode) {
    return (
      <NotWired
        title="Financials"
        subtitle="This screen is still demo UI (fake KPIs/invoices). We’ll wire it to Supabase + QuickBooks/Stripe next."
      />
    );
  }

  const [syncing, setSyncing] = useState(false);
  const [actionStatus, setActionStatus] = useState<Record<string, string>>({});
  const [viewingPunches, setViewingPunches] = useState<string | null>(null);

  const mockInvoices = [
    { id: "INV-2041", name: "Tech Solutions LLC", amount: "$4,500", status: "Past Due", date: "Apr 15, 2026", days: "18 days late" },
    { id: "INV-2043", name: "Sarah Jenkins", amount: "$850", status: "Pending", date: "May 2, 2026", days: "Due in 14 days" },
    { id: "INV-2042", name: "John Martinez", amount: "$2,850", status: "Paid", date: "May 1, 2026", days: "Paid on time" },
    { id: "INV-2040", name: "Mike Johnson (Emergency)", amount: "$450", status: "Paid", date: "Apr 30, 2026", days: "Paid on time" }
  ];

  const handleAction = (id: string, type: 'reminder' | 'review') => {
    setActionStatus(prev => ({ 
      ...prev, 
      [id]: type === 'reminder' ? 'Reminder Sent ✓' : 'Review Link Sent ✓' 
    }));
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => setSyncing(false), 1500);
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 h-[calc(100vh-2rem)] overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">Financials & Operations</h1>
        <p className="text-gray-500 mt-2">Live profitability, AI revenue, payroll tracking, and Accounts Receivable.</p>
      </div>

      {/* Row 1: The "Why you pay us" KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5">
            <DollarSign size={120} className="text-gray-500 -mr-4 -mt-4" />
          </div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total MTD Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">$84,500</p>
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-gray-600 bg-gray-50 w-fit px-2 py-1 rounded-full border border-gray-100">
            <TrendingUp size={14} />
            <span>Gross Billed</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-blue-200 shadow-sm relative overflow-hidden ring-1 ring-blue-50">
          <div className="absolute right-0 top-0 opacity-5">
            <Activity size={120} className="text-blue-500 -mr-4 -mt-4" />
          </div>
          <h3 className="text-sm font-medium text-blue-600 mb-2">AI Booked Revenue</h3>
          <p className="text-3xl font-bold text-gray-900">$14,250</p>
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-blue-700 bg-blue-50 w-fit px-2 py-1 rounded-full border border-blue-100">
            <CheckCircle2 size={14} />
            <span>16.8% of total gross</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-green-200 shadow-sm relative overflow-hidden ring-1 ring-green-50">
          <div className="absolute right-0 top-0 opacity-5">
            <ShieldCheck size={120} className="text-green-500 -mr-4 -mt-4" />
          </div>
          <h3 className="text-sm font-medium text-green-700 mb-2">Missed Call Rescue</h3>
          <p className="text-3xl font-bold text-gray-900">$3,200</p>
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-green-700 bg-green-50 w-fit px-2 py-1 rounded-full border border-green-100">
            <PhoneMissed size={14} />
            <span>4 after-hours jobs saved</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-red-200 shadow-sm relative overflow-hidden ring-1 ring-red-50">
          <div className="absolute right-0 top-0 opacity-5">
            <Wallet size={120} className="text-red-500 -mr-4 -mt-4" />
          </div>
          <h3 className="text-sm font-medium text-red-600 mb-2">Money on the Street (A/R)</h3>
          <p className="text-3xl font-bold text-gray-900">$18,400</p>
          <div className="flex items-center gap-2 mt-4 text-xs font-medium text-red-700 bg-red-50 w-fit px-2 py-1 rounded-full border border-red-100">
            <AlertCircle size={14} />
            <span>$4,500 is 60+ days late</span>
          </div>
        </div>
      </div>

      {/* Row 2: Operations & Gamification */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Payroll & Labor ROI */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Live Timesheets & Labor Leakage</h2>
              <p className="text-sm text-gray-500">Identify unapplied time before payroll is run.</p>
            </div>
            <button className="text-xs font-medium text-blue-600 hover:text-blue-800">Export CSV</button>
          </div>

          <div className="flex gap-6 items-center mb-6">
            <div className="relative h-24 w-24 flex-shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-gray-100" />
                <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="12" fill="transparent" strokeDasharray="251" strokeDashoffset="45" className="text-blue-600" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-gray-900">82%</span>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Payroll Hours</span>
                <span className="font-bold text-gray-900">120 hrs</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Billed to Customers</span>
                <span className="font-bold text-blue-600">98 hrs</span>
              </div>
              <div className="p-2 bg-orange-50 rounded text-xs font-semibold text-orange-800 flex items-center justify-between mt-2">
                <span className="flex items-center gap-1"><AlertCircle size={14} /> Leakage: 22h</span>
                <span>~$880 loss</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-3">
              {/* Tech 1 Timecard */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-700">M</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Mike (Truck 1)</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Clocked In: 42.5h</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingPunches("Mike (Truck 1)")}
                  className="text-xs font-medium text-blue-600 bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                >
                  View Punches
                </button>
              </div>

              {/* Tech 2 Timecard */}
              <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-700">D</div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Dave (Truck 2)</p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Clocked In: 38.0h</p>
                  </div>
                </div>
                <button 
                  onClick={() => setViewingPunches("Dave (Truck 2)")}
                  className="text-xs font-medium text-blue-600 bg-white border border-gray-200 px-3 py-1.5 rounded hover:bg-gray-50 transition-colors"
                >
                  View Punches
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Live Job Costing & Margins */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Live Job Costing & Margins</h2>
              <p className="text-sm text-gray-500">Based on last 10 completed jobs</p>
            </div>
            <span className="flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              <FileText size={14} /> Supply Runner OCR Active
            </span>
          </div>
          
          <div className="space-y-6 flex-1">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Gross Revenue</span>
                <span className="font-bold text-gray-900">$45,000</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div className="bg-gray-800 h-4 rounded-full" style={{ width: '100%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Materials (via OCR Invoices)</span>
                <span className="font-bold text-orange-600">$12,150 (27%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div className="bg-orange-500 h-4 rounded-full" style={{ width: '27%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="font-medium text-gray-700">Labor (Burdened)</span>
                <span className="font-bold text-blue-600">$14,850 (33%)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4">
                <div className="bg-blue-500 h-4 rounded-full" style={{ width: '33%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100">
              <div className="flex justify-between text-base mb-1">
                <span className="font-bold text-gray-900">Actual Net Profit</span>
                <span className="font-bold text-green-600">$18,000 (40% Margin)</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 mt-2">
                <div className="bg-green-500 h-4 rounded-full" style={{ width: '40%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Tech Leaderboard & Upsells */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tech Leaderboard & Spiffs</h2>
              <p className="text-sm text-gray-500">Track field performance and upsell commissions</p>
            </div>
            <Award size={24} className="text-yellow-500" />
          </div>

          <div className="space-y-4">
            {/* Tech 1 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">1</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Mike (Truck 1)</h4>
                  <p className="text-xs text-gray-500">14 Jobs Completed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">$14,500 Gross</p>
                <p className="text-xs font-semibold text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded mt-1">+$1,200 Upsells</p>
              </div>
            </div>

            {/* Tech 2 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">2</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Dave (Truck 2)</h4>
                  <p className="text-xs text-gray-500">11 Jobs Completed</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">$11,200 Gross</p>
                <p className="text-xs font-semibold text-green-600 bg-green-50 inline-block px-2 py-0.5 rounded mt-1">+$450 Upsells</p>
              </div>
            </div>

            {/* Tech 3 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center font-bold text-gray-600">3</div>
                <div>
                  <h4 className="font-semibold text-gray-900">Sarah (Estimator)</h4>
                  <p className="text-xs text-gray-500">8 Bids Won</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-gray-900">$22,000 Pipeline</p>
                <p className="text-xs font-semibold text-blue-600 bg-blue-50 inline-block px-2 py-0.5 rounded mt-1">65% Close Rate</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Row 4: Accounts Receivable Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
          <div className="flex justify-between items-end">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Accounts Receivable & Follow-ups</h2>
              <p className="text-sm text-gray-500 mt-1">One-click automations for collecting payments and getting Google Reviews.</p>
            </div>
            <button className="text-sm text-blue-600 font-medium hover:text-blue-800">View Aging Report →</button>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {mockInvoices.map((invoice) => (
            <div key={invoice.id} className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between">
              
              <div className="flex items-center gap-4">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  invoice.status === 'Paid' ? 'bg-green-100' : 
                  invoice.status === 'Past Due' ? 'bg-red-100' : 'bg-gray-100'
                }`}>
                  {invoice.status === 'Paid' ? <CheckCircle2 size={18} className="text-green-600" /> : 
                   invoice.status === 'Past Due' ? <AlertCircle size={18} className="text-red-600" /> :
                   <FileText size={18} className="text-gray-600" />}
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {invoice.name} 
                    <span className="ml-2 text-gray-400 font-normal text-sm">{invoice.id}</span>
                  </h4>
                  <p className={`text-sm mt-1 font-medium ${invoice.status === 'Past Due' ? 'text-red-600' : 'text-gray-500'}`}>
                    {invoice.days} (Sent: {invoice.date})
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">{invoice.amount}</p>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                    invoice.status === 'Paid' ? 'text-green-700 bg-green-100' : 
                    invoice.status === 'Past Due' ? 'text-red-700 bg-red-100' : 'text-gray-700 bg-gray-200'
                  }`}>
                    {invoice.status}
                  </span>
                </div>

                <div className="w-[180px] flex justify-end">
                  {actionStatus[invoice.id] ? (
                    <span className="text-sm font-medium text-green-600 bg-green-50 px-4 py-2 rounded-lg border border-green-100 flex items-center gap-1">
                      <CheckCircle2 size={16} /> {actionStatus[invoice.id]}
                    </span>
                  ) : invoice.status === 'Paid' ? (
                    <button 
                      onClick={() => handleAction(invoice.id, 'review')}
                      className="text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 w-full justify-center"
                    >
                      <Star size={16} className="text-yellow-500" />
                      Request Review
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleAction(invoice.id, 'reminder')}
                      className="text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors flex items-center gap-2 w-full justify-center"
                    >
                      <Mail size={16} />
                      Send Reminder
                    </button>
                  )}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>

      {viewingPunches && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center animate-[slideUp_0.2s_ease-out]">
          <div className="bg-white rounded-2xl w-[500px] shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Timecard Punches</h2>
                <p className="text-sm text-gray-500 mt-1">{viewingPunches} • Today</p>
              </div>
              <button onClick={() => setViewingPunches(null)} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4 bg-white">
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                <span className="text-green-600 font-bold flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div> Clock In (Shop)
                </span>
                <span className="text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded">7:00 AM</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                <span className="text-orange-500 font-bold flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-orange-400"></div> Start Drive (Job 1)
                </span>
                <span className="text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded">8:15 AM</span>
              </div>
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                <span className="text-blue-600 font-bold flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-blue-500"></div> On Site (Job 1)
                </span>
                <span className="text-gray-600 font-medium bg-gray-50 px-2 py-1 rounded">8:30 AM</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-400 font-bold flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full border-2 border-gray-300"></div> Expected Clock Out
                </span>
                <span className="text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded">4:00 PM</span>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
               <button className="text-sm font-medium text-blue-600 hover:text-blue-800" onClick={() => alert("Would open full edit timesheet view")}>Edit Timesheet →</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
