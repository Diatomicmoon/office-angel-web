"use client";

import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar activePage="about" />

      <main className="flex-1">

        {/* Hero */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-12 md:pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap size={16} /> Our Story
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-6 leading-tight">
            Built by people who've been<br />
            <span className="text-blue-600">inside the walls.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Hard Hat Solutions didn't come from a startup incubator or a venture capital pitch deck. It came from watching real contractors lose real money — one missed call at a time.
          </p>
        </section>

        {/* Founding Story */}
        <section className="bg-white border-t border-gray-200 py-16 md:py-20 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="space-y-6 text-gray-600">
              <p className="text-base md:text-lg leading-relaxed">
                The idea for Hard Hat Solutions started on a job site. A master electrician is three stories up, hands in a panel, phone buzzing in his pocket. He can't answer. The customer hangs up after four rings and calls the next contractor on Google. That job — worth $1,500 minimum — is gone before he even gets back to ground level.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                It happens dozens of times a week across every trade. Electricians, HVAC techs, plumbers, roofers — every one of them running lean crews with no office staff, no receptionist, no one holding down the phones. They're doing the work and trying to run the business at the same time. Something always falls through the cracks.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                We built Hard Hat Solutions to be the thing that doesn't fall through the cracks. An AI that handles inbound calls professionally, qualifies the lead, books the job, and puts it on the crew's calendar — all before the contractor even climbs back down the ladder.
              </p>
              <p className="text-base md:text-lg leading-relaxed">
                But we didn't stop at call answering. We kept asking: what else is slowing these guys down? The answer was everything — dispatch, scheduling, tracking the crew, managing customers, knowing if the business is actually making money. So we built the whole back office.
              </p>
              <p className="text-base md:text-lg leading-relaxed font-medium text-gray-800">
                Hard Hat Solutions is the AI office manager that every contractor deserves but could never afford to hire.
              </p>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="bg-gray-50 border-t border-gray-200 py-16 md:py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12">What we believe</h2>
            <div className="grid sm:grid-cols-3 gap-6 md:gap-4 md:p-8">
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
                  body: "We're not selling software. We're selling recovered opportunity. Contractors who plug the gaps in their front office unlock revenue that was already there — they just couldn't capture it.",
                },
              ].map((v, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-base md:text-lg font-bold mb-3">{v.title}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="bg-white border-t border-gray-200 py-16 md:py-20 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">The team</h2>
            <p className="text-gray-500 text-base md:text-lg mb-10 md:mb-12">A small team with a big mission.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8 max-w-2xl mx-auto">
              <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
                <div className="w-16 h-16 bg-gray-900 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold">
                  J
                </div>
                <h3 className="text-xl font-bold mb-1">Jakob</h3>
                <p className="text-blue-600 text-sm font-medium mb-3">Co-Founder & CEO</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Master Electrician turned software builder. Jakob designed every feature from firsthand experience on the job site.
                </p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 md:p-8 border border-gray-100">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-extrabold">
                  Z
                </div>
                <h3 className="text-xl font-bold mb-1">Zaki</h3>
                <p className="text-blue-600 text-sm font-medium mb-3">Co-Founder & CTO</p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Sales, operations, and growth. Zaki is the one contractors talk to first — and the reason they stick around.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-900 text-white py-16 md:py-20 px-4 md:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Want to see what we built?</h2>
            <p className="text-gray-400 text-base md:text-lg mb-8">15 minutes. No slides. Just the real product.</p>
            <Link
              href="/#demo"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Book a Demo <ArrowRight size={20} />
            </Link>
          </div>
        </section>

      </main>

      <footer className="bg-white py-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
