"use client";

import React, { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify"; // Optional: For better user feedback
import "../../css/auth.css";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const verified = searchParams.get("verified");

  useEffect(() => {
    if (verified === "true") {
      toast.success("Email successfully verified! You can now log in."); // Or display a nicer message
    }
  }, [verified]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

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
    } else {
      // Login successful, now attempt to claim guest orders
      try {
        await fetch("/api/auth/claim-guest-orders", { method: "POST" });
        console.log("Attempted to claim guest orders.");
      } catch (claimError) {
        console.error("Failed to claim guest orders:", claimError);
      }
      router.push("/");
    }

    setLoading(true);
  };

  return (
    <div className="auth-container">
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Login</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" className="auth-label">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            className="auth-input"
            value={form.email}
            onChange={handleChange}
            autoComplete="email"
            required
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="password" className="auth-label">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="auth-input"
            value={form.password}
            onChange={handleChange}
            autoComplete="current-password"
            required
          />
        </div>
        {message && (
          <div
            className="auth-message"
            style={{
              color: message === "Login successful!" ? "#22c55e" : "#ef4444",
            }}
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="auth-button"
          style={{
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div style={{ marginTop: 18, textAlign: "center", fontSize: 15 }}>
        Don't have an account?{" "}
        <a href="/auth/signup" className="auth-link">
          Sign up
        </a>
      </div>
    </div>
  );
}
