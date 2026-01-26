"use client";

import React from "react";
import StudioSubNavBar from "../../components/StudioSubNavBar";
import Breadcrumbs from "../../components/Breadcrumbs";
import { motion } from "framer-motion";
import { Outfit, Inter } from "next/font/google";
import { Code, Smartphone, Box, Layers, Users, Zap } from "lucide-react";
import Link from "next/link";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});
const inter = Inter({
  subsets: ["latin"],
  weight: "400",
});

export default function StudioAboutPage() {
  const processes = [
    {
      title: "Discovery",
      desc: "We dive deep into your brand, goals, and audience to build a solid foundation.",
      icon: Users,
    },
    {
      title: "Strategy",
      desc: "We craft a technical and creative roadmap tailored to your unique needs.",
      icon: Layers,
    },
    {
      title: "Execution",
      desc: "Our experts build your solution using cutting-edge tech and elite design.",
      icon: Code,
    },
    {
      title: "Launch & Growth",
      desc: "We ensure a smooth rollout and provide ongoing support for scaling.",
      icon: Zap,
    },
  ];

  return (
    <main className="bg-black min-h-screen">
      <StudioSubNavBar />

      <section className="py-20 lg:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-500/5 to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Breadcrumbs
            items={[
              { label: "Studio", href: "/studio" },
              { label: "About", href: "/studio/about" },
            ]}
          />

          <div className="max-w-3xl">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-5xl lg:text-7xl font-black text-white mb-8 ${outfit.className}`}
            >
              Elite Digital{" "}
              <span className="text-green-500">Craftsmanship.</span>
            </motion.h1>
            <p
              className={`text-xl text-gray-400 leading-relaxed font-medium mb-10 ${inter.className}`}
            >
              Bravework Studio is the core creative arm of the Bravework
              ecosystem. We specialize in building professional-grade web,
              mobile, and 3D solutions for brands that refuse to settle for
              average.
            </p>
            <Link
              href="/about"
              className="text-green-500 font-bold flex items-center gap-2 hover:underline"
            >
              Part of Bravework – See full story <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Expertise Section */}
      <section className="py-24 bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2
                className={`text-4xl font-black text-white mb-6 ${outfit.className}`}
              >
                Why Choose Studio?
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Our approach combines Nigerian ingenuity with global standards.
                We don't just build apps; we create digital assets that drive
                business results and user delight.
              </p>
              <ul className="space-y-6">
                {[
                  { title: "Mobile & Web Excellence", icon: Smartphone },
                  { title: "Immersive 3D Experiences", icon: Box },
                  { title: "Scalable Architecture", icon: Layers },
                ].map((item, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-4 text-white font-bold text-xl"
                  >
                    <div className="w-10 h-10 bg-green-500/10 text-green-500 rounded-lg flex items-center justify-center">
                      <item.icon size={20} />
                    </div>
                    {item.title}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="h-64 bg-gray-900 rounded-[2rem] border border-gray-800" />
                <div className="h-40 bg-green-500/10 rounded-[2rem] border border-green-500/20" />
              </div>
              <div className="space-y-4 pt-8">
                <div className="h-40 bg-blue-500/10 rounded-[2rem] border border-blue-500/20" />
                <div className="h-64 bg-gray-900 rounded-[2rem] border border-gray-800" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            className={`text-4xl font-black text-white mb-16 ${outfit.className}`}
          >
            Our Process
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {processes.map((p, i) => (
              <div
                key={i}
                className="p-8 bg-gray-900/30 border border-gray-800 rounded-3xl hover:border-green-500/30 transition-all"
              >
                <div className="w-12 h-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <p.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{p.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

function ArrowRight({ size }: { size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14m-7-7 7 7-7 7" />
    </svg>
  );
}
