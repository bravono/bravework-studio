"use client";
import { useMemo } from "react";
import ActiveCourseForm from "./ActiveCourseForm";
import InactiveCourseForm from "./InactiveCourseForm";

export default function NewsletterPage() {
  const isActive = useMemo(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      return params.get("isActive") === "true";
    }
    return false;
  }, []);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Newsletter Signup</h1>
      {isActive ? <ActiveCourseForm /> : <InactiveCourseForm />}
    </div>
  );
}
