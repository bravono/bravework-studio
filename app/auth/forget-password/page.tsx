"use client";

import React, { useState } from "react";
import Joi from "joi";
import { Lock, Mail } from "lucide-react";

const resendVeriSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().label("Email"),
});

export default function ForgetPasswordPage() {
  const [form, setForm] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);
    setMessage(null);

    // Joi client-side validation
    const { error } = resendVeriSchema.validate(form, { abortEarly: false });
    if (error) {
      setMessage(error.details.map((d) => d.message).join(" "));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/forget-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage(data?.message);
      } else {
        setMessage(data?.error || "Something went wrong");
      }
    } catch (err) {
      setMessage("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex flex-col items-center mb-6">
          <Lock className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Reset Your Password
          </h1>
        </div>

        <div className="text-sm text-gray-500">
          <form onSubmit={handleSubmit}>
            <div className="mb-5 relative">
              <label htmlFor="email" className="sr-only">
                Enter your email*
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
                autoComplete="email"
                onChange={(e) => {
                  setForm({ email: e.target.value });
                  setMessage(null);
                }}
                required
              />
            </div>
            {message && (
              <div
                className={`p-3 rounded-lg text-sm text-center ${
                  message.includes("Error")
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {message}
              </div>
            )}
            <div className="flex justify-center">
              <button
                type="submit"
                className="text-green-600 hover:underline font-medium"
                disabled={loading}
              >
                {loading ? "Sending..." : "Reset Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
