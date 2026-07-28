"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Clock, DollarSign, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AIEmployeePage() {
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.15 } }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar activePage="ai-employee" />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden max-w-7xl mx-auto px-4 md:px-8 pt-20 md:pt-32 pb-16 md:pb-24 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 text-sm font-medium mb-6">
              <Zap size={16} /> Staffing as a Service
            </motion.div>
            
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
              Don't buy software. <br />
              <span className="text-blue-600">Hire an AI employee.</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
              You don't need another dashboard to log into. You need someone to answer the phone, book the jobs, and handle the paperwork while you're in the field.
            </motion.p>
            
            <motion.div variants={fadeUp} className="flex justify-center">
              <Link href="/#demo" className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center justify-center gap-2">
                Meet Your New Hire <ArrowRight size={20} />
              </Link>
            </motion.div>
          </motion.div>
        </section>

        {/* Comparison Section */}
        <section className="bg-white py-20 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              viewport={{ once: true }} 
              variants={fadeUp}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">The new way to scale your back office.</h2>
              <p className="text-gray-500 text-lg">Stop paying $50k+ a year for an office admin.</p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {/* Traditional Hire */}
              <motion.div 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={fadeUp}
                className="bg-gray-50 rounded-3xl p-8 border border-gray-200"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <Clock className="text-gray-400" /> Traditional Office Hire
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-gray-600"><span className="text-red-500 font-bold">✕</span> Costs $45,000 - $60,000/year</li>
                  <li className="flex gap-3 text-gray-600"><span className="text-red-500 font-bold">✕</span> Works 9 to 5, Monday to Friday</li>
                  <li className="flex gap-3 text-gray-600"><span className="text-red-500 font-bold">✕</span> Misses calls when on the other line</li>
                  <li className="flex gap-3 text-gray-600"><span className="text-red-500 font-bold">✕</span> Takes weeks to train</li>
                  <li className="flex gap-3 text-gray-600"><span className="text-red-500 font-bold">✕</span> Calls in sick & takes PTO</li>
                </ul>
              </motion.div>

              {/* AI Hire */}
              <motion.div 
                initial="hidden" 
                whileInView="visible" 
                viewport={{ once: true }} 
                variants={fadeUp}
                className="bg-blue-600 rounded-3xl p-8 border border-blue-500 shadow-2xl text-white transform md:-translate-y-4"
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Zap className="text-blue-300" /> The Hard Hat AI
                </h3>
                <ul className="space-y-4">
                  <li className="flex gap-3"><CheckCircle2 className="text-blue-300 shrink-0" /> Costs a fraction of a human salary</li>
                  <li className="flex gap-3"><CheckCircle2 className="text-blue-300 shrink-0" /> Works 24/7/365, nights and weekends</li>
                  <li className="flex gap-3"><CheckCircle2 className="text-blue-300 shrink-0" /> Answers infinite calls simultaneously</li>
                  <li className="flex gap-3"><CheckCircle2 className="text-blue-300 shrink-0" /> Ready to work on Day 1</li>
                  <li className="flex gap-3"><CheckCircle2 className="text-blue-300 shrink-0" /> Never calls in sick, never quits</li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-white py-8 border-t border-gray-200 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
        <p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}