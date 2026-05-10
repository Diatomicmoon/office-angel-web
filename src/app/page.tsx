"use client";

import Link from "next/link";
import {
  PhoneIncoming,
  Zap,
  Calendar,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  Bot,
  MapPin,
  Inbox,
  Users,
  Mic,
  DollarSign,
  ClipboardList,
} from "lucide-react";
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
        <div className="flex items-center gap-6">
          <Link href="#features" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Pricing</Link>
          <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">About</Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">Login</Link>
          <Link href="#demo" className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">Book Demo</Link>
        </div>
      </nav>

      <main className="flex-1">

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-8 pt-24 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap size={16} /> The AI Back-Office for Contractors
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
            Your entire office.<br />
            <span className="text-blue-600">Running on autopilot.</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Office Angel is a full AI office suite built for home service contractors. Calls, scheduling, dispatch, CRM, financials, and field tracking — all in one place, running 24/7.
          </p>
          <div className="flex justify-center gap-4">
            <Link href="#demo" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center gap-2">
              See It Live <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-sm flex items-center gap-2">
              See All Features
            </Link>
          </div>
        </section>

        {/* Social Proof Bar */}
        <section className="bg-white border-t border-b border-gray-200 py-8 px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-4">Built for home service businesses</p>
            <div className="flex flex-wrap justify-center gap-8 text-gray-700 font-semibold text-base">
              <span>Electrical Contractors</span>
              <span>HVAC Companies</span>
              <span>Plumbing</span>
              <span>Roofing</span>
              <span>Solar</span>
              <span>General Contractors</span>
            </div>
          </div>
        </section>

        {/* Full Feature Suite */}
        <section id="features" className="bg-gray-50 py-24 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900">Everything your office needs. Nothing it doesn't.</h2>
              <p className="text-gray-500 mt-2 text-lg">One platform. Zero office drama.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">

              {/* AI Voice Dispatcher */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-6">
                  <PhoneIncoming size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Voice Dispatcher</h3>
                <p className="text-gray-600 leading-relaxed">
                  Answers overflow and after-hours calls with your company name, sounds exactly like a human, asks the right triage questions, and never lets a lead go to voicemail.
                </p>
              </div>

              {/* AI Co-Pilot */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-6">
                  <Mic size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">AI Co-Pilot Mode</h3>
                <p className="text-gray-600 leading-relaxed">
                  When a human takes the call, AI listens silently in the background. It extracts the address, job type, and urgency — and has the calendar event ready before you hang up.
                </p>
              </div>

              {/* Smart Scheduling Inbox */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-6">
                  <Inbox size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Scheduling Inbox</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every inbound job request — from calls, texts, and web forms — lands in one unified inbox. Review, approve, and dispatch in seconds.
                </p>
              </div>

              {/* Auto Job Scheduling */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-6">
                  <Calendar size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Auto Job Scheduling</h3>
                <p className="text-gray-600 leading-relaxed">
                  Job details are instantly pushed to your crew's Google or Apple Calendar. Field guys see it on their phones the second it's booked. No calls, no texts, no confusion.
                </p>
              </div>

              {/* Live Field Tracking */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-6">
                  <MapPin size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Live Field Tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  See exactly where every technician is and what job they're on — in real time. Know who's available to take the next job without making a single call.
                </p>
              </div>

              {/* CRM & Customer Profiles */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-6">
                  <Users size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">CRM & Customer Profiles</h3>
                <p className="text-gray-600 leading-relaxed">
                  Full job history, notes, and contact info for every customer. Know who called before, what work was done, and when to follow up — all in one place.
                </p>
              </div>

              {/* Financial Dashboard */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-6">
                  <DollarSign size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Financial Dashboard</h3>
                <p className="text-gray-600 leading-relaxed">
                  Track revenue, open invoices, and job profitability at a glance. Know exactly where your money is without logging into QuickBooks or chasing down your accountant.
                </p>
              </div>

              {/* Call Logs */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-6">
                  <ClipboardList size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Call Logs & Transcripts</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every AI call is recorded, transcribed, and summarized automatically. Review any call in seconds. Never lose a job detail buried in a voicemail again.
                </p>
              </div>

              {/* Lead Qualification */}
              <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-6">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3">Lead Triage & Qualification</h3>
                <p className="text-gray-600 leading-relaxed">
                  AI asks the right questions on every call — address, job type, emergency level, homeowner status — so your crew only shows up to qualified, booked jobs.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* How It Plugs In */}
        <section className="bg-white py-24 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-8 text-center">
            <h2 className="text-3xl font-bold mb-4">Zero learning curve. Plug in and go.</h2>
            <p className="text-gray-500 text-lg mb-12">We connect to the tools your crew already uses. No new apps to install. No training required.</p>
            <div className="grid md:grid-cols-3 gap-8 text-left">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="font-bold text-lg mb-2">Your existing phone number</p>
                <p className="text-gray-600 text-sm">We forward overflow calls to Office Angel — your number stays the same.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="font-bold text-lg mb-2">Google & Apple Calendar</p>
                <p className="text-gray-600 text-sm">Jobs drop straight onto the calendars your crew already has on their phones.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="font-bold text-lg mb-2">Your website & web forms</p>
                <p className="text-gray-600 text-sm">Web leads and contact forms route automatically into your scheduling inbox.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Demo */}
        <section id="demo" className="py-24 bg-gray-900 text-white px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">See the whole thing live.</h2>
            <p className="text-xl text-gray-400 mb-12">
              Pick a time below and we'll walk you through the full platform in 30 minutes. No slides. Just the real product.
            </p>
            <CalendlyEmbed />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white py-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
