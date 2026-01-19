"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  BookOpen,
  Sparkles,
  Globe,
  GraduationCap,
  TrendingUp,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";
import AcademySubNavBar from "../components/AcademySubNavBar";

export default function AcademyLandingPage() {
  return (
    <div className="bg-white min-h-screen">
      <AcademySubNavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-600 font-bold text-sm mb-6">
                <Sparkles size={16} />
                <span>Future-Proof Your Career</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
                Master the Art of{" "}
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                  Digital Craft.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                Bravework Academy provides top-tier training in 3D Animation,
                Web Development, and Digital Skills. Empowering the next
                generation of African creators.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/academy/courses"
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-600/20 transition-all flex items-center gap-3"
                >
                  <BookOpen size={20} />
                  Explore Courses
                </Link>
                <Link
                  href="/academy/about"
                  className="px-8 py-4 bg-white border-2 border-gray-100 hover:border-blue-600 text-gray-700 font-bold rounded-2xl transition-all flex items-center gap-3"
                >
                  Learn Strategy
                  <ChevronRight size={20} />
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-green-500" size={18} />
                  Official Certification
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="text-blue-500" size={18} />
                  Available in Nigeria
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-indigo-100/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative z-10 rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white">
                <Image
                  src="/assets/academy/hero.png"
                  alt="Academy Learning Environment"
                  width={800}
                  height={600}
                  className="w-full h-auto object-cover bg-gray-100"
                />
              </div>

              {/* Floating elements for "wow" factor */}
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 4,
                  ease: "easeInOut",
                }}
                className="absolute -top-6 -right-6 p-6 bg-white rounded-3xl shadow-2xl z-20 border border-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 text-amber-600 rounded-xl">
                    <GraduationCap size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Graduates</div>
                    <div className="font-bold text-gray-900">5,400+</div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 15, 0] }}
                transition={{
                  repeat: Infinity,
                  duration: 5,
                  ease: "easeInOut",
                  delay: 1,
                }}
                className="absolute -bottom-10 -left-6 p-6 bg-white rounded-3xl shadow-2xl z-20 border border-gray-50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 text-emerald-600 rounded-xl">
                    <TrendingUp size={24} />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">Success Rate</div>
                    <div className="font-bold text-gray-900">98.2%</div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              Why Bravework Academy?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We don't just teach tools; we build careers with industry-ready
              curriculum and professional mentorship.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Industry-Led Projects",
                desc: "Work on real client briefs that build a portfolio that actually gets you hired.",
                icon: Zap,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                title: "Digital Badges",
                desc: "Earn verified credentials for every module you complete and showcase your skills.",
                icon: ShieldCheck,
                color: "text-indigo-600",
                bg: "bg-indigo-50",
              },
              {
                title: "Global Community",
                desc: "Connect with developers and artists from across Africa and beyond.",
                icon: Globe,
                color: "text-emerald-600",
                bg: "bg-emerald-50",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 rounded-[2rem] bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10 transition-all group"
              >
                <div
                  className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6 ring-4 ring-white shadow-sm group-hover:scale-110 transition-transform`}
                >
                  <feature.icon size={28} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Course Preview / Free Modules */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/5 blur-[120px] -z-0"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-6">
                Start for <span className="text-blue-400">Free.</span>
                <br />
                Pay as you grow.
              </h2>
              <p className="text-xl text-gray-400 mb-10 leading-relaxed">
                Check out our free intro modules for UI/UX, Next.js, and 3D
                Character Design. No credit card required to start your journey.
              </p>
              <ul className="space-y-4 mb-10">
                {[
                  "10+ Free Video Lessons",
                  "Downloadable Asset Packs",
                  "Weekly Community Webinars",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 font-bold">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center">
                      <ArrowRight size={14} />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/academy/courses"
                className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-bold rounded-2xl hover:bg-blue-400 transition-all"
              >
                Get Started Now
              </Link>
            </div>

            <div className="relative">
              <div className="aspect-square bg-gradient-to-br from-blue-500/20 to-indigo-500/20 rounded-full flex items-center justify-center p-8 backdrop-blur-3xl animate-pulse">
                <div className="aspect-square bg-gradient-to-br from-blue-500/30 to-indigo-500/30 rounded-full flex items-center justify-center p-8">
                  <div className="w-full h-full bg-blue-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl relative overflow-hidden">
                    <BookOpen size={100} className="text-white opacity-20" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl font-black">Free</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/40"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>

            <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">
              Join the Academy Today
            </h2>
            <p className="text-xl text-blue-100 mb-10 relative z-10 max-w-2xl mx-auto">
              Ready to take the next step in your professional journey? Get
              certified and join a network of elite creators.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/auth/signup"
                className="px-10 py-5 bg-white text-blue-600 font-black rounded-2xl hover:bg-yellow-400 hover:text-gray-900 transition-all shadow-xl"
              >
                Create Account
              </Link>
              <Link
                href="/academy/about"
                className="px-10 py-5 bg-blue-800 text-white font-black rounded-2xl hover:bg-blue-900 transition-all flex items-center justify-center gap-2"
              >
                Learn More <ArrowRight size={20} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
