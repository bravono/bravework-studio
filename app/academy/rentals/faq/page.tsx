"use client";

import React from "react";
import {
  HelpCircle,
  ShieldAlert,
  FileText,
  Zap,
  ArrowLeft,
  ChevronDown,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import AcademySubNavBar from "../../../components/AcademySubNavBar";

export default function AcademyFAQPage() {
  const faqs = [
    {
      q: "How does the rental integrate with my Academy courses?",
      a: "Our hardware is pre-configured with the software required for your specific track (e.g., Blender for Animation, VS Code for Web Dev). Additionally, Academy students receive a 10% discount when bundling rentals with course enrollment.",
    },
    {
      q: "What happens if the hardware gets damaged?",
      a: "We offer a 'Bravework Care' protection plan (₦2,000/week) that covers accidental damage. Without this plan, renters are liable for the full repair or replacement cost of the device.",
    },
    {
      q: "Can I take the hardware home?",
      a: "Certain devices (Laptops/iPads) are available for off-site rental to verified students. High-end rendering rigs are currently on-site only at our Lagos Studio to ensure stability and high-speed fiber connection.",
    },
    {
      q: "Do I need to pay a security deposit?",
      a: "Yes, a refundable security deposit is required for all off-site rentals. This deposit is returned within 24 hours of the hardware being returned in good condition.",
    },
    {
      q: "What is the minimum rental duration?",
      a: "The minimum rental period is 2 hours for on-site use and 24 hours for off-site use.",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <AcademySubNavBar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12 text-center">
          <Link
            href="/academy/rentals"
            className="inline-flex items-center text-sm font-bold text-green-600 mb-6 hover:gap-2 transition-all mx-auto"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Rentals Overview
          </Link>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Policies & FAQs
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Everything you need to know about renting high-performance gear from
            Bravework Academy.
          </p>
        </div>

        {/* Categories */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Damage Policy</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Learn about repair costs, replacement values, and our optional
                protection plans.
              </p>
            </div>
          </div>
          <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 flex items-start gap-4">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Zap size={24} />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-2">Academy Bundles</h3>
              <p className="text-sm text-gray-500 leading-relaxed">
                Special rates and pre-installed software perks for active
                Academy students.
              </p>
            </div>
          </div>
        </div>

        {/* FAQ List */}
        <div className="space-y-4 mb-20">
          <h2 className="text-2xl font-black text-gray-900 mb-8 flex items-center gap-3">
            <HelpCircle size={28} className="text-green-600" />
            Frequently Asked Questions
          </h2>
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-6 border border-gray-100 hover:border-green-200 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-center gap-4">
                <h4 className="font-bold text-gray-900 group-hover:text-green-700 transition-colors">
                  {faq.q}
                </h4>
                <ChevronDown
                  size={20}
                  className="text-gray-400 group-hover:text-green-600 transition-all"
                />
              </div>
              <p className="mt-4 text-gray-500 text-sm leading-relaxed border-t border-gray-50 pt-4">
                {faq.a}
              </p>
            </div>
          ))}
        </div>

        {/* Contact Support */}
        <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
          <MessageCircle className="mx-auto h-12 w-12 text-green-500 mb-6" />
          <h3 className="text-2xl font-black mb-4">Still have questions?</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            Our hardware operations team is here to help you find the right
            setup for your learning goals.
          </p>
          <Link
            href="/contact"
            className="px-8 py-4 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all inline-flex items-center gap-3"
          >
            Contact Support <ArrowLeft size={18} className="rotate-180" />
          </Link>
        </div>
      </div>
    </div>
  );
}
