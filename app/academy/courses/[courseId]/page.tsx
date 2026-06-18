"use client";
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Course } from "@/app/types/app";
import { WHATSAPP_GROUP_URL } from "@/lib/constants";

import {
  Users,
  Clock,
  ExternalLink,
  Github,
  Award,
  CheckCircle,
  Calendar,
  Shield,
  FileText,
  CreditCard,
  Lock,
  Sparkles,
  ArrowRight,
  PlayCircle,
} from "lucide-react";
import ExpandableText from "@/app/components/ExpandableText";
import VideoModal from "@/app/components/VideoModal";

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
          }),
        );
      } catch (e) {
        console.error(
          "Invalid date string for timezone conversion:",
          dateTimeString,
        );
        setLocalTime(null);
      }
    }
  }, [dateTimeString]);

  return localTime;
};

// --- Course Page Component ---
export default function CoursePage() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<Course>();
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

  const isActive = course?.isActive;

  const getDescendants = useCallback((c: Course, list: Course[]): Course[] => {
    let descendants: Course[] = [];
    if (c.childCourseIds && c.childCourseIds.length > 0) {
      const directChildren = list.filter((item) =>
        c.childCourseIds?.includes(Number(item.id)),
      );
      descendants = [...directChildren];
      directChildren.forEach((child) => {
        descendants = [...descendants, ...getDescendants(child, list)];
      });
    }
    return Array.from(
      new Map(descendants.map((item) => [item.id, item])).values(),
    );
  }, []);

  const bundleCourses = useMemo(() => {
    if (!course || allCourses.length === 0) return [];
    return [course, ...getDescendants(course, allCourses)];
  }, [course, allCourses, getDescendants]);

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
    try {
      const res = await fetch(`/api/courses/${courseId}`);
      if (!res.ok) {
        console.warn("API fetch failed");

        throw new Error("Failed to fetch course from API");
      }

      const data = await res.json();
      console.log("Data", data);
      const courseData = data[0];
      setCourse(courseData);

      // If it's a bundle, fetch all courses to find descendants
      if (courseData?.childCourseIds && courseData.childCourseIds.length > 0) {
        const allRes = await fetch("/api/courses");
        if (allRes.ok) {
          const allCourses = await allRes.json();
          setAllCourses(allCourses);
        }
      }
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  useEffect(() => {
    if (!course) return;

    window.dataLayer = window.dataLayer || [];

    window.dataLayer.push({
      event: "course_data_ready",
      course_name: course.title,
      course_category: course.category,
      course_level: course.level,
      price: course.price,
      currency: "NGN",
      course_id: course.id,
      page: "",
    });
  }, [course]);

  useEffect(() => {
    console.log("Course", course);
  }, [course]);

  // Placeholder data for new sections
  const testimonials = [
    {
      type: "parent",
      quote:
        "Mr Yusuf was very patient and focused on results.  He was also very helpful with tangentially related IT issues.",
      name: "Parker Van Lawrence",
      title: "Parent",
      image: `https://live.staticflickr.com/65535/54869433903_ef1ca24998_b.jpg" width="956" height="1024" alt="Parker Van Lawrence`,
    },
    {
      type: "parent",
      quote:
        "I frequently recommend this training to people.  Shaka is developing an advanced appreciation for film and film production.  He has also sold some models to commercial clients.  Not bad for a 13 year old!",
      name: "Parker Van Lawrence",
      title: "Parent",
      image: `https://live.staticflickr.com/65535/54869433903_ef1ca24998_b.jpg" width="956" height="1024" alt="Lawrence`,
    },
    {
      type: "student",
      quote:
        "The thing I enjoy most about the lessons is that it was quite easy to learn even with all of the complicated buttons. Originally I didn't want to do Blender but then it become my favorite thing to do everyday",
      name: "Shaka L.",
      title: "Student (13)",
      image: "",
    },
  ];

  const studentRenders = [];

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
    <div className="bg-gray-50 min-h-screen font-[Inter]">
      {/* Premium Hero Section */}
      <div className="relative bg-white overflow-hidden border-b border-gray-100">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/5 via-transparent to-secondary-light/5" />
        {/* Soft blur light blobs */}
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-light/10 rounded-full blur-3xl opacity-60"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-secondary-light/10 rounded-full blur-3xl opacity-60"></div>

        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left: Text & Badges */}
            <div className="lg:col-span-7 text-left space-y-6">
              <div className="flex flex-wrap gap-2 items-center">
                {isActive ? (
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 shadow-sm">
                    <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-2 animate-pulse" />
                    Enrolling Now
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 shadow-sm">
                    <span className="w-2.5 h-2.5 bg-gray-400 rounded-full mr-2" />
                    Coming Soon
                  </span>
                )}
                {course?.category && (
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-primary/10 text-primary border border-primary/20">
                    {course.category}
                  </span>
                )}
                {course?.level && (
                  <span className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-secondary/10 text-secondary border border-secondary/20">
                    {course.level}
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-secondary-dark leading-tight tracking-tight">
                {course?.title}
              </h1>

              <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed max-w-2xl">
                Master the tools, workflows, and core principles of modern creative technology with Yusuf. Build a portfolio that sets you apart.
              </p>

              {/* Pricing Tag */}
              <div className="pt-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest block mb-1">
                  Tuition
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-secondary-dark">
                    {course?.price === 0
                      ? "Free"
                      : (course?.price ? `₦${(course.price / 100).toLocaleString()}` : "---")}
                  </span>
                  {course?.price !== 0 && (
                    <span className="text-sm font-semibold text-gray-500">
                      / Full course access
                    </span>
                  )}
                </div>
              </div>

              {/* Direct CTAs */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link
                  href={`/auth/signup?enroll=true&courseId=${courseId}`}
                  className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-bold rounded-2xl text-white bg-primary hover:bg-primary-dark transition-all duration-200 shadow-lg shadow-primary/25 hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Enroll in Course <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
                <a
                  href={WHATSAPP_GROUP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-8 py-4 border border-green-500/20 text-base font-bold rounded-2xl text-green-600 bg-green-50 hover:bg-green-100/50 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 gap-2"
                >
                  <i className="fa-brands fa-whatsapp text-lg"></i>
                  Join WhatsApp Community
                </a>
              </div>
            </div>

            {/* Right: Glassmorphic Image/Video Card */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none rounded-[2rem] overflow-hidden bg-white p-4 shadow-2xl border border-gray-100">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-gray-100 shadow-inner group">
                  <img
                    src={course?.thumbnailUrl || "/assets/Bravework_Studio-Logo-Color.png"}
                    alt={course?.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {course?.category && course.category.includes("3D") && (
                    <button
                      onClick={() => setPlayingVideoUrl("https://www.youtube.com/embed/4U0ONHj3_hw?autoplay=1")}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group"
                      aria-label="Play Trailer"
                    >
                      <div className="w-16 h-16 bg-white text-primary rounded-full flex items-center justify-center shadow-2xl scale-100 group-hover:scale-110 transition-transform duration-300">
                        <PlayCircle size={36} className="fill-current text-primary" />
                      </div>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Sections */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Overview Details & Description */}
          <div className="lg:col-span-8 space-y-12">
            
            {/* About Course */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-3xl font-black text-secondary-dark">About the Course</h2>
              <div className="text-gray-600 text-lg leading-relaxed">
                <ExpandableText
                  text={course?.description || ""}
                  maxChars={350}
                  className="leading-relaxed"
                />
              </div>
            </div>

            {/* Curriculum */}
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 space-y-8">
              <h2 className="text-3xl font-black text-secondary-dark flex items-center">
                <Sparkles className="w-7 h-7 text-primary mr-3" />
                Course Syllabus
              </h2>
              <div className="ql-snow border-t border-gray-50 pt-6">
                <div
                  className="ql-editor !p-0 prose prose-lg max-w-none prose-headings:text-secondary-dark prose-a:text-primary hover:prose-a:text-primary-dark"
                  dangerouslySetInnerHTML={{ __html: course?.content || "<p className='text-gray-500 italic'>Syllabus outline coming soon.</p>" }}
                />
              </div>
            </div>

          </div>

          {/* Right Column: Dynamic Side Panel (Instructor, Tools, Discounts) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* Course Features Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-6">
              <h3 className="text-xl font-bold text-secondary-dark pb-4 border-b border-gray-100">Quick Specs</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Duration</p>
                    <p className="font-bold text-gray-800">
                      {course?.duration || (isActive ? "6 Weeks Live" : "Open Shortly")}
                    </p>
                    <p className="text-xs text-gray-500">Live online session logs</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Start Date</p>
                    <p className="font-bold text-gray-800">
                      {course?.startDate ? new Date(course.startDate).toLocaleDateString() : "Starting Shortly"}
                    </p>
                    <p className="text-xs text-gray-500">Zoom classes</p>
                  </div>
                </div>

                {course?.software && course.software.length > 0 && (
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/10 p-2.5 rounded-xl text-primary">
                      <Github className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Software Used</p>
                      <p className="font-bold text-gray-800">
                        {course.software.map((s) => s.name).join(", ")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Early Bird Discount Banner */}
            {course?.discount && new Date(course.discountEndDate) > new Date() && (
              <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border border-yellow-500/25 rounded-3xl p-6 relative overflow-hidden space-y-3">
                <div className="flex items-center gap-2.5">
                  <Award className="w-6 h-6 text-orange-600 animate-bounce" />
                  <span className="font-bold text-orange-800 text-lg uppercase tracking-wide">
                    {course.discount}% OFF Early Bird
                  </span>
                </div>
                <p className="text-sm text-orange-700 leading-relaxed font-medium">
                  Enroll early to lock in your special discounted tuition rate.
                </p>
                <div className="text-xs text-orange-600/80 font-bold bg-white/50 inline-block px-3 py-1 rounded-full border border-orange-200">
                  {(() => {
                    const end = new Date(course.discountEndDate);
                    const now = new Date();
                    const diff = end.getTime() - now.getTime();
                    if (diff <= 0) return "Expired";
                    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                    return `Promo expires in ${days} days`;
                  })()}
                </div>
              </div>
            )}

            {/* Instructor Details Card */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest pb-3 border-b border-gray-100">Your Instructor</h3>
              <div className="flex items-center gap-4">
                <img
                  src="/assets/Profile_Picture.jpg"
                  alt="Ahbideen Yusuf"
                  className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <p className="font-bold text-gray-900 text-base">Ahbideen Yusuf</p>
                  <p className="text-xs text-primary font-bold">Founder, Bravework Studio</p>
                </div>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed pt-2">
                Passionate educator and creative technologist. Yusuf designs custom curriculums to translate technical complexities into fun, builder-oriented learning.
              </p>
            </div>

          </div>
        </div>

        {/* Student Showcase */}
        {studentRenders.length > 0 && (
          <div className="my-24 space-y-12">
            <div className="text-center max-w-2xl mx-auto space-y-3">
              <h2 className="text-3xl md:text-4xl font-black text-secondary-dark">Student Showcase</h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Check out the incredible rendering and technical assets built by our academy graduates.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {studentRenders.map((src, index) => (
                <div
                  key={index}
                  className="group relative aspect-square rounded-3xl overflow-hidden shadow-md bg-white border border-gray-100"
                >
                  <img
                    src={src}
                    alt={`Student Render ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-secondary-dark/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        <div className="my-24 space-y-12">
          <h2 className="text-3xl md:text-4xl font-black text-secondary-dark text-center">What Parents & Students Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between h-full relative group hover:shadow-md transition-shadow"
              >
                <div className="text-5xl text-primary/10 font-serif leading-none absolute top-6 right-6">“</div>
                <div className="flex-grow pb-6">
                  <p className="text-gray-700 text-base italic leading-relaxed relative z-10">
                    {t.quote}
                  </p>
                </div>
                <div className="flex items-center pt-6 border-t border-gray-100">
                  <img
                    src={t.image || "/assets/Bravework_Studio-Logo-Black.png"}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover border border-gray-200 mr-4"
                  />
                  <div>
                    <p className="font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-primary font-bold uppercase tracking-wider">{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dynamic Bundle Pricing Section */}
        {bundleCourses.length > 1 && (
          <div className="my-24">
            <div className="bg-gradient-to-br from-secondary-light to-secondary-dark rounded-[3rem] p-10 md:p-16 text-white shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -mr-48 -mt-48 blur-3xl" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-12">
                  <div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-widest mb-4">
                      <span>Curriculum Bundle</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-black mb-4">
                      Power Bundle Path
                    </h2>
                    <p className="text-blue-100 text-lg max-w-xl leading-relaxed">
                      Enroll in the full learning path containing {bundleCourses.length} professional classes and unlock special discount prices.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/25 text-center">
                      <div className="text-3xl font-black">{bundleCourses.length}</div>
                      <div className="text-xs font-bold uppercase tracking-widest opacity-80">Courses</div>
                    </div>
                    <div className="px-6 py-3 bg-green-500 rounded-2xl shadow-lg text-center">
                      <div className="text-3xl font-black">20%</div>
                      <div className="text-xs font-bold uppercase tracking-widest">Savings</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bundleCourses.map((bc, idx) => (
                    <div
                      key={bc.id}
                      className="bg-white/10 backdrop-blur-sm border border-white/15 rounded-2xl p-6 hover:bg-white/20 transition-all flex items-center gap-6 group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-secondary font-black text-xl shadow-md shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-lg font-bold mb-1">{bc.title}</h4>
                        <p className="text-blue-100 text-xs line-clamp-2 opacity-80 leading-relaxed">
                          {bc.description}
                        </p>
                      </div>
                      <Link
                        href={`/academy/courses/${bc.id}`}
                        className="p-2.5 rounded-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </div>
                  ))}
                </div>

                <div className="mt-12 flex flex-col items-center gap-6 border-t border-white/10 pt-12">
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 rounded-full border border-white/10">
                    <Shield className="w-4 h-4 text-green-400" />
                    <span className="text-xs font-bold tracking-wide">
                      Certificates and all study assets included
                    </span>
                  </div>
                  <Link
                    href={`/auth/signup?enroll=true&bundle=${bundleCourses.map((c) => c.id).join(",")}`}
                    className="inline-flex items-center justify-center px-10 py-4.5 bg-white text-secondary font-black text-lg rounded-full shadow-2xl hover:bg-white/90 transition-all transform hover:scale-[1.02] duration-200"
                  >
                    Enroll in Bundle Now <ArrowRight className="ml-3 w-5 h-5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Benefits & Trust Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-24">
          {/* Why Choose Us */}
          <div className="bg-secondary-dark rounded-[2.5rem] p-8 md:p-12 text-white shadow-xl relative overflow-hidden flex flex-col justify-between">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <h2 className="text-3xl font-black mb-8 relative z-10">Why Students Love Us</h2>
            <ul className="space-y-6 relative z-10">
              {friendlyFeedbackBullets.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-white/10 p-2 rounded-xl mr-4 mt-1 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-1">{item.title}</h3>
                    <p className="text-gray-300 leading-relaxed text-sm">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Safety & Trust details */}
          <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-black text-secondary-dark mb-8">Safety & Trust</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <Shield className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Code of Conduct</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Safe, respectful space built on collaboration and positive reinforcement.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <Lock className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Verified Instructors</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Strict clearances and verification for peace of mind.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <CreditCard className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Money-Back Guarantee</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Full refund guarantee if you withdraw prior to session 2.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-gray-50 border border-gray-100/50">
                  <FileText className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-bold text-gray-900 text-sm mb-1">Privacy First</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">
                    Student projects and data are shared only with full consent.
                  </p>
                </div>
              </div>
            </div>
            <div className="pt-8 text-center mt-6">
              <Link
                href="https://braveworkstudio.com/refund-policy"
                target="_blank"
                className="inline-flex items-center text-sm text-secondary font-bold hover:text-primary transition-colors gap-1.5"
              >
                View Full Policies <ExternalLink className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA Banner */}
        <div className="bg-gradient-to-r from-primary to-primary-dark rounded-[2.5rem] shadow-2xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-white/5 mix-blend-overlay" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Ready to start your journey?
            </h2>
            <p className="text-primary-light/10 text-white/90 text-lg leading-relaxed">
              Enroll today and get immediate access to all curriculum, sessions, and discord channels.
            </p>
            <Link
              href={`/auth/signup?enroll=true&courseId=${courseId}`}
              className="inline-flex items-center justify-center px-10 py-4.5 bg-white text-primary font-black text-lg rounded-full shadow-lg hover:bg-gray-50 transition-colors transform hover:scale-[1.02] duration-200"
            >
              Enroll in Course
            </Link>
          </div>
        </div>
      </div>

      <VideoModal
        isOpen={!!playingVideoUrl}
        onClose={() => setPlayingVideoUrl(null)}
        videoUrl={playingVideoUrl || ""}
      />
    </div>
  );
}
