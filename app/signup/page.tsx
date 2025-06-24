"use client";

import React, { useState } from "react";
import Joi from "joi";

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
  bio: Joi.string().max(500).allow("").label("Bio"),
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
    bio: "",
    companyName: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
          bio: form.bio,
          companyName: form.companyName,
          phone: form.phone,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(
          "Signup successful! Please check your email to verify your account."
        );
        setForm({
          firstName: "",
          lastName: "",
          email: "",
          password: "",
          confirmPassword: "",
          bio: "",
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
    <div
      className="signup-container"
      style={{
        maxWidth: 400,
        margin: "60px auto",
        background: "#fff",
        borderRadius: 12,
        boxShadow: "0 2px 16px rgba(0,0,0,0.07)",
        padding: 32,
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="firstName"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            First Name *
          </label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={form.firstName}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 16,
            }}
            autoComplete="given-name"
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="lastName"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            Last Name *
          </label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={form.lastName}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 16,
            }}
            autoComplete="family-name"
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="email"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            Email *
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
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="password"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            Password *
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
            autoComplete="new-password"
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="confirmPassword"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            Confirm Password *
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 16,
            }}
            autoComplete="new-password"
            required
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="bio"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            Bio
          </label>
          <textarea
            id="bio"
            name="bio"
            value={form.bio}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 16,
              minHeight: 60,
              resize: "vertical",
            }}
            maxLength={500}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label
            htmlFor="companyName"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            Company Name
          </label>
          <input
            type="text"
            id="companyName"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 16,
            }}
            maxLength={100}
          />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label
            htmlFor="phone"
            style={{ display: "block", marginBottom: 6, fontWeight: 500 }}
          >
            Phone
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "10px 12px",
              borderRadius: 6,
              border: "1px solid #e5e7eb",
              fontSize: 16,
            }}
            autoComplete="tel"
          />
        </div>
        {message && (
          <div
            style={{
              marginBottom: 16,
              color: message.startsWith("Signup successful")
                ? "#22c55e"
                : "#ef4444",
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
          {loading ? "Signing up..." : "Sign Up"}
        </button>
      </form>
      <div style={{ marginTop: 18, textAlign: "center", fontSize: 15 }}>
        Already have an account?{" "}
        <a href="/login" style={{ color: "#4f46e5", fontWeight: 600 }}>
          Log in
        </a>
      </div>
    </div>
  );
}
