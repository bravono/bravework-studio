"use client";
import React, { useCallback, useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Course } from "@/app/types/app";
import getWeeksBtwDates from "@/lib/utils/getWeeksBtwDays";
import { coursesData } from "@/app/services/localDataService";

import {
  Users,
  Clock,
  ExternalLink,
  Github,
  Award,
  Circle,
  CheckCircle,
  ChevronDown,
} from "lucide-react";

export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course>();

  const isActive = course?.isActive;

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch course");
      }

      const data = await res.json();
      setCourse(data[0]);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    console.log("Viewing Course", course?.id);
    console.log("Match Course", coursesData);
  }, [course]);

  // Find the current course based on the courseId
  const currentCourse = coursesData.find(
    (c) => Number(c.id) === Number(course?.id)
  );

  if (!currentCourse) {
    return (
      <div className="text-center sm:text-5xl py-12 h-full">
        Course not found
      </div>
    );
  }

  return (
    <div className="bg-white min-h-screen py-12 font-[Inter]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl mt-10 font-extrabold text-secondary-dark leading-tight mb-2 rounded-xl">
            {course.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            {currentCourse.tagline}
          </p>
        </div>

        {/* Course Overview Card */}
        <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 mb-12 border-2 border-primary-light">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Instructor and quick details */}
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-dark">
                Course Overview
              </h2>
              <div className="flex items-center space-x-4">
                <Users className="text-secondary" />
                <span className="text-gray-700 font-medium">Age:</span>
                <span className="font-bold text-gray-900">
                  {currentCourse.targetAudience}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Clock className="text-secondary" />
                <span className="text-gray-700 font-medium">Duration:</span>
                <span className="font-bold text-gray-900">
                  {currentCourse.duration}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Github className="text-secondary" />
                <span className="text-gray-700 font-medium">Software:</span>
                <span className="font-bold text-gray-900">
                  {currentCourse.software}
                </span>
              </div>
              <div className="mt-4 border-t pt-4">
                <p className="text-gray-700">
                  <span className="font-semibold text-secondary-dark">
                    Instructor:
                  </span>{" "}
                  {course.firstName + course.lastName}
                </p>
              </div>
            </div>
            {/* Overview paragraph */}
            <div>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg rounded-xl bg-primary-light/10 border-l-4 border-primary p-4 shadow-inner">
                {currentCourse.overview}
              </p>
            </div>
          </div>
        </div>

        {/* Levels Section */}
        <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 mb-12 border-2 border-primary-light">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark text-center mb-8">
            <Award className="inline-block w-10 h-10 mr-2 text-secondary" />
            Program Levels
          </h2>
          <div className="space-y-6">
            {currentCourse.levels.map((level, index) => (
              <LevelCard key={index} level={level} />
            ))}
          </div>
        </div>

        {/* Program Details Section */}
        {!currentCourse.duration.includes("hours") && (
          <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 mb-12 border-2 border-primary-light">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark text-center mb-8">
              Program Details
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(currentCourse.details).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-primary-light/10 rounded-xl p-4 flex items-start space-x-4"
                >
                  <Circle className="w-5 h-5 mt-1 text-primary flex-shrink-0" />
                  <div>
                    <h3 className="text-lg font-semibold text-primary-dark capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <p className="text-gray-700 text-sm mt-1">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Why Choose Us & How to Join Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Why Choose Us */}
          <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 border-2 border-primary-light">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark mb-6 text-center">
              Why Choose Us?
            </h2>
            <ul className="space-y-4">
              {currentCourse.whyChooseUs.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <div className="mt-1 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {item.title}
                    </h3>
                    <p className="text-gray-700 text-sm mt-1">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* How to Join */}
          <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 border-2 border-primary-light">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark mb-6 text-center">
              How to Join
            </h2>
            <ul className="space-y-4">
              {currentCourse.howToJoin.map((item, index) => (
                <li key={index} className="flex items-start space-x-3">
                  <ExternalLink className="w-5 h-5 mt-1 text-secondary flex-shrink-0" />
                  <p className="text-gray-700">{item}</p>
                </li>
              ))}
            </ul>
            {isActive && (
              <Link
                className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                href={`/auth/signup?enroll=true&courseId=${courseId}`}
              >
                Enroll Now
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Reusable component for each level card with expand/collapse functionality
const LevelCard = ({ level }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const LevelIcon = level.icon;

  return (
    <div
      className="bg-primary-light/10 p-6 rounded-2xl shadow-inner cursor-pointer transition-transform transform hover:scale-[1.01]"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <LevelIcon className="w-10 h-10 text-primary" />
          <h3 className="text-xl font-bold text-primary-dark">
            {level.level}: {level.title}
          </h3>
        </div>
        <ChevronDown
          className={`w-6 h-6 text-secondary transform transition-transform duration-300 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </div>

      {isExpanded && (
        <div className="mt-4 text-gray-700 space-y-3 transition-opacity duration-300 opacity-100">
          <div className="bg-secondary-light/10 p-3 rounded-lg border-l-4 border-secondary">
            <h4 className="font-semibold text-secondary-dark">Objective:</h4>
            <p>{level.objective}</p>
          </div>
          {level.description && (
            <p>
              <span className="font-semibold text-secondary-dark">
                What Student Will Do:
              </span>{" "}
              {level.description}
            </p>
          )}
          <p>
            <span className="font-semibold text-secondary-dark">Activity:</span>{" "}
            {level.activity}
          </p>
          {level.why && (
            <p>
              <span className="font-semibold text-secondary-dark">Why:</span>{" "}
              {level.why}
            </p>
          )}
          {level.outcomes.length > 0 && (
            <p>
              <span className="font-semibold text-secondary-dark">
                Learning Outcomes:
              </span>{" "}
              {level.outcomes.join(", ")}
            </p>
          )}
          <p>
            <span className="font-semibold text-secondary-dark">Info:</span>{" "}
            {level.info}
          </p>
        </div>
      )}
    </div>
  );
};
