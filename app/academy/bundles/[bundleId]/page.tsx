"use client";

import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import AcademySubNavBar from "@/app/components/AcademySubNavBar";
import ShareButton from "@/app/components/ShareButton";
import Loader from "@/app/components/Loader";
import ExpandableText from "@/app/components/ExpandableText";
import useExchangeRates from "@/hooks/useExchangeRates";
import useSelectedCurrency from "@/hooks/useSelectedCurrency";
import { getCurrencySymbol } from "@/lib/utils/getCurrencySymbol";
import { convertCurrency } from "@/lib/utils/convertCurrency";
import { KOBO_PER_NAIRA, WHATSAPP_GROUP_URL } from "@/lib/constants";
import { Course } from "@/app/types/app";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  CheckCircle,
  Clock,
  ExternalLink,
  Layers,
  Lock,
  Monitor,
  Shield,
  Sparkles,
  Tag,
  Users,
  Award,
} from "lucide-react";

export default function BundleDetailsPage() {
  const { bundleId } = useParams();
  const router = useRouter();

  const [bundleRootCourse, setBundleRootCourse] = useState<Course | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [includeHardware, setIncludeHardware] = useState(false);

  const { exchangeRates } = useExchangeRates();
  const { selectedCurrency } = useSelectedCurrency();

  const cleanBundleId = useMemo(() => {
    return String(bundleId || "").replace(/^bundle-/, "");
  }, [bundleId]);

  const fetchBundleData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data: Course[] = await res.json();
      setAllCourses(data);

      const target = data.find(
        (c) => String(c.id) === cleanBundleId || Number(c.id) === Number(cleanBundleId),
      );
      setBundleRootCourse(target || null);
    } catch (error) {
      console.error("Error fetching bundle courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, [cleanBundleId]);

  useEffect(() => {
    fetchBundleData();
  }, [fetchBundleData]);

  const getDescendants = useCallback(
    (course: Course, list: Course[]): Course[] => {
      let descendants: Course[] = [];
      if (course.childCourseIds && course.childCourseIds.length > 0) {
        const directChildren = list.filter((item) =>
          course.childCourseIds?.includes(Number(item.id)),
        );
        descendants = [...directChildren];
        directChildren.forEach((child) => {
          descendants = [...descendants, ...getDescendants(child, list)];
        });
      }
      return Array.from(
        new Map(descendants.map((item) => [item.id, item])).values(),
      );
    },
    [],
  );

  const bundleCourses = useMemo(() => {
    if (!bundleRootCourse || allCourses.length === 0) return [];
    return [bundleRootCourse, ...getDescendants(bundleRootCourse, allCourses)];
  }, [bundleRootCourse, allCourses, getDescendants]);

  const bundleSubtotal = useMemo(() => {
    return bundleCourses.reduce((sum, c) => sum + (c.price || 0), 0);
  }, [bundleCourses]);

  const bundleDiscount = useMemo(() => {
    if (bundleCourses.length === 2) return 0.1;
    if (bundleCourses.length >= 3) return 0.2;
    return 0;
  }, [bundleCourses]);

  const discountedTotal = useMemo(() => {
    return bundleSubtotal * (1 - bundleDiscount);
  }, [bundleSubtotal, bundleDiscount]);

  const formatPrice = (amountInKobo: number) => {
    if (amountInKobo === 0) return "Free";
    if (exchangeRates && exchangeRates[selectedCurrency]) {
      return convertCurrency(
        amountInKobo / KOBO_PER_NAIRA,
        exchangeRates[selectedCurrency],
        getCurrencySymbol(selectedCurrency),
      );
    }
    return `₦${(amountInKobo / KOBO_PER_NAIRA).toLocaleString()}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <AcademySubNavBar />
        <div className="py-32 flex justify-center">
          <Loader user="admin" />
        </div>
      </div>
    );
  }

  if (!bundleRootCourse) {
    return (
      <div className="min-h-screen bg-white">
        <AcademySubNavBar />
        <div className="max-w-4xl mx-auto px-4 py-32 text-center">
          <h1 className="text-3xl font-black text-gray-900 mb-4">
            Bundle Not Found
          </h1>
          <p className="text-gray-600 mb-8">
            The requested course bundle could not be found or has been updated.
          </p>
          <Link
            href="/academy/bundles"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={18} /> Back to Academy Bundles
          </Link>
        </div>
      </div>
    );
  }

  const enrollmentLink = `/auth/signup?enroll=true&bundle=${bundleCourses
    .map((c) => c.id)
    .join(",")}${includeHardware ? "&hardware=true" : ""}`;

  return (
    <div className="min-h-screen bg-gray-50 font-[Inter]">
      <AcademySubNavBar />

      {/* Hero Section */}
      <section className="relative bg-white border-b border-gray-100 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-green-50/40" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20">
          {/* Back button and share action */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <Link
              href="/academy/bundles"
              className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              Back to Bundles
            </Link>

            <ShareButton
              type="bundle"
              title={`${bundleRootCourse.title} Power Bundle`}
              text={`Explore the complete ${bundleRootCourse.title} pathway with ${bundleCourses.length} courses and exclusive bundle savings at Bravework Studio.`}
              url={`/academy/bundles/${cleanBundleId}`}
              label="Share Bundle"
              variant="outline"
              className="px-4 py-2 rounded-xl text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 shadow-sm"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column: Bundle Info */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-blue-100 text-blue-800">
                  <Tag size={13} />
                  Curated Career Path
                </span>
                <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-green-100 text-green-800">
                  <Layers size={13} />
                  {bundleCourses.length} Courses Included
                </span>
                {bundleDiscount > 0 && (
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                    {Math.round(bundleDiscount * 100)}% Bundle Discount
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl font-black text-gray-900 leading-tight">
                {bundleRootCourse.title} Power Bundle
              </h1>

              <p className="text-lg text-gray-600 leading-relaxed max-w-2xl">
                {bundleRootCourse.description ||
                  `Master the complete ${bundleRootCourse.title} pathway. This curated curriculum takes you step-by-step through foundational principles to advanced real-world execution.`}
              </p>

              {/* Pricing Display */}
              <div className="pt-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Tuition & Bundle Pricing
                </span>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl font-black text-blue-600">
                    {formatPrice(discountedTotal)}
                  </span>
                  {bundleDiscount > 0 && (
                    <span className="text-lg text-gray-400 line-through font-bold">
                      {formatPrice(bundleSubtotal)}
                    </span>
                  )}
                  <span className="text-xs font-bold text-gray-500 uppercase">
                    / All {bundleCourses.length} courses included
                  </span>
                </div>
              </div>

              {/* Hardware Rental Option */}
              <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 max-w-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeHardware}
                    onChange={(e) => setIncludeHardware(e.target.checked)}
                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-bold text-gray-900 text-sm">
                      <Monitor size={16} className="text-blue-600" />
                      Add Hardware Rental Gear
                    </div>
                    <p className="text-xs text-blue-600 font-medium mt-0.5">
                      Receive an additional 10% discount on workstation rentals during your classes.
                    </p>
                  </div>
                </label>
              </div>

              {/* Primary Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Link
                  href={enrollmentLink}
                  className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white font-black text-base rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/25 transform hover:-translate-y-0.5"
                >
                  Enroll in Full Bundle <ArrowRight className="ml-2 w-5 h-5" />
                </Link>

                <ShareButton
                  type="bundle"
                  title={`${bundleRootCourse.title} Power Bundle`}
                  text={`Check out the ${bundleRootCourse.title} pathway at Bravework Studio.`}
                  url={`/academy/bundles/${cleanBundleId}`}
                  label="Share Bundle"
                  variant="outline"
                  className="inline-flex items-center justify-center px-6 py-4 border border-gray-200 text-base font-bold rounded-2xl text-gray-700 bg-white hover:bg-gray-50 transition-all shadow-sm"
                />

                <a
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-4 border border-green-500/20 text-base font-bold rounded-2xl text-green-600 bg-green-50 hover:bg-green-100 transition-all shadow-sm gap-2"
                >
                  <Users size={18} />
                  Join WhatsApp
                </a>
              </div>
            </div>

            {/* Right Column: Visual Preview Card */}
            <div className="lg:col-span-5 relative">
              <div className="rounded-[2.5rem] bg-gradient-to-br from-blue-600 to-indigo-700 p-2 shadow-2xl">
                <div className="relative aspect-[4/3] rounded-[2rem] overflow-hidden bg-white/10 backdrop-blur-md">
                  <img
                    src={
                      bundleRootCourse.thumbnailUrl ||
                      "/assets/Bravework_Studio-Logo-Color.png"
                    }
                    alt={bundleRootCourse.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <span className="text-xs font-bold uppercase tracking-widest text-blue-200 block mb-1">
                      Curriculum Pathway
                    </span>
                    <h3 className="text-xl font-black leading-snug">
                      Complete {bundleRootCourse.title} Mastery
                    </h3>
                    <p className="text-xs text-gray-300 mt-2">
                      Includes certificates, project reviews, and community support for all {bundleCourses.length} modules.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content: Courses Breakdown */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
          {/* Header */}
          <div>
            <div className="flex items-center gap-3 text-xs font-black text-blue-600 uppercase tracking-widest mb-2">
              <Sparkles size={16} />
              <span>Step-by-Step Curriculum</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900">
              Courses Included in this Bundle ({bundleCourses.length})
            </h2>
            <p className="text-gray-600 mt-2 max-w-2xl">
              Each course in this bundle builds upon the previous one, forming a cohesive pathway designed to transition you from core concepts to professional production.
            </p>
          </div>

          {/* Courses List */}
          <div className="space-y-8">
            {bundleCourses.map((course, index) => (
              <div
                key={course.id}
                className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  {/* Left: Step badge and Course info */}
                  <div className="flex items-start gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl font-black shrink-0 border border-blue-100">
                      {index + 1}
                    </div>

                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700">
                          {course.level || "All Levels"}
                        </span>
                        {course.category && (
                          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-blue-50 text-blue-600">
                            {course.category}
                          </span>
                        )}
                        <span className="text-xs text-gray-400 font-bold">
                          Step {index + 1} of {bundleCourses.length}
                        </span>
                      </div>

                      <h3 className="text-2xl font-black text-gray-900">
                        {course.title}
                      </h3>

                      <ExpandableText
                        text={course.description || ""}
                        maxChars={200}
                        className="text-gray-600 text-sm leading-relaxed max-w-3xl"
                      />

                      <div className="flex flex-wrap items-center gap-6 pt-2 text-xs font-bold text-gray-500">
                        {course.duration && (
                          <div className="flex items-center gap-1.5">
                            <Clock size={15} className="text-blue-600" />
                            <span>{course.duration}</span>
                          </div>
                        )}
                        {course.startDate && (
                          <div className="flex items-center gap-1.5">
                            <Calendar size={15} className="text-blue-600" />
                            <span>
                              Starts{" "}
                              {new Date(course.startDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <BookOpen size={15} className="text-blue-600" />
                          <span>Individual Price: {formatPrice(course.price)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right: Individual Course Link */}
                  <div className="shrink-0 w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3">
                    <Link
                      href={`/academy/courses/${course.id}`}
                      className="px-6 py-3 rounded-xl bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold text-sm transition-colors border border-gray-200 flex items-center justify-center gap-2"
                    >
                      View Course <ExternalLink size={16} />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Value Highlights Grid */}
          <div className="bg-gradient-to-br from-blue-900 to-indigo-950 rounded-[3rem] p-10 md:p-14 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl space-y-6">
              <span className="text-xs font-black uppercase tracking-widest text-blue-300">
                Why Choose This Bundle
              </span>
              <h3 className="text-3xl font-black leading-tight">
                Everything You Need for Career Progression
              </h3>
              <p className="text-blue-100 text-base leading-relaxed">
                Rather than jumping between disconnected tutorials, our bundled pathways provide a structured, verified curriculum taught by seasoned industry professionals.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 pt-4">
                {[
                  "Verified Certificates for each completed course",
                  "Structured milestones with hands-on projects",
                  "Direct instructor feedback on your creations",
                  "Up to 20% flat discount on bundled tuition",
                  "Optional hardware rental discounts",
                  "Access to our active student creator community",
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <CheckCircle size={18} className="text-emerald-400 shrink-0" />
                    <span className="text-sm font-bold text-gray-200">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing Breakdown Card */}
          <div className="bg-white rounded-[2.5rem] border border-gray-200 p-8 md:p-12 shadow-sm space-y-8">
            <h3 className="text-2xl font-black text-gray-900">
              Bundle Savings Breakdown
            </h3>

            <div className="divide-y divide-gray-100">
              {bundleCourses.map((c, i) => (
                <div key={c.id} className="py-3 flex items-center justify-between text-sm">
                  <span className="font-bold text-gray-700">
                    {i + 1}. {c.title}
                  </span>
                  <span className="text-gray-500 font-semibold">{formatPrice(c.price)}</span>
                </div>
              ))}

              <div className="py-3 flex items-center justify-between text-sm font-bold text-gray-500">
                <span>Total Individual Price</span>
                <span className="line-through">{formatPrice(bundleSubtotal)}</span>
              </div>

              {bundleDiscount > 0 && (
                <div className="py-3 flex items-center justify-between text-sm font-bold text-emerald-600">
                  <span>Bundle Discount ({Math.round(bundleDiscount * 100)}%)</span>
                  <span>- {formatPrice(bundleSubtotal * bundleDiscount)}</span>
                </div>
              )}

              <div className="py-4 flex items-center justify-between text-lg font-black text-gray-900">
                <span>Final Bundle Tuition</span>
                <span className="text-2xl text-blue-600">{formatPrice(discountedTotal)}</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                <Shield size={16} className="text-emerald-500" />
                <span>Protected by our money-back guarantee prior to Session 2</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <ShareButton
                  type="bundle"
                  title={`${bundleRootCourse.title} Power Bundle`}
                  text={`Check out this bundled course at Bravework Studio.`}
                  url={`/academy/bundles/${cleanBundleId}`}
                  label="Share Bundle"
                  variant="outline"
                  className="px-6 py-4 rounded-xl border-gray-200 text-gray-700 hover:bg-gray-50"
                />
                <Link
                  href={enrollmentLink}
                  className="flex-1 sm:flex-initial px-8 py-4 bg-blue-600 text-white font-black text-base rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 text-center"
                >
                  Enroll in Full Bundle
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
