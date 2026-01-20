"use client";

import React, { useState } from "react";
import StudioSubNavBar from "../../components/StudioSubNavBar";
import { portfolios } from "../../services/localDataService";
import { motion, AnimatePresence } from "framer-motion";
import { Outfit } from "next/font/google";
import {
  Grid,
  Shapes,
  Code,
  Smartphone,
  PenTool,
  Mic,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
});

const categoryIcons: Record<string, any> = {
  All: Grid,
  "3D Modeling & Animation": Shapes,
  "Web Development": Code,
  "Mobile App": Smartphone,
  "UiUx Design": PenTool,
  "Video & Voice Over": Mic,
};

export default function StudioPortfolio() {
  const categories = [
    "All",
    "3D Modeling & Animation",
    "Web Development",
    "Mobile App",
    "UiUx Design",
    "Video & Voice Over",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");

  const filteredPortfolios =
    selectedCategory === "All"
      ? portfolios
      : portfolios.filter((p) => p.category === selectedCategory);

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
            Our <span className="text-green-500">Work</span>
          </motion.h1>
          <p className="text-xl text-gray-400">
            A showcase of digital engineering and creative excellence. From
            interactive web apps to lifelike 3D animations.
          </p>
        </div>
      </section>

      <section className="py-12 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat] || Grid;
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all duration-300 border ${
                    isActive
                      ? "bg-green-600 border-green-500 text-white shadow-lg shadow-green-900/20 scale-105"
                      : "bg-gray-900 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <AnimatePresence mode="popLayout">
              {filteredPortfolios.map((portfolio) => (
                <motion.div
                  layout
                  key={portfolio.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                >
                  <Link
                    href={`/portfolio/${portfolio.id}`}
                    className="group block bg-gray-900/50 rounded-[2rem] border border-gray-800 overflow-hidden transform transition-all hover:border-green-500/30 hover:shadow-2xl hover:shadow-green-900/10"
                  >
                    <div className="relative aspect-video overflow-hidden">
                      <img
                        src={portfolio.image}
                        alt={portfolio.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent opacity-60" />
                      <span className="absolute top-4 left-4 bg-green-600/90 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-white/10">
                        {portfolio.category}
                      </span>
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-green-400 transition-colors">
                        {portfolio.title}
                      </h3>
                      <p className="text-gray-400 text-sm mb-6 line-clamp-2">
                        {portfolio.description}
                      </p>
                      <div className="flex items-center text-green-500 font-bold text-sm uppercase tracking-widest gap-2">
                        View Project{" "}
                        <ArrowRight
                          size={16}
                          className="transition-transform group-hover:translate-x-1"
                        />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {filteredPortfolios.length === 0 && (
            <div className="py-24 text-center">
              <p className="text-gray-500 text-xl font-medium">
                No projects found in this category yet.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
