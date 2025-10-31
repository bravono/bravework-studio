"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

import Link from "next/link";
import {
  BookOpen,
  LinkIcon,
  Award,
  ChevronUp,
  ChevronDown,
  Video,
  Calendar,
  Check,
} from "lucide-react";
import { format } from "date-fns/format";

import { convertCurrency } from "@/lib/utils/convertCurrency";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";

// Mock Status Icon component based on status string
const StatusIcon = ({ status, className }) => {
  if (status === "Completed") return <Award className={className} />;
  if (status === "Enrolled") return <Check className={className} />;
  return <Calendar className={className} />; // Pending or Next Class
};

const isPast = (datetime) => datetime < Date.now();

const CourseDetailCard = ({ course, selectedCurrency, exchangeRates }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const KOBO_PER_NAIRA = 100;
  const router = useRouter();

  // Derive Status properties
  let statusLabel = course.status;
  let statusColor;

  if (statusLabel === "Completed") {
    statusColor = "bg-purple-100 text-purple-700";
  } else if (statusLabel === "Enrolled") {
    statusColor = "bg-green-100 text-green-700";
  } else {
    statusColor = "bg-yellow-100 text-yellow-700"; // Pending
  }

  /**
   * Finds the earliest session whose timestamp is in the future.
   */
  const findNextSession = (sessions) => {
    if (!sessions || sessions.length === 0) return null; // ADDED length check for robustness
    const futureSessions = sessions.filter(
      (s) => new Date(s.datetime).getTime() > Date.now()
    );
    if (futureSessions.length === 0) return null;
    futureSessions.sort((a, b) => a.datetime - b.datetime);
    return futureSessions[0];
  };

  /**
   * Checks if all session timestamps are in the past.
   */
  const areAllClassesPassed = (sessions) => {
    if (!sessions || sessions.length === 0) return false;
    // If the latest session's timestamp is in the past, all are passed.
    // Use a guard or fallback for Math.max on an empty array, although the guard above handles it.
    const latestTimestamp = Math.max(
      ...sessions.map((s) => new Date(s.datetime).getTime())
    ); // Changed to getTime() for consistency
    return latestTimestamp < Date.now();
  };

  // Calculate dynamic properties
  const nextSession = useMemo(
    () => findNextSession(course?.sessionGroup), // ADDED ?.
    [course] // Changed to just course to simplify dependency list
  );
  const isCertificationEnabled = useMemo(
    () =>
      statusLabel === "Completed" || areAllClassesPassed(course?.sessionGroup), // ADDED ?.
    [statusLabel, course] // Changed to just course to simplify dependency list
  );
  const currentPrice = useMemo(() => {
    // Use nullish coalescing for safe access to prevent NaN/crash
    const isDiscountActive =
      course?.discount && // ADDED ?.
      Date.now() > (course.discountStartDate ?? 0) &&
      Date.now() < (course.discountEndDate ?? 0);

    const priceInKobo = isDiscountActive
      ? (course.price ?? 0) -
        ((course.price ?? 0) / 100) * (course.discount ?? 0) // ADDED ?? 0
      : course.price ?? 0; // ADDED ?? 0

    return priceInKobo / KOBO_PER_NAIRA;
  }, [course]);

  // Handle price display
  const priceDisplay = (
    <span className="text-xl font-extrabold text-green-600">
      {getCurrencySymbol(selectedCurrency)}
      {convertCurrency(
        currentPrice,
        exchangeRates?.[selectedCurrency] ?? 1, // ADDED ?? 1 as fallback rate
        getCurrencySymbol(selectedCurrency)
      )}
    </span>
  );

  // Handle next class display (only visible in collapsed state or if not pending)
  const nextClassDisplay =
    nextSession && statusLabel !== "Pending" ? (
      <Link
        href={nextSession?.link ?? "#"} // ADDED ?. and ?? "#" fallback
        className="text-blue-600 hover:text-blue-700 font-semibold transition-colors duration-150 inline-flex items-center text-sm ml-auto sm:ml-0"
      >
        <LinkIcon className="w-4 h-4 mr-1" />
        Join Next Class
      </Link>
    ) : (
      <span className="text-sm text-gray-500 italic ml-auto sm:ml-0">
        {statusLabel === "Pending" ? "Payment Required" : "No Future Classes"}
      </span>
    );

  return (
    <div className="mb-6 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-100">
      <div className="p-6">
        {/* TOP SECTION (ALWAYS VISIBLE) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          {/* Title and Status */}
          <div className="mb-4 sm:mb-0 sm:pr-4 flex-1">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900 leading-tight">
                {course.title}
              </h2>
              <span
                className={`px-3 py-1 text-xs font-semibold rounded-full flex items-center gap-1 shrink-0 ${statusColor}`}
              >
                <StatusIcon status={statusLabel} className="w-3 h-3" />
                {statusLabel}
              </span>
            </div>

            {/* Price and Next Class Link (Visible in Collapsed/Top Section) */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-2 space-y-2 sm:space-y-0">
              {priceDisplay}
              {nextClassDisplay}
            </div>
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full sm:w-auto mt-4 sm:mt-0 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors duration-200 flex items-center justify-center space-x-2 shrink-0"
            aria-expanded={isExpanded}
            aria-controls={`details-${course.id}`}
          >
            <span className="text-sm">
              {isExpanded ? "Collapse Details" : "View All Details"}
            </span>
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 transition-transform" />
            ) : (
              <ChevronDown className="w-5 h-5 transition-transform" />
            )}
          </button>
        </div>

        {/* EXPANDABLE SECTION */}
        <div
          id={`details-${course.id}`}
          className={`transition-all duration-500 ease-in-out overflow-hidden ${
            isExpanded
              ? "max-h-screen opacity-100 mt-6 pt-6 border-t border-gray-200"
              : "max-h-0 opacity-0"
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">
            Course Overview
          </h3>

          {/* Description */}
          <p className="text-gray-600 mb-6 border-l-4 border-green-500 pl-4 py-1">
            {course.description}
          </p>

          {/* Sessions List */}
          {statusLabel !== "Pending" &&
            course?.sessionGroup && // ADDED ?.
            course.sessionGroup.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3 flex items-center">
                  <BookOpen className="w-4 h-4 text-green-600 mr-2" />
                  All Course Sessions
                </h4>
                <ul className="space-y-3 pl-0">
                  {course.sessionGroup.map((session, index) => {
                    const sessionDate = new Date(session?.datetime); // ADDED ?.
                    const isSessionPast = isPast(session?.datetime); // ADDED ?.
                    const isNext =
                      nextSession && nextSession.id === session?.id; // ADDED ?. to session.id

                    return (
                      <li
                        key={session.id}
                        className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 rounded-lg ${
                          isNext
                            ? "bg-blue-50 border border-blue-200"
                            : isSessionPast
                            ? "bg-gray-50"
                            : "bg-white border"
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">
                            Session {index + 1}
                            {isNext && (
                              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-500 text-white">
                                UPCOMING
                              </span>
                            )}
                          </p>
                          <p
                            className={`text-xs ${
                              isSessionPast
                                ? "text-gray-500 italic"
                                : "text-gray-600"
                            }`}
                          >
                            {format(sessionDate, "MMMM d, yyyy")} at{" "}
                            {format(sessionDate, "hh:mm a")} (
                            {session?.duration ?? 0} hr
                            {(session?.duration ?? 0) > 1 ? "s" : ""})
                          </p>
                        </div>

                        <div className="mt-2 sm:mt-0 flex items-center space-x-3 text-sm">
                          {isSessionPast &&
                            session?.recordingLink && ( // ADDED ?.
                              <Link
                                href={session.recordingLink ?? "#"} // ADDED ?? "#"
                                className="text-purple-600 hover:text-purple-800 flex items-center"
                              >
                                <Video className="w-4 h-4 mr-1" />
                                Watch Recording
                              </Link>
                            )}
                          {!isSessionPast &&
                            session?.link && ( // ADDED ?.
                              <Link
                                href={session.link ?? "#"} // ADDED ?? "#"
                                className="text-green-600 hover:text-green-800 flex items-center"
                              >
                                <LinkIcon className="w-4 h-4 mr-1" />
                                Class Link
                              </Link>
                            )}
                          {isSessionPast && !session.recordingLink && (
                            <span className="text-gray-500">Recording N/A</span>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

          {/* Action Buttons */}
          <div className="pt-4 border-t border-gray-200 mt-6 flex justify-between items-center">
            {statusLabel === "Pending" ? (
              // Payment Button for Pending Status
              <button
                onClick={() =>
                  router.push(`/user/dashboard/payment?courseId=${course.id}`)
                }
                className="w-full px-5 py-3 rounded-xl font-bold transition-all duration-200 ease-in-out text-center bg-green-600 text-white hover:bg-green-700"
              >
                Make Payment to Enroll
              </button>
            ) : (
              // Download Certificate Button
              <>
                <button
                  onClick={() =>
                    console.log(
                      `Downloading certificate for course ${course.id}`
                    )
                  }
                  disabled={!isCertificationEnabled}
                  className={`w-full px-5 py-3 rounded-xl font-bold transition-all duration-200 ease-in-out text-center flex items-center justify-center space-x-2 ${
                    isCertificationEnabled
                      ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  <Award className="w-5 h-5" />
                  <span>Download Certificate</span>
                </button>
                {!isCertificationEnabled && (
                  <p className="text-xs text-red-500 ml-4 hidden sm:block">
                    *Certificate unlocks after all classes are finished.
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseDetailCard;
