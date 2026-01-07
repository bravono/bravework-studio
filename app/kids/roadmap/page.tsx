"use client";

import React from "react";
import { motion } from "framer-motion";
import KidsSubNavBar from "../../components/KidsSubNavBar";
import {
  Calendar,
  Flag,
  Palette,
  Play,
  Megaphone,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function KidsRoadmapPage() {
  const milestones = [
    {
      month: "Month 1",
      title: "Foundation & Branding",
      desc: "Establishing visual style, recruiting core contributors, and finalising branding.",
      icon: Palette,
      status: "completed",
      color: "border-green-500 bg-green-50",
    },
    {
      month: "Month 2",
      title: "Episode 1 Pilot Development",
      desc: "Scripting, storyboarding, and initial 3D modeling for 'Quest for A, B, C'.",
      icon: Flag,
      status: "in-progress",
      color: "border-blue-500 bg-blue-50",
    },
    {
      month: "Month 3",
      title: "Voice-Overs & Multilingual Dubs",
      desc: "Recording English, Hausa, Igbo, and Yoruba dubs for the first two episodes.",
      icon: Megaphone,
      status: "upcoming",
      color: "border-gray-200 bg-white",
    },
    {
      month: "Month 4",
      title: "Pilot Launch & YouTube Debut",
      desc: "Release of Episode 1 and aggressive social media promotion.",
      icon: Play,
      status: "upcoming",
      color: "border-gray-200 bg-white",
    },
    {
      month: "Month 5",
      title: "Episode 2 Production",
      desc: "Workflow optimization and development of 'Shape Squad'.",
      icon: Calendar,
      status: "upcoming",
      color: "border-gray-200 bg-white",
    },
    {
      month: "Month 6",
      title: "Scaling & Partner Engagement",
      desc: "Seeking sponsorship for Season 1 and expanding the contributor pool.",
      icon: CheckCircle2,
      status: "upcoming",
      color: "border-gray-200 bg-white",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <KidsSubNavBar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Production <span className="text-blue-500 italic">Roadmap</span>
          </h1>
          <p className="text-xl text-gray-500 font-medium">
            Follow our journey as we bring Bravework Kids to life over the next
            6 months.
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-100 hidden md:block"></div>

          <div className="space-y-12">
            {milestones.map((ms, i) => (
              <motion.div
                key={ms.month}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="relative flex flex-col md:flex-row gap-8 items-start"
              >
                {/* Icon Hub */}
                <div
                  className={`flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center relative z-10 border-4 border-white shadow-xl ${
                    ms.status === "completed"
                      ? "bg-green-500 text-white"
                      : ms.status === "in-progress"
                      ? "bg-blue-500 text-white animate-pulse"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  <ms.icon size={28} />
                </div>

                {/* Content Card */}
                <div
                  className={`flex-1 p-8 rounded-[2rem] border-2 shadow-sm ${ms.color} transition-all hover:shadow-md`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                    <span
                      className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest ${
                        ms.status === "completed"
                          ? "bg-green-100 text-green-600"
                          : ms.status === "in-progress"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {ms.month}
                    </span>
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-400 uppercase">
                      {ms.status === "completed" ? (
                        <>
                          <CheckCircle2 size={16} className="text-green-500" />
                          <span className="text-green-600">Done</span>
                        </>
                      ) : ms.status === "in-progress" ? (
                        <>
                          <Clock size={16} className="text-blue-600" />
                          <span className="text-blue-600">Active</span>
                        </>
                      ) : (
                        <span>Upcoming</span>
                      )}
                    </div>
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 mb-4">
                    {ms.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium">
                    {ms.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Progress Tracker Teaser */}
        <div className="mt-24 p-12 rounded-[3rem] bg-gradient-to-r from-blue-600 to-blue-400 text-white text-center shadow-2xl">
          <h2 className="text-3xl font-black mb-6">
            Current Progress: <span className="text-yellow-300">20%</span>
          </h2>
          <div className="w-full bg-blue-900/30 h-4 rounded-full overflow-hidden mb-6">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "20%" }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="bg-yellow-400 h-full rounded-full shadow-[0_0_20px_rgba(250,204,21,0.5)]"
            ></motion.div>
          </div>
          <p className="text-blue-50 font-medium">
            On track for Month 4 Launch!
          </p>
        </div>
      </div>
    </div>
  );
}
