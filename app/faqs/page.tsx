"use client";

import React, { useState } from "react";
import Navbar from "../components/Navbar";
import {
  Globe,
  CreditCard,
  DollarSign,
  Clock,
  FileText,
  RefreshCcw,
  BadgeDollarSign,
  Clock3,
  Lightbulb,
  MessageCircle,
  ChevronDown,
} from "lucide-react";

const faqData = [
  {
    id: 1,
    icon: <Globe className="h-6 w-6 text-blue-600" />,
    question: "Do you work with clients outside Nigeria?",
    answer:
      "Absolutely. We serve clients globally and are proud to have worked with individuals and businesses across Africa, Europe, North America, and beyond.",
  },
  {
    id: 2,
    icon: <CreditCard className="h-6 w-6 text-blue-600" />,
    question: "What payment methods do you accept?",
    answer: (
      <ul className="list-disc list-inside space-y-2">
        <li>
          <strong>Local clients:</strong> Bank transfer, Paystack, Flutterwave.
        </li>
        <li>
          <strong>International clients:</strong> PayPal, Stripe, Wise, or direct
          wire transfer.
        </li>
      </ul>
    ),
  },
  {
    id: 3,
    icon: <DollarSign className="h-6 w-6 text-blue-600" />,
    question: "What currencies do you accept?",
    answer:
      "We accept Naira (₦) for local transactions and USD ($), GBP (£), or EUR (€) for international payments. Currency conversion fees may apply depending on your payment provider.",
  },
  {
    id: 4,
    icon: <Clock className="h-6 w-6 text-blue-600" />,
    question: "What are your working hours?",
    answer:
      "We operate on West Africa Standard Time (WAT), Monday to Friday, 9:00 AM – 6:00 PM. International clients should expect responses within 24 hours on business days.",
  },
  {
    id: 5,
    icon: <FileText className="h-6 w-6 text-blue-600" />,
    question: "Will I receive an invoice?",
    answer:
      "Yes. All clients receive a digital invoice detailing the project scope, payment terms, and applicable taxes or fees.",
  },
  {
    id: 6,
    icon: <RefreshCcw className="h-6 w-6 text-blue-600" />,
    question: "What is your refund and revision policy?",
    answer:
      "Refunds are milestone-based and may apply if a project is canceled before a milestone is approved. Each service includes free revisions. For full details, please refer to our dedicated Refund & Revision Policy page.",
  },
  {
    id: 7,
    icon: <Clock3 className="h-6 w-6 text-blue-600" />,
    question: "How long will my project take?",
    answer:
      "Small services (like voice-overs or single 3D assets) typically take 2–5 business days. Larger projects (apps, animations, full product design) may take 2–6 weeks. Timelines are always confirmed before starting the project.",
  },
  {
    id: 8,
    icon: <Lightbulb className="h-6 w-6 text-blue-600" />,
    question: "Who owns the final work?",
    answer:
      "Once the project is fully paid for, you own the final approved deliverables for commercial use. We may showcase non-confidential work in our portfolio, unless otherwise agreed upon.",
  },
  {
    id: 9,
    icon: <MessageCircle className="h-6 w-6 text-blue-600" />,
    question: "How do we communicate during the project?",
    answer:
      "We typically use email, WhatsApp, or Zoom/Google Meet for project updates. For international clients, you can expect replies within 24 hours on business days.",
  },
];

export default function FAQPage() {
  const [openQuestionId, setOpenQuestionId] = useState<number | null>(null);

  const toggleAnswer = (id: number) => {
    setOpenQuestionId(openQuestionId === id ? null : id);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <main className="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find answers to the most common questions about our services,
            payment, and project process.
          </p>
        </header>

        <div className="bg-white rounded-3xl shadow-xl divide-y divide-gray-200">
          {faqData.map((faq) => (
            <div key={faq.id} className="py-6 px-6 md:px-8">
              <button
                className="w-full flex justify-between items-center text-left"
                onClick={() => toggleAnswer(faq.id)}
              >
                <div className="flex items-center gap-4">
                  {faq.icon}
                  <h3 className="text-lg font-semibold text-gray-900">
                    {faq.question}
                  </h3>
                </div>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 transition-transform duration-300 ${
                    openQuestionId === faq.id ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-500 ease-in-out ${
                  openQuestionId === faq.id ? "max-h-96" : "max-h-0"
                }`}
              >
                <div className="mt-4 pb-2 text-gray-700 leading-relaxed pl-10">
                  {faq.answer}
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}