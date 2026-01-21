"use client";

import React from "react";
import { motion } from "framer-motion";
import KidsSubNavBar from "../../components/KidsSubNavBar";
import { Book, Lightbulb, Heart, Rocket, Target, Users } from "lucide-react";

export default function KidsAboutPage() {
  const episodeIdeas = [
    {
      title: "ABC Adventure",
      desc: "Join two kids on a letter-hunting quest through a magical 3D orchard.",
      icon: Book,
      color: "bg-pink-500",
    },
    {
      title: "Shape Squad",
      desc: "A team of geometric heroes solves puzzles using their unique shapes.",
      icon: Target,
      color: "bg-blue-500",
    },
    {
      title: "Global Feast",
      desc: "Travel the world to learn about different cultures and their foods.",
      icon: GlobeIcon, // Reusing icon logic
      color: "bg-green-500",
    },
    {
      title: "Eco Heroes",
      desc: "Kids learn about recycling and protecting the environment.",
      icon: Heart,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <KidsSubNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Core Vision */}
        <div className="mb-24 text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-gray-900 mb-8"
          >
            Our Vision:{" "}
            <span className="text-blue-500">Learning Through Wonder</span>
          </motion.h1>
          <p className="text-xl text-gray-600 leading-relaxed font-medium">
            Bravework Kids is an initiative specifically designed for
            preschoolers (ages 2–6). We believe that the best way to teach is
            through high-quality visual storytelling that captures the
            imagination while delivering foundational knowledge.
          </p>
        </div>

        {/* Vision Details Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          <div className="space-y-8">
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  One Idea Per Episode
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  We keep it simple. Each 5-minute episode focuses on a single
                  concept—be it a letter, a shape, or a social value—to ensure
                  maximum retention.
                </p>
              </div>
            </div>
            <div className="flex gap-6">
              <div className="flex-shrink-0 w-12 h-12 bg-green-100 text-green-600 rounded-xl flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Multilingual Dubbing
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Education should be accessible. We produce dubs in English,
                  Hausa, Igbo, and Yoruba to connect with diverse families
                  across Nigeria.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 p-10 rounded-[3rem] border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <Rocket className="text-blue-500" />
              Studio Synergy
            </h3>
            <p className="text-gray-600 leading-relaxed mb-6">
              This project is powered by **Bravework Studio's** expertise in:
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-gray-700 font-bold">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Premium 3D Animation & Modeling
              </li>
              <li className="flex items-center gap-3 text-gray-700 font-bold">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                AI-Assisted Storytelling
              </li>
              <li className="flex items-center gap-3 text-gray-700 font-bold">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                Bravework Academy Tech Training
              </li>
            </ul>
          </div>
        </div>

        {/* Upcoming Episode Ideas */}
        <div>
          <h2 className="text-3xl font-black text-gray-900 mb-12 text-center underline decoration-green-300 decoration-8 underline-offset-8 italic uppercase">
            Brainstormed Episodes
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {episodeIdeas.map((idea, i) => (
              <motion.div
                key={idea.title}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                viewport={{ once: true }}
                className="group p-8 rounded-[2.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-2xl transition-all text-center"
              >
                <div
                  className={`w-16 h-16 ${idea.color} text-white rounded-2xl flex items-center justify-center mx-auto mb-6 transition-transform group-hover:rotate-12`}
                >
                  <idea.icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {idea.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {idea.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple custom icons for missing ones
function GlobeIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}
