"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import "../../css/auth.css";

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorMessage =
    searchParams.get("message") || "An unknown error occurred.";

  return (
    <div
      className="auth-error-page"
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
          boxShadow: "0 4px 24px rgba(239,68,68,0.10)",
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
          style={{ margin: "0 auto 18px auto", color: "#ef4444" }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#ef4444"
            strokeWidth="2"
            fill="#fef2f2"
          />
          <path
            d="M15 9l-6 6M9 9l6 6"
            stroke="#ef4444"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: 10,
            color: "#ef4444",
          }}
        >
          Authentication Error
        </h1>
        <p style={{ color: "#b91c1c", marginBottom: 22, fontWeight: 500 }}>
          {errorMessage}
        </p>
        <a
          href="/auth/login"
          style={{
            display: "block",
            background: "#4f46e5",
            color: "#fff",
            borderRadius: 8,
            padding: "12px 0",
            fontWeight: 600,
            fontSize: "1rem",
            textDecoration: "none",
            marginBottom: 12,
            boxShadow: "0 2px 8px rgba(79,70,229,0.10)",
            transition: "background 0.2s",
          }}
        >
          Go to Sign In
        </a>
        <a
          href="/auth/signup"
          style={{
            display: "block",
            background: "#f3f4f6",
            color: "#22223b",
            borderRadius: 8,
            padding: "12px 0",
            fontWeight: 600,
            fontSize: "1rem",
            textDecoration: "none",
            marginBottom: 0,
            boxShadow: "0 2px 8px rgba(79,70,229,0.06)",
            transition: "background 0.2s",
          }}
        >
          Go to Sign Up
        </a>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ErrorContent />
    </Suspense>
  );
}
