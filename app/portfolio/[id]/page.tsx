'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';
import { portfolios } from '../../services/localDataService';



export default function PortfolioItem({ params }: { params: { id: number } }) {
  const portfolio = portfolios.find(p => p.id == params.id);


  if (!portfolio) {
    return (
      <main>
        <Navbar />
        <div className="container">
          <h1>Project not found</h1>
          <Link href="/portfolio" className="btn-primary">Back to Portfolio</Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <section className="portfolio-detail-section">
        <div className="container">
          <Link href="/portfolio" className="back-link">← Back to Portfolio</Link>
          
          <div className="portfolio-detail">
            <div className="portfolio-detail-header">
              <span className="portfolio-category">{portfolio.category}</span>
              <h1>{portfolio.title}</h1>
              <p className="portfolio-description">{portfolio.description}</p>
            </div>

            <div className="portfolio-detail-image">
              <img src={portfolio.image} alt={portfolio.title} />
            </div>

            <div className="portfolio-detail-content">
              <div className="project-info">
                <div className="info-item">
                  <h3>Client</h3>
                  <p>{portfolio.details.client}</p>
                </div>
                <div className="info-item">
                  <h3>Year</h3>
                  <p>{portfolio.details.year}</p>
                </div>
                <div className="info-item">
                  <h3>Tools Used</h3>
                  <div className="tools-list">
                    {portfolio.details.tools.map((tool, index) => (
                      <span key={index} className="tool-tag">{tool}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="project-description">
                <h2>Project Overview</h2>
                <p>{portfolio.details.description}</p>
              </div>

              <div className="project-challenges">
                <h2>Challenges</h2>
                <ul>
                  {portfolio.details.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>

              <div className="project-solutions">
                <h2>Solutions</h2>
                <ul>
                  {portfolio.details.solutions.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}