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
    (s) => s.title !== "Training Services",
  );

  const [expandedServices, setExpandedServices] = React.useState<{
    [key: number]: boolean;
  }>({});

  const toggleExpand = (index: number) => {
    setExpandedServices((prev) => ({ ...prev, [index]: !prev[index] }));
  };

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
            {studioServices.map((service, index) => {
              const isExpanded = expandedServices[index];
              const visibleSubServices = service.subServices
                ? isExpanded
                  ? service.subServices
                  : service.subServices.slice(0, 4)
                : [];

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="flex flex-col md:flex-row gap-8 items-start bg-gray-900/20 rounded-[2.5rem] p-8 sm:p-12 border border-gray-800"
                >
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gray-800 rounded-3xl flex items-center justify-center text-5xl shrink-0">
                    {service.icon}
                  </div>
                  <div className="flex-grow text-center md:text-left flex flex-col h-full">
                    <h3 className="text-3xl font-bold text-white mb-4">
                      {service.title}
                    </h3>
                    <p className="text-xl text-gray-400 mb-8 leading-relaxed">
                      {service.description}
                    </p>
                    <div className="flex flex-wrap justify-center md:justify-start gap-4 mb-6">
                      {(service.tags || [
                        "Industry Standard Tools",
                        "Dedicated Project Manager",
                        "Scalable Architecture"
                      ]).map((tag, idx) => {
                        const colors = [
                          "bg-green-500/10 border-green-500/20 text-green-400",
                          "bg-blue-500/10 border-blue-500/20 text-blue-400",
                          "bg-purple-500/10 border-purple-500/20 text-purple-400"
                        ];
                        return (
                          <span key={idx} className={`px-4 py-2 rounded-xl border font-bold text-xs uppercase tracking-tighter ${colors[idx % colors.length]}`}>
                            {tag}
                          </span>
                        );
                      })}
                    </div>
                    {service.subServices && (
                      <div className="flex flex-col h-full">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left">
                          {visibleSubServices.map((sub, idx) => (
                            <div
                              key={idx}
                              className="bg-black/30 p-4 rounded-2xl border border-gray-800"
                            >
                              <h4 className="text-white font-bold mb-1">
                                {sub.name}
                              </h4>
                              <p className="text-sm text-gray-500">
                                {sub.description}
                              </p>
                            </div>
                          ))}
                        </div>
                        {service.subServices.length > 4 && (
                          <div className="mt-4 text-right">
                            <button
                              onClick={() => toggleExpand(index)}
                              className="text-green-500 hover:text-green-400 font-semibold underline underline-offset-4 decoration-green-500/30 hover:decoration-green-400 transition-colors"
                            >
                              {isExpanded ? "Show less" : "Show more"}
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
