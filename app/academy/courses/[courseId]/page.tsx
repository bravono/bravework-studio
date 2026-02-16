"use client";
import React, { useCallback, useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Course } from "@/app/types/app";

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

  const isActive = course?.isActive;

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
      setCourse(data[0]);
    } catch (error) {
      console.error("Error fetching course:", error);
    }
  }, [courseId]);

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

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

  const studentRenders = [
    `https://live.staticflickr.com/65535/54877391770_bdca4c1889_b.jpg" width="1024" height="1019" alt="Shaka_render-1`,
    `https://live.staticflickr.com/65535/54883334764_d3a826c9ce_b.jpg" width="1024" height="1024" alt="Shaka_render-2`,
    `https://live.staticflickr.com/65535/54883334754_dc0fd5961e_b.jpg" width="1024" height="1024" alt="Shaka_render-3`,
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
    <div className="bg-gray-50 min-h-screen font-[Inter]">
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-light/5 via-transparent to-secondary-light/5" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
          {isActive ? (
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-green-100 text-green-800 mb-6">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
              Enrolling Now
            </span>
          ) : (
            <span className="inline-flex items-center px-4 py-1.5 rounded-full text-sm font-semibold bg-gray-100 text-gray-800 mb-6">
              Coming Soon
            </span>
          )}
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-black text-secondary-dark leading-tight mb-6 tracking-tight">
            {course?.title}
          </h1>
          <p className="text-xl sm:text-2xl text-gray-600 font-medium max-w-3xl mx-auto leading-relaxed">
            {/* {course?.tagline} */}
            {"Master the skills of tomorrow, today."}
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 -mt-10 pb-20 relative z-10">
        {/* Course Overview Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden mb-16">
          <div className="grid grid-cols-1 lg:grid-cols-3">
            {/* Left Column: Key Details & Instructor */}
            <div className="lg:col-span-1 bg-gray-50/50 p-8 border-r border-gray-100">
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold text-secondary-dark mb-6 flex items-center">
                    <Sparkles className="w-6 h-6 text-primary mr-2" />
                    Course Details
                  </h2>
                  <div className="space-y-5">
                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-primary">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Duration
                        </p>
                        {isActive ? (
                          <p className="font-bold text-gray-900">
                            {course?.sessions !== null &&
                              course?.sessions[0].duration}{" "}
                            {course.price === 0 ? "2hrs" : "hrs/week"}
                          </p>
                        ) : (
                          "Open Shortly"
                        )}
                        <p className="text-xs text-gray-500">Live on Zoom</p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-primary">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Start Date
                        </p>
                        <p className="font-bold text-gray-900">
                          {isActive
                            ? new Date(course?.startDate).toLocaleDateString()
                            : "Open Shortly"}
                        </p>
                        {isActive && (
                          <p className="text-xs text-gray-500">
                            at {localStartTime || startTime}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-primary">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Age Group
                        </p>
                        <p className="font-bold text-gray-900">
                          {course?.ageBracket}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start">
                      <div className="bg-white p-2 rounded-lg shadow-sm mr-4 text-primary">
                        <Github className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 font-medium">
                          Software
                        </p>
                        <p className="font-bold text-gray-900">
                          {course?.software?.map((s) => s.name).join(", ")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Early Bird Discount */}
                {course?.discount &&
                  new Date(course.discountEndDate) > new Date() && (
                    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-5 relative overflow-hidden">
                      <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-1 rounded-bl-lg">
                        Limited Time
                      </div>
                      <div className="flex items-center mb-2">
                        <Award className="w-6 h-6 text-yellow-600 mr-2" />
                        <span className="font-bold text-yellow-800 text-lg">
                          {course.discount}% OFF
                        </span>
                      </div>
                      <p className="text-sm text-yellow-700 mb-1">
                        Early Bird Discount
                      </p>
                      <p className="text-xs text-yellow-600 font-medium">
                        {(() => {
                          const end = new Date(course.discountEndDate);
                          const now = new Date();
                          const diff = end.getTime() - now.getTime();
                          if (diff <= 0) return "Expired";
                          const days = Math.floor(diff / (1000 * 60 * 60 * 24));
                          const hours = Math.floor(
                            (diff / (1000 * 60 * 60)) % 24,
                          );
                          return `Ends in ${days}d ${hours}h`;
                        })()}
                      </p>
                    </div>
                  )}

                <div className="pt-6 border-t border-gray-200">
                  <p className="text-xs uppercase tracking-wider text-gray-500 font-semibold mb-4">
                    Instructor
                  </p>
                  <div className="flex items-center">
                    <img
                      src="/assets/Profile_Picture.jpg"
                      alt="Ahbideen Yusuf"
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md mr-4"
                    />
                    <div>
                      <p className="font-bold text-gray-900">Ahbideen Yusuf</p>
                      <p className="text-xs text-gray-500">
                        Founder, Bravework Studio
                      </p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-3 leading-relaxed">
                    Passionate educator and creative technologist making complex
                    concepts accessible and fun.
                  </p>
                </div>
              </div>
            </div>

            {/* Right Column: Description & CTA */}
            <div className="lg:col-span-2 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="text-3xl font-bold text-secondary-dark mb-6">
                About the Course
              </h3>
              <div className="prose prose-lg text-gray-600 mb-10">
                <p className="leading-relaxed">{course?.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                {isActive ? (
                  <>
                    <Link
                      href={`/auth/signup?enroll=true&courseId=${courseId}`}
                      className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-primary hover:bg-primary-dark transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Enroll Now <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>
                  </>
                ) : (
                  <Link
                    href={`/newsletter?isActive=false&courseId=${courseId}`}
                    className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-white bg-secondary hover:bg-secondary-dark transition-all duration-200 shadow-lg"
                  >
                    Notify Me When Opens
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Student Renders Section */}
        {studentRenders.length > 0 && (
          <div className="mb-20">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-secondary-dark mb-4">
                Student Showcase
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Incredible work created by our students. From concept to final
                render.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {studentRenders.map((src, index) => (
                <div
                  key={index}
                  className="group relative aspect-square rounded-2xl overflow-hidden shadow-lg bg-gray-100"
                >
                  <img
                    src={src}
                    alt={`Student Render ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <p className="text-white font-medium">Student Project</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials Section */}
        <div className="mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-dark text-center mb-12">
            Hear from Our Community
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((t, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-lg border border-gray-50 flex flex-col h-full relative"
              >
                <div className="absolute top-6 right-8 text-6xl text-primary/10 font-serif leading-none">
                  "
                </div>
                <div className="flex-grow">
                  <p className="text-gray-700 text-lg italic leading-relaxed relative z-10 mb-6">
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
                    <p className="text-sm text-primary font-medium">
                      {t.title}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Program Levels */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 mb-20">
          <h2 className="text-3xl md:text-4xl font-bold text-secondary-dark mb-10 text-center">
            Curriculum & Levels
          </h2>
          <div
            className="prose prose-lg max-w-none prose-headings:text-secondary-dark prose-a:text-primary hover:prose-a:text-primary-dark"
            dangerouslySetInnerHTML={{ __html: course?.content || "" }}
          />
        </div>

        {/* Why Choose Us & Policies */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-20">
          {/* Benefits */}
          <div className="bg-secondary-dark rounded-3xl p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
            <h2 className="text-3xl font-bold mb-8 relative z-10">
              Why Students Love Us
            </h2>
            <ul className="space-y-6 relative z-10">
              {friendlyFeedbackBullets.map((item, index) => (
                <li key={index} className="flex items-start">
                  <div className="bg-white/10 p-2 rounded-lg mr-4 mt-1 flex-shrink-0">
                    <CheckCircle className="w-5 h-5 text-primary-light" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Trust & Safety */}
          <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl border border-gray-100">
            <h2 className="text-3xl font-bold text-secondary-dark mb-8">
              Safety & Trust
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Shield className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">
                  Code of Conduct
                </h3>
                <p className="text-sm text-gray-600">
                  Safe, non-judgmental space focused on learning and respect.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <Lock className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">
                  Verified Instructors
                </h3>
                <p className="text-sm text-gray-600">
                  Rigorous background checks and Working-with-Children
                  clearances.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <CreditCard className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">
                  Money-Back Guarantee
                </h3>
                <p className="text-sm text-gray-600">
                  Full refund if you withdraw before the second session.
                </p>
              </div>
              <div className="p-4 rounded-xl bg-gray-50 border border-gray-100">
                <FileText className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-bold text-gray-900 mb-2">Privacy First</h3>
                <p className="text-sm text-gray-600">
                  Student work shared only with explicit consent.
                </p>
              </div>
            </div>
            <div className="mt-8 pt-6 border-t border-gray-100 text-center">
              <Link
                href="https://braveworkstudio.com/refund-policy"
                target="_blank"
                className="inline-flex items-center text-secondary font-semibold hover:text-primary transition-colors"
              >
                View Full Policies <ExternalLink className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        {isActive && (
          <div className="bg-primary rounded-3xl shadow-2xl p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Ready to start your journey?
              </h2>
              <p className="text-primary-100 text-xl mb-8 max-w-2xl mx-auto">
                Join a community of creators and start building your portfolio
                today.
              </p>
              <Link
                href={`/auth/signup?enroll=true&courseId=${courseId}`}
                className="inline-flex items-center justify-center px-10 py-4 bg-white text-primary font-bold text-lg rounded-full shadow-lg hover:bg-gray-50 transition-colors transform hover:scale-105 duration-200"
              >
                Enroll Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
