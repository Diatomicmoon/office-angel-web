"use client";

import { motion } from "framer-motion";
import { Zap, Check, Smartphone, Wifi, MapPin, Route } from "lucide-react";

export const VoiceDispatcherAnimation = () => {
  return (
    <div className="w-full h-40 bg-[#0a0d14] rounded-2xl border border-gray-800/60 flex items-center justify-center relative overflow-hidden mb-6 group-hover:border-blue-500/30 transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
      
      {/* Audio Waveform */}
      <div className="flex items-center gap-[4px] z-10">
        {[...Array(16)].map((_, i) => (
          <motion.div
            key={i}
            className="w-1.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)] rounded-full"
            animate={{ height: [10, Math.random() * 50 + 20, 10] }}
            transition={{ 
              repeat: Infinity, 
              duration: 0.6 + Math.random() * 0.4, 
              ease: "easeInOut", 
              delay: i * 0.05 
            }}
          />
        ))}
      </div>
      
      {/* Status Bar */}
      <div className="absolute top-3 left-4 text-[10px] font-mono text-blue-400 flex items-center gap-2 opacity-90 tracking-widest bg-blue-500/10 px-2 py-1 rounded-md border border-blue-500/20">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
        </span>
        LIVE CALL
      </div>
    </div>
  );
};

export const CoPilotAnimation = () => {
  return (
    <div className="w-full h-40 bg-[#0a0d14] rounded-2xl border border-gray-800/60 p-4 flex flex-col justify-center relative overflow-hidden mb-6 group-hover:border-indigo-500/30 transition-colors">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-900/20 via-transparent to-transparent"></div>
      
      <div className="space-y-4 z-10 w-full px-2">
        {/* Fake transcript typing */}
        <div className="flex gap-3 items-start">
          <div className="w-6 h-6 rounded-full bg-gray-800 flex-shrink-0 flex items-center justify-center text-[9px] text-gray-500 border border-gray-700">C</div>
          <div className="text-[11px] font-mono text-gray-400 leading-relaxed bg-gray-800/40 p-2 rounded-r-lg rounded-bl-lg border border-gray-800/50 w-full">
            <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }} className="mr-1">_</motion.span>
            Panel is buzzing...
          </div>
        </div>

        {/* AI Suggestion sliding in */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ repeat: Infinity, duration: 4, delay: 1, repeatType: "reverse", ease: "backOut" }}
          className="ml-9 bg-indigo-500/10 border border-indigo-500/30 p-2 rounded-l-lg rounded-br-lg flex items-start gap-2 shadow-[0_0_15px_rgba(99,102,241,0.15)]"
        >
          <Zap size={14} className="text-indigo-400 mt-0.5 flex-shrink-0" />
          <div className="text-[10px] font-mono text-indigo-300">
            <span className="font-bold text-indigo-200">INTENT:</span> Emergency. <br/>Prompting dispatch...
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const AutoSchedulingAnimation = () => {
  return (
    <div className="w-full h-40 bg-[#0a0d14] rounded-2xl border border-gray-800/60 flex items-center justify-center relative overflow-hidden mb-6 group-hover:border-emerald-500/30 transition-colors p-5">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-900/20 via-transparent to-transparent"></div>
      
      <div className="w-full max-w-[240px] z-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-3 px-1">
          <div className="text-[10px] font-mono text-gray-500 tracking-widest">CALENDAR</div>
          <div className="text-[10px] font-mono text-emerald-500 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            <Check size={10} /> SYNCED
          </div>
        </div>
        
        {/* Grid */}
        <div className="grid grid-cols-4 gap-2">
          {[...Array(4)].map((_, i) => (
            <div key={`t-${i}`} className="h-7 bg-gray-800/40 rounded-md border border-gray-800/80"></div>
          ))}
          
          <div className="h-7 bg-gray-800/40 rounded-md border border-gray-800/80"></div>
          
          {/* Animated booking block */}
          <motion.div 
            className="h-7 bg-emerald-500/20 border border-emerald-500/50 col-span-2 rounded-md flex items-center justify-center text-[10px] font-mono text-emerald-300 font-bold shadow-[0_0_15px_rgba(16,185,129,0.2)] overflow-hidden relative"
            initial={{ opacity: 0, scale: 0.8, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ repeat: Infinity, duration: 3, repeatDelay: 1.5, ease: "backOut" }}
          >
            <motion.div 
              className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent"
              initial={{ x: "-100%" }}
              animate={{ x: "200%" }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.5, ease: "linear" }}
            />
            TECH DISPATCHED
          </motion.div>
          
          <div className="h-7 bg-gray-800/40 rounded-md border border-gray-800/80"></div>
          
          {[...Array(4)].map((_, i) => (
            <div key={`b-${i}`} className="h-7 bg-gray-800/40 rounded-md border border-gray-800/80"></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const HardwareAnimation = () => {
  return (
    <div className="w-full h-full min-h-[300px] bg-[#0a0d14] rounded-2xl border border-gray-800 flex items-center justify-center relative overflow-hidden">
      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
      <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(#1f2937 1px, transparent 1px)", backgroundSize: "20px 20px" }}></div>
      
      {/* Central Hub (Truck/Bin) */}
      <div className="relative z-10 w-24 h-24 bg-gray-900 border-2 border-cyan-500/50 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.2)]">
        <Wifi size={32} className="text-cyan-400 mb-2" />
        <motion.div 
          animate={{ scale: [1, 2.5], opacity: [0.8, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
          className="absolute inset-0 border-2 border-cyan-400 rounded-2xl"
        />
        <div className="absolute bottom-2 text-[9px] font-mono text-cyan-300 tracking-wider">SYNCING</div>
      </div>

      {/* Connection Lines & Nodes */}
      {/* Top Left - NFC */}
      <motion.div 
        className="absolute top-12 left-12 flex flex-col items-center gap-2"
        animate={{ y: [0, -5, 0] }}
        transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
      >
        <div className="w-12 h-12 bg-gray-800 border border-gray-600 rounded-full flex items-center justify-center shadow-lg">
          <Smartphone size={20} className="text-gray-300" />
        </div>
        <div className="text-[10px] font-mono text-gray-400 bg-gray-900/80 px-2 py-1 rounded">NFC_TAG</div>
      </motion.div>

      {/* Top Right - Smart Bin */}
      <motion.div 
        className="absolute top-12 right-12 flex flex-col items-center gap-2"
        animate={{ y: [0, 5, 0] }}
        transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
      >
        <div className="w-12 h-12 bg-gray-800 border border-gray-600 rounded-lg flex items-center justify-center shadow-lg">
          <div className="w-4 h-6 bg-gray-600 rounded-sm flex flex-col justify-end p-0.5">
             <motion.div 
              animate={{ height: ["20%", "80%", "40%"] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "linear" }}
              className="w-full bg-emerald-400 rounded-sm"
             />
          </div>
        </div>
        <div className="text-[10px] font-mono text-gray-400 bg-gray-900/80 px-2 py-1 rounded">IoT_BIN</div>
      </motion.div>

      {/* Bottom Center - Fleet */}
      <motion.div 
        className="absolute bottom-12 right-1/4 flex flex-col items-center gap-2"
        animate={{ x: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
      >
        <div className="w-12 h-12 bg-gray-800 border border-cyan-500/30 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.1)] relative">
          <MapPin size={20} className="text-cyan-400" />
          <div className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
        </div>
        <div className="text-[10px] font-mono text-cyan-300 bg-cyan-900/20 border border-cyan-500/20 px-2 py-1 rounded">OBD2_GPS</div>
      </motion.div>
    </div>
  );
};

export const D2DAnimation = () => {
  return (
    <div className="w-full h-full min-h-[300px] bg-[#0a0d14] rounded-2xl border border-gray-800/60 flex items-center justify-center relative overflow-hidden group-hover:border-purple-500/30 transition-colors p-4">
      {/* Map Background grid */}
      <div className="absolute inset-0 bg-[#05080f] opacity-80" style={{ backgroundImage: "linear-gradient(#1f2937 1px, transparent 1px), linear-gradient(90deg, #1f2937 1px, transparent 1px)", backgroundSize: "40px 40px" }}></div>
      
      {/* Territory Polygon */}
      <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
        <motion.polygon 
          points="40,40 320,60 360,260 60,280" 
          fill="rgba(168, 85, 247, 0.15)" 
          stroke="#a855f7" 
          strokeWidth="2" 
          strokeDasharray="6,6"
          animate={{ opacity: [0.3, 0.6, 0.3] }} 
          transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
        />
      </svg>

      {/* Ghost Trail Route */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 300" preserveAspectRatio="none">
        <motion.path 
          d="M80,240 L120,160 L200,190 L260,110 L320,140"
          fill="none" 
          stroke="#c084fc" 
          strokeWidth="3" 
          strokeDasharray="8,8"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        />
      </svg>

      {/* Hot Lead Pin */}
      <motion.div 
        className="absolute flex flex-col items-center"
        style={{ left: "65%", top: "35%" }}
        animate={{ y: [0, -8, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center relative shadow-[0_0_20px_rgba(239,68,68,0.5)] border border-red-500/50">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <motion.div animate={{ scale: [1, 2.5], opacity: [0.8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="absolute inset-0 border-[2px] border-red-400 rounded-full" />
        </div>
        <div className="text-[10px] font-mono text-red-400 mt-1 bg-gray-900/90 px-1.5 py-0.5 rounded font-bold border border-red-500/30">HOT LEAD</div>
      </motion.div>

      {/* Moving Rep Avatar */}
      <motion.div 
        className="absolute w-10 h-10 bg-[#0d1117] border-2 border-purple-500 rounded-full shadow-[0_0_25px_rgba(168,85,247,0.6)] flex items-center justify-center z-10"
        animate={{
          left: ["20%", "30%", "50%", "65%", "80%"],
          top: ["80%", "53%", "63%", "36%", "46%"]
        }}
        transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
        style={{ translateX: "-50%", translateY: "-50%" }}
      >
        <div className="w-4 h-4 bg-purple-400 rounded-full animate-pulse" />
        <div className="absolute -bottom-6 text-[9px] font-mono text-purple-300 bg-purple-900/40 px-1.5 rounded">BEN_REP</div>
      </motion.div>
    </div>
  );
};