"use client";

import React, { useState } from "react";
import { MailCheck } from "lucide-react";
import { toast } from "react-toastify";
import { Mail } from "lucide-react";
import Joi from "joi";

const resendVeriSchema = Joi.object({
  email: Joi.string().email({ tlds: false }).required().label("Email"),
});

export default function VerificationEmailPage() {
  const [form, setForm] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Try to open the user's default email client
  const handleOpenEmail = () => {
    window.location.href = "mailto:";
  };

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    setLoading(true);

    // Joi client-side validation
    const { error } = resendVeriSchema.validate(form, { abortEarly: false });
    if (error) {
      setMessage(error.details.map((d) => d.message).join(" "));
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      });
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message);
      } else {
        toast.error(data.error || "Something went wrong");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg text-center">
        <div className="flex flex-col items-center mb-6">
          <MailCheck className="h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Verify Your Email
          </h1>
          <p className="text-sm text-gray-500">
            We’ve sent a verification link to your email address. Please check
            your inbox and click the link to activate your account.
          </p>
        </div>

        <button
          onClick={handleOpenEmail}
          className="w-full py-3 px-6 rounded-lg font-bold text-white bg-green-600 hover:bg-green-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
        >
          Open Email App
        </button>

        <div className="mt-4 text-sm text-gray-500">
          Didn’t get the email? Check your spam folder or{" "}
          <form onSubmit={handleResend}>
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
                className={`p-3 rounded-lg text-sm text-center bg-red-100 text-red-700`}
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
                {loading ? "Sending..." : "resend verification"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
