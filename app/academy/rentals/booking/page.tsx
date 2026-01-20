"use client";

import React from "react";
import {
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  CreditCard,
  ArrowLeft,
  Info,
} from "lucide-react";
import Link from "next/link";
import AcademySubNavBar from "../../../components/AcademySubNavBar";

export default function AcademyBookingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AcademySubNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Link
            href="/academy/rentals"
            className="inline-flex items-center text-sm font-bold text-green-600 mb-6 hover:gap-2 transition-all"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Rentals Overview
          </Link>
          <h1 className="text-4xl font-black text-gray-900 mb-4">
            Book Your Session
          </h1>
          <p className="text-gray-600 max-w-2xl text-lg">
            Schedule your equipment pickup or on-site rendering session below.
            All bookings are subject to our standard damage and usage policies.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Booking Info */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
                <Info size={20} className="text-blue-500" />
                How it works
              </h3>
              <ul className="space-y-6">
                {[
                  {
                    icon: Calendar,
                    title: "Select Time",
                    desc: "Pick a date and time that fits your study schedule.",
                    color: "text-blue-600",
                    bg: "bg-blue-50",
                  },
                  {
                    icon: CreditCard,
                    title: "Payment",
                    desc: "Pay securely via your Bravework Wallet or Card.",
                    color: "text-green-600",
                    bg: "bg-green-50",
                  },
                  {
                    icon: MapPin,
                    title: "Pickup",
                    desc: "Collect your gear at our Lagos Hub (Studio A).",
                    color: "text-amber-600",
                    bg: "bg-amber-50",
                  },
                ].map((step, i) => (
                  <li key={i} className="flex gap-4">
                    <div
                      className={`shrink-0 w-10 h-10 ${step.bg} ${step.color} rounded-xl flex items-center justify-center`}
                    >
                      <step.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-1">
                        {step.title}
                      </h4>
                      <p className="text-gray-500 text-xs leading-relaxed">
                        {step.desc}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-gray-900 to-black rounded-[2rem] p-8 text-white shadow-xl shadow-green-900/10">
              <ShieldCheck className="text-green-500 mb-4" size={32} />
              <h3 className="text-lg font-bold mb-2">Safe & Reliable</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                All devices are sanitized and benchmarked before every rental.
                Our 24/7 support is included with your booking.
              </p>
              <Link href="/academy/rentals/faq">
                <button className="text-green-500 font-bold text-sm hover:underline flex items-center gap-2">
                  Read Rental Policy <Clock size={14} />
                </button>
              </Link>
            </div>
          </div>

          {/* Calendar Embed Placeholder */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden h-[600px] flex flex-col">
              <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="font-bold text-gray-900 uppercase tracking-widest text-xs">
                    Live Availability
                  </span>
                </div>
                <span className="text-xs font-bold text-gray-400">
                  Powered by Bravework Scheduler
                </span>
              </div>
              <div className="flex-grow relative bg-gray-50 flex items-center justify-center">
                {/* 
                  In a real scenario, this would be a Google Calendar or Calendly embed.
                  For this demo, we'll show a high-end placeholder that looks like a scheduler.
                */}
                <div className="text-center p-12">
                  <Calendar className="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 font-medium mb-6">
                    Our interactive booking calendar is loading...
                  </p>
                  <div className="max-w-md mx-auto aspect-video bg-white rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-4">
                    <p className="text-xs text-gray-400 font-bold uppercase">
                      Scheduling Engine Interface
                    </p>
                    <div className="w-48 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="w-2/3 h-full bg-green-500"></div>
                    </div>
                  </div>

                  {/* Note for the User */}
                  <div className="mt-8 p-4 bg-amber-50 border border-amber-100 rounded-xl text-left max-w-lg">
                    <p className="text-amber-800 text-xs font-medium">
                      <strong>Developer Note:</strong> To activate live booking,
                      replace this placeholder with your Calendar ID in the{" "}
                      <code>iframe</code> embed code.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
