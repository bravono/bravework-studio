import React, { useState } from "react";

export default function ActiveCourseForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setStatus("Submitting...");

    // NOTE: This fetch call targets a mock path "/api/subscribe"
    // In a real application, you must ensure this API endpoint is configured.
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        body: JSON.stringify({ email, name, isActive: "true" }),
        headers: { "Content-Type": "application/json" },
      });

      // Mocking the response for demonstration since the API path isn't live
      const data = {
        message: res.ok
          ? `Success! Welcome, ${name}.`
          : "Subscription failed. Please try again.",
      };

      setStatus(data.message);
    } catch (error) {
      console.error("Submission error:", error);
      setStatus("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  // Determine status color for visual feedback
  const getStatusColor = () => {
    if (status.toLowerCase().includes("success")) return "text-green-600";
    if (status.toLowerCase().includes("submitting")) return "text-blue-500";
    if (
      status.toLowerCase().includes("error") ||
      status.toLowerCase().includes("failed")
    )
      return "text-red-600";
    return "text-gray-500";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <h2 className="text-3xl font-extrabold text-center text-blue-600 tracking-tight">
        Join the Active Course
      </h2>
      <p className="text-center text-gray-500">
        Enter your details to get instant access.
      </p>

      {/* Name Input */}
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Full Name
        </label>
        <input
          id="name"
          type="text"
          placeholder="e.g., Ade Shina"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm text-gray-800"
          aria-label="Your full name"
          disabled={isLoading}
        />
      </div>

      {/* Email Input */}
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Email Address
        </label>
        <input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 shadow-sm text-gray-800"
          aria-label="Your email address"
          disabled={isLoading}
        />
      </div>

      {/* Submission Button */}
      <button
        type="submit"
        className={`w-full py-3 px-4 rounded-lg text-white font-bold text-lg shadow-lg transition duration-200 focus:outline-none focus:ring-4 focus:ring-blue-300 ${
          isLoading
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
        }`}
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin h-5 w-5 mr-3 text-white"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Joining...
          </span>
        ) : (
          "Join Now"
        )}
      </button>

      {/* Status Message */}
      {status && (
        <p
          className={`text-center font-medium mt-4 ${getStatusColor()} transition-colors duration-300`}
        >
          {status}
        </p>
      )}
    </form>
  );
}
