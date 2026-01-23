"use client";

import React from "react";
import Link from "next/link";
import { Monitor, ArrowRight, Zap } from "lucide-react";

export default function HardwareWidget() {
  return (
    <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-[2rem] p-8 border border-green-100 shadow-sm relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Monitor size={120} className="text-green-600" />
      </div>
      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-600 text-white text-[10px] font-black uppercase tracking-widest mb-4">
          <Zap size={10} />
          Enhance Your Experience
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">
          Need a high-spec PC?
        </h3>
        <p className="text-gray-600 text-sm mb-6 leading-relaxed">
          Don't let hardware limitations slow down your learning. Rent
          professional rendering units and dev rigs by the hour or day.
        </p>
        <Link
          href="/academy/rentals"
          className="inline-flex items-center gap-2 text-green-600 font-bold hover:gap-3 transition-all text-sm"
        >
          View Available Gear <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
}
