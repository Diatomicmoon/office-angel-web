import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-8 md:p-12 text-gray-900">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Terms and Conditions</h1>
        <p className="text-gray-500 mb-10">Last updated: June 2026</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p>
              These Terms and Conditions constitute a legally binding contract made between you and Hard Hat Holdings LLC (doing business as "Hard Hat Solutions," "we," "us," or "our"), concerning your access to and use of our website, web forms, data systems, and AI telecommunication services. By accessing our platform, submitting your phone number or information, or interacting with our AI, you expressly agree to be bound by every provision of these Terms. If you do not agree, you must immediately cease use of our services.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Comprehensive Service Description</h2>
            <p>
              Hard Hat Solutions provides an advanced AI-powered back-office platform designed for the trades. Our ecosystem includes inbound/outbound call handling, AI transcriptions, data tracking, appointment booking, web form processing, lead triage, and automated SMS notifications. Our AI actively interprets human speech and text; by using the service, you acknowledge that automated processing is inherent to the platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. SMS Communications & Express Consent</h2>
            <p className="mb-2">
              By providing your phone number via our web submissions, calling our systems, or engaging with our web forms, you explicitly grant us consent to send you SMS communications related to your service request, scheduling, dispatch, and support needs.
            </p>
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg mt-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Privacy & Data Sharing:</strong> No mobile information will be shared with third parties/affiliates for marketing/promotional purposes. All other categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.</li>
                <li><strong>Carrier Disclaimers:</strong> Message and data rates may apply. Message frequency varies based on your usage. Carriers are not liable for delayed or undelivered messages.</li>
                <li><strong>Opting Out:</strong> You can cancel the SMS service at any time by texting "STOP". Upon texting "STOP", we will send one confirmation message, after which SMS communications will cease.</li>
                <li><strong>Help:</strong> Reply "HELP" for assistance or contact our main business line.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Absolute Limitation of Liability</h2>
            <p className="font-bold text-red-600 mb-2">READ CAREFULLY: THIS LIMITS OUR LEGAL LIABILITY.</p>
            <p>
              Under absolutely no circumstances shall Hard Hat Holdings LLC, its directors, employees, or agents be held liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, punitive, or financial damages. This includes, without limitation, lost profits, lost revenue, missed appointments, loss of data, business interruption, or damages resulting from AI misinterpretation, telecommunication failures, or web form errors. We assume zero liability and zero assumption of damages for anything that occurs during the use of our services, even if we have been advised of the possibility of such damages. You use our systems entirely at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Indemnification</h2>
            <p>
              You agree to fully defend, indemnify, and hold harmless Hard Hat Holdings LLC from and against any loss, damage, liability, claim, or demand, including reasonable attorneys' fees and expenses, made by any third party due to or arising out of your use of our services, your breach of these Terms, or your violation of any laws or rights of a third party.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Intellectual Property Rights</h2>
            <p>
              All proprietary technology, source code, AI architecture, databases, web forms, text, and graphics on the platform are the exclusive property of Hard Hat Holdings LLC and are protected by intellectual property laws. You are strictly prohibited from copying, reverse-engineering, or scraping our systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Governing Law & Court Litigation (No Arbitration)</h2>
            <p>
              We do not believe in sweeping legal issues under the rug via forced arbitration. These Terms and your use of our services shall be strictly governed by the laws of the State of Minnesota. <strong>Any and all legal disputes, controversies, or claims arising from or related to these Terms shall be litigated exclusively in the state or federal courts located in Minnesota.</strong> By using this service, you irrevocably consent to the exclusive jurisdiction of these courts. We expressly reject any assumption of damages, and if you wish to challenge us, we will see you in a court of law.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}