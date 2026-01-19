"use client";

import React from "react";
import AcademySubNavBar from "../../components/AcademySubNavBar";
import { motion } from "framer-motion";
import { Target, Eye, Users, Heart, ShieldCheck, Zap } from "lucide-react";

export default function AcademyAboutPage() {
  return (
    <div className="bg-white min-h-screen">
      <AcademySubNavBar />

      <section className="py-20 lg:py-32 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-5xl lg:text-7xl font-black text-gray-900 mb-8">
              Empowering African{" "}
              <span className="text-blue-600">Innovation.</span>
            </h1>
            <p className="text-xl text-gray-600 leading-relaxed font-medium">
              Bravework Academy was born out of a desire to bridge the digital
              skills gap in Nigeria and Africa. We believe that by providing
              world-class education in high-demand technical fields, we can
              empower individuals to build global careers and drive local
              economic growth.
            </p>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="p-12 rounded-[3rem] bg-blue-50 border border-blue-100"
            >
              <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                <Target size={32} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To provide accessible, industry-relevant, and project-based
                digital skills training that prepares our students for the
                future of work.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="p-12 rounded-[3rem] bg-indigo-50 border border-indigo-100"
            >
              <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-indigo-500/20">
                <Eye size={32} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-6">
                Our Vision
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                To be Africa's leading hub for digital craftsmanship, recognized
                globally for producing world-class talent in technology and the
                creative arts.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-black text-gray-900 mb-16">
            Our Core Values
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                title: "Excellence",
                desc: "Setting high standards in everything we do.",
                icon: Heart,
              },
              {
                title: "Inspiration",
                desc: "Igniting creativity and passion in our students.",
                icon: Zap,
              },
              {
                title: "Community",
                desc: "Building a supportive network for growth.",
                icon: Users,
              },
              {
                title: "Integrity",
                desc: "Maintaining honesty and transparency.",
                icon: ShieldCheck,
              },
            ].map((value, i) => (
              <div
                key={value.title}
                className="p-8 bg-white rounded-3xl shadow-sm border border-gray-100"
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                  <value.icon size={24} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600">{value.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
