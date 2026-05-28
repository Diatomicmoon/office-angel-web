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
        <p className="text-gray-500 mb-10">Last updated: May 2026</p>
        
        <div className="space-y-8 text-gray-700 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Introduction</h2>
            <p>
              Office Angel ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website, use our AI dispatch services, or communicate with us via phone, web form, or SMS.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect</h2>
            <p className="mb-2">We may collect information about you in a variety of ways, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Personal Data:</strong> Personally identifiable information, such as your name, shipping address, email address, and telephone number, that you voluntarily give to us when requesting home services or quotes.</li>
              <li><strong>Communication Data:</strong> Audio recordings, transcripts, and message logs generated when you interact with our AI Voice Dispatcher or SMS systems.</li>
              <li><strong>Service Data:</strong> Details regarding your home service needs, property information, and scheduling preferences.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. SMS & Messaging Data (IMPORTANT)</h2>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-5 rounded-r-lg">
              <p className="font-semibold text-gray-900">
                Mobile information will not be shared with third parties/affiliates for marketing/promotional purposes. All the above categories exclude text messaging originator opt-in data and consent; this information will not be shared with any third parties.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. How We Use Your Information</h2>
            <p className="mb-2">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Facilitate the scheduling and dispatch of home service technicians.</li>
              <li>Communicate with you regarding appointments, quotes, and service updates.</li>
              <li>Generate AI summaries to brief technicians prior to arrival.</li>
              <li>Respond to customer service requests and resolve disputes.</li>
              <li>Improve our AI models and operational efficiency.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Disclosure of Your Information</h2>
            <p>
              We may share information we have collected about you in certain situations. Your information may be disclosed to third-party service providers who perform services for us (such as database hosting and Twilio telecom services). <strong>We strictly prohibit the sale of your personal data to third parties.</strong> We may also disclose your information if required by law, subpoena, or other legal process.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Data Security & Retention</h2>
            <p>
              We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable. We retain your data only as long as necessary to fulfill the purposes outlined in this Privacy Policy or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Opt-Out Rights</h2>
            <p>
              You may opt-out of SMS communications at any time by replying "STOP" to any message you receive from us. Message and data rates may apply. Reply "HELP" for assistance. You may also contact us directly to request the deletion of your personal data from our systems.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
            <p>
              If you have questions or comments about this Privacy Policy, please contact us at support@office-angel.com.
            </p>
          </section>
          
        </div>
      </div>
    </div>
  );
}
