"use client";

import { motion, useEffect, useState } from "react";
import { Terminal, ShieldCheck, Zap, Activity } from "lucide-react";

const lines = [
  { text: "> Incoming call detected: (612) 555-0192", delay: 0.5, color: "text-gray-300" },
  { text: "> Transcribing voice audio...", delay: 1.5, color: "text-gray-400" },
  { text: "  \"Hey, my main breaker keeps tripping and half the house is out.\"", delay: 2.5, color: "text-blue-300" },
  { text: "> Analyzing intent: Emergency Service / Panel Issue", delay: 3.5, color: "text-emerald-400" },
  { text: "> Checking technician availability...", delay: 4.5, color: "text-gray-400" },
  { text: "> Match found: Zaki is 3 miles away. ETA 20 mins.", delay: 5.5, color: "text-emerald-400" },
  { text: "> Action: Dispatching tech & texting customer tracking link.", delay: 6.5, color: "text-purple-400" },
  { text: "> STATUS: Job Booked. Revenue pipeline updated.", delay: 7.5, color: "text-blue-400 font-bold" },
];

export default function AITerminal() {
  const [visibleLines, setVisibleLines] = useState<number>(0);

  useEffect(() => {
    const timers = lines.map((line, index) => {
      return setTimeout(() => {
        setVisibleLines((prev) => Math.max(prev, index + 1));
      }, line.delay * 1000);
    });

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-2xl mx-auto rounded-2xl overflow-hidden bg-[#0d1117] border border-gray-800 shadow-[0_0_50px_rgba(59,130,246,0.15)] relative group"
    >
      {/* Top Bar */}
      <div className="flex items-center px-4 py-3 bg-[#161b22] border-b border-gray-800">
        <div className="flex gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
        </div>
        <div className="mx-auto flex items-center gap-2 text-xs font-mono text-gray-400">
          <Terminal size={14} /> agent.hardhat.core
        </div>
      </div>

      {/* Terminal Content */}
      <div className="p-6 font-mono text-sm md:text-base leading-relaxed text-left min-h-[320px]">
        {lines.slice(0, visibleLines).map((line, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className={`mb-2 ${line.color}`}
          >
            {line.text}
          </motion.div>
        ))}
        {visibleLines < lines.length && (
          <motion.div 
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
            className="w-3 h-5 bg-blue-500 inline-block align-middle mt-1"
          />
        )}
      </div>

      {/* Tech Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"></div>
    </motion.div>
  );
}