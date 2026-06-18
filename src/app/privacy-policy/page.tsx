import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-200 p-4 md:p-8 md:p-12 text-gray-900">
        
        <Link href="/" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-blue-600 mb-8 transition-colors">
          <ArrowLeft size={16} /> Back to Home
        </Link>

        <h1 className="text-4xl font-extrabold mb-4 tracking-tight">Privacy Policy</h1>
        <p className="text-gray-500 mb-10">Last updated: June 2026</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Hard Hat Holdings LLC (doing business as "Hard Hat Solutions", "we", "our", or "us") respects your privacy and is fully committed to protecting your personal data. This comprehensive Privacy Policy explains how we collect, use, disclose, track, and safeguard your information when you visit our website, submit web forms, use our AI dispatch and scheduling services, or communicate with us via phone, SMS, email, or any other digital medium.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-2">We rigorously track and collect information to provide our services. This includes:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data & Identifiers:</strong> Name, physical address, shipping address, email address, and telephone numbers voluntarily provided via web submissions, lead forms, customer portals, or direct communication.</li>
              <li><strong>Communication & AI Processing Data:</strong> Audio recordings of phone calls, live transcripts, SMS message logs, and email records. Our AI engines actively process and summarize this data to facilitate service.</li>
              <li><strong>Digital Tracking & Cookies:</strong> IP addresses, browser types, device information, operating systems, and website interaction data (such as clicks, time on page, and navigation paths). We use cookies, web beacons, and similar tracking technologies to monitor user behavior and improve platform performance.</li>
              <li><strong>Service Data:</strong> Details regarding your home service needs, property information, quotes, and scheduling preferences.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. SMS & Messaging Data (Strict Compliance)</h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-lg">
              <p className="font-semibold text-gray-900">
                Mobile information will not be shared with third parties or affiliates for marketing or promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information is kept strictly confidential and will not be sold or shared with any third parties under any circumstances.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. How We Use Your Information</h2>
            <p className="mb-2">We utilize the collected data to operate our business and provide you with a customized, highly efficient experience. Uses include:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitating the scheduling, dispatch, and routing of home service technicians.</li>
              <li>Processing web form submissions and delivering automated SMS/email communications regarding your appointments and quotes.</li>
              <li>Generating AI summaries to brief technicians prior to arrival.</li>
              <li>Analyzing tracking data to optimize our marketing, website performance, and business analytics.</li>
              <li>Protecting against fraud, unauthorized access, and maintaining legal compliance.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Disclosure of Your Information</h2>
            <p>
              We share information only in necessary, restricted situations. Your data may be disclosed to trusted third-party service providers who directly perform services on our behalf (such as secure database hosting, Twilio telecommunication infrastructure, and payment processors). <strong>We strictly prohibit the sale of your personal data, phone numbers, or web form details to third parties for their own marketing.</strong> Furthermore, we will decisively disclose information if required by law, court order, subpoena, or to defend our legal rights in a court of law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Data Security & Retention</h2>
            <p>
              We implement enterprise-grade administrative, technical, and physical security protocols to protect your data. While we strive to ensure absolute security, no digital transmission is impervious. We retain your personal, tracking, and communication data indefinitely or as long as necessary to fulfill business operations and legal obligations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Opt-Out Rights</h2>
            <p>
              You may opt-out of SMS communications at any time by replying "STOP" to any message you receive from us. Message and data rates may apply. Reply "HELP" for assistance. For web tracking, you may adjust your browser settings to refuse cookies, though some platform features may become unavailable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our extensive data tracking practices, please contact us at support@hardhat-solutions.com.
            </p>
          </section>
          
        </div>
      </div>
    </div>
  );
}