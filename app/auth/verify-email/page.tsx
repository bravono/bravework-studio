"use client";

import React from "react";

export default function VerificationEmailPage() {
  // Try to open the user's default email client
  const handleOpenEmail = () => {
    window.location.href = "mailto:";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          boxShadow: "0 4px 24px rgba(79,70,229,0.08)",
          padding: "40px 32px",
          maxWidth: 420,
          width: "100%",
          textAlign: "center",
        }}
      >
        <svg
          width={64}
          height={64}
          viewBox="0 0 24 24"
          fill="none"
          style={{ margin: "0 auto 18px auto", color: "#4f46e5" }}
        >
          <path
            d="M3 8l9 6 9-6M5 19h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2z"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: 10 }}>
          Verify Your Email
        </h1>
        <p style={{ color: "#555", marginBottom: 22 }}>
          We’ve sent a verification link to your email address.
          <br />
          Please check your inbox and click the link to activate your account.
        </p>
        <button
          onClick={handleOpenEmail}
          style={{
            background: "#4f46e5",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "12px 28px",
            fontSize: "1rem",
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 14,
            boxShadow: "0 2px 8px rgba(79,70,229,0.10)",
            transition: "background 0.2s",
          }}
        >
          Open Email App
        </button>
        <div style={{ marginTop: 12, color: "#888", fontSize: 15 }}>
          Didn’t get the email? Check your spam folder or&nbsp;
          <a
            href="/auth/resend_verification"
            style={{ color: "#4f46e5", fontWeight: 600 }}
          >
            resend verification
          </a>
          .
        </div>
      </div>
    </div>
  );
}
