"use client";

import Link from "next/link";
import { Check, X, ArrowRight, Zap, Phone } from "lucide-react";
import Navbar from "@/components/Navbar";

const plans = [
  {
    name: "Starter",
    tagline: "For solo operators and small crews.",
    description: "Everything you need to stop missing calls and start booking more jobs automatically.",
    badge: null,
    color: "border-gray-200",
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
  { name: "Basic Voice Tools", note: "Answer calls only. No scheduling, no CRM, no dashboard." },
  { name: "Generic AI Platforms", note: "Not built for trades. Miss the job flow entirely." },
  { name: "Human Answering Services", note: "Slower, expensive, and still require manual follow-up." },
  { name: "Office Angel", note: "Purpose-built for trades. The complete AI back-office suite.", highlight: true },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
      <Navbar activePage="pricing" />

      <main className="flex-1">

        {/* Header */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 pt-16 md:pt-20 pb-10 md:pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-sm font-medium mb-6">
            <Zap size={16} /> Plans & Packages
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">
            Priced for your operation.<br />Not a one-size-fits-all.
          </h1>
          <p className="text-base md:text-xl text-gray-500 max-w-2xl mx-auto">
            Every contractor is different. Book a free demo and we'll put together the right package for your crew size, call volume, and budget. Subscription plans are month-to-month. Custom enterprise builds are scoped and contracted individually.
          </p>
        </section>

        {/* The Math */}
        <section className="max-w-4xl mx-auto px-4 md:px-8 pb-10 md:pb-12">
          <div className="bg-gray-900 text-white rounded-2xl p-6 md:p-8 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-blue-400">$1,500+</p>
              <p className="text-gray-400 mt-1 text-sm">Estimated value of a typical missed contractor service call*</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-blue-400">24/7</p>
              <p className="text-gray-400 mt-1 text-sm">Coverage across calls, scheduling, dispatch, and field ops</p>
            </div>
            <div>
              <p className="text-3xl md:text-4xl font-extrabold text-blue-400">1 platform</p>
              <p className="text-gray-400 mt-1 text-sm">Replacing the patchwork of tools contractors are stuck managing today</p>
            </div>
          </div>
        </section>

        {/* Plan Cards */}
        <section className="max-w-6xl mx-auto px-4 md:px-8 pb-16 md:pb-20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`bg-white rounded-2xl border-2 ${plan.color} shadow-sm p-6 md:p-8 relative`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wide">
                    {plan.badge}
                  </div>
                )}
                <h2 className="text-2xl font-bold mb-1">{plan.name}</h2>
                <p className="text-blue-600 text-sm font-semibold mb-3">{plan.tagline}</p>
                <p className="text-gray-500 text-sm mb-6 leading-relaxed">{plan.description}</p>

                <div className="bg-gray-50 rounded-xl p-4 mb-6 text-center border border-gray-100">
                  <p className="text-sm text-gray-500 mb-1">Custom pricing based on your operation</p>
                  <p className="text-base font-bold text-gray-900">Book a demo to get your quote</p>
                </div>

                <Link
                  href="/#demo"
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-colors mb-6 md:mb-8 ${plan.buttonStyle}`}
                >
                  <Phone size={16} /> Talk to Sales
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
          <p className="text-center text-gray-400 text-sm mt-8">Subscriptions are month-to-month · Custom builds contracted individually · Setup timeline confirmed at onboarding</p>
        </section>

        {/* Competitor Comparison */}
        <section className="bg-white border-t border-gray-200 py-16 md:py-20 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-4">Why contractors choose Office Angel.</h2>
            <p className="text-center text-gray-500 mb-10 md:mb-12">Most tools solve one problem. We built the whole back office.</p>
            <div className="overflow-x-auto rounded-2xl border border-gray-200">
              <table className="w-full text-sm min-w-[400px]">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-4 md:px-6 py-4 font-semibold text-gray-700">Provider</th>
                    <th className="text-left px-4 md:px-6 py-4 font-semibold text-gray-700">What you actually get</th>
                  </tr>
                </thead>
                <tbody>
                  {competitors.map((c, i) => (
                    <tr key={i} className={`border-b border-gray-100 last:border-0 ${c.highlight ? "bg-blue-50" : ""}`}>
                      <td className={`px-4 md:px-6 py-4 font-bold whitespace-nowrap ${c.highlight ? "text-blue-700" : "text-gray-700"}`}>
                        {c.name} {c.highlight && (
                          <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Best Value</span>
                        )}
                      </td>
                      <td className={`px-4 md:px-6 py-4 ${c.highlight ? "text-blue-800 font-medium" : "text-gray-500"}`}>{c.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-gray-50 border-t border-gray-200 py-16 md:py-20 px-4 md:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-10 md:mb-12">Common questions</h2>
            <div className="space-y-4 md:space-y-6">
              {[
                {
                  q: "Why don't you show pricing on the page?",
                  a: "Because a 2-man electrical crew and a 30-truck HVAC company shouldn't pay the same price. We build a custom package based on your call volume, crew size, and which features actually matter to your operation.",
                },
                {
                  q: "Is there a long-term commitment?",
                  a: "Subscription plans are month-to-month with no long-term commitment — cancel anytime. Custom enterprise software builds are scoped and contracted individually to protect both parties and ensure you get exactly what was promised.",
                },
                {
                  q: "How fast can I get set up?",
                  a: "Setup is handled by our team and typically completed quickly after onboarding. Your exact timeline will be confirmed when we scope your setup.",
                },
                {
                  q: "Does it work with my existing phone number?",
                  a: "Yes. We forward overflow calls to Office Angel — your number stays exactly the same.",
                },
                {
                  q: "Does it work with Google and Apple Calendar?",
                  a: "Yes, both. Jobs are pushed directly to whichever calendar your crew already uses on their phones.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-5 md:p-6 shadow-sm">
                  <p className="font-bold text-gray-900 mb-2">{item.q}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gray-900 text-white py-16 md:py-20 px-4 md:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Let's build your package.</h2>
            <p className="text-gray-400 text-base md:text-lg mb-8">15 minutes. No slides. We'll show you the product and put together a quote on the spot.</p>
            <Link
              href="/#demo"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-colors"
            >
              Book Your Free Demo <ArrowRight size={20} />
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-white py-8 border-t border-gray-200 text-center text-sm text-gray-500 px-4">
        <p>© 2026 Hard Hat Holdings LLC. All rights reserved.</p>
        <p className="mt-2 text-xs text-gray-400 max-w-xl mx-auto">* Figures are estimates based on industry data and are provided for illustrative purposes only. Individual results will vary based on business type, call volume, and market conditions. Office Angel makes no guarantee of specific outcomes.</p>
      </footer>
    </div>
  );
}
