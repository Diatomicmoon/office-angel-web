"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  const fadeUp = { hidden: { opacity: 0, y: 30 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } } };
  const staggerContainer = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.15 } } };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900 selection:bg-blue-500 selection:text-white">
      <Navbar activePage="about" />

      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden max-w-5xl mx-auto px-4 md:px-8 pt-16 md:pt-28 pb-12 md:pb-20 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-3xl z-0 pointer-events-none">
            <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-[pulse_6s_ease-in-out_infinite]"></div>
            <div className="absolute top-10 right-10 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-[100px] opacity-20 animate-[pulse_6s_ease-in-out_infinite] delay-1000"></div>
          </div>
          
          <motion.div initial="hidden" animate="visible" variants={staggerContainer} className="relative z-10">
            <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/80 backdrop-blur-md border border-gray-200 shadow-[0_4px_20px_rgb(0,0,0,0.05)] text-blue-700 text-sm font-bold mb-6 uppercase tracking-wide">
              <Zap size={16} /> Our Story
            </motion.div>
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
              Built by people who've been<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">inside the walls.</span>
            </motion.h1>
            <motion.p variants={fadeUp} className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
              Hard Hat Solutions didn't come from a startup incubator or a venture capital pitch deck. It came from watching real contractors lose real money — one missed call at a time.
            </motion.p>
          </motion.div>
        </section>

        {/* Founding Story */}
        <section className="bg-white border-t border-gray-200 py-16 md:py-24 px-4 md:px-8 relative overflow-hidden">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-3xl mx-auto relative z-10">
            <div className="space-y-6 text-gray-600">
              <motion.p variants={fadeUp} className="text-lg md:text-xl leading-relaxed">
                The idea for Hard Hat Solutions started on a job site. A master electrician is three stories up, hands in a panel, phone buzzing in his pocket. He can't answer. The customer hangs up after four rings and calls the next contractor on Google. That job — worth $1,500 minimum — is gone before he even gets back to ground level.
              </motion.p>
              <motion.p variants={fadeUp} className="text-lg md:text-xl leading-relaxed">
                It happens dozens of times a week across every trade. Electricians, HVAC techs, plumbers, roofers — every one of them running lean crews with no office staff, no receptionist, no one holding down the phones. They're doing the work and trying to run the business at the same time. Something always falls through the cracks.
              </motion.p>
              <motion.p variants={fadeUp} className="text-lg md:text-xl leading-relaxed">
                We built Hard Hat Solutions to be the thing that doesn't fall through the cracks. An AI that handles inbound calls professionally, qualifies the lead, books the job, and puts it on the crew's calendar — all before the contractor even climbs back down the ladder.
              </motion.p>
              <motion.p variants={fadeUp} className="text-lg md:text-xl leading-relaxed">
                But we didn't stop at call answering. We kept asking: what else is slowing these guys down? The answer was everything — dispatch, scheduling, tracking the crew, managing customers, knowing if the business is actually making money. So we built the whole back office.
              </motion.p>
              <motion.div variants={fadeUp} className="bg-gray-50 border border-gray-200 rounded-3xl p-8 mt-12 shadow-sm">
                <p className="text-xl md:text-2xl leading-relaxed font-bold text-gray-900 text-center">
                  Hard Hat Solutions is the AI office manager that every contractor deserves but could never afford to hire.
                </p>
              </motion.div>
            </div>
          </motion.div>
        </section>

        {/* Values */}
        <section className="bg-gray-50 border-t border-gray-200 py-20 md:py-32 px-4 md:px-8">
          <div className="max-w-5xl mx-auto">
            <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-3xl md:text-4xl font-extrabold text-center mb-12 md:mb-16">What we believe</motion.h2>
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-6 md:gap-8">
              {[
                {
                  title: "Trades deserve better tools.",
                  body: "The people building, fixing, and wiring America have been underserved by software for decades. Generic tools built for office workers don't cut it on a job site.",
                },
                {
                  title: "Automation should feel invisible.",
                  body: "The best technology gets out of the way. Contractors shouldn't have to think about the software — it should just work, quietly, in the background.",
                },
                {
                  title: "One recovered call changes everything.",
                  body: "We're not selling software. We're selling recovered opportunity. Contractors who plug the gaps in their front office unlock revenue that was already there.",
                },
              ].map((v, i) => (
                <motion.div key={i} variants={fadeUp} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <h3 className="text-xl font-bold mb-4 text-gray-900">{v.title}</h3>
                  <p className="text-gray-600 text-base leading-relaxed">{v.body}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-white border-t border-gray-200 py-20 md:py-32 px-4 md:px-8">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="max-w-4xl mx-auto text-center">
            <motion.h2 variants={fadeUp} className="text-3xl md:text-4xl font-extrabold mb-4">The team</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-500 text-lg md:text-xl mb-12 md:mb-16">A small team with a big mission.</motion.p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div variants={fadeUp} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 group">
                <div className="w-20 h-20 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-extrabold group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] transition-all">
                  J
                </div>
                <h3 className="text-2xl font-bold mb-1">Jakob</h3>
                <p className="text-blue-600 text-base font-semibold mb-4">Co-Founder & CEO</p>
                <p className="text-gray-600 text-base leading-relaxed">
                  Electrician turned software builder. Jakob designed every feature from firsthand experience on the job site.
                </p>
              </motion.div>
              <motion.div variants={fadeUp} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:border-blue-100 transition-all duration-300 group">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-extrabold group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all">
                  Z
                </div>
                <h3 className="text-2xl font-bold mb-1">Zaki</h3>
                <p className="text-blue-600 text-base font-semibold mb-4">Co-Founder & CTO</p>
                <p className="text-gray-600 text-base leading-relaxed">
                  Operations, product, and growth. Zaki is the architect behind the technology that makes the platform tick.
                </p>
              </motion.div>
              <motion.div variants={fadeUp} className="bg-gray-50 rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:border-emerald-100 transition-all duration-300 group sm:col-span-2 md:col-span-1">
                <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl font-extrabold group-hover:scale-110 group-hover:bg-emerald-600 group-hover:text-white group-hover:shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all">
                  B
                </div>
                <h3 className="text-2xl font-bold mb-1">Ben</h3>
                <p className="text-emerald-600 text-base font-semibold mb-4">Head of Sales</p>
                <p className="text-gray-600 text-base leading-relaxed">
                  The first point of contact for contractors. Ben ensures every new client gets the exact right package for their operation.
                </p>
              </motion.div>
            </div>
          </motion.div>
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
            <motion.h2 variants={fadeUp} className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">Want to see what we built?</motion.h2>
            <motion.p variants={fadeUp} className="text-gray-300 text-xl md:text-2xl mb-12">15 minutes. No slides. Just the real product.</motion.p>
            <motion.div variants={fadeUp}>
              <Link
                href="/#demo"
                className="inline-flex items-center gap-3 bg-white hover:bg-gray-50 text-gray-900 px-10 py-5 rounded-2xl font-bold text-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] hover:scale-105"
              >
                Book a Live Demo <ArrowRight size={24} />
              </Link>
            </motion.div>
          </motion.div>
        </section>

      </main>

      <footer className="bg-white py-12 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
