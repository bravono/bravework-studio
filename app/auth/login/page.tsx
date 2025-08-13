"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { Loader2 } from "lucide-react"; // Importing Loader2 for the loading spinner

function LoginForm() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  // Display a toast message if the user was just verified
  useEffect(() => {
    if (verified === "true") {
      toast.success("Email successfully verified! You can now log in.");
    }
  }, [verified]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    const result = await signIn("credentials", {
      redirect: false,
      email: form.email,
      password: form.password,
    });

    if (result?.error) {
      if (result.error === "Please verify your email first.") {
        setMessage(
          "Your email address is not verified. Please check your inbox for a verification link."
        );
      } else {
        setMessage(result.error);
      }
      setLoading(false);
    } else {
      // Login successful, now attempt to claim guest orders
      try {
        await fetch("/api/auth/claim-guest-orders", { method: "POST" });
        console.log("Attempted to claim guest orders.");
      } catch (claimError) {
        console.error("Failed to claim guest orders:", claimError);
      }
      // Redirect to the homepage after successful login and guest order claim attempt
      router.push("/");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg border border-gray-200">
        <h2 className="text-3xl font-bold text-center text-green-800">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full px-4 py-2 text-gray-900 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors"
              value={form.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
          </div>
          {message && (
            <div
              className={`p-3 text-sm rounded-lg ${
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
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-3" />
                Logging in...
              </span>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Don't have an account?{" "}
          <a href="/auth/signup" className="text-green-600 hover:text-green-800 font-medium">
            Sign up
          </a>
        </div>
      </div>
    </div>
  );
}

// The main export for the page, wrapped with Suspense
export default function Login() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen text-lg text-gray-700">
          Loading...
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}

