"use client";

import Link from "next/link";
import { PhoneIncoming, Zap, Calendar, ArrowRight, ShieldCheck, BarChart3, Bot } from "lucide-react";
import CalendlyEmbed from "@/components/CalendlyEmbed";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Navigation */}
      <nav className="w-full bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center z-10 relative">
        <div className="flex items-center gap-2">
          <Bot className="text-blue-600" size={28} />
          <span className="text-xl font-bold tracking-tight">Office Angel</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            Login
          </Link>
          <Link href="#demo" className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">
            Book Demo
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap size={16} /> The AI Office Tech for Home Services
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
            Never miss a <span className="text-blue-600">service call</span><br />while you're in the attic.
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Office Angel answers your overflow calls, extracts job details, and automatically schedules the crew to your calendar. The complete back-office in a box.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="#demo" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              Talk to Sales <ArrowRight size={20} />
            </Link>
          </div>
        </section>

        {/* Feature Grid */}
        <section className="bg-white py-24 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="text-gray-500 mt-2">We plug right into your existing phone number and calendar.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <PhoneIncoming size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Answers Overflow Calls</h3>
                <p className="text-gray-600 leading-relaxed">
                  When your office is busy or after hours, our Voice AI answers the phone with your company name, sounding exactly like a human dispatcher.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Triage & Qualify</h3>
                <p className="text-gray-600 leading-relaxed">
                  It asks the right questions: "What's the address?", "Is it an emergency?", and "Are you the homeowner?". 
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Auto-Schedules Jobs</h3>
                <p className="text-gray-600 leading-relaxed">
                  Job details are summarized and instantly dropped onto your existing Google or Apple Calendar. The field guys see it immediately on their phones.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Demo */}
        <section id="demo" className="py-24 bg-gray-900 text-white px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to scale your crew?</h2>
            <p className="text-xl text-gray-400 mb-12">
              Stop losing $1,500 electrical service calls to voicemail. Pick a time below and we'll show you exactly how it works.
            </p>
            <CalendlyEmbed />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>© 2026 Ghost Office LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}