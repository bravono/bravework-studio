"use client";

import React from "react";
import { motion } from "framer-motion";
import { Outfit, Inter } from "next/font/google";
import Link from "next/link";
import { ArrowRight, Sparkles, GraduationCap, Gamepad2 } from "lucide-react";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: "400",
});

const ecosystems = [
  {
    title: "Bravework Kids",
    subtitle: "Playful Learning",
    description:
      "Edutainment programs like 3D animation for ages 2+. Fun, creative tech education tailored for 7+.",
    icon: Gamepad2,
    link: "/kids",
    color: "from-purple-500 to-pink-500",
    btnColor: "bg-purple-600 hover:bg-purple-700",
    badge: "For Ages 2-7",
    features: ["3D Animation", "Creative Coding", "Digital Art"],
  },
  {
    title: "Bravework Academy",
    subtitle: "Professional Growth",
    description:
      "Master digital skills with certified courses in Web Development, UI/UX, and 3D modeling. Flexible online & in-person.",
    icon: GraduationCap,
    link: "/academy",
    color: "from-blue-500 to-cyan-500",
    btnColor: "bg-blue-600 hover:bg-blue-700",
    badge: "Professional Certs",
    features: ["Web Development", "UI/UX Design", "3D Modeling"],
  },
  {
    title: "Main Studio",
    subtitle: "Enterprise Solutions",
    description:
      "Cutting-edge software, mobile apps, and 3D assets for businesses. We bring your most ambitious visions to life.",
    icon: Sparkles,
    link: "/studio",
    color: "from-green-500 to-emerald-500",
    btnColor: "bg-green-600 hover:bg-green-700",
    badge: "B2B Solutions",
    features: ["Mobile Apps", "Custom Software", "Game Assets"],
  },
];

export default function EcosystemSection() {
  return (
    <section className="py-24 bg-black relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gray-800 to-transparent opacity-20" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className={`text-4xl sm:text-6xl font-black text-white mb-6 ${outfit.className}`}
          >
            Explore Our Worlds
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className={`text-xl text-gray-400 max-w-3xl mx-auto ${inter.className}`}
          >
            Discover the specialized ecosystems within Bravework Studio,
            designed to empower creators of all ages.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ecosystems.map((eco, index) => (
            <motion.div
              key={eco.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -10 }}
              className="group relative bg-gray-900/40 backdrop-blur-xl rounded-[2rem] p-1 border border-gray-800 hover:border-white/20 transition-all duration-500 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none" />

              <div className="p-8 h-full flex flex-col">
                <div
                  className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${eco.color} flex items-center justify-center text-white mb-6 shadow-lg shadow-black/40 transform group-hover:rotate-6 transition-transform duration-500`}
                >
                  <eco.icon size={32} />
                </div>

                <div className="mb-4">
                  <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-gray-400 uppercase tracking-tighter mb-2 inline-block">
                    {eco.badge}
                  </span>
                  <h3
                    className={`text-2xl font-bold text-white mb-2 ${outfit.className}`}
                  >
                    {eco.title}
                  </h3>
                  <p className="text-blue-400 text-sm font-semibold mb-4 italic">
                    {eco.subtitle}
                  </p>
                </div>

                <p className="text-gray-400 text-lg mb-8 leading-relaxed flex-grow">
                  {eco.description}
                </p>

                <div className="space-y-3 mb-8">
                  {eco.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-2 text-sm text-gray-500"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      {feature}
                    </div>
                  ))}
                </div>

                <Link
                  href={eco.link}
                  className={`w-full py-4 rounded-xl ${eco.btnColor} text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg`}
                >
                  Explore Now
                  <ArrowRight size={18} />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
