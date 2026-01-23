"use client";

import React from "react";
import AcademySubNavBar from "../../components/AcademySubNavBar";
import { motion } from "framer-motion";
import { Box, CheckCircle2, ArrowRight, Zap } from "lucide-react";

export default function AcademyBundlesPage() {
  const bundles = [
    {
      title: "Web Dev Full-Stack Bundle",
      desc: "Master everything from UI design to backend deployment. Includes UI/UX, Next.js, and Node.js courses.",
      price: "₦350,000",
      saving: "Save 25%",
      features: [
        "3 Full Courses",
        "Priority Support",
        "Capstone Project Review",
        "Job Placement Assistance",
      ],
      color: "from-blue-600 to-indigo-600",
      bg: "bg-blue-50",
    },
    {
      title: "3D Animation Pro Bundle",
      desc: "Go from zero to pro in 3D character design and animation. Includes modeling, texturing, and rigging.",
      price: "₦280,000",
      saving: "Save 20%",
      features: [
        "2 Specialization Tracks",
        "Asset Library Access",
        "Weekly 1-on-1 Mentorship",
        "Portfolio Website Template",
      ],
      color: "from-purple-600 to-pink-600",
      bg: "bg-purple-50",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <AcademySubNavBar />

      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-6">
            Course Bundles
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Accelerate your learning path and save money by choosing one of our
            curated bundles designed for professional success.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            {bundles.map((bundle, i) => (
              <motion.div
                key={bundle.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className={`${bundle.bg} rounded-[3rem] p-12 border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-all group`}
              >
                <div className="flex justify-between items-start mb-8">
                  <div
                    className={`p-4 bg-white rounded-2xl shadow-sm text-gray-900`}
                  >
                    <Box size={32} />
                  </div>
                  <div
                    className={`px-4 py-1.5 rounded-full bg-white text-xs font-black uppercase tracking-widest shadow-sm`}
                  >
                    {bundle.saving}
                  </div>
                </div>

                <h2 className="text-3xl font-black text-gray-900 mb-4">
                  {bundle.title}
                </h2>
                <p className="text-gray-600 mb-10 text-lg leading-relaxed">
                  {bundle.desc}
                </p>

                <ul className="space-y-4 mb-12 flex-grow">
                  {bundle.features.map((feat) => (
                    <li
                      key={feat}
                      className="flex items-center gap-3 font-bold text-gray-700"
                    >
                      <CheckCircle2 className="text-green-500" size={20} />
                      {feat}
                    </li>
                  ))}
                </ul>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-gray-200/50">
                  <div className="text-4xl font-black text-gray-900">
                    {bundle.price}
                  </div>
                  <button
                    className={`w-full sm:w-auto px-8 py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2`}
                  >
                    Buy Bundle <ArrowRight size={20} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mx-auto mb-8 ring-1 ring-blue-500/50">
            <Zap size={32} />
          </div>
          <h2 className="text-4xl font-black mb-6">Need a Custom Bundle?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Are you a business or institution looking to train your team? We can
            design a custom learning path for your specific needs.
          </p>
          <button className="px-10 py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
            Contact Enterprise Sales
          </button>
        </div>
      </section>
    </div>
  );
}
