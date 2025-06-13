"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { projects } from "../services/localDataService";
import { Nosifer } from "next/font/google";

const nosifer = Nosifer({ subsets: ["latin"], weight: "400" });

export default function ProjectCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProject = projects[currentIndex];

  const nextProject = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
  };

  const prevProject = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + projects.length) % projects.length
    );
  };

  // Calculate completion percentage based on completed tasks
  const completedTasks = currentProject.todos.filter(
    (task) => task.completed
  ).length;
  const completionPercentage =
    (completedTasks / currentProject.todos.length) * 100;

  // Calculate timeline percentage
  const start = new Date(currentProject.startDate);
  const end = new Date(currentProject.endDate);
  const today = new Date();
  const totalDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  const elapsedDays =
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

  // If the project hasn't started yet, timeline should be 0
  const timelinePercentage =
    today < start
      ? 0
      : Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

  // Format dates
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  return (
    <section className="project-carousel-section">
      <div className="container">
        <h2 className={`section-title ${nosifer.className}`}>Active Projects</h2>
        <div className="project-carousel">
          <button className="carousel-arrow prev" onClick={prevProject}>
            <span className="arrow-icon">←</span>
          </button>

          <div className="project-card">
            <div className="project-counter">
              {currentIndex + 1} of {projects.length}
            </div>
            <h3 className="project-title">{currentProject.title}</h3>
            <p className="project-owner">{currentProject.owner}</p>

            <div className="progress-rings">
              <div className="progress-ring">
                <svg viewBox="0 0 100 100" className="progress-ring__circle">
                  <circle
                    className="progress-ring__circle-bg"
                    cx="50"
                    cy="50"
                    r="45"
                  />
                  <circle
                    className="progress-ring__circle-progress"
                    cx="50"
                    cy="50"
                    r="45"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${
                        2 * Math.PI * 45 * (1 - completionPercentage / 100)
                      }`,
                    }}
                  />
                </svg>
                <div className="progress-ring__content">
                  <span className="progress-ring__label">Tasks</span>
                  <span className="progress-ring__value">
                    {completedTasks} of {currentProject.todos.length}
                  </span>
                </div>
              </div>

              <div className="progress-ring">
                <svg viewBox="0 0 100 100" className="progress-ring__circle">
                  <circle
                    className="progress-ring__circle-bg"
                    cx="50"
                    cy="50"
                    r="45"
                  />
                  <circle
                    className="progress-ring__circle-progress"
                    cx="50"
                    cy="50"
                    r="45"
                    style={{
                      strokeDasharray: `${2 * Math.PI * 45}`,
                      strokeDashoffset: `${
                        2 * Math.PI * 45 * (1 - timelinePercentage / 100)
                      }`,
                    }}
                  />
                </svg>
                <div className="progress-ring__content">
                  <span className="progress-ring__label">Timeline</span>
                  <span className="progress-ring__value">
                    {Math.round(timelinePercentage)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="project-dates">
              <div className="date">
                <span className="date-label">Start</span>
                <span className="date-value">
                  {formatDate(currentProject.startDate)}
                </span>
              </div>
              <div className="date">
                <span className="date-label">End</span>
                <span className="date-value">
                  {formatDate(currentProject.endDate)}
                </span>
              </div>
            </div>

            <Link
              href={`/projects/${currentProject.id}`}
              className="view-project-link"
            >
              View Project Details
            </Link>
          </div>

          <button className="carousel-arrow next" onClick={nextProject}>
            <span className="arrow-icon">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
