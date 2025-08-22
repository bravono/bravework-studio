import React from "react";
import Navbar from "../components/Navbar";
import {
  CalendarDays,
  ShieldCheck,
  Download,
  Share2,
  Lock,
  Archive,
  Cookie,
  Mail,
  RefreshCcw,
} from "lucide-react";

export default function PrivacyPolicyPage() {
  const effectiveDate = "8/22/2025";
  const lastUpdated = "8/22/2025";

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 lg:p-16">
          <header className="text-center mb-12 space-y-2">
            <div className="flex items-center justify-center text-blue-600">
              <ShieldCheck className="h-16 w-16" />
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Privacy Policy
            </h1>
            <div className="flex items-center justify-center text-sm text-gray-500 font-medium">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>Effective: {effectiveDate}</span>
              <span className="mx-2">·</span>
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
              Bravework Studio is committed to protecting your privacy. This
              policy explains how we collect, use, and safeguard your
              information when you engage with our services.
            </p>
          </header>

          <section className="space-y-12">
            {/* Information We Collect */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Download className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  1. Information We Collect
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We collect information necessary to provide our services and
                improve your experience. This may include:
              </p>
              <ul className="space-y-4 text-gray-700 leading-relaxed list-disc list-inside">
                <li>
                  <strong className="text-gray-900">Contact Details:</strong>{" "}
                  Name, email address, and phone number.
                </li>
                <li>
                  <strong className="text-gray-900">Project Data:</strong>{" "}
                  Project details, preferences, and files you submit to us.
                </li>
                <li>
                  <strong className="text-gray-900">Payment Data:</strong>{" "}
                  Billing information processed securely via third-party
                  providers like Paystack and Stripe.
                </li>
                <li>
                  <strong className="text-gray-900">Usage Data:</strong> We may
                  collect your IP address, browser type, and pages visited
                  through cookies and analytics tools to understand how you use
                  our website.
                </li>
              </ul>
            </div>

            {/* How We Use and Share Information */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Share2 className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  2. How We Use & Share Your Information
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We use your data to process and deliver your projects,
                communicate with you about your order, and improve our services.
                We do not sell your personal data. We only share it with third
                parties as necessary for our operations, such as with payment
                processors to complete your transactions, and with analytics
                providers to enhance our website. We will also share your
                information if required by law.
              </p>
            </div>

            {/* Data Security & Retention */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Lock className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  3. Data Security & Retention
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We implement industry-standard security measures to protect your
                data. We retain your personal data only for as long as needed to
                complete your project and fulfill legal or tax obligations.
                Project files are securely deleted after 6 months unless a
                different agreement is in place.
              </p>
            </div>

            {/* Cookies */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Cookie className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">4. Cookies</h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Our website uses cookies to enhance your browsing experience.
                You have the option to disable cookies in your browser settings,
                though some website features may not function properly as a
                result.
              </p>
            </div>

            {/* Your Rights */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Mail className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  5. Your Rights
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                You have the right to access, correct, or request the deletion
                of your personal data. To exercise these rights or for any
                questions, please contact us at:
              </p>
              <a
                href="mailto:support@braveworkstudio.com"
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
              >
                support@braveworkstudio.com
              </a>
            </div>

            {/* Children’s Privacy */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  6. Children’s Privacy
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for children under 16, and we do
                not knowingly collect their data.
              </p>
            </div>

            {/* Updates to This Policy */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <RefreshCcw className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  7. Updates to This Policy
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We may update this policy periodically. Any changes will be
                posted here with a revised effective date.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
