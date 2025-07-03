"use client";

import { useSearchParams } from "next/navigation";

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const errorMessage = searchParams.get("message") || "An unknown error occurred.";

  return (
    <div>
      <h1>Authentication Error</h1>
      <p style={{ color: "red" }}>{errorMessage}</p>
      <p>
        <a href="/auth/signin">Go to Sign In</a>
      </p>
      <p>
        <a href="/auth/signup">Go to Sign Up</a>
      </p>
    </div>
  );
}