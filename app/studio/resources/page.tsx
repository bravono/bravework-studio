"use client";

import React from "react";
import StudioSubNavBar from "../../components/StudioSubNavBar";
import { motion } from "framer-motion";
import { Outfit } from "next/font/google";
import { BookOpen, Lightbulb, TrendingUp, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import ArrowButton from "../../components/ArrowButton";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const guides = [
  {
    title: "Top 5 UI/UX Trends in Nigeria",
    description:
      "Discover how local startups are leveraging global design systems to dominate the African market.",
    icon: TrendingUp,
    color: "bg-blue-500",
    link: "/academy/blog/uiux-trends",
  },
  {
    title: "Why Next.js is the Future for Fintechs",
    description:
      "An analysis of speed, security, and SEO in the Nigerian financial services landscape.",
    icon: Zap,
    color: "bg-green-500",
    link: "/academy/blog/nextjs-fintech",
  },
  {
    title: "The Impact of 3D in Modern Marketing",
    description:
      "How 3D product visualizations are increasing sales for E-commerce brands in Lagos.",
    icon: Lightbulb,
    color: "bg-purple-500",
    link: "/academy/blog/3d-marketing",
  },
];

export default function StudioResources() {
  return (
    <main className="bg-black min-h-screen">
      <StudioSubNavBar />

      <section className="py-24 bg-gray-950 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-5xl sm:text-7xl font-black text-white mb-6 ${outfit.className}`}
          >
            Studio <span className="text-green-500">Insights</span>
          </motion.h1>
          <p className="text-xl text-gray-400">
            Resources and guides to help you navigate the digital landscape.
            From local case studies to global trends.
          </p>
        </div>
      </section>

      <section className="py-24 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {guides.map((guide, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-gray-900/50 rounded-[2.5rem] border border-gray-800 p-8 flex flex-col h-full hover:border-green-500/30 transition-all group"
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${guide.color} flex items-center justify-center text-white mb-6`}
                >
                  <guide.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-green-400 transition-colors">
                  {guide.title}
                </h3>
                <p className="text-gray-400 mb-8 flex-grow">
                  {guide.description}
                </p>
                <Link
                  href={guide.link}
                  className="flex items-center gap-2 text-green-500 font-bold text-sm uppercase tracking-widest group-hover:gap-4 transition-all"
                >
                  Read Guide <ArrowRight size={18} />
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Academy Cross-Promotion Card */}
          <div className="relative bg-gradient-to-br from-green-600 to-emerald-800 rounded-[3rem] p-12 overflow-hidden shadow-2xl shadow-green-900/20">
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
              <div className="flex-grow text-center md:text-left">
                <span className="px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-widest mb-6 inline-block">
                  Master the Skills
                </span>
                <h2 className="text-4xl sm:text-6xl font-black text-white mb-6">
                  Want to learn <br />
                  how we do it?
                </h2>
                <p className="text-xl text-green-50/80 mb-10 max-w-xl">
                  Join Bravework Academy and master the very tools we use at
                  Studio to build world-class digital solutions.
                </p>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                  <ArrowButton label="Visit Academy" link="/academy" />
                </div>
              </div>
              <div className="w-full md:w-1/3 flex justify-center">
                <div className="w-48 h-48 sm:w-64 sm:h-64 bg-white/10 backdrop-blur-xl rounded-full flex items-center justify-center border border-white/20">
                  <BookOpen size={80} className="text-white animate-pulse" />
                </div>
              </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-96 h-96 bg-black/20 rounded-full blur-[100px]" />
          </div>
        </div>
      </section>
    </main>
  );
}
