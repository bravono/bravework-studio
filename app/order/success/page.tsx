"use client";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function OrderSuccessPage() {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div
      className="order-success-page"
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
          boxShadow: "0 4px 24px rgba(34,197,94,0.10)",
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
          style={{ margin: "0 auto 18px auto", color: "#22c55e" }}
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="#22c55e"
            strokeWidth="2"
            fill="#f0fdf4"
          />
          <path
            d="M8 12l2.5 2.5L16 9"
            stroke="#22c55e"
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
            color: "#22c55e",
          }}
        >
          Order Submitted!
        </h1>
        <p style={{ color: "#166534", marginBottom: 22, fontWeight: 500 }}>
          Thank you for your order.
          <br />
          We'll review your project details and get back to you via email with a
          custom offer within the hour.
        </p>
        <Link
          href="/"
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
          Go to Home
        </Link>
        {user && (
          <Link
            href="/user/dashboard"
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
            Dashboard
          </Link>
        )}
        <Link
          href="/order"
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
          Place Another Order
        </Link>
      </div>
    </div>
  );
}
