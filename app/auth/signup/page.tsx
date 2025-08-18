"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Joi from "joi";
import { User, Mail, Lock, Building, Phone } from "lucide-react";

const signupSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required().label("First Name"),
  lastName: Joi.string().min(2).max(50).required().label("Last Name"),
  email: Joi.string().email({ tlds: false }).required().label("Email"),
  password: Joi.string().min(7).max(100).required().label("Password"),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({ "any.only": "Passwords do not match." }),
  companyName: Joi.string().max(100).allow("").optional().label("Company Name"),
  phone: Joi.string().allow("").optional().label("Phone"),
});

export default function Signup() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    companyName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    // Joi client-side validation
    const { error } = signupSchema.validate(form, { abortEarly: false });
    if (error) {
      setMessage(error.details.map((d) => d.message).join(" "));
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          password: form.password,
          companyName: form.companyName,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        // Use a generic success message to maintain consistency
        setMessage("Signup successful! Redirecting to email verification...");

        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          companyName: "",
          phone: "",
        });

        router.push("/auth/verify-email");
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
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="mt-2 text-gray-500 text-sm">
            Please fill in the details below to get started.
          </p>
        </div>

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
              value={form.firstName}
              onChange={handleChange}
              autoComplete="given-name"
              required
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
              value={form.lastName}
              onChange={handleChange}
              autoComplete="family-name"
              required
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
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>

          {/* Password */}
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

          {/* Confirm Password */}
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

          {/* Company Name (Optional) */}
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

          {/* Phone (Optional) */}
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
            {loading ? "Signing up..." : "Sign Up"}
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
