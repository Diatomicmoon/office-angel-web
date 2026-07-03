"use client";

import { useState, useEffect } from "react";
import { Bot, Briefcase, PhoneIncoming, Clock, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Truck, MapPin, ArrowRight, Activity, PhoneMissed, Zap, Calendar, FileText, Users, Tag, BarChart2 } from "lucide-react";
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
  const [tier, setTier] = useState<number>(1);
  const [aiMode, setAiMode] = useState<"auto" | "copilot">("auto");
  const [ghlContacts, setGhlContacts] = useState<any[]>([]);
  const [ghlTotal, setGhlTotal] = useState<number>(0);
  const [ghlLoading, setGhlLoading] = useState(true);
  const [recentJobs, setRecentJobs] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/me').then(r => r.json()).then(d => setTier(d.tier || 1)).catch(()=>{});
    try {
      const stored = localStorage.getItem('oa_recent_jobs');
      if (stored) setRecentlyViewed(JSON.parse(stored));
    } catch(e) {}
    
    fetch("/api/jobs?limit=4")
      .then(r => r.json())
      .then(json => setRecentJobs((json.jobs || []).slice(0, 4)))
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/ghl/contacts?limit=5")
      .then(res => res.json())
      .then(json => {
        setGhlContacts(json.contacts || []);
        setGhlTotal(json.total || 0);
        setGhlLoading(false);
      })
      .catch(() => setGhlLoading(false));
  }, []);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const isRestricted = ['field_rep', 'tech', 'apprentice', 'sales'].includes((data?.user?.role || '').toLowerCase());

  if (isRestricted) {
    return (
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            {data.user?.firstName ? `Welcome, ${data.user.firstName}!` : "Welcome!"}
          </h1>
          <p className="text-gray-500 mt-2">Here is your canvassing summary.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between text-gray-500 mb-4">
              <h3 className="font-medium text-sm">Doors Knocked</h3>
              <div className="bg-blue-50 p-2 rounded-lg"><MapPin size={18} className="text-blue-600" /></div>
            </div>
            {loading ? <p className="text-3xl font-bold text-gray-400">...</p> : <p className="text-4xl font-extrabold text-gray-900">{data.user?.personalStats?.knocks || 0}</p>}
          </div>

          <div className="bg-orange-50 border border-orange-100 p-6 rounded-xl shadow-sm">
            <div className="flex items-center justify-between text-orange-700 mb-4">
              <h3 className="font-bold text-sm">Demos Set</h3>
              <div className="bg-orange-100 p-2 rounded-lg"><TrendingUp size={18} className="text-orange-600" /></div>
            </div>
            {loading ? <p className="text-3xl font-bold text-orange-300">...</p> : <p className="text-4xl font-extrabold text-orange-600">{data.user?.personalStats?.demos || 0}</p>}
          </div>
        </div>

        <div className="mt-8">
          <Link href="/canvassing" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors">
            <MapPin size={20} /> Open Canvassing Map
          </Link>
        </div>
      </div>
    );
  }

  const isFriday = new Date().getDay() === 5;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-4 md:p-8 space-y-6 md:space-y-8 h-[calc(100dvh-3.5rem)] md:h-[calc(100vh-2rem)] overflow-y-auto pb-24">

      {/* Friday Weekly Recap Banner */}
      {isFriday && (
        <Link href="/weekly-recap" className="flex items-center justify-between gap-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white rounded-2xl px-5 py-4 shadow-md hover:shadow-lg transition-all group">
          <div className="flex items-center gap-3">
            <BarChart2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold text-sm">📊 Your Weekly Recap is ready.</p>
              <p className="text-yellow-100 text-xs mt-0.5">See how this week stacked up — jobs, calls, spend, and more.</p>
            </div>
          </div>
          <ArrowRight className="w-5 h-5 flex-shrink-0 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}

      {/* Header */}
      {tier === 1 ? (
        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mb-6 relative overflow-hidden group hover:border-gray-300 transition-all">
          <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-all transform group-hover:scale-110 group-hover:-rotate-3 duration-500"><Briefcase size={100} /></div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to your Workspace</h2>
          <p className="text-gray-600 max-w-xl">You are currently on the Basic SaaS Tier. Use the CRM, D2D map, and estimating tools below. Upgrade to Tier 2 to unlock your Voice AI receptionist.</p>
        </div>
      ) : tier === 2 ? (
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 bg-[length:200%_auto] animate-[pulse_4s_ease-in-out_infinite] rounded-xl p-6 shadow-xl mb-6 text-white overflow-hidden border border-blue-500/50">
          <div className="absolute -right-6 -top-6 opacity-20"><Bot size={130} /></div>
          <div className="relative z-10 flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_15px_rgba(34,211,238,0.9)]"></div>
            <h2 className="text-2xl font-bold text-white tracking-wide">Cloud AI is Active</h2>
          </div>
          <p className="relative z-10 text-blue-200 max-w-xl opacity-90">Your Voice AI receptionist is monitoring the phone lines. Call routing and SMS follow-ups are online.</p>
        </div>
      ) : (
        <div className="bg-gray-900 rounded-xl p-6 shadow-2xl mb-6 text-white relative overflow-hidden border border-purple-500/50 group">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/10 to-transparent -translate-y-full animate-[ping_3s_linear_infinite] opacity-50"></div>
          <div className="absolute -right-2 -top-2 opacity-10"><Activity size={140} /></div>
          
          <div className="relative z-10 flex items-center gap-3 mb-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full animate-ping absolute"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full relative z-10 shadow-[0_0_15px_rgba(168,85,247,0.9)]"></div>
            <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">Autonomous AI Employee Online</h2>
          </div>
          <p className="relative z-10 text-gray-300 max-w-xl">Mothership uplink connected. Hardware node is running. Full-scale dispatching, estimating, and fleet routing are fully autonomous.</p>
          <div className="relative z-10 mt-4 flex items-center gap-2 text-[10px] font-mono text-purple-300 bg-purple-900/30 w-fit px-3 py-1 rounded-full border border-purple-500/30">
            <span className="animate-pulse text-purple-400">●</span> HARDWARE LINK: STABLE
          </div>
        </div>
      )}

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900">
            {data.user?.firstName ? `Hey ${data.user.firstName}, welcome back!` : "Command Center"}
          </h1>
          <p className="text-sm md:text-base text-gray-500 mt-1 md:mt-2">
            {data.company?.name ? `Live overview for ${data.company.name}.` : "Live overview of dispatch, AI operations, and daily revenue."}
          </p>
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

      {/* Recently Viewed / Jump Back In */}
      {recentlyViewed.length > 0 && (
        <div className="bg-blue-50/50 rounded-xl border border-blue-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-3 border-b border-blue-100 bg-blue-100/50 flex justify-between items-center">
            <h2 className="text-sm font-bold text-blue-900 flex items-center gap-2 uppercase tracking-wider">
              <Clock size={14} className="text-blue-600" /> Jump Back In
            </h2>
          </div>
          <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {recentlyViewed.slice(0, 4).map((job: any) => (
              <Link href={`/jobs/${job.id}`} key={job.id} className="block border border-blue-100/50 rounded-lg p-3 bg-white hover:border-blue-300 hover:shadow-md transition-all group">
                <h4 className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-700">{job.title || "Untitled Job"}</h4>
                <p className="text-xs text-gray-500 mt-1 truncate">{job.customerName || job.address || "No details"}</p>
                <div className="mt-2 text-[10px] text-gray-400 flex justify-between items-center">
                   <span>Viewed recently</span>
                   <span className="font-medium text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{job.status || "Open"}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

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

        {/* Recent Jobs */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CheckCircle2 size={18} className="text-blue-600" /> Recent Jobs
            </h2>
            <Link href="/jobs" className="text-xs text-gray-600 font-bold hover:text-gray-900">View All →</Link>
          </div>
          <div className="p-5 space-y-3">
            {recentJobs.length === 0 ? (
              <div className="text-sm text-gray-500 text-center py-4">No jobs yet. Jobs will appear here as they come in from AI calls.</div>
            ) : recentJobs.map((job: any) => {
              const customerName = job.customers ? `${job.customers.first_name || ""} ${job.customers.last_name || ""}`.trim() : "";
              const statusColor = (job.status || "").toLowerCase().includes("complete") ? "border-green-200 bg-green-50 text-green-700" :
                (job.status || "").toLowerCase().includes("schedule") ? "border-purple-200 bg-purple-50 text-purple-700" :
                "border-yellow-200 bg-yellow-50 text-yellow-700";
              return (
                <Link href={`/jobs/${job.id}`} key={job.id} className="block border border-gray-100 rounded-lg p-4 bg-gray-50 hover:bg-white hover:border-gray-300 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 text-sm truncate">{job.title || "Untitled Job"}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{customerName || job.address || "No address"}</p>
                    </div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ml-2 shrink-0 ${statusColor}`}>
                      {job.status || "Lead"}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* GHL CRM Widget */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Users size={18} className="text-indigo-500" /> CR Leads
                {!ghlLoading && <span className="text-xs font-medium text-gray-400 ml-1">({ghlTotal.toLocaleString()} total)</span>}
              </h2>
              <Link href="/crm" className="text-xs text-indigo-600 font-bold hover:underline">View All →</Link>
            </div>
            {ghlLoading ? (
              <div className="p-6 text-gray-500 text-sm">Loading GHL contacts...</div>
            ) : ghlContacts.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">No contacts found.</div>
            ) : (
              <div className="divide-y divide-gray-100">
                {ghlContacts.map((c: any) => (
                  <div key={c.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-indigo-100 flex items-center justify-center">
                        <span className="text-indigo-700 font-bold text-sm">{c.name?.charAt(0)?.toUpperCase() || "?"}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{c.name}</p>
                        <p className="text-xs text-gray-500">{c.phone || c.email || c.address || "No contact info"}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {c.tags?.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 flex items-center gap-1">
                          <Tag size={9} /> {tag}
                        </span>
                      ))}
                      {!c.tags?.length && (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-full border border-gray-200 bg-gray-50 text-gray-400">{c.type}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
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
