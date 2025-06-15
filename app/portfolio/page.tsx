'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { portfolios } from '../services/localDataService';
import { Nosifer } from "next/font/google";

const nosifer = Nosifer({ subsets: ["latin"], weight: "400" });

export default function Portfolio() {
  // Get unique categories from portfolios
  const categories = ["All", "3D Service", "Web Development", "Mobile development", "UI/UX Design", "Voice Service"];
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Filter portfolios based on selected category
  const filteredPortfolios =
    selectedCategory === "All"
      ? portfolios
      : portfolios.filter((p) => p.category === selectedCategory);

  return (
    <main>
      <Navbar />
      <section className="portfolio-section">
        <div className="container">
          <h1 className={`section-title ${nosifer.className}`}>Our Portfolio</h1>
          
          {/* Category Filter */}
          <div style={{ marginBottom: 32, display: "flex", gap: 12, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: "8px 20px",
                  borderRadius: 20,
                  border: "none",
                  background: selectedCategory === cat ? "#4f46e5" : "#e5e7eb",
                  color: selectedCategory === cat ? "#fff" : "#333",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: selectedCategory === cat ? "0 2px 8px rgba(79,70,229,0.12)" : "none",
                  transition: "all 0.2s"
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="portfolio-grid">
            {filteredPortfolios.length === 0 ? (
              <div style={{ padding: 40, textAlign: "center", color: "#888" }}>
                No portfolio items found for this category.
              </div>
            ) : (
              filteredPortfolios.map((portfolio) => (
                <Link href={`/portfolio/${portfolio.id}`} key={portfolio.id} className="portfolio-item">
                  <div className="portfolio-image">
                    <img src={portfolio.image} alt={portfolio.title} />
                  </div>
                  <div className="portfolio-content">
                    <span className="portfolio-category">{portfolio.category}</span>
                    <h3>{portfolio.title}</h3>
                    <p>{portfolio.description}</p>
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