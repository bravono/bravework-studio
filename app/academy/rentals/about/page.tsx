"use client";

import React from "react";
import AcademySubNavBar from "@/app/components/AcademySubNavBar"; // Rentals is under Academy
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { motion } from "framer-motion";
import {
  Box,
  Shield,
  Zap,
  Laptop,
  Monitor,
  MousePointer,
  ArrowRight,
  GraduationCap,
} from "lucide-react";
import Link from "next/link";
import { Outfit } from "next/font/google";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "700", "900"],
});

export default function RentalsAboutPage() {
  const specs = [
    {
      title: "High-End Laptops",
      desc: "Equipped with NVIDIA RTX GPUs for seamless 3D rendering and development.",
      icon: Laptop,
    },
    {
      title: "Premium Displays",
      desc: "Color-accurate monitors for designers and video editors.",
      icon: Monitor,
    },
    {
      title: "Elite Peripherals",
      desc: "Wacom tablets, mechanical keyboards, and precision mice.",
      icon: MousePointer,
    },
  ];

  return (
    <main className="bg-white min-h-screen">
      <AcademySubNavBar />

      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Breadcrumbs
            items={[
              { label: "Academy", href: "/academy" },
              { label: "Rentals", href: "/academy/rentals" },
              { label: "About", href: "/academy/rentals/about" },
            ]}
          />

          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-5xl lg:text-7xl font-black text-gray-900 mb-8 ${outfit.className}`}
            >
              Tech Without <span className="text-orange-600">Barriers.</span>
            </motion.h1>
            <p className="text-xl text-gray-600 leading-relaxed font-medium mb-8">
              Bravework Rentals is the accessibility arm of our ecosystem. We
              provide students and professionals with affordable access to the
              high-performance hardware required for modern digital
              craftsmanship.
            </p>
            <div className="flex flex-wrap gap-6">
              <Link
                href="/about"
                className="text-blue-600 font-bold flex items-center gap-2 hover:underline"
              >
                Part of Bravework – See full story <ArrowRight size={16} />
              </Link>
              <Link
                href="/academy/about"
                className="text-indigo-600 font-bold flex items-center gap-2 hover:underline"
              >
                <GraduationCap size={18} /> Integrated with Bravework Academy{" "}
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Hardware Specs Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-4xl font-black text-gray-900 ${outfit.className}`}
            >
              Elite Hardware for Elite Results
            </h2>
            <p className="text-gray-600 mt-4 max-w-2xl mx-auto font-medium">
              We only stock industry-standard equipment tested for 3D, coding,
              and design.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {specs.map((item, i) => (
              <div
                key={i}
                className="p-10 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-8">
                  <item.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="py-24 bg-orange-600 text-white rounded-[4rem] mx-4 sm:mx-8 mb-24 overflow-hidden relative">
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2
            className={`text-4xl sm:text-5xl font-black mb-8 ${outfit.className}`}
          >
            Safety & Reliability Guaranteed
          </h2>
          <div className="grid sm:grid-cols-2 gap-12 text-left">
            <div className="flex gap-4">
              <Shield size={40} className="flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Fully Insured</h3>
                <p className="text-orange-100">
                  Peace of mind for both short-term rentals and long-term
                  leases.
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Zap size={40} className="flex-shrink-0" />
              <div>
                <h3 className="text-xl font-bold mb-2">Instant Setup</h3>
                <p className="text-orange-100">
                  Equipment comes pre-loaded with essential creative software.
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -mr-48 -mt-48 blur-3xl" />
      </section>
    </main>
  );
}
