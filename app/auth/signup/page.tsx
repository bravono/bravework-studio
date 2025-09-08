"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import Joi from "joi";
import {
  User,
  Mail,
  Lock,
  Phone,
  Clock,
  DollarSign,
  Building,
} from "lucide-react";
import { toast } from "react-toastify";

// Mock data for courses. In a real app, this would be fetched from your API.
const courses = [
  { id: 1, title: "Intro to 3D Modeling", price: 5000000 }, // Price in Kobo (e.g., N50,000)
  {
    id: 2,
    title: "Web Development for Kids",
    price: 6000000,
  },
  {
    id: 3,
    title: "UI/UX Design for Kids",
    price: 5500000,
  },
  {
    id: 4,
    title: "Game Development for Kids",
    price: 7500000,
  },
];

const preferredSessionOptions = [
  { value: "18:00:00", label: "Friday (2:30 PM - 3:10 PM)" },
  { value: "20:00:00", label: "Saturday (10:00 AM - 10:40 AM)" },
  { value: "22:00:00", label: "Sunday (5:30 PM - 6:10 PM)" },
];

// Joi Schemas
const baseSignupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().label("First Name"),
  lastName: Joi.string().min(2).max(50).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
  phone: Joi.string().allow("").optional().label("Phone"),
  password: Joi.string().min(7).max(100).required().label("Password"),
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
  password: Joi.string().min(7).max(100).required().label("Password"),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({ "any.only": "Passwords do not match." }),
  preferredSessionTime: Joi.string().required().label("Preferred Session Time"),
  courseId: Joi.number().required().label("Course Id"), // Use Joi.number() since course IDs are numbers
});

const enrollExistingUserSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().label("First Name"),
  lastName: Joi.string().min(2).max(50).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
  phone: Joi.string().allow("").optional().label("Phone"),
  preferredSessionTime: Joi.string().required().label("Preferred Session Time"),
  courseId: Joi.number().required().label("Course Id"), // Use Joi.number() since course IDs are numbers
});

export default function Signup() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEnrollmentPage = searchParams.get("enroll") === "true";
  const courseId = searchParams.get("courseId");
  const KOBO_PER_NAIRA = 100;
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
    password: "",
    confirmPassword: "",
    companyName: "",
    preferredSessionTime: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState(null);

  useEffect(() => {
    if (isEnrollmentPage && courseId) {
      const course = courses.find((c) => c.id === Number(courseId));
      if (course) {
        setSelectedCourse(course);
      } else {
        setMessage("Invalid course selected. Please go back.");
      }
    }
  }, [isEnrollmentPage, courseId]);

  const schemaToValidate = useMemo(() => {
    if (!isEnrollmentPage) return baseSignupSchema;
    return !user ? enrollmentSchema : enrollExistingUserSchema;
  }, [isEnrollmentPage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
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
        courseId: Number(courseId),
      };

      payloadForValidation = {
        firstName,
        lastName,
        email,
        phone: form.phone,
        password: form.password,
        confirmPassword: form.confirmPassword, // Included for frontend validation
        preferredSessionTime: form.preferredSessionTime,
        courseId: Number(courseId),
      };

      payloadForApi = {
        firstName,
        lastName,
        email,
        phone: form.phone,
        preferredSessionTime: form.preferredSessionTime,
        courseId: Number(courseId),
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
      };

      payloadForApi = {
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        password: form.password, // Only send the password to the backend
        companyName: form.companyName,
      };
    }

    // Validate the payload using the Joi schema
    const { error } = schemaToValidate.validate(
      !user ? payloadForValidation : payloadExistingUser,
      {
        abortEarly: false,
      }
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
        setMessage(
          "Signup successful! Please check your email to verify your account and proceed with your enrollment."
        );
        // Reset form to initial state
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          companyName: "",
          phone: "",
          preferredSessionTime: "",
        });
        // Redirect to verification page after a short delay
        setTimeout(() => {
          router.push(user ? "/user/dashboard" : "/auth/verify-email");
        }, 3000);
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {isEnrollmentPage ? "Enroll Now" : "Create Account"}
          </h2>
          <p className="mt-2 text-gray-500 text-sm">
            Please fill in the details below to get started.
          </p>
        </div>

        {isEnrollmentPage && selectedCourse && (
          <div className="bg-gray-50 p-6 rounded-xl mb-6 border border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              <span className="inline-flex items-center gap-2"></span>

              <p className="text-lg text-gray-600 font-semibold mb-1">
                Enroll in: {selectedCourse.title}
              </p>
            </h3>

            <p className="text-2xl font-bold text-green-600">
              ₦{(selectedCourse.price / KOBO_PER_NAIRA).toLocaleString()}
            </p>
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
                  {preferredSessionOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
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
              className={`p-3 rounded-lg text-sm text-center ${
                message.startsWith("Signup successful")
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
              ? "Enroll & Pay"
              : "Sign Up"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="/auth/login"
            className="text-green-600 hover:underline font-medium"
          >
            Log in
          </a>
        </div>
      </div>
    </div>
  );
}
