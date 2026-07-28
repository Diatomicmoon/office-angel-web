"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, X, ArrowRight, Zap, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";

const plans = [
  {
    name: "Starter",
    tagline: "For solo operators and small crews.",
    description: "Everything you need to stop missing calls and start booking more jobs automatically.",
    badge: null,
    color: "border-gray-100",
    hoverGlow: "hover:shadow-[0_0_40px_rgba(0,0,0,0.08)] hover:border-gray-300",
    buttonStyle: "bg-gray-900 text-white hover:bg-black",
    features: [
      { text: "AI Voice Dispatcher (overflow & after-hours)", included: true },
      { text: "24/7 After-Hours & Weekend Coverage", included: true },
      { text: "Lead Triage & Qualification", included: true },
      { text: "Auto-Schedule to Google / Apple Calendar", included: true },
      { text: "Job Summary Email to Owner", included: true },
      { text: "Call Logs & Transcripts", included: true },
      { text: "Smart Scheduling Inbox", included: true },
      { text: "SMS Alerts to Field Crew", included: false },
      { text: "AI Co-Pilot (Live Call Listener)", included: false },
      { text: "Custom Brand Call Script", included: false },
      { text: "Emergency Routing to Cell", included: false },
      { text: "Bilingual Support (EN + ES)", included: false },
      { text: "Live Field Tracking", included: false },
      { text: "CRM & Customer Profiles", included: false },
      { text: "Financial Dashboard", included: false },
    ],
  },
  {
    name: "Pro",
    tagline: "For growing crews who need the full suite.",
    description: "The complete AI back-office. Dispatch, Co-Pilot, CRM, field tracking, and more — all automated.",
    badge: "Most Popular",
    color: "border-blue-500 ring-2 ring-blue-500",
    hoverGlow: "shadow-[0_0_30px_rgba(59,130,246,0.15)] hover:shadow-[0_0_50px_rgba(59,130,246,0.3)]",
    buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
    features: [
      { text: "AI Voice Dispatcher (overflow & after-hours)", included: true },
      { text: "24/7 After-Hours & Weekend Coverage", included: true },
      { text: "Lead Triage & Qualification", included: true },
      { text: "Auto-Schedule to Google / Apple Calendar", included: true },
      { text: "Job Summary Email to Owner", included: true },
      { text: "Call Logs & Transcripts", included: true },
      { text: "Smart Scheduling Inbox", included: true },
      { text: "SMS Alerts to Field Crew", included: true },
      { text: "AI Co-Pilot (Live Call Listener)", included: true },
      { text: "Custom Brand Call Script", included: true },
      { text: "Emergency Routing to Cell", included: true },
      { text: "Bilingual Support (EN + ES)", included: true },
      { text: "Live Field Tracking", included: true },
      { text: "CRM & Customer Profiles", included: true },
      { text: "Financial Dashboard", included: false },
    ],
  },
  {
    name: "Elite",
    tagline: "For high-volume operations running at full scale.",
    description: "Unlimited calls, every feature unlocked, and a dedicated onboarding specialist to get you live fast.",
    badge: null,
    color: "border-gray-100",
    hoverGlow: "hover:shadow-[0_0_40px_rgba(0,0,0,0.08)] hover:border-gray-300",
    buttonStyle: "bg-gray-900 text-white hover:bg-black",
    features: [
      { text: "Unlimited AI Voice Dispatcher calls", included: true },
      { text: "24/7 After-Hours & Weekend Coverage", included: true },
      { text: "Lead Triage & Qualification", included: true },
      { text: "Auto-Schedule to Google / Apple Calendar", included: true },
      { text: "Job Summary Email to Owner", included: true },
      { text: "Call Logs & Transcripts", included: true },
      { text: "Smart Scheduling Inbox", included: true },
      { text: "SMS Alerts to Field Crew", included: true },
      { text: "AI Co-Pilot (Live Call Listener)", included: true },
      { text: "Custom Brand Call Script", included: true },
      { text: "Emergency Routing to Cell", included: true },
      { text: "Bilingual Support (EN + ES)", included: true },
      { text: "Live Field Tracking", included: true },
      { text: "CRM & Customer Profiles", included: true },
      { text: "Financial Dashboard", included: true },
    ],
  },
];

const competitors = [
  { name: "Basic Voice Tools", note: "Answer calls only. No scheduling, no CRM, no dashboard." },
  { name: "Generic AI Platforms", note: "Not built for trades. Miss the job flow entirely." },
  { name: "Human Answering Services", note: "Slower, expensive, and still require manual follow-up." },
  { name: "Hard Hat Solutions", note: "Purpose-built for trades. The complete AI back-office suite.", highlight: true },
];

export default function PricingPage() {
  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-blue-500 selection:text-white">
      <Navbar activePage="pricing" />

      <main className="flex-1 relative overflow-hidden">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-5xl z-0 pointer-events-none">
          <div className="absolute top-10 left-0 w-[500px] h-[500px] bg-blue-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-[pulse_8s_ease-in-out_infinite] translate-x-20"></div>
          <div className="absolute top-32 right-0 w-[500px] h-[500px] bg-indigo-400/20 rounded-full mix-blend-multiply filter blur-[120px] animate-[pulse_8s_ease-in-out_infinite] delay-1000 -translate-x-20"></div>
        </div>

        {/* Header */}
        <section className="relative z-10 max-w-4xl mx-auto px-4 md:px-8 pt-20 md:pt-32 pb-12 md:pb-16 text-center">
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-blue-100 shadow-sm text-blue-700 text-sm font-bold mb-8 uppercase tracking-wide">
              <Zap size={16} className="text-blue-600" /> Plans & Packages
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Priced for your operation.<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Not a one-size-fits-all.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Every contractor is different. Book a free demo and we'll put together the right package for your crew size, call volume, and budget.
            </motion.p>
          </motion.div>
        </section>

        {/* The Math */}
        <section className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 pb-16 md:pb-24">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
            className="bg-[#0d1117] text-white rounded-3xl p-8 md:p-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center shadow-2xl relative overflow-hidden group border border-gray-800"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-blue-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
            
            <div className="relative z-10">
              <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">$1,500+</p>
              <p className="text-gray-400 mt-3 text-sm md:text-base">Estimated value of a typical missed contractor service call*</p>
            </div>
            <div className="relative z-10">
              <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">24/7</p>
              <p className="text-gray-400 mt-3 text-sm md:text-base">Coverage across calls, scheduling, dispatch, and field ops</p>
            </div>
            <div className="relative z-10">
              <p className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">1 platform</p>
              <p className="text-gray-400 mt-3 text-sm md:text-base">Replacing the patchwork of tools contractors are stuck managing today</p>
            </div>
          </motion.div>
        </section>

        {/* Plan Cards */}
        <section className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 pb-20 md:pb-32">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <motion.div
                key={plan.name}
                variants={fadeUp}
                className={`bg-white/80 backdrop-blur-xl rounded-3xl border-2 ${plan.color} p-8 relative transition-all duration-500 transform hover:-translate-y-2 ${plan.hoverGlow}`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)] text-white text-xs font-extrabold px-5 py-1.5 rounded-full uppercase tracking-wide">
                    {plan.badge}
                  </div>
                )}
                <h2 className="text-3xl font-extrabold mb-2 text-gray-900">{plan.name}</h2>
                <p className="text-blue-600 text-sm font-bold mb-4 uppercase tracking-wide">{plan.tagline}</p>
                <p className="text-gray-600 text-base mb-8 leading-relaxed">{plan.description}</p>

                <div className="bg-gray-50/50 rounded-2xl p-5 mb-8 text-center border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Custom pricing based on your operation</p>
                  <p className="text-base font-bold text-gray-900">Book a demo to get your quote</p>
                </div>

                <Link
                  href="/#demo"
                  className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-base transition-all shadow-md hover:shadow-xl mb-8 ${plan.buttonStyle}`}
                >
                  <Phone size={18} /> Talk to Sales
                </Link>
                <ul className="space-y-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm md:text-base">
                      {f.included ? (
                        <Check size={18} className="text-emerald-500 mt-0.5 shrink-0 font-bold" />
                      ) : (
                        <X size={18} className="text-gray-300 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? "text-gray-800 font-medium" : "text-gray-400"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-center text-gray-400 text-sm mt-12 font-medium">
            Subscriptions are month-to-month · Custom builds contracted individually · Setup timeline confirmed at onboarding
          </motion.p>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden bg-gray-900 text-white py-24 md:py-32 px-4 md:px-8 text-center border-t border-gray-800">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-full">
              <div className="absolute inset-0 bg-blue-600 rounded-full mix-blend-screen filter blur-[150px] opacity-30 animate-pulse"></div>
            </div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 brightness-100 contrast-150"></div>
          </div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-3xl mx-auto relative z-10">
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Let's build your package.</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-300 text-xl md:text-2xl mb-12">15 minutes. No slides. We'll show you the product and put together a quote on the spot.</motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/#demo"
                className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105"
              >
                Book Your Free Demo <ArrowRight size={24} />
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>

      <footer className="bg-white py-8 border-t border-gray-200 text-center text-sm text-gray-500 px-4 relative z-10">
        <p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>
        <p className="mt-2 text-xs text-gray-400 max-w-xl mx-auto">* Figures are estimates based on industry data and are provided for illustrative purposes only. Individual results will vary based on business type, call volume, and market conditions. Hard Hat Solutions makes no guarantee of specific outcomes.</p>
      </footer>
    </div>
  );
}