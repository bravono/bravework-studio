"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Play,
  Sparkles,
  Globe,
  GraduationCap,
  Clock,
  ChevronRight,
  ArrowRight,
  Monitor,
  ShieldCheck,
} from "lucide-react";
import KidsSubNavBar from "../components/KidsSubNavBar";

export default function KidsLandingPage() {
  return (
    <div className="bg-white min-h-screen">
      <KidsSubNavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-b from-yellow-50 via-white to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-pink-100 text-pink-600 font-bold text-sm mb-6">
                <Sparkles size={16} />
                <span>New Initiative</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
                Fun 3D Adventures That{" "}
                <span className="text-blue-500">Teach!</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-xl">
                Welcome to Bravework Kids! Our 3D animated series for ages 3-6
                mixes education with entertainment, available in English, Hausa,
                Igbo, and Yoruba.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/kids/episodes"
                  className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white font-bold rounded-2xl shadow-xl shadow-green-500/20 transition-all flex items-center gap-3 animate-bounce"
                >
                  <Play fill="white" size={20} />
                  Watch Episodes
                </Link>
                <Link
                  href="/kids/opportunities"
                  className="px-8 py-4 bg-white border-2 border-gray-100 hover:border-blue-500 text-gray-700 font-bold rounded-2xl transition-all flex items-center gap-3"
                >
                  Join as Contributor
                  <ChevronRight size={20} />
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-blue-100/50 rounded-full blur-3xl animate-pulse"></div>
              <Image
                src="/assets/kids/hero_character.png"
                alt="Bravework Kids Character"
                width={600}
                height={600}
                className="relative z-10 w-full h-auto drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Video Teaser Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-12">
            See What's Coming! 🍎
          </h2>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative group rounded-3xl overflow-hidden shadow-2xl bg-white p-2"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-200">
              <Image
                src="/assets/kids/episode_teaser.png"
                alt="ABC Adventure Teaser"
                layout="fill"
                objectFit="cover"
                className="transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                  <Play size={40} fill="currentColor" />
                </div>
              </div>
            </div>
            <div className="p-6">
              <p className="text-lg font-bold text-gray-700">
                Teaser: Welcome to ABC Adventure
              </p>
              <p className="text-gray-500">
                Coming soon to YouTube and our platform!
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* USP Highlights */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Bite-Sized Lessons",
                desc: "5-minute episodes perfect for short attention spans and focused learning.",
                icon: Clock,
                color: "text-orange-500",
                bg: "bg-orange-50",
              },
              {
                title: "Cultural Diversity",
                desc: "Authentic Nigerian stories and characters reflecting our rich cultural heritage.",
                icon: Globe,
                color: "text-green-500",
                bg: "bg-green-50",
              },
              {
                title: "Tech-Driven Future",
                desc: "Integrated with Bravework Academy to spark a lifelong interest in technology.",
                icon: GraduationCap,
                color: "text-blue-500",
                bg: "bg-blue-50",
              },
              {
                title: "Kid-Safe Gear",
                desc: "Specialized tablets and laptops with parental controls, integrated with Academy Rentals.",
                icon: Monitor,
                color: "text-pink-500",
                bg: "bg-pink-50",
              },
            ].map((usp, i) => (
              <motion.div
                key={usp.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                viewport={{ once: true }}
                className="p-10 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all"
              >
                <div
                  className={`w-16 h-16 ${usp.bg} ${usp.color} rounded-2xl flex items-center justify-center mb-6`}
                >
                  <usp.icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {usp.title}
                </h3>
                <p className="text-gray-600 leading-relaxed font-medium">
                  {usp.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Studio Cross-Promotion */}
      <section className="py-24 bg-blue-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-[3rem] p-12 text-center border-4 border-dashed border-blue-100 relative overflow-hidden">
            <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6">
              Dreaming of Joining Our{" "}
              <span className="text-green-600">Studio?</span> 🚀
            </h2>
            <p className="text-gray-600 text-xl max-w-2xl mx-auto mb-10">
              Our Studio experts build the very animations and games you love!
              Check out what the "Big Creators" at Bravework are up to.
            </p>
            <Link
              href="/studio"
              className="px-10 py-5 bg-green-600 hover:bg-green-700 text-white font-black rounded-[2rem] shadow-xl shadow-green-500/20 transition-all inline-flex items-center gap-3"
            >
              Visit Main Studio <Sparkles size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="pb-24 pt-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-blue-600 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl shadow-blue-500/40"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <h2 className="text-4xl md:text-5xl font-black mb-6 relative z-10">
              Ready to Join the Adventure?
            </h2>
            <p className="text-xl text-blue-100 mb-10 relative z-10 max-w-2xl mx-auto">
              We are looking for scriptwriters, voice actors, and animators to
              help us build the next generation of African edutainment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/jobs"
                className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl hover:bg-yellow-400 hover:text-gray-900 transition-all shadow-xl"
              >
                Create Free Account
              </Link>
              <Link
                href="/kids/about"
                className="px-8 py-4 bg-blue-700 text-white font-black rounded-2xl hover:bg-blue-800 transition-all flex items-center justify-center gap-2"
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
