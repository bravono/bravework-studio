"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Monitor,
  Cpu,
  Battery,
  Wifi,
  Clock,
  ChevronRight,
  Zap,
  ShieldCheck,
  Smartphone,
  CheckCircle2,
  GraduationCap,
} from "lucide-react";
import AcademySubNavBar from "../../components/AcademySubNavBar";

export default function AcademyRentalsPage() {
  return (
    <div className="bg-white min-h-screen">
      <AcademySubNavBar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-24 lg:pt-20 lg:pb-32 bg-gradient-to-br from-green-50 via-white to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-100 text-green-700 font-bold text-sm mb-6">
                <Zap size={16} />
                <span>Empowering Your Learning Journey</span>
              </div>
              <h1 className="text-5xl lg:text-7xl font-black text-gray-900 leading-[1.1] mb-6">
                Gear Up for <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-600 to-blue-600">
                  Success.
                </span>
              </h1>
              <p className="text-xl text-gray-600 mb-10 leading-relaxed max-w-xl">
                Don't let hardware be a barrier. Rent professional-grade PCs,
                GPUs, and iPads optimized for 3D animation, development, and
                digital art.
                <span className="font-bold text-green-600">
                  {" "}
                  Starting from ₦500/hour.
                </span>
              </p>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/academy/rentals/inventory"
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl shadow-xl shadow-green-600/20 transition-all flex items-center gap-3"
                >
                  <Monitor size={20} />
                  View Inventory
                </Link>
                <Link
                  href="/academy/rentals/booking"
                  className="px-8 py-4 bg-white border-2 border-green-100 hover:border-green-600 text-gray-700 font-bold rounded-2xl transition-all flex items-center gap-3"
                >
                  Book Now
                  <ChevronRight size={20} />
                </Link>
              </div>

              <div className="mt-10 flex items-center gap-6 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-green-500" size={18} />
                  Damage Protection
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-500" size={18} />
                  Flexible Hourly Rates
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, type: "spring" }}
              className="relative"
            >
              <div className="absolute -inset-10 bg-green-100/40 rounded-full blur-3xl animate-pulse"></div>
              <div className="relative z-10 p-8 bg-white/40 backdrop-blur-xl rounded-[2.5rem] border border-white/20 shadow-2xl">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    {
                      icon: Monitor,
                      label: "High-Spec PCs",
                      color: "bg-blue-500",
                    },
                    { icon: Cpu, label: "Render Rigs", color: "bg-purple-500" },
                    {
                      icon: Smartphone,
                      label: "Digital Tablets",
                      color: "bg-amber-500",
                    },
                    {
                      icon: Battery,
                      label: "Backup Power",
                      color: "bg-green-500",
                    },
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="p-6 bg-white rounded-3xl shadow-sm border border-gray-50 hover:shadow-md transition-shadow"
                    >
                      <div
                        className={`w-12 h-12 ${item.color} rounded-2xl flex items-center justify-center text-white mb-4`}
                      >
                        <item.icon size={24} />
                      </div>
                      <span className="font-bold text-gray-900">
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Why Rent with Us? */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-gray-900 mb-4">
              The Smarter Way to Learn
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              We provide the tools, you provide the talent. Our rental ecosystem
              is designed specifically for modern digital education.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "Student Discounts",
                desc: "Active Academy students get up to 15% off regular rental rates during their course duration.",
                icon: GraduationCap,
                color: "text-green-600",
                bg: "bg-green-50",
              },
              {
                title: "Optimized for Academy",
                desc: "All devices come pre-installed with the software you need for your Bravework courses.",
                icon: CheckCircle2,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                title: "Reliable Infrastructure",
                desc: "High-speed internet and consistent power protection ensure your work is never lost.",
                icon: Wifi,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="p-10 rounded-[2rem] bg-gray-50/50 border border-gray-100 group"
              >
                <div
                  className={`w-14 h-14 ${feature.bg} ${feature.color} rounded-2xl flex items-center justify-center mb-6`}
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

      {/* Quick CTA */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_120%,rgba(34,197,94,0.15),transparent)] pointer-events-none"></div>
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Need Hardware for Your Course?
            </h2>
            <p className="text-gray-400 text-xl mb-10 max-w-2xl mx-auto">
              Bundle your rental with any Academy enrollment and save 10%
              instantly. Limited slots available for high-end rendering units.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/academy/rentals/inventory"
                className="px-10 py-5 bg-green-600 text-white font-black rounded-2xl hover:bg-green-700 transition-all"
              >
                Explore Inventory
              </Link>
              <Link
                href="/academy/rentals/faq"
                className="px-10 py-5 bg-white/10 text-white font-black rounded-2xl hover:bg-white/20 transition-all border border-white/10"
              >
                View Rental Policies
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
