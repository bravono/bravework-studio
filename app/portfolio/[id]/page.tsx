"use client";

import React from "react";
import Navbar from "../../components/Navbar";
import Link from "next/link";
import { portfolios } from "../../services/localDataService";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function PortfolioItem({ params }: { params: { id: number } }) {
  const portfolio = portfolios.find((p) => p.id == params.id);

  if (!portfolio) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Project not found
          </h1>
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Portfolio
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200 mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Portfolio
          </Link>

          <div className="bg-white rounded-3xl shadow-xl p-6 md:p-12 space-y-12">
            {/* Header Section */}
            <div className="text-center">
              <span className="inline-block px-4 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 mb-4">
                {portfolio.category}
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                {portfolio.title}
              </h1>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {portfolio.description}
              </p>
            </div>

            {/* Main Image */}
            <div className="relative">
              <img
                src={portfolio.image}
                alt={portfolio.title}
                className="w-full h-auto rounded-xl shadow-lg"
              />
            </div>

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Client</h3>
                <p className="text-gray-600">{portfolio.details.client}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Year</h3>
                <p className="text-gray-600">{portfolio.details.year}</p>
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-gray-900">Tools Used</h3>
                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  {portfolio.details.tools.map((tool, index) => (
                    <span
                      key={index}
                      className="inline-block px-3 py-1 text-sm rounded-full bg-gray-200 text-gray-700"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Content */}
            <div className="space-y-12">
              {/* Project Video */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-4">
                  Project Video
                </h2>
                <div
                  className="aspect-w-16 aspect-h-9"
                  dangerouslySetInnerHTML={{ __html: portfolio.iFrame }}
                />
              </div>

              {/* Project Overview */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">
                  Project Overview
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {portfolio.details.description}
                </p>
              </div>

              {/* Challenges */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Challenges</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {portfolio.details.challenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>

              {/* Solutions */}
              <div className="space-y-4">
                <h2 className="text-3xl font-bold text-gray-900">Solutions</h2>
                <ul className="list-disc list-inside text-gray-600 space-y-2">
                  {portfolio.details.solutions.map((solution, index) => (
                    <li key={index}>{solution}</li>
                  ))}
                </ul>
              </div>

              {/* More Samples */}
              {portfolio.otherSamples.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-3xl font-bold text-gray-900">
                    More Samples
                  </h2>
                  <ul className="list-decimal list-inside text-gray-600 space-y-2">
                    {portfolio.otherSamples.map((sample, index) => (
                      <li key={index}>
                        <Link
                          href={sample}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {portfolio.sampleNames[index]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Order Service Button */}
            <div className="mt-12">
              <a
                href={`/order?service=${encodeURIComponent(
                  portfolio.category
                )}`}
                className="w-full inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
              >
                Order Service
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link
              href="/portfolio"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Portfolio
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}