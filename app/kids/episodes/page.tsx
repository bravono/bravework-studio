"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import KidsSubNavBar from "../../components/KidsSubNavBar";
import { Play, Lock, Info, ExternalLink, Youtube } from "lucide-react";

export default function KidsEpisodesPage() {
  const episodes = [
    {
      id: 1,
      title: "Episode 1: Quest for A, B, C",
      desc: "Join our heroes as they explore a magical orchard to find the first three letters of the alphabet.",
      thumbnail: "/assets/kids/episode_teaser.png",
      status: "coming-soon",
      badge: "Pilot Episode",
      url: "https://youtu.be/o5HukmvQD1w",
    },
    {
      id: 2,
      title: "Episode 1: Shape Squad Heroics",
      desc: "A giant circle is blocking the square city's gate! The Shape Squad must work together to find a way through.",
      thumbnail: "/assets/kids/episode_2.png",
      status: "locked",
      badge: "In Scripting",
      url: "",
    },
    {
      id: 3,
      title: "Episode 1: Global Feast Adventure",
      desc: "Travel to a vibrant village and learn about diverse cultures and delicious traditional foods.",
      thumbnail: "/assets/kids/episode_3.png",
      status: "locked",
      badge: "Brainstorming",
      url: "",
    },
  ];

  return (
    <div className="bg-white min-h-screen">
      <KidsSubNavBar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-16">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 underline decoration-yellow-400 decoration-8 underline-offset-4">
              Watch & Learn
            </h1>
            <p className="text-xl text-gray-600 font-medium">
              Explore the world of Bravework Kids. New episodes are produced
              monthly with our community of contributors.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FF0000] text-white font-bold hover:scale-105 transition-transform shadow-xl shadow-red-500/20"
              onClick={() =>
                window.open("https://youtu.be/o5HukmvQD1w", "_blank")
              }
            >
              <Youtube size={20} />
              YouTube Channel
            </button>
          </div>
        </div>

        {/* Episodes Grid */}
        <div className="grid md:grid-cols-2 gap-12 mb-24">
          {episodes.map((ep, i) => (
            <motion.div
              key={ep.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-gray-100 shadow-xl mb-6">
                <Image
                  src={ep.thumbnail}
                  alt={ep.title}
                  layout="fill"
                  objectFit="cover"
                  className={`transition-all duration-700 group-hover:scale-110 ${
                    ep.status === "locked" ? "grayscale opacity-50" : ""
                  }`}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-8">
                  <div className="text-white">
                    <span className="px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-3 inline-block">
                      {ep.badge}
                    </span>
                    <h3 className="text-2xl font-black">{ep.title}</h3>
                  </div>
                </div>

                {/* Play/Lock Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  {ep.status === "locked" ? (
                    <div className="w-20 h-20 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white border-2 border-white/30">
                      <Lock size={32} />
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white shadow-2xl scale-0 group-hover:scale-100 transition-transform">
                      <Play
                        size={40}
                        fill="currentColor"
                        onClick={() => window.open(ep.url, "_blank")}
                      />
                    </div>
                  )}
                </div>
              </div>
              <p className="text-gray-600 font-medium leading-relaxed px-4">
                {ep.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Production Insights Section */}
        <div className="p-12 rounded-[3.5rem] bg-pink-50 border-4 border-dashed border-pink-200">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-gray-900 mb-6 flex items-center gap-3">
                <Info className="text-pink-500" />
                Behind the Scenes
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium mb-8">
                From script to final render, our production process is built on
                transparency. We use Blender for 3D modeling and animation,
                providing professional insights for our students at the
                Bravework Academy.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-3xl text-center shadow-sm">
                  <p className="text-2xl font-black text-pink-500 mb-1">200+</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    3D Assets Created
                  </p>
                </div>
                <div className="bg-white p-6 rounded-3xl text-center shadow-sm">
                  <p className="text-2xl font-black text-blue-500 mb-1">4</p>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Languages Supported
                  </p>
                </div>
              </div>
            </div>
            <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl rotate-3">
              <Image
                src="/assets/kids/hero_character.png"
                alt="Production environment"
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-pink-500/10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
