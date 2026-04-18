"use client";

import React, {
  useState,
  useMemo,
  useEffect,
  Suspense,
  useCallback,
} from "react";
import {
  User,
  Mail,
  Lock,
  Phone,
  Clock,
  Building,
  Handshake,
} from "lucide-react";

import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";

import Joi from "joi";
import { Course } from "@/app/types/app";
import { KOBO_PER_NAIRA } from "@/lib/constants";

// Joi Schemas
const baseSignupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().label("First Name"),
  lastName: Joi.string().min(2).max(50).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
  phone: Joi.string().allow("").optional().label("Phone"),
  referralCode: Joi.string().allow("").optional().length(8).label("Referral"),
  password: Joi.string()
    .min(7)
    .max(100)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*?~])"))
    .label("Password")
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*?~).",
    }),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({ "any.only": "Passwords do not match." }),
  companyName: Joi.string().max(100).allow("").optional().label("Company Name"),
});

const enrollmentSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().label("First Name"),
  lastName: Joi.string().min(2).max(50).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
  phone: Joi.string().allow("").optional().label("Phone"),
  referralCode: Joi.string().allow("").optional().length(8).label("Referral"),
  password: Joi.string()
    .min(7)
    .max(100)
    .required()
    .pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*?~])"))
    .label("Password")
    .messages({
      "string.pattern.base":
        "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character (!@#$%^&*?~).",
    }),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({ "any.only": "Passwords do not match." }),
  preferredSessionTime: Joi.string().required().label("Preferred Session Time"),
  courseId: Joi.number().optional().label("Course Id"),
  bundle: Joi.string().allow(null, "").optional().label("Bundle"),
  includeHardware: Joi.boolean().optional().label("Include Hardware"),
}).or("courseId", "bundle");

const enrollExistingUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().label("First Name"),
  lastName: Joi.string().min(2).max(50).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
  phone: Joi.string().allow("").optional().label("Phone"),
  preferredSessionTime: Joi.string().required().label("Preferred Session Time"),
  courseId: Joi.number().optional().label("Course Id"),
  bundle: Joi.string().allow(null, "").optional().label("Bundle"),
  includeHardware: Joi.boolean().optional().label("Include Hardware"),
  referralCode: Joi.string().allow("").optional().length(8).label("Referral"),
}).or("courseId", "bundle");

function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEnrollmentPage = searchParams.get("enroll") === "true";
  const courseId = searchParams.get("courseId");
  const bundleParam = searchParams.get("bundle");
  const hardwareParam = searchParams.get("hardware") === "true";
  const { data: session } = useSession();
  const user = session?.user;
  const firstName = user?.name ? user.name.split(" ")[0] : "";
  const lastName = user?.name ? user.name.split(" ").slice(1).join(" ") : "";
  const email = user?.email || "";

  

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    referralCode: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    preferredSessionTime: "",
  });
  const [course, setCourse] = useState<Course>();
  const [bundleCourses, setBundleCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const fetchCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/courses/${courseId}`);

      if (!res.ok) {
        throw new Error("Failed to get course");
      }

      const data = await res.json();
      setCourse(data[0]);
    } catch (error) {
      console.log("Internal error fetching course: ", error.message);
    }
  }, [course]);

  

  

  useEffect(() => {
    if (isEnrollmentPage) {
      if (courseId) {
        fetchCourse();
      } else if (bundleParam) {
        const ids = bundleParam.split(",");
        Promise.all(ids.map(id => fetch(`/api/courses/${id}`).then(r => r.json())))
          .then(results => {
            const courses = results.map(r => r[0]);
            setBundleCourses(courses);
            if (courses.length > 0) {
              setCourse(courses[0]);
            }
          })
          .catch(err => console.error("Error fetching bundle courses:", err));
      }
    }
  }, [isEnrollmentPage, courseId, bundleParam]);

  useEffect(() => {
    const referralCode = searchParams.get("ref");
    if (referralCode) {
      setForm({ ...form, referralCode });
    }

    console.log("Form", form);
  }, [searchParams]);

  const schemaToValidate = useMemo(() => {
    if (!isEnrollmentPage) return baseSignupSchema;
    // For bundles, we relax the courseId requirement in Joi if bundle is present
    return !user ? enrollmentSchema : enrollExistingUserSchema;
  }, [isEnrollmentPage, user]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Create a payload with only the necessary fields
    let payloadForValidation;
    let payloadForApi;
    let payloadExistingUser;

    // For logged in students, we don't send password fields
    const firstName = user?.name ? user.name.split(" ")[0] : form.firstName;
    const lastName = user?.name
      ? user.name.split(" ").slice(1).join(" ")
      : form.lastName;
    const email = user?.email || form.email;

    if (isEnrollmentPage) {
      payloadExistingUser = {
        firstName,
        lastName,
        email,
        phone: form.phone,
        preferredSessionTime: form.preferredSessionTime,
        courseId: courseId ? Number(courseId) : undefined,
        bundle: bundleParam,
        includeHardware: hardwareParam,
      };

      payloadForValidation = {
        firstName,
        lastName,
        email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword, // Included for frontend validation
        preferredSessionTime: form.preferredSessionTime,
        courseId: courseId ? Number(courseId) : undefined,
        bundle: bundleParam,
        includeHardware: hardwareParam,
        referralCode: form.referralCode,
      };

      payloadForApi = {
        firstName,
        lastName,
        email,
        phone: form.phone,
        preferredSessionTime: form.preferredSessionTime,
        courseId: courseId ? Number(courseId) : undefined,
        bundle: bundleParam,
        includeHardware: hardwareParam,
      };

      if (!user) {
        payloadForApi.password = form.password; // Only send the password to the backend if user is not logged in
      }
    } else {
      payloadForValidation = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword, // Included for frontend validation
        companyName: form.companyName,
        referralCode: form.referralCode,
      };

      payloadForApi = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password, // Only send the password to the backend
        companyName: form.companyName,
        referralCode: form.referralCode,
      };
    }

    // Validate the payload using the Joi schema
    const { error } = schemaToValidate.validate(
      !user ? payloadForValidation : payloadExistingUser,
      {
        abortEarly: false,
      },
    );
    if (error) {
      setMessage(error.details.map((d) => d.message).join(" "));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payloadForApi), // Send the new, clean API payload
      });

      const data = await res.json();
      if (res.ok) {
        // GTM Tracking: Successful Signup
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push({
          event: "auth_event",
          auth_event: "signup",
          user_role: user?.roles?.join("+") || "user",
          user_id: data.userId || user?.id,
          page: window.location.pathname,
        });

        if (isEnrollmentPage && course) {
          // Relocated to backend signup route for security and reliability
        }

        if (!user?.email) {
          if (isEnrollmentPage) {
            setMessage(
              "Signup successful! Please check your email to verify your account and proceed with your enrollment.",
            );
          }
          setMessage(
            "Signup successful! Please check your email to verify your account and log in.",
          );
        } else {
          const paymentPrompt =
            (course?.price || bundleCourses.some(c => c.price > 0)) ? " Please proceed to payment." : "";
          const displayTitle = course?.title || `${bundleCourses.length} courses`;
          setMessage(
            `Enrollment successful! You have been enrolled in ${displayTitle}.${paymentPrompt}`,
          );
        }

        // Reset form to initial state
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          companyName: "",
          phone: "",
          referralCode: "",
          preferredSessionTime: "",
        });
        // Redirect to verification page after a short delay
        setTimeout(() => {
          user
            ? (window.location.href = "/user/dashboard")
            : router.push("/auth/verify-email");
        }, 1000);
      } else {
        setMessage(data.message || "Signup failed. Please try again.");
      }
    } catch (error) {
      setMessage("Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4 mt-10">
      <div className="p-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {isEnrollmentPage ? "Enroll Now" : "Create Account"}
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Please fill in the details below to get started.
          </p>
        </div>

        {isEnrollmentPage && (course || bundleCourses.length > 0) && (
          <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              <p className="text-lg text-gray-600 font-semibold mb-1">
                {bundleCourses.length > 0 
                  ? `Enroll in Bundle: ${bundleCourses.map(c => c.title).join(", ")}`
                  : `Enroll in: ${course?.title}`}
              </p>
            </h3>

            {hardwareParam && (
              <div className="flex items-center gap-2 text-blue-600 font-bold mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                <Building className="w-5 h-5" />
                <span>+ Hardware Rental Included (10% Discount Active)</span>
              </div>
            )}

            <p className="text-2xl font-bold text-green-600">
              {bundleCourses.length > 1 
                ? `${bundleCourses.length === 2 ? "10%" : "20%"} Bundle Discount Applied` 
                : "Course Enrollment Ready"}
            </p>
            {course?.early_bird_discount && (
               <p className="text-sm text-blue-600 font-medium mt-1">
                 * Includes Stacking Early Bird Discount
               </p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* First Name */}
          <div className="relative">
            <label htmlFor="firstName" className="sr-only">
              First Name *
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
              placeholder="First Name *"
              value={user ? firstName : form.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              required
              disabled={!!user}
            />
          </div>

          {/* Last Name */}
          <div className="relative">
            <label htmlFor="lastName" className="sr-only">
              Last Name *
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <User className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
              placeholder="Last Name *"
              value={user ? lastName : form.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              required
              disabled={!!user}
            />
          </div>

          {/* Email */}
          <div className="relative">
            <label htmlFor="email" className="sr-only">
              Email *
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Mail className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
              placeholder="Email *"
              value={user ? email : form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          {/* Phone */}
          <div className="relative">
            <label htmlFor="phone" className="sr-only">
              Phone
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Phone className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="tel"
              id="phone"
              name="phone"
              className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
              placeholder="Phone (Optional)"
              value={form.phone}
              onChange={handleChange}
              autoComplete="tel"
            />
          </div>

          {/* Referral */}
          <div className="relative">
            <label htmlFor="referralCode" className="sr-only">
              Referral Code *
            </label>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Handshake className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="referralCode"
              id="referralCode"
              name="referralCode"
              className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
              placeholder="Referral Code (Optional)"
              value={form.referralCode}
              onChange={handleChange}
              autoComplete="referralCode"
            />
          </div>

          {isEnrollmentPage && (
            <>
              {/* Preferred Session Time */}
              <div className="relative">
                <label htmlFor="preferredSessionTime" className="sr-only">
                  Preferred Session Time *
                </label>
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <select
                  id="preferredSessionTime"
                  name="preferredSessionTime"
                  className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200 appearance-none bg-white"
                  value={form.preferredSessionTime}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a preferred time *</option>
                  {course?.sessions?.map((session) => {
                    const date = new Date(session.datetime);
                    const durationHours = session.duration || 2; // default to 2 hours if not provided

                    const endDate = new Date(
                      date.getTime() + durationHours * 60 * 60 * 1000,
                    );

                    const startTime = date.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    const endTime = endDate.toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    });

                    const hour = date.getHours();
                    const prefix = hour < 12 ? "Morning" : "Evening";

                    const display = `${prefix} - ${startTime} to ${endTime}`;
                    const value = course.sessionOption;

                    return (
                      <option key={value} value={value}>
                        {display}
                      </option>
                    );
                  })}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </>
          )}

          {/* Password (for both regular and enrollment signup) */}
          {!user && (
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password *
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="password"
                name="password"
                className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
                placeholder="Password *"
                value={form.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {/* Confirm Password (for both regular and enrollment signup) */}
          {!user && (
            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password *
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
                placeholder="Confirm Password *"
                value={form.confirmPassword}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
            </div>
          )}

          {/* Company Name (only for regular signup) */}
          {!isEnrollmentPage && (
            <div className="relative">
              <label htmlFor="companyName" className="sr-only">
                Company Name
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Building className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                id="companyName"
                name="companyName"
                className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
                placeholder="Company Name (Optional)"
                value={form.companyName}
                onChange={handleChange}
                maxLength={100}
              />
            </div>
          )}

          {message && (
            <div
              className={`p-3 rounded-lg text-sm text-center w-96 ${
                message.includes("successful")
                  ? "bg-green-100 text-green-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 ${
              loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            {loading
              ? "Processing..."
              : isEnrollmentPage
                ? "Enroll"
                : "Sign Up"}
          </button>
        </form>

        {!isEnrollmentPage && user && <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-green-600 hover:underline font-medium"
          >
            Log in
          </a>
        </div>}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <Signup />
    </Suspense>
  );
}
