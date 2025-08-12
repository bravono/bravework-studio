"use client";

import React, { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { projects } from "../services/localDataService"; // Using your original import
import { Nosifer } from "next/font/google";

// Since the data is now being imported, you should also import the types if they exist
// Assuming your localDataService file exports these types, you can uncomment these lines:
// import { Project, Todo } from "../services/localDataService";

const nosifer = Nosifer({ subsets: ["latin"], weight: "400" });

// SVG icon for the left arrow
const ChevronLeftIcon = () => (
  <svg
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
    <path d="m15 18-6-6 6-6" />
  </svg>
);

// SVG icon for the right arrow
const ChevronRightIcon = () => (
  <svg
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
    <path d="m9 18 6-6-6-6" />
  </svg>
);

export default function ProjectCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Memoize the next/prev functions with useCallback for performance
  const nextProject = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % projects.length);
      setIsAnimating(false);
    }, 500); // Match animation duration
  }, [isAnimating, projects.length]);

  const prevProject = useCallback(() => {
    if (isAnimating) return;
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + projects.length) % projects.length
      );
      setIsAnimating(false);
    }, 500); // Match animation duration
  }, [isAnimating, projects.length]);

  const currentProject = projects[currentIndex];

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
  const elapsedDays = (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);

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
    <section className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-950 dark:to-gray-800 py-16 sm:py-24">
      <div className="container mx-auto px-4">
        <h2
          className={`text-4xl sm:text-5xl font-extrabold text-center text-gray-900 dark:text-white mb-12 drop-shadow ${nosifer.className}`}
        >
          Active Projects
        </h2>
        <div className="relative flex items-center justify-center">
          <button
            className="absolute left-0 z-10 p-3 text-white bg-indigo-500 rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={prevProject}
            disabled={isAnimating}
          >
            <ChevronLeftIcon />
          </button>

          <div
            className={`bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 sm:p-12 max-w-2xl w-full transition-all duration-500 ease-in-out transform ${
              isAnimating ? "scale-95 opacity-50" : "scale-100 opacity-100"
            }`}
            key={currentProject.id}
          >
            <div className="flex justify-between items-center mb-6 text-gray-600 dark:text-gray-400">
              <span className="text-sm font-semibold uppercase tracking-wider">
                Project {currentIndex + 1} of {projects.length}
              </span>
              <div className="px-3 py-1 bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-bold rounded-full">
                ACTIVE
              </div>
            </div>

            <h3 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {currentProject.title}
            </h3>
            <p className="text-lg text-gray-600 dark:text-gray-400 font-medium">
              Owner: {currentProject.owner}
            </p>

            <div className="flex flex-col sm:flex-row justify-around items-center gap-8 my-10">
              {/* Tasks Progress Ring */}
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    className="text-gray-200 dark:text-gray-700 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                  />
                  <circle
                    className="text-emerald-500 stroke-current transition-all duration-500 ease-out"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 45 * (1 - completionPercentage / 100)
                    }`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round(completionPercentage)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Tasks
                  </span>
                </div>
              </div>

              {/* Timeline Progress Ring */}
              <div className="relative w-32 h-32">
                <svg viewBox="0 0 100 100" className="w-full h-full">
                  <circle
                    className="text-gray-200 dark:text-gray-700 stroke-current"
                    strokeWidth="10"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                  />
                  <circle
                    className="text-indigo-500 stroke-current transition-all duration-500 ease-out"
                    strokeWidth="10"
                    strokeLinecap="round"
                    cx="50"
                    cy="50"
                    r="45"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 45}`}
                    strokeDashoffset={`${
                      2 * Math.PI * 45 * (1 - timelinePercentage / 100)
                    }`}
                    transform="rotate(-90 50 50)"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {Math.round(timelinePercentage)}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Timeline
                  </span>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 text-gray-600 dark:text-gray-400">
              <div className="flex flex-col text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  Start At
                </span>
                <span className="text-sm font-medium">
                  {formatDate(currentProject.startDate)}
                </span>
              </div>
              <div className="flex flex-col text-center">
                <span className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  End At
                </span>
                <span className="text-sm font-medium">
                  {formatDate(currentProject.endDate)}
                </span>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href={`/projects/${currentProject.id}`}
                className="inline-block bg-indigo-500 text-white font-semibold py-3 px-8 rounded-full shadow-lg hover:bg-indigo-600 transition-colors duration-300"
              >
                View Project Details
              </Link>
            </div>
          </div>

          <button
            className="absolute right-0 z-10 p-3 text-white bg-indigo-500 rounded-full hover:bg-indigo-600 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={nextProject}
            disabled={isAnimating}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
