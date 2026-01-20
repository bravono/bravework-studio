"use client";

import React from "react";
import StudioSubNavBar from "../../components/StudioSubNavBar";
import StudioServiceWizard from "../../components/StudioServiceWizard";
import { motion } from "framer-motion";
import { Outfit } from "next/font/google";
import { services } from "../../services/localDataService";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

export default function StudioServices() {
  const studioServices = services.filter(
    (s) => s.title !== "Training Services"
  );

  return (
    <main className="bg-black min-h-screen">
      <StudioSubNavBar />

      {/* Services Hero */}
      <section className="py-24 relative overflow-hidden text-center bg-gray-950">
        <div className="max-w-4xl mx-auto px-4 relative z-10">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-5xl sm:text-7xl font-black text-white mb-6 ${outfit.className}`}
          >
            Digital <span className="text-green-500">Excellence</span>, <br />
            Tailored to You
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-400 mb-12"
          >
            We don't just build apps; we build experiences. Use our service
            wizard to find your perfect solution or browse our detailed services
            below.
          </motion.p>
        </div>
      </section>

      {/* Wizard Section */}
      <section className="py-20 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <StudioServiceWizard />
        </div>
      </section>

      {/* Detailed Services Breakdown */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-16">
            <h2
              className={`text-3xl sm:text-5xl font-black text-white mb-4 ${outfit.className}`}
            >
              Detailed Service Breakdown
            </h2>
            <div className="w-20 h-1.5 bg-green-500 rounded-full" />
          </div>

          <div className="space-y-12">
            {studioServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="flex flex-col md:flex-row gap-8 items-center bg-gray-900/20 rounded-[2.5rem] p-8 sm:p-12 border border-gray-800"
              >
                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-3xl flex items-center justify-center text-5xl shrink-0">
                  {service.icon}
                </div>
                <div className="flex-grow text-center md:text-left">
                  <h3 className="text-3xl font-bold text-white mb-4">
                    {service.title}
                  </h3>
                  <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <span className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 font-bold text-xs uppercase tracking-tighter">
                      Industry Standard Tools
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-tighter">
                      Dedicated Project Manager
                    </span>
                    <span className="px-4 py-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-bold text-xs uppercase tracking-tighter">
                      Scalable Architecture
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
