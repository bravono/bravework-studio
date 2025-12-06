import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import {
  CalendarDays,
  ScrollText,
  CreditCard,
  RefreshCcw,
  Users,
  Clock,
  ShieldCheck,
  FileLock,
  Flag,
  Handshake,
  Gavel,
} from "lucide-react";

export default function TermsOfServicePage() {
  const effectiveDate = "8/22/2025";
  const lastUpdated = "8/22/2025";

  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 lg:p-16">
          <header className="text-center mb-12 space-y-2">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900">
              Terms of Service
            </h1>
            <div className="flex items-center justify-center text-sm text-gray-500 font-medium">
              <CalendarDays className="h-4 w-4 mr-2" />
              <span>Effective: {effectiveDate}</span>
              <span className="mx-2">·</span>
              <span>Last Updated: {lastUpdated}</span>
            </div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto mt-4">
              Welcome to Bravework Studio. By engaging our services, you agree
              to the following terms, designed for clarity, fairness, and mutual
              respect.
            </p>
          </header>

          <section className="space-y-12">
            {/* Section 1: Scope of Services */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <ScrollText className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  1. Scope of Services
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We offer a range of custom digital services, including but not
                limited to web and mobile application development, UI/UX design,
                3D modeling, and voice-over production. The specific scope for
                each project will be defined in a written proposal or agreement
                before work begins.
              </p>
            </div>

            {/* Section 2: Payment Terms */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  2. Payment Terms
                </h2>
              </div>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Options:</span>{" "}
                  50% upfront, 50% on delivery; 70% upfront (with a{" "}
                  <span className="text-green-600 font-semibold">
                    5% discount
                  </span>
                  ); or 100% upfront (with a{" "}
                  <span className="text-green-600 font-semibold">
                    10% discount
                  </span>
                  ).
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">Process:</span>{" "}
                  Work begins only after the initial payment is received. Final
                  deliverables are released upon full balance payment.
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900">
                    Milestones:
                  </span>{" "}
                  Projects are divided into milestones with defined deliverables
                  and timelines. Payment covers work completed or in progress.
                </li>
              </ul>
            </div>

            {/* Section 3: Refund & Revision Policy (Combined & Polished) */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <RefreshCcw className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  3. Refund & Revision Policy
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our Refund & Revision Policy ensures fairness and transparency.
                For full details on refund eligibility, included revisions, and
                conditions for paid extra revisions, please see our dedicated
                policy page.
              </p>
              <Link
                href="/refund-policy"
                className="inline-flex items-center font-medium text-blue-600 hover:text-blue-800"
              >
                View Full Policy
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-4 h-4 ml-1"
                >
                  <path
                    fillRule="evenodd"
                    d="M3.25 6.75A.75.75 0 014 6h12a.75.75 0 010 1.5H4a.75.75 0 01-.75-.75zm0 5A.75.75 0 014 11h12a.75.75 0 010 1.5H4a.75.75 0 01-.75-.75zm0 5A.75.75 0 014 16h12a.75.75 0 010 1.5H4a.75.75 0 01-.75-.75z"
                    clipRule="evenodd"
                  />
                </svg>
              </Link>
            </div>

            {/* Section 4: Client Responsibilities */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Users className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  4. Client Responsibilities
                </h2>
              </div>
              <ul className="space-y-2 text-gray-700 leading-relaxed list-disc list-inside">
                <li>
                  Provide complete project requirements before work begins.
                </li>
                <li>
                  Respond to communication and feedback requests promptly.
                </li>
                <li>Supply any necessary assets (e.g., logos, scripts).</li>
                <li>Respect project scope and revision limits.</li>
              </ul>
              <p className="text-sm text-gray-500 mt-2">
                Note: Delays caused by client-side issues may affect delivery
                timelines.
              </p>
            </div>

            {/* Section 5: Timelines & Delivery */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Clock className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  5. Timelines & Delivery
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Estimated timelines will be provided at the project's start.
                Delivery schedules may be adjusted for scope changes, revisions,
                or client delays. We are not liable for delays caused by
                third-party tools or circumstances beyond our control.
              </p>
            </div>

            {/* Section 6: Intellectual Property Rights */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <ShieldCheck className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  6. Intellectual Property Rights
                </h2>
              </div>
              <ul className="space-y-4 text-gray-700 leading-relaxed">
                <li>
                  <strong className="text-gray-900">
                    Before full payment:
                  </strong>{" "}
                  All drafts, prototypes, and previews remain the property of
                  Bravework Studio.
                </li>
                <li>
                  <strong className="text-gray-900">After full payment:</strong>{" "}
                  You own the final approved deliverables for personal or
                  commercial use, unless otherwise agreed. We reserve the right
                  to showcase completed work in our portfolio.
                </li>
              </ul>
            </div>

            {/* Section 7: Confidentiality */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <FileLock className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  7. Confidentiality
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                All client information, assets, and project details are treated
                as confidential and will not be shared without your consent.
              </p>
            </div>

            {/* Section 8: Termination */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Flag className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  8. Termination
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                Either party may terminate a project by written notice. If
                terminated before completion, payments made will be applied to
                work completed to date, with any refunds following our Refund &
                Revision Policy.
              </p>
            </div>

            {/* Section 9: Limitation of Liability */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <Gavel className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  9. Limitation of Liability
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                We are not liable for indirect, incidental, or consequential
                damages. Our maximum liability shall not exceed the total amount
                paid for the specific project.
              </p>
            </div>

            {/* Section 10: Governing Law */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  10. Governing Law
                </h2>
              </div>
              <p className="text-gray-700 leading-relaxed">
                In the event of a dispute, both parties agree to attempt
                resolution through direct communication. Unresolved disputes
                shall be governed by and construed in accordance with the laws
                of Nigeria and resolved in the courts of Lagos State.
              </p>
            </div>

            {/* Section 11: Acceptance */}
            <div className="pt-8">
              <div className="flex items-center justify-center text-center">
                <Handshake className="h-10 w-10 text-green-600 flex-shrink-0" />
              </div>
              <p className="text-center text-lg text-gray-700 mt-4 leading-relaxed">
                By paying a deposit, signing a proposal, or otherwise engaging
                our services, you acknowledge that you have read, understood,
                and agreed to these Terms of Service.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
