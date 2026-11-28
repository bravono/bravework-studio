"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import AcademySubNavBar from "../../components/AcademySubNavBar";
import { motion } from "framer-motion";
import {
  Box,
  CheckCircle2,
  ArrowRight,
  Zap,
  PlusCircle,
  ShoppingCart,
  Users,
  Tag,
  Monitor,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  X,
} from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Course } from "@/app/types/app";
import {
  BundleWithCourses,
  getBundleTags,
  getAllBundleTags,
  getAllBundleCategories,
  filterBundles,
} from "@/lib/utils/bundleFilter";
import { KOBO_PER_NAIRA } from "@/lib/constants";
import Loader from "@/app/components/Loader";
import Pagination from "@/app/components/Pagination";
import ShareButton from "@/app/components/ShareButton";

const BUNDLES_PER_PAGE = 4;
const COURSES_PER_BUNDLE_PREVIEW = 3;

function AcademyBundlesContent() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exchangeRates, setExchangeRates] = useState<any>(null);
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [includeHardware, setIncludeHardware] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedBundles, setExpandedBundles] = useState<Record<string, boolean>>({});

  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const searchParams = useSearchParams();
  const highlightedBundleId = searchParams?.get("bundleId");
  const categoryParam = searchParams?.get("category");
  const tagParam = searchParams?.get("tag");

  useEffect(() => {
    if (categoryParam) {
      setActiveCategory(categoryParam);
    }
  }, [categoryParam]);

  useEffect(() => {
    if (tagParam) {
      setSelectedTags([tagParam]);
    }
  }, [tagParam]);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await fetch("/api/courses");
      if (!res.ok) throw new Error("Failed to fetch courses");
      const data = await res.json();
      setCourses(data);
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchExchangeRates = async () => {
    try {
      const res = await fetch("/api/exchange-rates");
      const data = await res.json();
      setExchangeRates(data);
    } catch (error) {
      console.error("Error fetching exchange rates:", error);
    }
  };

  useEffect(() => {
    fetchCourses();
    fetchExchangeRates();
  }, [fetchCourses]);

  const getDescendants = useCallback(
    (course: Course, allCourses: Course[]): Course[] => {
      let descendants: Course[] = [];
      if (course.childCourseIds && course.childCourseIds.length > 0) {
        const directChildren = allCourses.filter((c) =>
          course.childCourseIds?.includes(Number(c.id)),
        );
        descendants = [...directChildren];
        directChildren.forEach((child) => {
          descendants = [...descendants, ...getDescendants(child, allCourses)];
        });
      }
      return Array.from(
        new Map(descendants.map((item) => [item.id, item])).values(),
      );
    },
    [],
  );

  const presetBundles: BundleWithCourses[] = useMemo(() => {
    const bundles: BundleWithCourses[] = [];
    courses.forEach((course) => {
      if (course.childCourseIds && course.childCourseIds.length > 0) {
        const descendants = getDescendants(course, courses);
        if (descendants.length > 0) {
          bundles.push({
            ...course,
            bundleCourses: [course, ...descendants],
          });
        }
      }
    });
    return bundles;
  }, [courses, getDescendants]);

  const categories = useMemo(() => {
    const rawCategories = getAllBundleCategories(presetBundles);
    return ["All", ...rawCategories];
  }, [presetBundles]);

  const allTags = useMemo(() => {
    return getAllBundleTags(presetBundles);
  }, [presetBundles]);

  const filteredBundles = useMemo(() => {
    return filterBundles(presetBundles, {
      category: activeCategory,
      selectedTags,
      searchQuery,
    });
  }, [presetBundles, activeCategory, selectedTags, searchQuery]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, selectedTags, searchQuery]);

  // Navigate to page containing target bundle if bundleId param is present
  useEffect(() => {
    if (!highlightedBundleId || filteredBundles.length === 0) return;

    const targetIndex = filteredBundles.findIndex(
      (b) =>
        String(b.id) === highlightedBundleId ||
        `bundle-${b.id}` === highlightedBundleId,
    );

    if (targetIndex !== -1) {
      const targetPage = Math.floor(targetIndex / BUNDLES_PER_PAGE) + 1;
      setCurrentPage(targetPage);

      setTimeout(() => {
        const targetElement = document.getElementById(
          `bundle-${highlightedBundleId}`,
        );
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 350);
    }
  }, [highlightedBundleId, filteredBundles]);

  const totalPages = Math.ceil(filteredBundles.length / BUNDLES_PER_PAGE);

  const paginatedBundles = useMemo(() => {
    const startIndex = (currentPage - 1) * BUNDLES_PER_PAGE;
    return filteredBundles.slice(startIndex, startIndex + BUNDLES_PER_PAGE);
  }, [filteredBundles, currentPage]);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const resetFilters = () => {
    setActiveCategory("All");
    setSelectedTags([]);
    setSearchQuery("");
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const bundlesSection = document.getElementById("curated-bundles");
    if (bundlesSection) {
      bundlesSection.scrollIntoView({ behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleExpandBundle = (bundleId: string | number) => {
    const key = String(bundleId);
    setExpandedBundles((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const convertCurrency = (amount: number, rate: number, symbol: string) => {
    return `${symbol}${(amount * rate).toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "GBP":
        return "£";
      case "EUR":
        return "€";
      default:
        return "₦";
    }
  };

  return (
    <div className="bg-white min-h-screen">
      <AcademySubNavBar />

      <section className="py-20 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-black text-gray-900 mb-6">
            Academy Bundles
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Accelerate your learning path and save money by choosing one of our
            curated bundles designed for professional success.
          </p>
        </div>
      </section>

      <section className="py-24" id="curated-bundles">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Actions: Custom and Enterprise */}
          <div className="grid lg:grid-cols-3 gap-8 mb-20">
            {/* Custom Bundle Redirect Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="col-span-full lg:col-span-2 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-[3rem] p-8 md:p-12 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:scale-110 transition-transform duration-500"></div>
              <div className="relative z-10 flex-grow text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-white/30">
                  <PlusCircle size={14} /> Design Your Path
                </div>
                <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                  Create a Custom Learning Bundle
                </h2>
                <p className="text-blue-100 text-lg mb-8 max-w-xl">
                  Pick any 3 courses and unlock a 20% flat discount + additional
                  savings on gear rentals.
                </p>
                <Link
                  href="/academy/courses?filter=All"
                  className="px-8 py-4 bg-white text-blue-600 font-black rounded-2xl shadow-xl hover:bg-blue-50 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto md:mx-0"
                >
                  Start Customizing <ArrowRight size={20} />
                </Link>
              </div>
              <div className="relative z-10 w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
                <div className="absolute inset-0 bg-white/10 rounded-full animate-pulse"></div>
                <ShoppingCart size={80} className="text-white opacity-80" />
              </div>
            </motion.div>

            {/* Enterprise Sales Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="col-span-full lg:col-span-1 bg-white rounded-[3rem] border-2 border-dashed border-blue-200 p-8 md:p-12 text-center flex flex-col justify-center items-center shadow-lg hover:border-blue-400 transition-colors group"
            >
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-3xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Users size={40} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-4">
                Enterprise Solutions
              </h3>
              <p className="text-gray-500 mb-8 font-medium">
                Looking for group training or custom curriculum for your
                organization?
              </p>
              <Link
                href="/academy/contact"
                className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-green-600 transition-all flex items-center justify-center gap-2"
              >
                Contact Sales <ArrowRight size={20} />
              </Link>
            </motion.div>
          </div>

          {/* Search, Category and Tag Filters */}
          <div className="bg-white rounded-[2.5rem] border border-blue-100 p-6 md:p-8 shadow-lg shadow-blue-50/50 mb-14 space-y-6">
            <div className="flex flex-col lg:flex-row gap-6 items-stretch lg:items-center justify-between">
              {/* Category Filters */}
              <div className="flex flex-wrap items-center gap-2">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setActiveCategory(cat)}
                      className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all ${
                        isActive
                          ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                          : "bg-gray-50 text-gray-600 border border-gray-200 hover:border-blue-400 hover:bg-white"
                      }`}
                    >
                      {cat}
                    </button>
                  );
                })}
              </div>

              {/* Search Query Input */}
              <div className="relative w-full lg:w-80 shrink-0">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Search by topic, tag, skill..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 rounded-2xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm text-gray-800 placeholder-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    title="Clear search"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Specialization Tags Filter */}
            {allTags.length > 0 && (
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                    <Tag size={13} className="text-blue-500" /> Filter by Specialization &amp; Tools
                  </p>
                  {(selectedTags.length > 0 || activeCategory !== "All" || searchQuery) && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      Reset all filters
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {allTags.map((tag) => {
                    const isActive = selectedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                          isActive
                            ? "bg-blue-50 text-blue-700 border-2 border-blue-600 ring-2 ring-blue-100"
                            : "bg-white text-gray-500 border border-gray-200 hover:border-blue-300 hover:bg-gray-50/70"
                        }`}
                      >
                        {tag}
                        {isActive && (
                          <span className="ml-1.5 inline-flex items-center justify-center w-3.5 h-3.5 rounded-full bg-blue-600 text-white text-[9px]">
                            ✓
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4 mb-12">
            <h4 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 whitespace-nowrap">
              Curated Career Paths
            </h4>
            <div className="h-px bg-gray-100 w-full"></div>
            {filteredBundles.length > 0 && (
              <span className="text-xs font-bold text-gray-400 whitespace-nowrap">
                Showing {Math.min(filteredBundles.length, paginatedBundles.length)} of {filteredBundles.length} bundles
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="py-24">
              <Loader user="admin" />
            </div>
          ) : presetBundles.length === 0 ? (
            <div className="py-24 text-center">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300">
                <Box size={40} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                No preset bundles available
              </h3>
              <p className="text-gray-500">
                Check back soon for new curated paths or build your own!
              </p>
            </div>
          ) : filteredBundles.length === 0 ? (
            <div className="py-24 text-center bg-gray-50/50 rounded-[2.5rem] border border-dashed border-gray-200">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
                <Search size={36} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                No matching bundles found
              </h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6 text-sm">
                We couldn&apos;t find any bundles matching your search or tag filters. Try adjusting your search query or reset the filters.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-6 py-3 bg-blue-600 text-white font-bold text-sm rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-12">
                {paginatedBundles.map((bundle, i) => {
                  const bundleCourses = bundle.bundleCourses;
                  const bundlePrice = bundleCourses.reduce(
                    (sum, c) => sum + c.price,
                    0,
                  );
                  const discount =
                    bundleCourses.length === 2
                      ? 0.1
                      : bundleCourses.length >= 3
                        ? 0.2
                        : 0;
                  const discountedPrice = bundlePrice * (1 - discount);
                  const isTargetHighlighted =
                    highlightedBundleId === String(bundle.id) ||
                    highlightedBundleId === `bundle-${bundle.id}`;
                  const isExpanded = !!expandedBundles[String(bundle.id)];
                  const visibleCourses = isExpanded
                    ? bundleCourses
                    : bundleCourses.slice(0, COURSES_PER_BUNDLE_PREVIEW);

                  return (
                    <motion.div
                      key={bundle.id}
                      id={`bundle-${bundle.id}`}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      viewport={{ once: true }}
                      className={`bg-white rounded-[3rem] border-2 ${
                        isTargetHighlighted
                          ? "border-blue-600 ring-4 ring-blue-100 shadow-2xl"
                          : "border-blue-100"
                      } overflow-hidden hover:shadow-2xl hover:shadow-blue-200/50 transition-all group flex flex-col h-full relative`}
                    >
                      <div className="absolute top-6 right-6 z-20 flex items-center gap-2">
                        <ShareButton
                          type="bundle"
                          title={bundle.title}
                          text={`Explore the ${bundle.title} Power Bundle with ${bundleCourses.length} courses at Bravework Studio Academy.`}
                          url={`/academy/bundles/${bundle.id}`}
                          variant="icon"
                          showLabel={false}
                          className="bg-white/95 hover:bg-white text-blue-700 shadow-md border-blue-100"
                        />
                        <div className="px-5 py-2 bg-blue-600 text-white text-xs font-black rounded-full shadow-lg uppercase tracking-widest">
                          {Math.round(discount * 100)}% Bundle Save
                        </div>
                      </div>

                      <div className="relative aspect-[21/10] overflow-hidden bg-blue-50">
                        <div className="absolute inset-0 flex items-center justify-center p-8">
                          <div className="relative w-full h-full max-w-lg">
                            <div className="absolute inset-0 bg-blue-200 rounded-3xl rotate-2 scale-95 opacity-50"></div>
                            <div className="absolute inset-0 bg-blue-400 rounded-3xl -rotate-2 scale-95 opacity-30"></div>
                            <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-blue-100 flex items-center justify-center overflow-hidden">
                              <img
                                src={
                                  bundle.thumbnailUrl ||
                                  "/assets/Bravework_Studio-Logo-Color.png"
                                }
                                alt={bundle.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent"></div>
                              <div className="absolute bottom-8 left-8 text-white">
                                <div className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                                  Academy Path
                                </div>
                                <div className="text-2xl font-black leading-tight">
                                  Complete {bundle.title}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="p-10 flex flex-col flex-grow bg-gradient-to-b from-blue-50/30 to-white">
                        <div className="flex items-center justify-between gap-3 flex-wrap mb-3">
                          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-600">
                            <Tag size={16} />
                            Professional Bundle • {bundleCourses.length} Courses
                          </div>
                          {bundle.category && (
                            <button
                              type="button"
                              onClick={() => setActiveCategory(bundle.category)}
                              className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-[11px] font-bold rounded-full transition-colors"
                              title={`Filter by category: ${bundle.category}`}
                            >
                              {bundle.category}
                            </button>
                          )}
                        </div>

                        {/* Bundle Tags */}
                        {(() => {
                          const bundleTags = getBundleTags(bundle);
                          if (bundleTags.length === 0) return null;
                          return (
                            <div className="flex flex-wrap gap-1.5 mb-6">
                              {bundleTags.slice(0, 5).map((t) => {
                                const isTagSelected = selectedTags.includes(t);
                                return (
                                  <button
                                    key={t}
                                    type="button"
                                    onClick={() => toggleTag(t)}
                                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                                      isTagSelected
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-white text-gray-600 border border-blue-100 hover:border-blue-400 hover:text-blue-600"
                                    }`}
                                    title={`Filter by tag: ${t}`}
                                  >
                                    #{t}
                                  </button>
                                );
                              })}
                            </div>
                          );
                        })()}

                        {/* Courses list with preview limit */}
                        <div className="space-y-4 mb-6">
                          {visibleCourses.map((bc, idx) => (
                            <div
                              key={bc.id}
                              className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-blue-50 shadow-sm group/item hover:border-blue-200 transition-colors"
                            >
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-sm font-black group-hover/item:bg-blue-600 group-hover/item:text-white transition-colors">
                                {idx + 1}
                              </div>
                              <div className="flex-grow">
                                <span className="font-bold text-gray-800 block">
                                  {bc.title}
                                </span>
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest font-black">
                                  {bc.category}
                                </span>
                              </div>
                              <Link
                                href={`/academy/courses/${bc.id}`}
                                className="text-xs font-bold text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                                title="View individual course"
                              >
                                View
                              </Link>
                            </div>
                          ))}
                        </div>

                        {/* Expansion toggle if bundle has more courses than the preview limit */}
                        {bundleCourses.length > COURSES_PER_BUNDLE_PREVIEW && (
                          <button
                            type="button"
                            onClick={() => toggleExpandBundle(bundle.id)}
                            className="flex items-center justify-center gap-2 text-xs font-bold text-blue-600 hover:text-blue-800 mb-6 py-2 px-3 rounded-xl bg-blue-50/60 hover:bg-blue-100/60 transition-colors"
                          >
                            {isExpanded ? (
                              <>
                                <ChevronUp size={14} /> Show fewer courses
                              </>
                            ) : (
                              <>
                                <ChevronDown size={14} /> Show all {bundleCourses.length} courses (+{bundleCourses.length - COURSES_PER_BUNDLE_PREVIEW} more)
                              </>
                            )}
                          </button>
                        )}

                        <div className="p-5 bg-white rounded-2xl border border-blue-50 mb-8 shadow-sm">
                          <label className="flex items-center gap-4 cursor-pointer group/rental">
                            <input
                              type="checkbox"
                              checked={includeHardware}
                              onChange={(e) =>
                                setIncludeHardware(e.target.checked)
                              }
                              className="w-6 h-6 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <div>
                              <div className="flex items-center gap-2 font-black text-gray-900 leading-none">
                                <Monitor size={18} /> Add Hardware Rental
                              </div>
                              <div className="text-xs text-blue-500 font-bold uppercase tracking-wider mt-1.5">
                                +Extra 10% Off Rental Gear
                              </div>
                            </div>
                          </label>
                        </div>

                        <div className="mt-auto pt-8 border-t border-blue-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div>
                            <div className="text-sm text-gray-400 line-through font-bold mb-1">
                              {exchangeRates
                                ? convertCurrency(
                                    bundlePrice / KOBO_PER_NAIRA,
                                    exchangeRates[selectedCurrency],
                                    getCurrencySymbol(selectedCurrency),
                                  )
                                : convertCurrency(
                                    bundlePrice / KOBO_PER_NAIRA,
                                    1,
                                    "₦",
                                  )}
                            </div>
                            <div className="text-3xl font-black text-blue-600">
                              {exchangeRates
                                ? convertCurrency(
                                    discountedPrice / KOBO_PER_NAIRA,
                                    exchangeRates[selectedCurrency],
                                    getCurrencySymbol(selectedCurrency),
                                  )
                                : convertCurrency(
                                    discountedPrice / KOBO_PER_NAIRA,
                                    1,
                                    "₦",
                                  )}
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-3">
                            <ShareButton
                              type="bundle"
                              title={bundle.title}
                              text={`Check out the ${bundle.title} Power Bundle with ${bundleCourses.length} courses!`}
                              url={`/academy/bundles/${bundle.id}`}
                              variant="outline"
                              className="px-4 py-4 rounded-2xl border-blue-200 text-blue-700 hover:bg-blue-50"
                            />
                            <Link
                              href={`/academy/bundles/${bundle.id}`}
                              className="px-6 py-4 bg-gray-50 hover:bg-gray-100 text-gray-800 font-bold rounded-2xl transition-all border border-gray-200 text-sm flex items-center justify-center gap-1.5"
                            >
                              View Details
                            </Link>
                            <Link
                              href={`/auth/signup?enroll=true&bundle=${bundleCourses.map((c) => c.id).join(",")}${includeHardware ? "&hardware=true" : ""}`}
                              className="px-8 py-4 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 flex items-center gap-2 shrink-0"
                            >
                              Enroll All <ChevronRight size={20} />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Pagination controls for bundles page */}
              {totalPages > 1 && (
                <div className="mt-16 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </section>

      {/* Enterprise Benefits */}
      <section className="py-24 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center mb-8 ring-1 ring-blue-500/50">
                <Zap size={32} />
              </div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                Empower Your Team with Creative Tech
              </h2>
              <p className="text-xl text-gray-400 mb-12 leading-relaxed">
                Custom-tailored training programs for schools, agencies, and
                production houses. We help your staff master the latest tools in
                3D, Design, and Development.
              </p>
              <div className="space-y-6">
                {[
                  "Dedicated Instructor Support",
                  "Custom Learning Management",
                  "Bulk Enrollment Discounts",
                  "Co-branded Certifications",
                ].map((item) => (
                  <div key={item} className="flex items-center gap-4">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-lg font-bold text-gray-200">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white/5 backdrop-blur-md rounded-[3rem] p-12 border border-white/10">
              <h3 className="text-2xl font-black mb-6">Request a Proposal</h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Organization Name"
                  className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl focus:border-blue-500 outline-none transition-colors"
                />
                <input
                  type="email"
                  placeholder="Work Email"
                  className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl focus:border-blue-500 outline-none transition-colors"
                />
                <textarea
                  placeholder="Tell us about your training needs..."
                  rows={4}
                  className="w-full px-6 py-4 bg-white/10 border border-white/10 rounded-2xl focus:border-blue-500 outline-none transition-colors"
                />
                <button className="w-full py-5 bg-blue-600 text-white font-black rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20">
                  Send Request
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AcademyBundlesPage() {
  return (
    <Suspense fallback={<Loader user="admin" />}>
      <AcademyBundlesContent />
    </Suspense>
  );
}
