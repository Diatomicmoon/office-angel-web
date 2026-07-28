"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  PhoneIncoming,
  Calendar,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Inbox,
  Users,
  Mic,
  ClipboardList,
  Zap
} from "lucide-react";
import AnimatedRevenueChart from "@/components/AnimatedRevenueChart";
import AITerminal from "@/components/AITerminal";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-blue-500 selection:text-white">
      <Navbar />

      <main className="flex-1">

        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 md:pt-32 pb-20 md:pb-32 text-center min-h-[90vh] flex flex-col justify-center">
          {/* Video Background Layer */}
          <div className="absolute inset-0 z-0 bg-black">
            <video 
              autoPlay 
              loop 
              muted 
              playsInline 
              className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-screen"
            >
              <source src="/assets/hardhat-hero.mp4" type="video/mp4" />
            </video>
            {/* Dark overlay to ensure text legibility */}
            <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 via-gray-900/40 to-gray-50"></div>
          </div>
          
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10 max-w-7xl mx-auto px-4 md:px-8">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 shadow-lg text-blue-300 text-sm font-bold mb-8 tracking-wide uppercase">
              <Zap size={16} className="text-blue-400" /> The AI Back-Office for Contractors
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-5xl md:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6 drop-shadow-2xl">
              Your entire office.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-blue-400 bg-[length:200%_auto] animate-[pulse_3s_ease-in-out_infinite]">Running on autopilot.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto mb-12 leading-relaxed drop-shadow-md">
              Hard Hat Solutions is a full AI back-office platform built for home service contractors. From the first inbound call to the final invoice — handled automatically.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row justify-center gap-4 mb-20">
              <Link href="#demo" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] flex items-center justify-center gap-2 transform hover:-translate-y-1">
                See It Live <ArrowRight size={20} />
              </Link>
              <Link href="#features" className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-8 py-4 rounded-2xl font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-2 hover:-translate-y-1">
                Explore Features
              </Link>
            </motion.div>

            {/* AI Terminal Visualization */}
            <motion.div variants={fadeUp} className="relative z-20">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-3xl blur opacity-20"></div>
              <AITerminal />
            </motion.div>
          </motion.div>
        </section>

        {/* Feature Suite */}
        <section id="features" className="bg-[#050505] py-20 md:py-32 border-t border-gray-800 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 md:px-8">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="text-center mb-16 md:mb-24">
              <motion.h2 variants={fadeUp} className="text-3xl md:text-5xl font-bold text-white tracking-tight">Everything your office needs.</motion.h2>
              <motion.p variants={fadeUp} className="text-gray-400 mt-4 text-xl">One platform. Built explicitly for the trades.</motion.p>
            </motion.div>

            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={staggerContainer} className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">

              {/* Dynamic Animated Chart taking full width */}
              <AnimatedRevenueChart />

              {/* Feature Cards */}
              <motion.div variants={fadeUp} className="bg-[#0d1117] rounded-3xl p-8 border border-gray-800 hover:bg-[#161b22] hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:border-blue-500/30 transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-blue-500/10 text-blue-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <PhoneIncoming size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">AI Voice Dispatcher</h3>
                <p className="text-gray-400 leading-relaxed text-base">
                  Handles overflow and after-hours calls using your company name. Captures job details and keeps your pipeline full while you sleep.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-[#0d1117] rounded-3xl p-8 border border-gray-800 hover:bg-[#161b22] hover:shadow-[0_0_30px_rgba(99,102,241,0.15)] hover:border-indigo-500/30 transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Mic size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">AI Co-Pilot Mode</h3>
                <p className="text-gray-400 leading-relaxed text-base">
                  Assists your team during live calls in real time. By the time you hang up, the job is already drafted and ready to confirm.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bg-[#0d1117] rounded-3xl p-8 border border-gray-800 hover:bg-[#161b22] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] hover:border-emerald-500/30 transition-all duration-500 transform hover:-translate-y-2 group">
                <div className="w-14 h-14 bg-emerald-500/10 text-emerald-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-sm">
                  <Calendar size={28} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">Auto Scheduling</h3>
                <p className="text-gray-400 leading-relaxed text-base">
                  Confirmed jobs are pushed directly to your crew's existing calendar. Field techs see the update instantly — no back and forth.
                </p>
              </motion.div>

            </motion.div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="demo" className="relative overflow-hidden py-24 md:py-32 bg-gray-900 text-white border-t border-gray-800">
          <div className="absolute inset-0 z-0">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full">
              <div className="absolute inset-0 bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-40 animate-pulse"></div>
            </div>
            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150"></div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-4xl mx-auto px-4 text-center relative z-10">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight">Ready to scale your crew?</motion.h2>
            <motion.p variants={fadeUp} className="text-xl md:text-2xl text-gray-300 mb-12">
              Stop losing $1,500 service calls to voicemail. Let us show you exactly how it works.
            </motion.p>
            <motion.div variants={fadeUp}>
              <Link href="/contact" className="inline-flex items-center gap-3 bg-white text-gray-900 px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)] hover:scale-105">
                Book a Live Demo <ArrowRight size={24} />
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-white py-12 border-t border-gray-200 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-4">
        <p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>
        <p>Contact: support@hardhat-solutions.com | (612) 598-6260</p>
        <div className="flex gap-4">
          <a href="/privacy-policy" className="hover:text-gray-900 transition-colors">Privacy Policy</a>
          <a href="/terms" className="hover:text-gray-900 transition-colors">Terms & Conditions</a>
        </div>
      </footer>
    </div>
  );
}