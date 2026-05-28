"use client";

import { useState, useEffect } from "react";
import { PhoneIncoming, Clock, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Truck, MapPin, ArrowRight, Activity, PhoneMissed, Zap, Calendar, FileText } from "lucide-react";
import { VapiCallButton } from "@/components/VapiCallButton";
import Link from "next/link";

type Technician = {
  id: string;
  name?: string;
  status?: string;
  last_location_address?: string;
  current_job_title?: string;
  updated_at?: string;
};

type ActionItem = {
  id: string;
  type: "call" | "receipt" | "permit";
  priority: "high" | "medium" | "low";
  title: string;
  description?: string;
  href?: string;
};

function statusPill(status?: string) {
  const s = (status || "unknown").toLowerCase();
  if (s === "available") return { label: "Available", cls: "border-green-200 bg-green-50 text-green-700" };
  if (s === "en_route" || s === "en route") return { label: "En Route", cls: "border-blue-200 bg-blue-50 text-blue-700" };
  if (s === "on_site" || s === "on site") return { label: "On Site", cls: "border-purple-200 bg-purple-50 text-purple-700" };
  if (s === "off" || s === "offline") return { label: "Offline", cls: "border-gray-200 bg-gray-50 text-gray-600" };
  return { label: status || "Unknown", cls: "border-gray-200 bg-gray-50 text-gray-600" };
}

export default function Dashboard() {
  const [data, setData] = useState<any>({ calls: [], technicians: [], techTableAvailable: true, actionItems: [], stats: { totalCalls: 0, emergencies: 0, actionItemsCount: 0 } });
  const [loading, setLoading] = useState(true);
  const [aiMode, setAiMode] = useState<"auto" | "copilot">("auto");

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6 md:space-y-8 h-[calc(100vh-2rem)] overflow-y-auto pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">Command Center</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">Live overview of dispatch, AI operations, and daily revenue.</p>
        </div>
        <div className="flex gap-3 items-center w-full md:w-auto">
          
          {/* AI Mode Toggle */}
          <div className="bg-gray-100 p-1 rounded-lg flex border border-gray-200 flex-1 md:flex-none">
            <button 
              onClick={() => setAiMode("auto")}
              className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${aiMode === 'auto' ? 'bg-white text-blue-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Auto-Pilot
            </button>
            <button 
              onClick={() => setAiMode("copilot")}
              className={`flex-1 md:flex-none px-3 md:px-4 py-1.5 rounded-md text-xs md:text-sm font-medium transition-all ${aiMode === 'copilot' ? 'bg-white text-purple-600 shadow-sm border border-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Co-Pilot
            </button>
          </div>

          <div className="hidden md:block">
            <VapiCallButton />
          </div>
        </div>
      </div>

      {/* Mode Status Banner */}
      {aiMode === "auto" ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between text-sm text-blue-800">
          <div className="flex items-center gap-2 font-medium">
            <div className="h-2 w-2 bg-blue-500 rounded-full animate-pulse"></div>
            Auto-Pilot Active: AI is currently answering all inbound calls automatically.
          </div>
        </div>
      ) : (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center justify-between text-sm text-purple-800">
          <div className="flex items-center gap-2 font-medium">
            <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse"></div>
            Co-Pilot Active: Phones ring to office staff. AI is listening silently in the background.
          </div>
          <Link href="/co-pilot" className="text-purple-700 font-bold hover:text-purple-900 underline">Open Dispatcher Screen →</Link>
        </div>
      )}

      {/* Core KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-4">
            <h3 className="font-medium text-sm">AI Calls Handled</h3>
            <div className="bg-blue-50 p-2 rounded-lg"><PhoneIncoming size={18} className="text-blue-600" /></div>
          </div>
          {loading ? <p className="text-3xl font-bold text-gray-400">...</p> : <p className="text-3xl font-bold text-gray-900">{data.stats.totalCalls}</p>}
          <p className="text-sm text-gray-400 font-medium mt-2 flex items-center gap-1">Real database count</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-4">
            <h3 className="font-medium text-sm">Missed Calls Rescued</h3>
            <div className="bg-green-50 p-2 rounded-lg"><PhoneMissed size={18} className="text-green-600" /></div>
          </div>
          {loading ? <p className="text-3xl font-bold text-gray-400">...</p> : <p className="text-3xl font-bold text-gray-900">${(data.stats.rescuedValue || 0).toLocaleString()}</p>}
          <p className="text-sm text-gray-400 font-medium mt-2 flex items-center gap-1">Est. pipeline value ($150/lead)</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-red-100 bg-red-50/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-red-700 mb-4">
            <h3 className="font-medium text-sm">Emergency Dispatches</h3>
            <div className="bg-red-100 p-2 rounded-lg"><AlertTriangle size={18} className="text-red-600" /></div>
          </div>
          {loading ? <p className="text-3xl font-bold text-gray-400">...</p> : <p className="text-3xl font-bold text-red-900">{data.stats.emergencies}</p>}
          <p className="text-sm text-gray-500 font-medium mt-2">Real database count</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-4">
            <h3 className="font-medium text-sm">Auto-Scheduled</h3>
            <div className="bg-purple-50 p-2 rounded-lg"><Calendar size={18} className="text-purple-600" /></div>
          </div>
          {loading ? <p className="text-3xl font-bold text-gray-400">...</p> : <p className="text-3xl font-bold text-gray-900">{data.stats.autoScheduledCount || 0}</p>}
          <p className="text-sm text-gray-400 font-medium mt-2">Active scheduled jobs</p>
        </div>
      </div>

      {/* Grid Layout for Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column (Span 2): Live Dispatch Map & Techs */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Truck size={18} className="text-gray-500" /> Live Field Status
              </h2>
              <Link href="/dispatch" className="text-xs text-gray-700 hover:text-gray-900 font-bold bg-white border border-gray-200 px-3 py-1 rounded-full">Open Dispatch →</Link>
            </div>
            {loading ? (
              <div className="p-6 text-gray-500">Loading technicians...</div>
            ) : (data.technicians?.length || 0) === 0 ? (
              <div className="p-6 text-center text-gray-500">
                {data.techTableAvailable === false ? (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">Technician table not found.</p>
                    <p className="text-sm">Create a <span className="font-mono">technicians</span> table in Supabase to enable live field status.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="font-medium text-gray-900">No technicians yet.</p>
                    <p className="text-sm">Add your first tech to start tracking live field status.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {(data.technicians as Technician[]).slice(0, 6).map((t) => {
                  const pill = statusPill(t.status);
                  return (
                    <div key={t.id} className="p-5 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                          <MapPin size={18} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-gray-900">{t.name || "Technician"}</h4>
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${pill.cls}`}>{pill.label}</span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                            {t.current_job_title ? `Job: ${t.current_job_title}` : (t.last_location_address || "No location yet")}
                          </p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400 font-semibold">
                        {t.updated_at ? new Date(t.updated_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent AI Calls */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PhoneIncoming size={18} className="text-gray-500" /> Recent AI Call Summaries
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              {loading ? (
                <div className="p-5 text-gray-500">Loading recent calls...</div>
              ) : data.calls.length === 0 ? (
                <div className="p-10 text-center text-gray-500 flex flex-col items-center">
                  <PhoneIncoming size={32} className="text-gray-300 mb-3" />
                  <p className="font-medium text-gray-900">No calls yet.</p>
                  <p className="text-sm mt-1">Make a test call using the button above.</p>
                </div>
              ) : (
                data.calls.slice(0, 3).map((call: any) => (
                  <div key={call.id} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-full flex items-center justify-center ${call.urgency_flag === 'high' ? 'bg-red-100' : 'bg-green-100'}`}>
                        {call.urgency_flag === 'high' ? <AlertTriangle size={18} className="text-red-600" /> : <CheckCircle2 size={18} className="text-green-600" />}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">
                          {call.customers?.first_name ? `${call.customers.first_name} ${call.customers.last_name || ''}` : call.customers?.phone_number || 'Unknown Caller'}
                          <span className={`ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${call.urgency_flag === 'high' ? 'border-red-200 bg-red-50 text-red-700' : 'border-green-200 bg-green-50 text-green-700'}`}>
                            {call.urgency_flag || 'Standard'}
                          </span>
                        </h4>
                        <p className="text-sm text-gray-600 mt-1 line-clamp-1">{call.summary}</p>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {new Date(call.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <Link href="/call-logs" className="text-xs text-blue-700 hover:text-blue-900 font-bold mt-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1">Transcript <ArrowRight size={12}/></Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column (Span 1): AI Action Items & Pulse */}
        <div className="space-y-8">
          
          {/* Action Items */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity size={18} className="text-blue-600" /> AI Action Items
              </h2>
            </div>
            {loading ? (
              <div className="p-6 text-gray-500 text-sm">Loading action items...</div>
            ) : (data.actionItems?.length || 0) === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No action items right now.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {(data.actionItems as ActionItem[]).slice(0, 6).map((item) => {
                  const isHigh = item.priority === "high";
                  const icon = item.type === "receipt" ? <FileText size={16} className="text-gray-600" /> : item.type === "permit" ? <Clock size={16} className="text-gray-600" /> : (isHigh ? <AlertTriangle size={16} className="text-red-600" /> : <CheckCircle2 size={16} className="text-green-600" />);
                  const badgeCls = isHigh ? "border-red-200 bg-red-50 text-red-700" : item.priority === "medium" ? "border-yellow-200 bg-yellow-50 text-yellow-800" : "border-gray-200 bg-gray-50 text-gray-600";

                  const inner = (
                    <div className="p-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">{icon}</div>
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-semibold text-gray-900 leading-tight">{item.title}</p>
                              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${badgeCls}`}>{item.priority}</span>
                            </div>
                            {item.description ? <p className="text-sm text-gray-600 mt-1 line-clamp-2">{item.description}</p> : null}
                          </div>
                        </div>
                        <ArrowRight size={16} className="text-gray-300 mt-1" />
                      </div>
                    </div>
                  );

                  return item.href ? (
                    <Link key={item.id} href={item.href} className="block">
                      {inner}
                    </Link>
                  ) : (
                    <div key={item.id}>{inner}</div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Today's Cash Flow */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" /> Financial Pulse
              </h2>
              {data.stats.qbConnected && (
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700">
                  Live Sync
                </span>
              )}
            </div>
            {loading ? (
               <div className="p-6 text-center text-gray-500 text-sm">Loading financials...</div>
            ) : (
               <div className="p-6">
                 <div className="flex justify-between items-center mb-4">
                   <div className="text-sm text-gray-500">{data.stats.qbConnected ? 'Gross Profit (YTD)' : 'Material Spend (YTD)'}</div>
                   <div className="text-lg font-bold text-gray-900">
                     {data.stats.qbConnected ? `$${(data.stats.qbGrossProfit || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${(data.stats.totalMaterialSpend || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                   </div>
                 </div>
                 <div className="flex justify-between items-center mb-4">
                   <div className="text-sm text-gray-500">{data.stats.qbConnected ? 'Total Expenses' : 'Estimated Revenue'}</div>
                   <div className="text-lg font-bold text-gray-900">
                     {data.stats.qbConnected ? `$${(data.stats.qbTotalExpenses || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : `$${(data.stats.estimatedRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                   </div>
                 </div>
                 <div className="flex justify-between items-center mb-4 pt-4 border-t border-gray-100">
                   <div className="text-sm font-semibold text-gray-900">Net Income</div>
                   <div className={`text-xl font-bold ${data.stats.qbConnected ? 'text-green-600' : 'text-gray-400'}`}>
                     {data.stats.qbConnected ? `$${(data.stats.qbNetIncome || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 'Needs QB Auth'}
                   </div>
                 </div>
                 <p className="text-xs text-gray-400 mt-4 text-center">
                   {data.stats.qbConnected 
                     ? (data.stats.qbError ? `Warning: ${data.stats.qbError}. Showing cached data.` : 'Live integration with QuickBooks Online.') 
                     : 'QuickBooks integration required for full P&L tracking.'}
                 </p>
               </div>
            )}
          </div>

        </div>
      </div>

    </div>
  );
}
