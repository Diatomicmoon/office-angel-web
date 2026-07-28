"use client";

import { motion } from "framer-motion";
import { Zap, Check } from "lucide-react";

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
