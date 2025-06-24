"use client";

import React, { useState } from "react";

export default function Login() {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!form.email || !form.password) {
      setMessage("Both fields are required.");
      return;
    }

    setLoading(true);
    try {
      // Simulate API call
      await new Promise((res) => setTimeout(res, 1000));
      setMessage("Login successful!");
      setForm({ email: "", password: "" });
    } catch (error) {
      setMessage("Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="login-container"
      style={{
        maxWidth: 400,
        margin: "60px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        padding: 32,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Login</h2>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 16,
            }}
            autoComplete="email"
            required
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 16,
            }}
            autoComplete="current-password"
            required
          />
        </div>
        {message && (
          <div
            style={{
              marginBottom: 16,
              color: message === "Login successful!" ? "#22c55e" : "#ef4444",
              textAlign: "center",
              fontWeight: 500,
            }}
          >
            {message}
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 8,
            background: "#4f46e5",
            color: "#fff",
            fontWeight: 700,
            fontSize: 18,
            border: "none",
            cursor: loading ? "not-allowed" : "pointer",
            boxShadow: "0 2px 8px rgba(79,70,229,0.10)",
            transition: "background 0.2s",
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      <div style={{ marginTop: 18, textAlign: "center", fontSize: 15 }}>
        Don't have an account?{" "}
        <a href="/signup" style={{ color: "#4f46e5", fontWeight: 600 }}>
          Sign up
        </a>
      </div>
    </div>
  );
}
