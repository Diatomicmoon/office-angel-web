"use client";

import Link from "next/link";
import { Bot, Check, X, ArrowRight, Zap } from "lucide-react";

const plans = [
  {
    name: "Starter",
    price: "$197",
    period: "/mo",
    description: "Perfect for solo operators and small crews ready to stop missing calls.",
    setup: "$99 one-time setup",
    badge: null,
    color: "border-gray-200",
    buttonStyle: "bg-gray-900 text-white hover:bg-black",
    features: [
      { text: "AI Voice Dispatcher (up to 100 calls/mo)", included: true },
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
    price: "$347",
    period: "/mo",
    description: "The full back-office suite. Built for growing crews who need everything automated.",
    setup: "Free setup included",
    badge: "Most Popular",
    color: "border-blue-500 ring-2 ring-blue-500",
    buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
    features: [
      { text: "AI Voice Dispatcher (up to 300 calls/mo)", included: true },
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
    price: "$547",
    period: "/mo",
    description: "Unlimited everything. For high-volume operations running a full back-office on autopilot.",
    setup: "Free same-day setup",
    badge: null,
    color: "border-gray-200",
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
  { name: "GoodCall", price: "$59/mo", note: "Basic voice only" },
  { name: "NextPhone", price: "$199/mo", note: "Generic AI" },
  { name: "Smith.ai", price: "$350+/mo", note: "Human hybrid" },
  { name: "Office Angel", price: "$197–$547/mo", note: "Purpose-built for trades", highlight: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      {/* Nav */}
      <nav className="w-full bg-white border-b border-gray-200 py-4 px-8 flex justify-between items-center z-10 relative">
        <Link href="/" className="flex items-center gap-2">
          <Bot className="text-blue-600" size={28} />
          <span className="text-xl font-bold tracking-tight">Office Angel</span>
        </Link>
        <div className="flex items-center gap-6">
          <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-gray-900">Features</Link>
          <Link href="/pricing" className="text-sm font-medium text-gray-900 font-bold">Pricing</Link>
          <Link href="/about" className="text-sm font-medium text-gray-600 hover:text-gray-900">About</Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">Login</Link>
          <Link href="/#demo" className="text-sm font-medium bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition-colors">
            Book Demo
          </Link>
        </div>
      </nav>

      <main className="flex-1">

        {/* Header */}
        <section className="max-w-4xl mx-auto px-8 pt-20 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap size={16} /> Simple, transparent pricing
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight mb-4">
            One recovered call pays for months.
          </h1>
          <p className="text-xl text-gray-500">
            No contracts. Cancel anytime. Live in under 1 business day.
          </p>
        </section>

        {/* The Math */}
        <section className="max-w-4xl mx-auto px-8 pb-12">
          <div className="bg-gray-900 text-white rounded-2xl p-8 grid md:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-4xl font-extrabold text-blue-400">$1,500</p>
              <p className="text-gray-400 mt-1 text-sm">Average missed call value for a contractor</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-blue-400">4–8</p>
              <p className="text-gray-400 mt-1 text-sm">Extra booked jobs per month after activating Office Angel</p>
            </div>
            <div>
              <p className="text-4xl font-extrabold text-blue-400">1 call</p>
              <p className="text-gray-400 mt-1 text-sm">Covers 7+ months of Starter. The math is obvious.</p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="max-w-6xl mx-auto px-8 pb-20">
          <div className="grid md:grid-cols-3 gap-8 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 ${plan.color} shadow-sm p-8 relative`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                    {plan.badge}
                  </div>
                )}
                <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
                <div className="flex items-end gap-1 mb-2">
                  <span className="text-5xl font-extrabold">{plan.price}</span>
                  <span className="text-gray-500 mb-1">{plan.period}</span>
                </div>
                <p className="text-gray-500 text-sm mb-2">{plan.description}</p>
                <p className="text-xs text-gray-400 mb-6">{plan.setup}</p>
                <Link
                  href="/#demo"
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors mb-8 ${plan.buttonStyle}`}
                >
                  Get Started <ArrowRight size={16} />
                </Link>
                <ul className="space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm">
                      {f.included ? (
                        <Check size={16} className="text-green-500 mt-0.5 shrink-0" />
                      ) : (
                        <X size={16} className="text-gray-300 mt-0.5 shrink-0" />
                      )}
                      <span className={f.included ? "text-gray-700" : "text-gray-400"}>{f.text}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Competitor Comparison */}
        <section className="bg-white border-t border-gray-200 py-20 px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">How we compare</h2>
            <div className="overflow-hidden rounded-2xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Provider</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">Price</th>
                    <th className="text-left px-6 py-4 font-semibold text-gray-700">What you get</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c, i) => (
                    <tr
                      key={i}
                      className={`border-b border-gray-100 last:border-0 ${c.highlight ? "bg-blue-50" : ""}`}
                    >
                      <td className={`px-6 py-4 font-bold ${c.highlight ? "text-blue-700" : "text-gray-700"}`}>
                        {c.name} {c.highlight && <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Best Value</span>}
                      </td>
                      <td className="px-6 py-4 text-gray-700">{c.price}</td>
                      <td className="px-6 py-4 text-gray-500">{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 border-t border-gray-200 py-20 px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Common questions</h2>
            <div className="space-y-6">
              {[
                {
                  q: "Is there a contract?",
                  a: "No contracts, ever. Cancel anytime from your dashboard with one click.",
                },
                {
                  q: "How fast can I get set up?",
                  a: "Most customers are live within 1 business day. Our team handles the entire setup — you just plug in your phone number and we take it from there.",
                },
                {
                  q: "Does it work with my existing phone number?",
                  a: "Yes. We forward overflow calls to Office Angel — your number stays exactly the same.",
                },
                {
                  q: "What if I go over my call limit?",
                  a: "We'll notify you before you hit the cap. You can upgrade anytime or we'll handle overflow gracefully.",
                },
                {
                  q: "Does it work with Google and Apple Calendar?",
                  a: "Yes, both. Jobs are pushed directly to whichever calendar your crew already uses.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
                  <p className="font-bold text-gray-900 mb-2">{item.q}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-900 text-white py-20 px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-4xl font-bold mb-4">Ready to stop losing jobs to voicemail?</h2>
            <p className="text-gray-400 text-lg mb-8">Book a free 15-min demo. No slides. Just the real product.</p>
            <Link
              href="/#demo"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Book Your Free Demo <ArrowRight size={20} />
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
