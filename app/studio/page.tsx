"use client";

import React from "react";
import StudioSubNavBar from "../components/StudioSubNavBar";
import HeroCarousel from "../components/HeroCarousel";
import { motion } from "framer-motion";
import { Outfit, Inter } from "next/font/google";
import { services } from "../services/localDataService";
import TestimonialCarousel from "../components/TestimonialCarousel";
import ArrowButton from "../components/ArrowButton";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: "400",
});

export default function StudioHome() {
  const studioServices = services.filter(
    (s) => s.title !== "Training Services"
  );

  return (
    <main className="bg-black min-h-screen">
      <StudioSubNavBar />

      {/* Studio Hero Section */}
      <section className="relative w-full h-[70vh] overflow-hidden bg-black border-b border-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black z-10" />
        <div className="relative z-20 h-full flex flex-col items-center justify-center text-center px-4">
          <motion.span
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-1.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-bold uppercase tracking-widest mb-6"
          >
            Professional Digital Solutions
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`text-6xl sm:text-8xl font-black text-white mb-6 ${outfit.className}`}
          >
            Bravework <span className="text-green-500">Studio</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`text-xl text-gray-400 max-w-2xl mx-auto mb-10 ${inter.className}`}
          >
            Elevating brands through cutting-edge Web, Mobile, and 3D
            experiences. Nigerian-born, globally trusted.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ArrowButton label="Explore Our Services" link="/studio/services" />
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
        </div>
      </section>

      {/* Quick Services Overview */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl sm:text-5xl font-black text-white mb-4 ${outfit.className}`}
            >
              Core Expertise
            </h2>
            <div className="w-20 h-1.5 bg-green-500 mx-auto rounded-full" />
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studioServices.map((service, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-900/30 border border-gray-800 p-8 rounded-[2rem] hover:border-green-500/30 transition-all group"
              >
                <div className="text-4xl mb-6 bg-gray-800 w-16 h-16 flex items-center justify-center rounded-2xl group-hover:bg-green-500/10 group-hover:text-green-500 transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-400 mb-6">{service.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl font-black text-white mb-4 ${outfit.className}`}
            >
              Client Success Stories
            </h2>
          </div>
          <TestimonialCarousel />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-b from-gray-950 to-black text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2
            className={`text-4xl sm:text-6xl font-black text-white mb-8 ${outfit.className}`}
          >
            Ready to bring your <span className="text-green-500">vision</span>{" "}
            to life?
          </h2>
          <p className="text-xl text-gray-400 mb-12">
            Whether it's a mobile app, 3D character, or a complete digital
            transformation, we're here to build it with you.
          </p>
          <ArrowButton
            label="Book a Free Consultation"
            link="/studio/contact"
          />
        </div>
      </section>
    </main>
  );
}
