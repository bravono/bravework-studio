import React from "react";
import Navbar from "../components/Navbar";
import {
  CreditCard,
  DollarSign,
  CircleCheck,
  CircleX,
  RefreshCcw,
} from "lucide-react";

export default function RefundPolicyPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <main className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 lg:p-16">
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              Refund & Revision Policy
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              At Bravework Studio, we believe in fairness, transparency, and
              trust. Our policy is designed to protect both you and us, ensuring
              a clear and reliable partnership.
            </p>
          </header>

          <section className="space-y-12">
            {/* Refund Calculation Table */}
            <div className="bg-blue-50 border-l-4 border-blue-600 rounded-lg p-6">
              <div className="flex items-center gap-4 mb-4">
                <DollarSign className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  How Refunds Are Calculated
                </h2>
              </div>
              <p className="text-gray-700 mb-6">
                Refunds are based on the value of completed milestones, which
                are clearly defined in your project proposal or invoice.
              </p>
              <div className="overflow-x-auto">
                <table className="min-w-full table-auto border-collapse">
                  <thead>
                    <tr className="bg-blue-100 text-left text-sm font-medium text-gray-700">
                      <th className="px-4 py-3 border-b-2 border-blue-200 rounded-tl-lg">
                        Payment Tier
                      </th>
                      <th className="px-4 py-3 border-b-2 border-blue-200">
                        Included Revisions
                      </th>
                      <th className="px-4 py-3 border-b-2 border-blue-200 rounded-tr-lg">
                        Refund Formula
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-blue-100 last:border-b-0">
                      <td className="px-4 py-4">50% Deposit</td>
                      <td className="px-4 py-4">2 minor revisions</td>
                      <td className="px-4 py-4">
                        50% – value of completed milestones
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100 last:border-b-0">
                      <td className="px-4 py-4">
                        70% Payment{" "}
                        <span className="text-green-600 font-semibold text-xs">
                          (5% Discount)
                        </span>
                      </td>
                      <td className="px-4 py-4">3 moderate revisions</td>
                      <td className="px-4 py-4">
                        70% – value of completed milestones
                      </td>
                    </tr>
                    <tr className="border-b border-blue-100 last:border-b-0">
                      <td className="px-4 py-4">
                        100% Payment{" "}
                        <span className="text-green-600 font-semibold text-xs">
                          (10% Discount)
                        </span>
                      </td>
                      <td className="px-4 py-4">5 full-scope revisions</td>
                      <td className="px-4 py-4">
                        100% – value of completed milestones
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Refund Conditions */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Refund Conditions
                </h2>
              </div>
              <ul className="space-y-4 text-gray-700">
                <li className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CircleCheck className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">
                      Before Work Begins:
                    </strong>{" "}
                    A full refund is available (minus any applied discounts).
                  </div>
                </li>
                <li className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CircleCheck className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">
                      Live Zoom Courses:
                    </strong>{" "}
                    If you are not happy after attending the first class, you
                    are eligible for a full refund of your payment for the
                    course.
                  </div>
                </li>
                <li className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CircleCheck className="h-6 w-6 text-green-600 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">
                      After First Draft/Prototype Delivery:
                    </strong>{" "}
                    If you are not satisfied, we will issue a partial refund of
                    50% of the payment made to cover completed work.
                  </div>
                </li>
                <li className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
                  <CircleX className="h-6 w-6 text-red-600 flex-shrink-0" />
                  <div>
                    <strong className="text-gray-900">
                      After Milestone Approval or Final Delivery:
                    </strong>{" "}
                    Payments become non-refundable.
                  </div>
                </li>
              </ul>
            </div>

            {/* Extra Revisions */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <RefreshCcw className="h-8 w-8 text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Extra Revisions
                </h2>
              </div>
              <p className="text-gray-700 mb-6">
                Once your included revisions are used up, you can request
                additional changes at the following categories. We will always
                confirm the cost before beginning any work.
              </p>
              <div className="bg-gray-100 rounded-lg p-6 space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                  <span className="font-semibold text-gray-900">
                    Minor Revision
                  </span>
                  <span className="text-blue-600 font-bold">
                    Quoted based on scope
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b border-gray-300">
                  <span className="font-semibold text-gray-900">
                    Moderate Revision
                  </span>
                  <span className="text-blue-600 font-bold">
                    Quoted based on scope
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-900">
                    Major Revision
                  </span>
                  <span className="text-blue-600 font-bold">
                    Quoted based on scope
                  </span>
                </div>
              </div>
            </div>

            {/* Non-Refundable Situations */}
            <div>
              <div className="flex items-center gap-4 mb-6">
                <CircleX className="h-8 w-8 text-red-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  No Refunds For
                </h2>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CircleX className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <span>
                    Change of mind after milestone approval or final delivery.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CircleX className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <span>
                    Delays caused by lack of client communication or incomplete
                    requirements.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CircleX className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <span>
                    Work that has already been completed and approved.
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CircleX className="h-5 w-5 text-red-600 flex-shrink-0 mt-1" />
                  <span>
                    Paid extra revisions once they have been delivered.
                  </span>
                </li>
              </ul>
            </div>

            {/* Additional Notes */}
            <div className="bg-gray-100 rounded-lg p-6 space-y-4">
              <h3 className="text-xl font-bold text-gray-900">
                Additional Notes
              </h3>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>
                  Refunds are processed within 7 business days of cancellation
                  confirmation.
                </li>
                <li>
                  Discounts are offered for early commitment and are
                  non-refundable once the corresponding milestone is completed.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
