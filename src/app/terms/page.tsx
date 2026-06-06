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
        <p className="text-gray-500 mb-10">Last updated: May 2026</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Agreement to Terms</h2>
            <p>
              These Terms and Conditions constitute a legally binding agreement made between you and Hard Hat Solutions ("we," "us," or "our"), concerning your access to and use of the hardhat-solutions.com website and our AI telecommunication services. By using our services, you agree that you have read, understood, and agreed to be bound by all of these Terms and Conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Description of Service</h2>
            <p>
              Hard Hat Solutions provides an AI-powered back-office platform designed for home service contractors. Our services include, but are not limited to, answering inbound phone calls, transcribing messages, booking appointments, routing dispatch data, and sending automated SMS notifications.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. SMS Communications & Consent</h2>
            <p className="mb-2">
              By initiating a call or submitting a web form to our business, you consent to receive SMS communications regarding your service request, appointment times, and dispatch notifications. 
            </p>
            <div className="bg-gray-50 border border-gray-200 p-5 rounded-lg mt-4">
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Carrier Disclaimers:</strong> Message and data rates may apply. Message frequency varies based on your service status. Carriers are not liable for delayed or undelivered messages.</li>
                <li><strong>Opting Out:</strong> You can cancel the SMS service at any time. Just text "STOP" to our number. After you send the SMS message "STOP", we will send you a confirmation message. After this, you will no longer receive SMS messages from us.</li>
                <li><strong>Help:</strong> If you are experiencing issues with the messaging program, you can reply with the keyword "HELP" for more assistance, or contact our main business line.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. Acceptable Use</h2>
            <p>
              You agree not to use our services for any unlawful or prohibited purpose. You may not use the AI systems to generate abusive, threatening, or harassing communications. We reserve the right to terminate access to our services if we determine, in our sole discretion, that a user has violated these acceptable use standards.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Intellectual Property Rights</h2>
            <p>
              Unless otherwise indicated, the Site and our AI service architecture are our proprietary property. All source code, databases, functionality, software, website designs, audio, video, text, photographs, and graphics on the Site are owned or controlled by us and are protected by copyright and trademark laws.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Limitation of Liability</h2>
            <p>
              In no event will we or our directors, employees, or agents be liable to you or any third party for any direct, indirect, consequential, exemplary, incidental, special, or punitive damages, including lost profit, lost revenue, or loss of data arising from your use of the site or our AI dispatch services, even if we have been advised of the possibility of such damages. The AI may occasionally misinterpret audio; users are responsible for verifying critical job details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Modifications and Interruptions</h2>
            <p>
              We reserve the right to change, modify, or remove the contents of the Site or our service features at any time or for any reason at our sole discretion without notice. We will not be liable to you or any third party for any modification, price change, suspension, or discontinuance of the Site.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Governing Law & Dispute Resolution</h2>
            <p>
              These Terms shall be governed by and defined following the laws of the State of Minnesota. Hard Hat Solutions and yourself irrevocably consent that the state and federal courts located in Minnesota shall have exclusive jurisdiction to resolve any dispute, controversy, or claim arising from or relating to these Terms or your use of the services. We expressly reject mandatory arbitration clauses; any and all legal disputes will be litigated in a court of competent jurisdiction.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
