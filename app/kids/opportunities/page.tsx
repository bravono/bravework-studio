"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import KidsSubNavBar from "../../components/KidsSubNavBar";
import {
  Users,
  Coins,
  Mic2,
  PenTool,
  Palette,
  Video,
  Share2,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function KidsOpportunitiesPage() {
  const roles = [
    {
      title: "Scriptwriters",
      icon: PenTool,
      color: "text-blue-500",
      bg: "bg-blue-50",
    },
    {
      title: "Voice Actors",
      icon: Mic2,
      color: "text-pink-500",
      bg: "bg-pink-50",
    },
    {
      title: "3D Animators",
      icon: Video,
      color: "text-green-500",
      bg: "bg-green-50",
    },
    {
      title: "3D Modelers",
      icon: Palette,
      color: "text-purple-500",
      bg: "bg-purple-50",
    },
    {
      title: "Sound Engineers",
      icon: Share2,
      color: "text-orange-500",
      bg: "bg-orange-50",
    },
    {
      title: "Translators",
      icon: Users,
      color: "text-yellow-600",
      bg: "bg-yellow-50",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <KidsSubNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-4xl md:text-6xl font-black text-gray-900 mb-6"
          >
            Build With <span className="text-green-500">Us!</span>
          </motion.h1>
          <p className="text-xl text-gray-600 font-medium">
            Join the Bravework Kids production team through our unique
            equity-based model. We are looking for passionate creators to build
            impactful edutainment for African children.
          </p>
        </div>

        {/* Roles Grid */}
        <div className="mb-24">
          <h2 className="text-2xl font-bold text-gray-900 mb-10 border-l-8 border-green-500 pl-4">
            Available Roles
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {roles.map((role) => (
              <div
                key={role.title}
                className="p-8 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div
                  className={`w-14 h-14 ${role.bg} ${role.color} rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`}
                >
                  <role.icon size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-900">
                  {role.title}
                </h3>
              </div>
            ))}
          </div>
        </div>

        {/* Equity Model section */}
        <div className="grid lg:grid-cols-2 gap-12 mb-24 items-center">
          <div className="p-12 rounded-[3rem] bg-gray-900 text-white relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-green-500/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <h2 className="text-3xl font-black mb-8 flex items-center gap-3">
              <Coins className="text-green-400" />
              The Equity Model
            </h2>
            <div className="space-y-6 text-gray-300">
              <p className="leading-relaxed">
                Rather than high upfront costs, we offer a **revenue share
                structure** tailored to low-commitment, high-impact
                contributors.
              </p>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></div>
                  <span>
                    **5-10% Revenue Share** per episode you contribute to.
                  </span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></div>
                  <span>Professional portfolio credit on all platforms.</span>
                </li>
                <li className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 mt-2"></div>
                  <span>
                    Flexible timeline: Contribute as much or as little as you
                    like.
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-black text-gray-900 leading-tight">
              Ready to leave your{" "}
              <span className="text-blue-500 italic">mark?</span>
            </h2>
            <p className="text-lg text-gray-600 leading-relaxed font-medium">
              We provide the tools, infrastructure, and 3D assets. You provide
              the creativity. Together, we build something that changes lives.
            </p>
            <div className="pt-4">
              <Link
                href="/job"
                className="inline-flex items-center gap-3 px-10 py-5 bg-green-500 hover:bg-green-600 text-white font-black rounded-2xl shadow-xl shadow-green-500/30 transition-all text-lg group"
              >
                Apply via Jobs Portal
                <ExternalLink
                  size={20}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="text-center pt-12 border-t border-gray-100">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-8">
            Resources to get you started
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors">
              <ChevronRight size={18} className="text-blue-500" />
              Episode 1 Sample Script
            </button>
            <button className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gray-50 text-gray-700 font-bold hover:bg-gray-100 transition-colors">
              <ChevronRight size={18} className="text-green-500" />
              Structured Overview PDF
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
