"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Joi from "joi";
import { Lock } from "lucide-react";

// Joi Schemas
const resetPasswordSchema = Joi.object({
  password: Joi.string().min(7).max(100).required().label("Password"),
  confirmPassword: Joi.any()
    .valid(Joi.ref("password"))
    .required()
    .label("Confirm Password")
    .messages({ "any.only": "Passwords do not match." }),
});

function ResetPassword() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFormDisabled, setIsFormDisabled] = useState(true);

  useEffect(() => {
    // Only enable the form if a token is present in the URL
    if (token) {
      setIsFormDisabled(false);
    } else {
      setMessage("Password reset token is missing from the URL.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    // Basic password strength check (optional, but good practice)
    if (password.length < 8) {
      setMessage("Password must be at least 8 characters long.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(
          data.message ||
            "Your password has been reset successfully. You can now log in."
        );

        setIsFormDisabled(true); // Disable form after success
        setTimeout(() => router.push("/auth/login"), 3000);
      } else {
        setMessage(data?.message || "Failed to reset. Please try again.");
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setMessage("An unexpected network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="w-full max-w-md p-8 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">
            {"Reset Password"}
          </h2>
          <p className="mt-2 text-gray-500 text-sm">Choose a new password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {
            <div className="relative">
              <label htmlFor="password" className="sr-only">
                Password *
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                placeholder="Password *"
                className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
              />
            </div>
          }

          {
            <div className="relative">
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password *
              </label>
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Lock className="w-5 h-5 text-gray-400" />
              </div>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm Password *"
                disabled={isLoading}
                className="w-full py-3 pl-10 pr-4 rounded-lg border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 transition-colors duration-200"
              />
            </div>
          }

          {message && (
            <div
              className={`p-3 rounded-lg text-sm text-center ${
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
            {isLoading ? "Processing..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <ResetPassword />
    </Suspense>
  );
}
