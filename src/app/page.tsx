"use client";

import Link from "next/link";
import {
  PhoneIncoming,
  Zap,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Bot,
  MapPin,
  Inbox,
  Users,
  Mic,
  DollarSign,
  ClipboardList,
} from "lucide-react";
import CalendlyEmbed from "@/components/CalendlyEmbed";
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1">

        {/* Hero */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-14 md:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap size={16} /> The AI Back-Office for Contractors
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
            Your entire office.<br />
            <span className="text-blue-600">Running on autopilot.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Office Angel is a full AI back-office platform built for home service contractors. From the first inbound call to the final invoice — handled automatically, around the clock.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="#demo" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2">
              See It Live <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-2">
              See All Features
            </Link>
          </div>
        </section>

        {/* Industry Bar */}
        <section className="bg-white border-t border-b border-gray-200 py-8 px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-4">Built for home service businesses</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-8 text-gray-700 font-semibold text-sm md:text-base">
              <span>Electrical Contractors</span>
              <span>HVAC Companies</span>
              <span>Plumbing</span>
              <span>Roofing</span>
              <span>Solar</span>
              <span>General Contractors</span>
            </div>
          </div>
        </section>

        {/* Feature Suite */}
        <section id="features" className="bg-gray-50 py-16 md:py-24 border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-4 md:px-8">
            <div className="text-center mb-12 md:mb-16">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Everything your office needs. Nothing it doesn't.</h2>
              <p className="text-gray-500 mt-2 text-base md:text-lg">One platform. Built for the trades.</p>
            </div>

            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5">
                  <PhoneIncoming size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">AI Voice Dispatcher</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Handles overflow and after-hours calls using your company name. Asks the right questions, captures the job details, and keeps your pipeline full — even when your team is unavailable.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-5">
                  <Mic size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">AI Co-Pilot Mode</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Assists your team during live calls in real time. By the time you hang up, the job is already drafted and ready to confirm — no manual data entry required.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-5">
                  <Inbox size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Smart Scheduling Inbox</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Every inbound job request — from calls, texts, and web forms — routed into one unified inbox. Review, approve, and dispatch in seconds.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-5">
                  <Calendar size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Auto Job Scheduling</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Confirmed jobs are pushed directly to your crew's existing calendar. Field techs see the update instantly — no calls, no texts, no back and forth.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-5">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Live Field Tracking</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  A real-time view of your crew in the field — who's available, who's on-site, and what's next on their schedule. Smarter dispatch, fewer wasted hours.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-5">
                  <Users size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">CRM & Customer Profiles</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Job history, notes, and contact records for every customer — organized and searchable. Know the full picture before your crew ever pulls up to the driveway.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
                  <DollarSign size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Financial Dashboard</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Revenue, open invoices, and job profitability — at a glance. Know where your business stands without chasing spreadsheets or waiting on your accountant.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-5">
                  <ClipboardList size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Call Logs & Summaries</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Every AI-handled call is logged and summarized automatically. Review what was said, what was booked, and what needs follow-up — all in one place.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm">
                <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center mb-5">
                  <ShieldCheck size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Lead Triage & Qualification</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Every inbound lead is screened automatically — job type, location, urgency, and homeowner status — so your crew shows up to real, bookable jobs.
                </p>
              </div>

            </div>

            <div className="text-center mt-10 md:mt-14">
              <Link href="#demo" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg">
                Book a Demo to See It All <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>

        {/* How It Plugs In */}
        <section className="bg-white py-16 md:py-24 border-t border-gray-200">
          <div className="max-w-4xl mx-auto px-4 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Plugs into what you already use.</h2>
            <p className="text-gray-500 text-base md:text-lg mb-10 md:mb-12">No new hardware. No app installs for your crew. No retraining anyone.</p>
            <div className="grid sm:grid-cols-3 gap-6 text-left">
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="font-bold text-base md:text-lg mb-2">Your existing phone number</p>
                <p className="text-gray-600 text-sm">Overflow calls route to Office Angel automatically. Your number stays the same.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="font-bold text-base md:text-lg mb-2">Google & Apple Calendar</p>
                <p className="text-gray-600 text-sm">Jobs drop straight onto the calendars your crew already has on their phones.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <p className="font-bold text-base md:text-lg mb-2">Your website & web forms</p>
                <p className="text-gray-600 text-sm">Web leads route automatically into your scheduling inbox alongside your calls.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Demo */}
        <section id="demo" className="py-16 md:py-24 bg-gray-900 text-white px-4 md:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">See the whole platform live.</h2>
            <p className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12">
              Pick a time below. We'll walk you through the full product in 30 minutes — no slides, no fluff.
            </p>
            <CalendlyEmbed />
          </div>
        </section>
      </main>

      <footer className="bg-white py-8 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
