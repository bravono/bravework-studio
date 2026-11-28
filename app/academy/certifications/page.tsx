"use client";

import React from "react";
import AcademySubNavBar from "../../components/AcademySubNavBar";
import { motion } from "framer-motion";
import {
  GraduationCap,
  ShieldCheck,
  Share2,
  Award,
  Zap,
  CheckCircle,
} from "lucide-react";
import Image from "next/image";

export default function AcademyCertificationsPage() {
  return (
    <div className="bg-white min-h-screen">
      <AcademySubNavBar />

      <section className="py-20 bg-gradient-to-br from-amber-50 to-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-amber-200/20 blur-[100px] -z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-100 text-amber-700 font-bold text-sm mb-6">
                <Award size={16} />
                <span>Verified Credentials</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-8">
                Your Skills, <span className="text-amber-600">World-Class</span>{" "}
                Certified.
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                Every course at Bravework Academy comes with a digital
                certification and a verifiable badge that proves your expertise
                to employers globally.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-amber-100/30 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative z-10 bg-white p-4 rounded-[3rem] shadow-2xl shadow-amber-500/10 border-4 border-amber-100">
                <Image
                  src="/assets/academy/badge.png"
                  alt="Academy Badge Mockup"
                  width={600}
                  height={600}
                  className="rounded-[2.5rem]"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              Our certification process is rigorous, ensuring our badges
              maintain high value.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                title: "Complete Modules",
                desc: "Follow the curriculum and complete all mandatory video lessons and quizzes.",
                icon: GraduationCap,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                title: "Submit Final Project",
                desc: "Demonstrate your skills by building a real-world project that meets our quality standards.",
                icon: ShieldCheck,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                title: "Earn & Share",
                desc: "Receive your digital badge and share it on LinkedIn, your portfolio, or resume.",
                icon: Share2,
                color: "text-purple-600",
                bg: "bg-purple-50",
              },
            ].map((step, i) => (
              <div key={step.title} className="text-center group">
                <div
                  className={`w-20 h-20 ${step.bg} ${step.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <step.icon size={36} />
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 bg-white rounded-[3rem] p-12 shadow-xl border border-gray-100">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900">
              Why Our Certifications Matter
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-8">
            {[
              "Verifiable on the Blockchain (Coming Soon)",
              "Globally Recognized Industry Standards",
              "Linked to Real-World Portfolio Projects",
              "Exclusive Access to Alumni Network",
              "Priority for Bravework Studio Projects",
              "Direct Verification for Employers",
            ].map((benefit) => (
              <div
                key={benefit}
                className="flex items-center gap-3 font-bold text-gray-700"
              >
                <CheckCircle
                  className="text-amber-500 flex-shrink-0"
                  size={24}
                />
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 text-center">
        <h2 className="text-3xl font-black text-gray-900 mb-8">
          Ready to get certified?
        </h2>
        <button className="px-10 py-5 bg-amber-600 text-white font-black rounded-2xl hover:bg-amber-700 transition-all shadow-xl shadow-amber-600/20">
          Begin Your Track
        </button>
      </section>
    </div>
  );
}
