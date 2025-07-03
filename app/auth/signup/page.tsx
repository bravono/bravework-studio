"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Joi from "joi";
import "../../css/auth.css";

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
  companyName: Joi.string().max(100).allow("").label("Company Name"),
  phone: Joi.string().allow("").label("Phone"),
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
        router.push("/auth/verify-email");

        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          companyName: "",
          phone: "",
        });
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
    <div className="auth-container">
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="firstName" className="auth-label">
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            className="auth-input"
            value={form.firstName}
            onChange={handleChange}
            autoComplete="given-name"
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="lastName" className="auth-label">
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            className="auth-input"
            value={form.lastName}
            onChange={handleChange}
            autoComplete="family-name"
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="email" className="auth-label">
            Email *
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
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="password" className="auth-label">
            Password *
          </label>
          <input
            type="password"
            id="password"
            name="password"
            className="auth-input"
            value={form.password}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="confirmPassword" className="auth-label">
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            className="auth-input"
            value={form.confirmPassword}
            onChange={handleChange}
            autoComplete="new-password"
            required
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="companyName" className="auth-label">
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            className="auth-input"
            value={form.companyName}
            onChange={handleChange}
            maxLength={100}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label htmlFor="phone" className="auth-label">
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            className="auth-input"
            value={form.phone}
            onChange={handleChange}
            autoComplete="tel"
          />
        </div>
        {message && (
          <div
            className="auth-message"
            style={{
              color: message.startsWith("Signup successful")
                ? "#22c55e"
                : "#ef4444",
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <div style={{ marginTop: 18, textAlign: "center", fontSize: 15 }}>
        Already have an account?{" "}
        <a href="/auth/login" className="auth-link">
          Log in
        </a>
      </div>
    </div>
  );
}
