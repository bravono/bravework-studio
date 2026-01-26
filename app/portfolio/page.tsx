"use client";

import React, { useState } from "react";
import Link from "next/link";
import { portfolios } from "../services/localDataService";
import { Outfit } from "next/font/google";
import { Grid, Shapes, Code, Smartphone, PenTool, Mic } from "lucide-react";

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "700", "900"] });

const categoryIcons = {
  All: Grid,
  "3D Modeling & Animation": Shapes,
  "Web Development": Code,
  "Mobile App": Smartphone,
  "UiUx Design": PenTool,
  "Video & Voice Over": Mic,
};

export default function Portfolio() {
  // Get unique categories from portfolios
  const categories = [
    "All",
    "3D Modeling & Animation",
    "Web Development",
    "Mobile App",
    "UiUx Design",
    "Video & Voice Over",
  ];
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter portfolios based on selected category
  const filteredPortfolios =
    selectedCategory === "All"
      ? portfolios
      : portfolios.filter((p) => p.category === selectedCategory);

  return (
    <main className="bg-gray-50 min-h-screen">
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1
              className={`text-5xl font-bold text-gray-900 ${outfit.className}`}
            >
              Our Portfolio
            </h1>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our collection of work across various creative and
              technical domains.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3 mb-12">
            {categories.map((cat) => {
              const Icon = categoryIcons[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`
                    flex items-center gap-2 px-6 py-2 rounded-full font-semibold transition-all duration-300
                    ${
                      selectedCategory === cat
                        ? "bg-indigo-600 text-white shadow-lg transform hover:scale-105"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {cat}
                </button>
              );
            })}
          </div>

          {/* Portfolio Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPortfolios.length === 0 ? (
              <div className="col-span-full py-20 text-center text-gray-500 text-lg">
                No portfolio items found for this category.
              </div>
            ) : (
              filteredPortfolios.map((portfolio) => (
                <Link
                  href={`/portfolio/${portfolio.id}`}
                  key={portfolio.id}
                  className="group block bg-white rounded-3xl shadow-xl overflow-hidden transform transition-transform duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={portfolio.image}
                      alt={portfolio.title}
                      className="w-full h-56 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <span className="absolute top-4 left-4 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-full z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {portfolio.category}
                    </span>
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      {portfolio.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {portfolio.description}
                    </p>
                    <div className="mt-4 text-indigo-600 font-semibold flex items-center">
                      View Project
                      <svg
                        className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 duration-300"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 5l7 7-7 7"
                        ></path>
                      </svg>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
