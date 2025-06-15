"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { portfolios } from "../../services/localDataService";

export default function PortfolioItem({ params }: { params: { id: number } }) {
  const portfolio = portfolios.find((p) => p.id == params.id);

  if (!portfolio) {
    return (
      <main>
        <Navbar />
        <div className="container">
          <h1>Project not found</h1>
          <Link href="/portfolio" className="btn-primary">
            <i className="fa fa-arrow-left arrow-icon" aria-hidden="true"></i>{" "}
            Back to Portfolio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Navbar />
      <section className="portfolio-detail-section">
        <div className="container">
          <Link href="/portfolio" className="back-link">
            <i className="fa fa-arrow-left arrow-icon" aria-hidden="true"></i>{" "}
            Back to Portfolio
          </Link>

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
                      <span key={index} className="tool-tag">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <h2>Project Video</h2>
                <div dangerouslySetInnerHTML={{ __html: portfolio.iFrame }} />
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
              {portfolio.otherSamples.length ? (
                <div className="project-more-samples">
                  <h2>More Samples</h2>
                  <ol>
                    {portfolio.otherSamples.map((sample, index) => (
                      <li key={index}>
                        <Link
                          href={sample}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {portfolio.sampleNames[index]}
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              ) : null}
            </div>
            <div className="order-service-btn-container">
              <a
                href={`/order?service=${encodeURIComponent(
                  portfolio.category
                )}`}
                className="order-service-btn"
              >
                Order Service
              </a>
            </div>
          </div>
          <Link href="/portfolio" className="back-link">
            <i className="fa fa-arrow-left arrow-icon" aria-hidden="true"></i>{" "}
            Back to Portfolio
          </Link>
        </div>
      </section>
    </main>
  );
}
