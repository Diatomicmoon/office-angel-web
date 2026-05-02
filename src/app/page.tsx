"use client";

import { PhoneIncoming, Clock, AlertTriangle, CheckCircle2, TrendingUp, DollarSign, Truck, MapPin, ArrowRight, Activity, PhoneMissed, Zap, Calendar, FileText } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
  return (
    <div className="max-w-7xl mx-auto p-8 space-y-8 h-[calc(100vh-2rem)] overflow-y-auto">

      {/* Header */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Command Center</h1>
          <p className="text-gray-500 mt-2">Live overview of dispatch, AI operations, and daily revenue.</p>
        </div>
        <div className="flex gap-3">
            <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors">
            AI Settings
          </button>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2 shadow-sm">
            <Zap size={18} /> New AI Campaign
          </button>
        </div>
      </div>

      {/* Core KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-4">
            <h3 className="font-medium text-sm">AI Calls Handled</h3>
            <div className="bg-blue-50 p-2 rounded-lg"><PhoneIncoming size={18} className="text-blue-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">142</p>
          <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1"><TrendingUp size={14}/> 12% vs last week</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-4">
            <h3 className="font-medium text-sm">Missed Calls Rescued</h3>
            <div className="bg-green-50 p-2 rounded-lg"><PhoneMissed size={18} className="text-green-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">$3,200</p>
          <p className="text-sm text-green-600 font-medium mt-2 flex items-center gap-1">4 jobs secured</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-red-100 bg-red-50/40 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-red-700 mb-4">
            <h3 className="font-medium text-sm">Emergency Dispatches</h3>
            <div className="bg-red-100 p-2 rounded-lg"><AlertTriangle size={18} className="text-red-600" /></div>
          </div>
          <p className="text-3xl font-bold text-red-900">2</p>
          <p className="text-sm text-red-700 font-bold mt-2">Active right now</p>
        </div>

        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between text-gray-500 mb-4">
            <h3 className="font-medium text-sm">Auto-Scheduled</h3>
            <div className="bg-purple-50 p-2 rounded-lg"><Calendar size={18} className="text-purple-600" /></div>
          </div>
          <p className="text-3xl font-bold text-gray-900">47</p>
          <p className="text-sm text-purple-600 font-medium mt-2">Appointments booked</p>
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
              <Link href="/dispatch" className="text-sm text-blue-600 hover:text-blue-800 font-medium">View Full Dispatch Map →</Link>
            </div>
            <div className="p-6 flex-1 overflow-y-auto space-y-4">
              {/* Tech 1 */}
              <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex justify-between items-center group hover:border-blue-200 transition-colors cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">M</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Mike (Truck 1) <span className="ml-2 text-[10px] bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">On Site</span></h4>
                    <p className="text-sm text-gray-500 flex items-center gap-1.5 mt-1"><MapPin size={14} className="text-gray-400" /> 1042 Elm St (Panel Upgrade)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-gray-900">2h 15m</p>
                  <p className="text-xs font-medium text-gray-500 mt-0.5">Elapsed Time</p>
                </div>
              </div>
              
              {/* Tech 2 */}
              <div className="p-4 border border-red-200 rounded-xl bg-red-50/50 shadow-sm flex justify-between items-center cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center text-red-800 font-bold text-lg ring-4 ring-red-50">D</div>
                  <div>
                    <h4 className="font-bold text-gray-900">Dave (Truck 2) <span className="ml-2 text-[10px] bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold animate-pulse">En Route</span></h4>
                    <p className="text-sm text-red-800 font-medium flex items-center gap-1.5 mt-1"><MapPin size={14} /> 1442 Grand Ave (Emergency)</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-red-700">12m</p>
                  <p className="text-xs font-bold text-red-500 mt-0.5">ETA</p>
                </div>
              </div>

              {/* Tech 3 */}
              <div className="p-4 border border-gray-100 rounded-xl bg-gray-50 shadow-sm flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-600 font-bold text-lg">S</div>
                  <div>
                    <h4 className="font-bold text-gray-500">Sarah (Truck 3) <span className="ml-2 text-[10px] bg-gray-200 text-gray-600 border border-gray-300 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Available</span></h4>
                    <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1">Returning to shop</p>
                  </div>
                </div>
                <div className="text-right">
                   <button className="text-sm font-bold text-blue-600 bg-white border border-gray-200 shadow-sm hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors">Dispatch</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent AI Calls */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <PhoneIncoming size={18} className="text-gray-500" /> Recent AI Call Summaries
              </h2>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="p-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                    <AlertTriangle size={18} className="text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">+1 (612) 555-0199 <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-red-200 bg-red-50 text-red-700">Emergency</span></h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">Customer reported storm damage to solar array. Power is completely out.</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">2 mins ago</p>
                  <Link href="/call-logs" className="text-xs text-blue-700 hover:text-blue-900 font-bold mt-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1">Transcript <ArrowRight size={12}/></Link>
                </div>
              </div>
              
              <div className="p-5 hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={18} className="text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">John Martinez <span className="ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border border-green-200 bg-green-50 text-green-700">Site Survey</span></h4>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">Inquiry for 200A panel upgrade. Site survey booked for Thursday at 10 AM.</p>
                  </div>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">45 mins ago</p>
                  <Link href="/call-logs" className="text-xs text-blue-700 hover:text-blue-900 font-bold mt-1.5 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full flex items-center gap-1">Transcript <ArrowRight size={12}/></Link>
                </div>
              </div>
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
            <div className="p-6 space-y-4">
              <div className="p-5 border border-orange-200 bg-orange-50 rounded-xl">
                <h4 className="text-sm font-bold text-orange-900 flex items-center gap-2 mb-2">
                  <FileText size={16} /> Estimate Needs Approval
                </h4>
                <p className="text-sm text-orange-800 mb-4 leading-relaxed">AI drafted a <strong>$4,200</strong> bid for John Martinez (Panel Upgrade). Requires your sign-off to send to customer.</p>
                <button className="text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 shadow-sm w-full py-2.5 rounded-lg transition-colors">Review Bid Now</button>
              </div>
              
              <div className="p-5 border border-gray-200 bg-gray-50 rounded-xl">
                <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2 mb-2">
                  <DollarSign size={16} className="text-gray-500"/> Invoice Overdue
                </h4>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">Tech Solutions LLC is 18 days late on <strong>$4,500</strong>. Should AI send a polite follow-up email?</p>
                <div className="flex gap-2">
                  <button className="text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-100 flex-1 py-2.5 rounded-lg transition-colors shadow-sm">Ignore</button>
                  <button className="text-sm font-bold text-white bg-gray-900 hover:bg-black flex-1 py-2.5 rounded-lg transition-colors shadow-sm">Send Email</button>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Cash Flow */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <DollarSign size={18} className="text-green-600" /> Today's Financial Pulse
              </h2>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Collected Today</span>
                  <span className="font-bold text-green-600 text-base">$3,450</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-semibold text-gray-500 uppercase tracking-wider text-xs">Expected (Unbilled)</span>
                  <span className="font-bold text-gray-900 text-base">$2,100</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5">
                  <div className="bg-gray-800 h-2.5 rounded-full" style={{ width: '40%' }}></div>
                </div>
              </div>
              <div className="pt-2">
                <Link href="/financials" className="text-sm text-blue-600 font-bold w-full text-center hover:text-blue-800 flex items-center justify-center gap-1 bg-blue-50 py-2.5 rounded-lg transition-colors border border-blue-100">
                  Full Financial Report <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}