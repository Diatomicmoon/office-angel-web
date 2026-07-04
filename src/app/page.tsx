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
import Navbar from "@/components/Navbar";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar />

      <main className="flex-1">

        {/* Hero */}
        <section className="relative overflow-hidden max-w-7xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-14 md:pb-20 text-center">
          {/* Animated Background Blobs */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-4xl z-0 pointer-events-none">
            <div className="absolute top-20 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[pulse_6s_ease-in-out_infinite] translate-x-10"></div>
            <div className="absolute top-40 right-0 w-72 h-72 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-[pulse_6s_ease-in-out_infinite] delay-1000 -translate-x-10"></div>
          </div>
          
          <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-200 shadow-[0_0_15px_rgba(59,130,246,0.3)] text-blue-700 text-sm font-medium mb-6 animate-bounce">
            <Zap size={16} /> The AI Back-Office for Contractors
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
            Your entire office.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 bg-[length:200%_auto] animate-[pulse_3s_ease-in-out_infinite]">Running on autopilot.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Hard Hat Solutions is a full AI back-office platform built for home service contractors. From the first inbound call to the final invoice — handled automatically, around the clock.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="#demo" className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(59,130,246,0.6)] hover:shadow-[0_0_30px_rgba(59,130,246,0.8)] flex items-center justify-center gap-2 transform hover:-translate-y-1">
              See It Live <ArrowRight size={20} />
            </Link>
            <Link href="#features" className="bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 px-8 py-3.5 rounded-xl font-bold text-lg transition-all shadow-sm flex items-center justify-center gap-2 hover:-translate-y-1">
              See All Features
            </Link>
          </div>
          </div>
        </section>

        {/* Industry Bar */}
        <section className="relative bg-white/80 backdrop-blur-md border-t border-b border-gray-200 py-8 px-4 md:px-8 z-10">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-gray-500 text-sm font-medium uppercase tracking-widest mb-4">Built for home service businesses</p>
            <div className="flex flex-wrap justify-center gap-4 md:gap-4 md:p-8 text-gray-700 font-semibold text-sm md:text-base">
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

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]">
                  <PhoneIncoming size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">AI Voice Dispatcher</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Handles overflow and after-hours calls using your company name. Asks the right questions, captures the job details, and keeps your pipeline full — even when your team is unavailable.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(79,70,229,0.5)]">
                  <Mic size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">AI Co-Pilot Mode</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Assists your team during live calls in real time. By the time you hang up, the job is already drafted and ready to confirm — no manual data entry required.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-green-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(22,163,74,0.5)]">
                  <Inbox size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Smart Scheduling Inbox</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Every inbound job request — from calls, texts, and web forms — routed into one unified inbox. Review, approve, and dispatch in seconds.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(147,51,234,0.5)]">
                  <Calendar size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Auto Job Scheduling</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Confirmed jobs are pushed directly to your crew's existing calendar. Field techs see the update instantly — no calls, no texts, no back and forth.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(234,88,12,0.5)]">
                  <MapPin size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Live Field Tracking</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  A real-time view of your crew in the field — who's available, who's on-site, and what's next on their schedule. Smarter dispatch, fewer wasted hours.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-pink-100 text-pink-600 rounded-xl flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-[0_0_15px_rgba(219,39,119,0.5)]">
                  <Users size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">CRM & Customer Profiles</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Job history, notes, and contact records for every customer — organized and searchable. Know the full picture before your crew ever pulls up to the driveway.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center mb-5">
                  <DollarSign size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Financial Dashboard</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Revenue, open invoices, and job profitability — at a glance. Know where your business stands without chasing spreadsheets or waiting on your accountant.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
                <div className="w-12 h-12 bg-yellow-100 text-yellow-600 rounded-xl flex items-center justify-center mb-5">
                  <ClipboardList size={24} />
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3">Call Logs & Summaries</h3>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  Every AI-handled call is logged and summarized automatically. Review what was said, what was booked, and what needs follow-up — all in one place.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300 transform hover:-translate-y-2 group">
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
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
                <p className="font-bold text-base md:text-lg mb-2">Your existing phone number</p>
                <p className="text-gray-600 text-sm">Overflow calls route to Hard Hat Solutions automatically. Your number stays the same.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
                <p className="font-bold text-base md:text-lg mb-2">Google & Apple Calendar</p>
                <p className="text-gray-600 text-sm">Jobs drop straight onto the calendars your crew already has on their phones.</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:bg-white hover:shadow-lg hover:border-gray-200 transition-all duration-300 transform hover:-translate-y-1">
                <p className="font-bold text-base md:text-lg mb-2">Your website & web forms</p>
                <p className="text-gray-600 text-sm">Web leads route automatically into your scheduling inbox alongside your calls.</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA / Demo */}
        <section id="demo" className="relative overflow-hidden py-16 md:py-24 bg-gray-900 text-white px-4 md:px-8 border-t border-gray-800">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-full z-0 pointer-events-none">
            <div className="absolute inset-0 bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-30 animate-pulse"></div>
            <div className="absolute inset-0 bg-indigo-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20 animate-pulse delay-75"></div>
          </div>
          <div className="max-w-4xl mx-auto text-center relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to scale your crew?</h2>
            <p className="text-lg md:text-xl text-gray-400 mb-10 md:mb-12">
              Stop losing $1,500 service calls to voicemail. Let us show you exactly how it works.
            </p>
            <Link href="/contact" className="inline-flex items-center gap-2 bg-white text-gray-900 hover:bg-gray-50 px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-105">
              Get in Touch
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white py-8 border-t border-gray-200 text-center text-sm text-gray-500 flex flex-col items-center justify-center gap-2">
        <p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>
        <p className="mt-1">Contact: support@hardhat-solutions.com | (612) 598-6260</p>
        <div>
          <a href="/privacy-policy" className="hover:underline text-gray-400 mx-2">Privacy Policy</a> | 
          <a href="/terms" className="hover:underline text-gray-400 mx-2">Terms & Conditions</a>
        </div>
      </footer>
    </div>
  );
}
