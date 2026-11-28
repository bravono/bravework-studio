"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import CourseDetailCard from "@/app/components/CourseDetailCard"; // Assuming this path is correct based on UserOverviewSection imports
import { Course } from "app/types/app";
import useExchangeRates from "@/hooks/useExchangeRates";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";
import Loader from "@/app/components/Loader"; // Or a skeleton

export default function StudentView({ user }: { user: any }) {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const { exchangeRates } = useExchangeRates();
  const { selectedCurrency } = useSelectedCurrency();

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await fetch("/api/user/courses");
        if (!res.ok) throw new Error("Failed to fetch courses");
        const data = await res.json();
        setCourses(data);
      } catch (error) {
        console.error("Error fetching courses", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="p-10 text-center">
        <p className="text-gray-500">Loading your academy progress...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Progress Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="flex items-center gap-2 text-xl font-bold text-gray-800">
                <BookOpen size={24} className="text-green-600" />
                My Courses
              </h2>
              <Link
                href="/academy/courses"
                className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
              >
                Explore More
              </Link>
            </div>

            <div className="space-y-4">
              {courses
                .filter(
                  (course) => course.price === 0 || course.paymentStatus === 1
                )
                .map((course) => (
                  <CourseDetailCard
                    key={course.id}
                    course={course}
                    selectedCurrency={selectedCurrency}
                    exchangeRates={exchangeRates}
                  />
                ))}

              {courses.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg dashed border-2 border-gray-200">
                  <p className="text-gray-500 mb-4">
                    You haven't enrolled in any courses yet.
                  </p>
                  <Link
                    href="/academy"
                    className="px-4 py-2 bg-green-600 text-white rounded-md font-medium hover:bg-green-700"
                  >
                    Browse Academy
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar / Recommendations */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-xl border border-green-100">
            <h3 className="font-bold text-gray-900 mb-2">
              Recommended for You
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Based on your interest in "Film Production"
            </p>
            {/* Static recommendation for now */}
            <div className="bg-white p-3 rounded-lg shadow-sm border border-gray-100 mb-3">
              <p className="font-semibold text-sm">
                Validating Your Startup Idea
              </p>
              <span className="text-xs text-green-600 font-medium">
                Trending
              </span>
            </div>
            <Link
              href="/academy"
              className="text-xs font-bold text-green-700 hover:underline"
            >
              View all catalog &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
