"use client";

import { motion } from "framer-motion";
import { AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { PhoneIncoming, Mic, Calendar, BrainCircuit, Sparkles, TrendingDown, Clock, CheckCircle2, Cpu, MapPin, Smartphone, Route } from "lucide-react";
import { VoiceDispatcherAnimation, CoPilotAnimation, AutoSchedulingAnimation, HardwareAnimation, D2DAnimation } from "./FeatureAnimations";

const voiceData = [
  { name: "Mon", missed: 12, ai: 2 },
  { name: "Tue", missed: 8, ai: 12 },
  { name: "Wed", missed: 5, ai: 20 },
  { name: "Thu", missed: 1, ai: 28 },
  { name: "Fri", missed: 0, ai: 35 },
];

const copilotData = [
  { name: "Job 1", mins: 9.5 },
  { name: "Job 2", mins: 7.2 },
  { name: "Job 3", mins: 4.8 },
  { name: "Job 4", mins: 2.1 },
  { name: "Job 5", mins: 1.5 },
];

const scheduleData = [
  { name: "Week 1", manual: 25, ai: 5 },
  { name: "Week 2", manual: 18, ai: 15 },
  { name: "Week 3", manual: 8, ai: 30 },
  { name: "Week 4", manual: 2, ai: 42 },
];

// Reusable tooltip style for dark mode
const tooltipStyle = {
  borderRadius: '12px',
  border: '1px solid #374151',
  backgroundColor: '#111827',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
  color: '#f9fafb',
  fontWeight: 600 as const,
};

export function AIVoiceBlock() {
  return (
    <div className="bg-[#0d1117] rounded-3xl p-8 md:p-12 border border-gray-800 shadow-[0_0_40px_rgba(59,130,246,0.05)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <PhoneIncoming size={28} />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-white">AI Voice Dispatcher</h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Stop sending $1,500 jobs to voicemail. The Hard Hat AI answers simultaneously, talks with a human-like voice, and captures the exact intent of the customer.
          </p>
          <VoiceDispatcherAnimation />
        </div>
        <div className="h-[300px] w-full bg-[#161b22] p-6 rounded-2xl border border-gray-800">
          <h4 className="text-gray-300 font-semibold mb-6 flex items-center gap-2"><TrendingDown size={18} className="text-emerald-400"/> Missed Calls vs AI Handled</h4>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={voiceData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorMissed" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 700 }} />
              <Area type="monotone" dataKey="missed" name="Missed Calls" stroke="#ef4444" strokeWidth={3} fill="url(#colorMissed)" />
              <Area type="monotone" dataKey="ai" name="AI Handled" stroke="#3b82f6" strokeWidth={3} fill="url(#colorAi)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function AICoPilotBlock() {
  return (
    <div className="bg-[#0d1117] rounded-3xl p-8 md:p-12 border border-gray-800 shadow-[0_0_40px_rgba(99,102,241,0.05)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-bl from-indigo-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10 flex-col-reverse">
        <div className="h-[300px] w-full bg-[#161b22] p-6 rounded-2xl border border-gray-800 order-2 md:order-1">
          <h4 className="text-gray-300 font-semibold mb-6 flex items-center gap-2"><Clock size={18} className="text-indigo-400"/> Time Spent per Call (Minutes)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={copilotData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 700 }} />
              <Line type="monotone" dataKey="mins" name="Call Duration" stroke="#818cf8" strokeWidth={4} dot={{ r: 6, fill: '#1e1b4b', stroke: '#818cf8', strokeWidth: 2 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="order-1 md:order-2">
          <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Mic size={28} />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-white">AI Co-Pilot Mode</h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            When you take the call, the AI listens quietly in the background. It transcribes the issue, looks up the customer, and prepares the job ticket before you even hang up.
          </p>
          <CoPilotAnimation />
        </div>
      </div>
    </div>
  );
}

export function AutoScheduleBlock() {
  return (
    <div className="bg-[#0d1117] rounded-3xl p-8 md:p-12 border border-gray-800 shadow-[0_0_40px_rgba(16,185,129,0.05)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
            <Calendar size={28} />
          </div>
          <h3 className="text-3xl font-bold mb-4 text-white">Auto Scheduling</h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Eliminate double data entry. The AI reads the tech's location, confirms availability, and injects the job straight into their calendar with zero manual clicks.
          </p>
          <AutoSchedulingAnimation />
        </div>
        <div className="h-[300px] w-full bg-[#161b22] p-6 rounded-2xl border border-gray-800">
          <h4 className="text-gray-300 font-semibold mb-6 flex items-center gap-2"><CheckCircle2 size={18} className="text-emerald-400"/> Jobs Booked (Manual vs AI)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={scheduleData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1f2937" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
              <Tooltip contentStyle={tooltipStyle} itemStyle={{ fontWeight: 700 }} cursor={{ fill: '#1f2937' }} />
              <Bar dataKey="manual" name="Manual Entry" stackId="a" fill="#4b5563" radius={[0, 0, 4, 4]} />
              <Bar dataKey="ai" name="AI Booked" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export function HardwareShowcase() {
  return (
    <div className="bg-[#0d1117] rounded-3xl p-8 md:p-12 border border-gray-800 shadow-[0_0_40px_rgba(6,182,212,0.05)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tl from-cyan-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10 flex-col-reverse">
        <div className="h-[350px] w-full order-2 md:order-1">
          <HardwareAnimation />
        </div>
        <div className="order-1 md:order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-bold mb-6 tracking-wide uppercase">
            <Cpu size={14} /> Custom Hardware Integration
          </div>
          <h3 className="text-3xl font-bold mb-4 text-white">Beyond the Screen.</h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            We don't just build software. We connect your physical world to the cloud. From white-labeled OBD-II fleet GPS trackers to NFC-enabled smart bins that auto-reorder materials when they run low.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-gray-300">
              <MapPin size={20} className="text-cyan-400 shrink-0 mt-0.5" /> 
              <span><strong className="text-white">Live Fleet Tracking:</strong> Monitor trucks, geofence timesheets, and dispatch the closest tech instantly.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <Smartphone size={20} className="text-cyan-400 shrink-0 mt-0.5" /> 
              <span><strong className="text-white">NFC Equipment Tags:</strong> Homeowners just tap the sticker on their water heater to summon your crew.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export function D2DShowcase() {
  return (
    <div className="bg-[#0d1117] rounded-3xl p-8 md:p-12 border border-gray-800 shadow-[0_0_40px_rgba(168,85,247,0.05)] relative overflow-hidden group">
      <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
      <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-bold mb-6 tracking-wide uppercase">
            <Route size={14} /> Smart Canvassing Map
          </div>
          <h3 className="text-3xl font-bold mb-4 text-white">Dominate Your Territory.</h3>
          <p className="text-gray-400 text-lg leading-relaxed mb-8">
            Arm your door-to-door reps with military-grade intelligence. Our built-in canvassing map automatically scrapes new home permits, drops hot leads, and routes your team using ghost trails.
          </p>
          <ul className="space-y-4">
            <li className="flex items-start gap-3 text-gray-300">
              <MapPin size={20} className="text-purple-400 shrink-0 mt-0.5" /> 
              <span><strong className="text-white">Predictive Heat Maps:</strong> See exactly where new certificates of occupancy are dropping.</span>
            </li>
            <li className="flex items-start gap-3 text-gray-300">
              <Sparkles size={20} className="text-purple-400 shrink-0 mt-0.5" /> 
              <span><strong className="text-white">Automated Territory Drawing:</strong> Owner draws the box, reps only see their active zones.</span>
            </li>
          </ul>
        </div>
        <div className="h-[350px] w-full">
          <D2DAnimation />
        </div>
      </div>
    </div>
  );
}

export function AIEmployeeShowcase() {
  return (
    <div className="col-span-1 sm:col-span-2 md:col-span-3 bg-gradient-to-b from-[#0d1117] to-[#050505] rounded-3xl p-8 md:p-16 border border-gray-800 shadow-[0_0_80px_rgba(59,130,246,0.1)] relative overflow-hidden flex flex-col items-center justify-center text-center">
      {/* Background glowing effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none"></div>
      
      <div className="relative z-10 mb-12 mt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold mb-6 tracking-wide">
          <Sparkles size={16} /> THE ULTIMATE UPGRADE
        </div>
        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">Meet Your AI Employee</h2>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Not just a software tool, but a hyper-intelligent digital team member. It learns your pricing, remembers your inventory, and manages your dispatching round-the-clock.
        </p>
      </div>

      {/* Massive Neural Core Animation */}
      <div className="relative w-64 h-64 md:w-80 md:h-80 mx-auto flex items-center justify-center mt-4 mb-8">
        {/* Core Glow */}
        <motion.div 
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }} 
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
          className="absolute inset-0 bg-blue-600 rounded-full blur-[60px]" 
        />
        
        {/* Outer Ring */}
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }} 
          className="absolute inset-0 border-[2px] border-blue-500/20 border-dashed rounded-full" 
        />
        
        {/* Middle Ring */}
        <motion.div 
          animate={{ rotate: -360 }} 
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }} 
          className="absolute inset-6 border-[2px] border-indigo-400/30 border-dotted rounded-full" 
        />
        
        {/* Inner Ring */}
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }} 
          className="absolute inset-16 border border-blue-400/40 rounded-full" 
        />

        {/* Orbiting Nodes */}
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 8, repeat: Infinity, ease: "linear" }} className="absolute inset-0 z-20">
          <div className="absolute top-0 left-1/2 w-4 h-4 bg-blue-400 rounded-full shadow-[0_0_15px_#60a5fa] -translate-x-1/2 -translate-y-1/2" />
        </motion.div>
        
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 12, repeat: Infinity, ease: "linear" }} className="absolute inset-6 z-20">
          <div className="absolute bottom-0 left-1/2 w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_15px_#818cf8] -translate-x-1/2 translate-y-1/2" />
        </motion.div>

        {/* Central Brain Icon */}
        <div className="relative z-30 bg-[#0d1117] border border-blue-500/50 p-8 rounded-full shadow-[0_0_40px_rgba(59,130,246,0.6)]">
           <BrainCircuit size={48} className="text-blue-400" />
        </div>
      </div>
      
      {/* Floating Badges */}
      <div className="flex flex-wrap justify-center gap-4 relative z-10 mt-8">
        <div className="bg-[#161b22] border border-gray-700 px-6 py-3 rounded-full text-gray-300 font-medium text-sm flex items-center gap-2 shadow-lg hover:border-blue-500/50 transition-colors">
          <CheckCircle2 size={16} className="text-emerald-400" /> Learns 10x faster
        </div>
        <div className="bg-[#161b22] border border-gray-700 px-6 py-3 rounded-full text-gray-300 font-medium text-sm flex items-center gap-2 shadow-lg hover:border-blue-500/50 transition-colors">
          <CheckCircle2 size={16} className="text-emerald-400" /> Works 24/7/365
        </div>
        <div className="bg-[#161b22] border border-gray-700 px-6 py-3 rounded-full text-gray-300 font-medium text-sm flex items-center gap-2 shadow-lg hover:border-blue-500/50 transition-colors">
          <CheckCircle2 size={16} className="text-emerald-400" /> Never calls in sick
        </div>
      </div>
    </div>
  );
}