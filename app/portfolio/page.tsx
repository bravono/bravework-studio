'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import { portfolios } from '../services/localDataService';

export default function Portfolio() {
  return (
    <main>
      <Navbar />
      <section className="portfolio-section">
        <div className="container">
          <h1 className="section-title">Our Portfolio</h1>
          <div className="portfolio-grid">
            {portfolios.map((portfolio) => (
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
            ))}
          </div>
        </div>
      </section>
    </main>
  );
} 