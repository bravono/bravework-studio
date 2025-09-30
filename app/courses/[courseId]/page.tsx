"use client";
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Course } from "@/app/types/app";
import { coursesData } from "@/app/services/localDataService"; // Assuming this is for fallback/static data

import {
  Users,
  Clock,
  ExternalLink,
  Github,
  Award,
  Circle,
  CheckCircle,
  ChevronDown,
  Calendar,
} from "lucide-react";

// --- New Hook for Timezone Conversion ---
const useLocalTimezone = (dateTimeString) => {
  const [localTime, setLocalTime] = useState(null);

  useEffect(() => {
    if (dateTimeString) {
      try {
        const date = new Date(dateTimeString);
        // Format the time to show the hour, minute, and local timezone abbreviation
        setLocalTime(
          date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short",
          })
        );
      } catch (e) {
        console.error(
          "Invalid date string for timezone conversion:",
          dateTimeString
        );
        setLocalTime(null);
      }
    }
  }, [dateTimeString]);

  return localTime;
};

// --- Level Card Component (Kept the same for brevity, but moved outside of CoursePage) ---
const LevelCard = ({ level }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  // This assumes the level object provides an icon component directly
  // In a real scenario, you'd likely map a string to an icon component
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

// --- Course Page Component ---
export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course>();

  const isActive = course?.isActive;

  // Use the local data as a temporary fallback or for structure,
  // but rely on the API call for dynamic data like isActive/startDate/hours
  const currentCourse = coursesData.find((c) => c.id.toString() === courseId);

  // Timezone conversion for start date
  const startTime = course?.startDate
    ? new Date(course.startDate).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        timeZoneName: "short",
      })
    : "N/A";
  const localStartTime = useLocalTimezone(course?.startDate);

  const fetchCourse = useCallback(async () => {
    // ... (fetchCourse logic is unchanged)
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) {
        console.warn("API fetch failed");

        throw new Error("Failed to fetch course from API");
      }

      const data = await res.json();
      setCourse(data[0]);
    } catch (error) {
      console.error("Error fetching course:", error);
      // The currentCourse from localDataService will be used if setCourse fails.
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
    console.log("Fetching course data for courseId:", courseId);
  }, [fetchCourse]);

  if (!currentCourse) {
    return (
      <div className="text-center sm:text-5xl py-12 h-full">
        Course not found
      </div>
    );
  }

  // Placeholder data for new sections
  const testimonials = [
    {
      type: "parent",
      quote:
        "My daughter loves the project-based learning! It's the only screen time I don't worry about.",
      name: "Sarah M.",
      title: "Parent",
    },
    {
      type: "parent",
      quote:
        "The instructor's background check gave me huge peace of mind. Excellent and secure program.",
      name: "David L.",
      title: "Parent",
    },
    {
      type: "student",
      quote:
        "I finally understand how to use all the tools. My renders look so much better now!",
      name: "Alex B.",
      title: "Student (14)",
    },
    {
      type: "student",
      quote:
        "The class chat is super helpful. Everyone is respectful, and I learned a lot from other students' questions.",
      name: "Maya R.",
      title: "Student (12)",
    },
  ];

  const studentRenders = [
    "/assets/render1.jpg",
    "/assets/render2.jpg",
    "/assets/render3.jpg",
    "/assets/render4.jpg",
  ];

  // Custom friendly feedback structure
  const friendlyFeedbackBullets = [
    {
      title: "Real-World Portfolio Boost",
      description:
        "Unlike generic tutorials, you build impressive, portfolio-ready projects with clear before-and-after improvements that showcase your skill to colleges or employers.",
    },
    {
      title: "Expert-Led, Peer-Supported",
      description:
        "Get direct, timely feedback from our founder, Ahbideen Yusuf, and collaborate with a small, engaged group of peers in a supportive, zero-pressure environment.",
    },
    {
      title: "Beyond the Basics",
      description:
        "We dive deep into the 'why' and 'how' of creative technology, ensuring students don't just use tools, but master the underlying principles for long-term success.",
    },
  ];

  return (
    <div className="bg-white min-h-screen py-12 font-[Inter]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section (Unchanged) */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl mt-10 font-extrabold text-secondary-dark leading-tight mb-2 rounded-xl">
            {course?.title || currentCourse?.title}
          </h1>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            {currentCourse?.tagline}
          </p>
        </div>

        {/* Course Overview Card (Modified to include local timezone) */}
        <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Instructor and quick details */}
            <div className="flex flex-col space-y-4">
              <h2 className="text-2xl sm:text-3xl font-bold text-secondary-dark">
                Course Overview
              </h2>
              {/* Duration and Timezone */}
              <div className="flex items-center space-x-4">
                <Clock className="text-secondary" />
                <span className="text-gray-700 font-medium">Duration:</span>
                <span className="font-bold text-gray-900">
                  {currentCourse?.duration} • {course?.hours}hrs/week • On Zoom
                </span>
              </div>
              {/* Start Date and Timezone conversion */}
              <div className="flex items-center space-x-4">
                <Calendar className="text-secondary" />
                <span className="text-gray-700 font-medium">Start Date:</span>
                <span className="font-bold text-gray-900">
                  {course?.isActive
                    ? `${new Date(course.startDate).toLocaleDateString()} at ${
                        localStartTime || startTime
                      }`
                    : "Coming Soon"}
                </span>
              </div>
              {/* Other details (Age, Software) ... (unchanged) */}
              <div className="flex items-center space-x-4">
                <Users className="text-secondary" />
                <span className="text-gray-700 font-medium">Age:</span>
                <span className="font-bold text-gray-900">
                  {currentCourse?.targetAudience}
                </span>
              </div>
              <div className="flex items-center space-x-4">
                <Github className="text-secondary" />
                <span className="text-gray-700 font-medium">Software:</span>
                <span className="font-bold text-gray-900">
                  {currentCourse?.software}
                </span>
              </div>
              {/* Early Bird Discount (Unchanged) */}
              {course?.discount &&
                new Date(course.discountEndDate) > new Date() && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-3 bg-green-50 border-l-4 border-green-500 rounded-lg p-3 shadow">
                      <Award className="text-green-500 w-6 h-6" />
                      <div>
                        <span className="font-semibold text-green-700">
                          Early Bird Discount:
                        </span>{" "}
                        <span className="text-green-800 font-bold">
                          {course.discount}% OFF
                        </span>
                        <span className="ml-2 text-green-700">
                          (until{" "}
                          {new Date(
                            course.discountEndDate
                          ).toLocaleDateString()}
                          )
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              {/* Instructor (Unchanged) */}
              <div className="mt-4 border-t pt-4">
                <div className="flex items-center space-x-4">
                  <img
                    src="/assets/Profile_Picture.jpg"
                    alt="Ahbideen Yusuf"
                    className="w-14 h-14 rounded-full object-cover border-2 border-primary"
                  />
                  <div>
                    <p className="text-gray-700">
                      <span className="font-semibold text-secondary-dark">
                        Instructor:
                      </span>{" "}
                      Ahbideen Yusuf
                    </p>
                    <p className="text-gray-600 text-sm mt-1">
                      Ahbideen Yusuf (founder of Bravework Studio) is a
                      passionate educator and creative technologist with years
                      of experience teaching digital skills to young learners
                      and professionals. He specializes in making complex
                      concepts accessible and fun.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            {/* Overview paragraph (Unchanged) */}
            <div>
              <p className="text-gray-700 leading-relaxed text-base sm:text-lg rounded-xl bg-primary-light/10 border-l-4 border-primary p-4 shadow-inner">
                {currentCourse?.overview}
              </p>
            </div>
          </div>
        </div>

        {/* --- NEW: Testimonials Section --- */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark text-center mb-8">
            Hear from Our Community
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className={`p-5 rounded-xl shadow-md transition-shadow duration-300 ${
                  t.type === "parent"
                    ? "bg-primary-light/10"
                    : "bg-secondary-light/10"
                }`}
              >
                <p className="text-lg italic text-gray-800">" {t.quote} "</p>
                <div className="mt-4 border-t pt-3 flex justify-between items-center">
                  <p className="font-semibold text-primary-dark">{t.name}</p>
                  <span className="text-xs font-medium text-gray-500">
                    {t.title}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Levels Section (Unchanged) */}
        <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark text-center mb-8">
            Program Levels
          </h2>
          <div className="space-y-6">
            {currentCourse.levels.map((level, index) => (
              <LevelCard key={index} level={level} />
            ))}
          </div>
        </div>

        {/* Program Details Section (Unchanged) */}
        {/* ... (Your existing Program Details section) */}
        {!currentCourse.duration.includes("hours") && (
          <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8 mb-12">
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

        {/* --- NEW: Student Gallery Section (Above CTA) --- */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8 mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark text-center mb-8">
            Student Renders & Creations
          </h2>
          <p className="text-center text-gray-600 mb-6 italic">
            A selection of incredible work created by students in this course
            (shared with full consent).
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {studentRenders.map((src, index) => (
              <div
                key={index}
                className="aspect-square overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <img
                  src={src}
                  alt={`Student Render ${index + 1}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Why Choose Us & How to Join Section (Modified Why Choose Us) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* --- MODIFIED: Friendly Feedback Bullets --- */}
          <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark mb-6 text-center">
              Results-Focused Feedback
            </h2>
            <ul className="space-y-4">
              {friendlyFeedbackBullets.map((item, index) => (
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

          {/* How to Join (Unchanged) */}
          <div className="bg-gray-100 rounded-3xl shadow-lg p-6 sm:p-8">
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
                className="mt-8 inline-flex items-center justify-center w-full px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-primary hover:bg-primary-dark transition-colors duration-200"
                href={`/auth/signup?enroll=true&courseId=${courseId}`}
              >
                Enroll Now
              </Link>
            )}
          </div>
        </div>

        {/* --- NEW: Safety, Policies, and Trust Section --- */}
        <div className="bg-white rounded-3xl shadow-lg p-6 sm:p-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-dark text-center mb-8">
            Safety, Policies, & Trust
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 1. Code of Conduct */}
            <div className="bg-primary-light/10 p-4 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-primary-dark mb-2">
                Code of Conduct
              </h3>
              <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
                <li>Focus on course material.</li>
                <li>Always constructive and respectful.</li>
                <li>No Personal Info: Never share contact details.</li>
              </ul>
              <p className="text-xs mt-2 italic text-gray-500">
                A safe, non-judgemental space is our top priority.
              </p>
            </div>

            {/* 2. Safeguarding/Working-with-Children */}
            <div className="bg-primary-light/10 p-4 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-primary-dark mb-2">
                Safeguarding & Trust
              </h3>
              <p className="text-sm text-gray-700">
                All instructors, including Ahbideen Yusuf, undergo rigorous
                background checks (Working-with-Children / equivalent
                clearances) to ensure a secure learning environment.
              </p>
            </div>

            {/* 3. Refunds Summary */}
            <div className="bg-primary-light/10 p-4 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-primary-dark mb-2">
                Refunds Summary
              </h3>
              <p className="text-sm text-gray-700">
                We offer a 100% money-back guarantee if you withdraw before the
                second session, no questions asked.
              </p>
              <Link
                href="https://braveworkstudio.com/refund-policy"
                target="_blank"
                className="text-sm text-secondary hover:text-primary transition-colors font-medium mt-2 inline-block"
              >
                Full Policy{" "}
                <ExternalLink className="w-3 h-3 inline-block ml-1" />
              </Link>
            </div>

            {/* 4. Privacy */}
            <div className="bg-primary-light/10 p-4 rounded-xl shadow-sm">
              <h3 className="text-xl font-bold text-primary-dark mb-2">
                Privacy & Work Consent
              </h3>
              <p className="text-sm text-gray-700 space-y-1">
                Student work is only featured on our platforms with explicit
                parental/guardian consent. We delete student project files from
                our cloud storage 6 months after the course completion date.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
