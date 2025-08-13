"use client";

import { useState, useEffect } from "react";
import { toast, ToastContainer } from "react-toastify";
import { Nosifer } from "next/font/google";
import Navbar from "../components/Navbar";
import Progress from "../components/Progress";
import FilesToUpload from "../components/FilesToUpload";
import {
  Code,
  Palette,
  Gamepad2,
  Shapes,
  Upload,
  Send,
  FileText,
} from "lucide-react";

const nosifer = Nosifer({ subsets: ["latin"], weight: "400" });

interface JobApplication {
  role: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  portfolio: string;
  experience: string;
  availability: string;
  message: string;
}

export default function JobsPage() {
  const [application, setApplication] = useState<JobApplication>({
    role: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    portfolio: "",
    experience: "",
    availability: "",
    message: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [fileInfo, setFileInfo] = useState<{
    fileName: string;
    fileSize: string;
    fileUrl: string;
  } | null>(null);

  useEffect(() => {
    console.log("Selected file:", file);
  }, [file]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");

    // Prepare file upload if a file is selected
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        formData.append("category", "job_application");

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formData,
          headers: {
            "X-Rename-Duplicate": "true",
          },
        });

        if (response.ok) {
          const blobDataRaw = await response.json();
          const blobData = {
            url: blobDataRaw.url,
            pathname: blobDataRaw.pathname || new URL(blobDataRaw.url).pathname,
            size: blobDataRaw.size || file.size,
          };

          setFileInfo({
            fileName: file.name,
            fileSize: `${(blobData.size / 1024).toFixed(2)} KB`,
            fileUrl: blobData.url,
          });

          toast.success(`File ${file.name} uploaded successfully!`);
        } else {
          const errorData = await response.json();
          toast(`Error uploading ${file.name}`);
          setSubmitStatus("error");
        }
      } catch (err) {
        toast("Error uploading file:", err);
        setSubmitStatus("error");
      }
    }

    const formDataToSend = new FormData();

    const entries = Object.entries(application);
    entries.slice(0, -1).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });

    console.log("File info to send:", fileInfo);
    formDataToSend.append("file", JSON.stringify(fileInfo));

    try {
      const response = await fetch("/api/jobs", {
        method: "POST",
        body: formDataToSend,
      });

      if (response.ok) {
        const data = await response.json();
        toast.success(`Application submitted successfully!`);
        setSubmitStatus("success");
      } else {
        const errorData = await response.json();
        toast.error(
          `Error submitting application: ${
            errorData.message || "Could not submit application"
          }`
        );
        setSubmitStatus("error");
      }
    } catch (error: any) {
      toast.error(`An error occurred: ${error.message || "Unknown error"}`);
    } finally {
      setIsSubmitting(false);
    }

    try {
      const formspreeData = {
        role: application.role,
        firstName: application.firstName,
        lastName: application.lastName,
        email: application.email,
        phone: application.phone,
        portfolio: application.portfolio,
        experience: application.experience,
        availability: application.availability,
        message: application.message,
        // Do not include file
      };

      await fetch("https://formspree.io/f/meokkjyz", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formspreeData),
      });
    } catch (error) {
      // Optionally handle Formspree error
    }

    // setApplication({
    //   role: "",
    //   firstName: "",
    //   lastName: "",
    //   email: "",
    //   phone: "",
    //   portfolio: "",
    //   experience: "",
    //   availability: "",
    //   message: "",
    // });
    // setFile(null);
    // setFileInfo(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile =
      e.target.files && e.target.files[0] ? e.target.files[0] : null;
    setFile(selectedFile);

    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target && typeof event.target.result === "string") {
        setFileInfo({
          fileName: selectedFile.name,
          fileSize: `${(selectedFile.size / 1024).toFixed(2)} KB`,
          fileUrl: event.target.result,
        });
        toast.success(`File ${selectedFile.name} has been attached!`);
      }
    };
    reader.readAsDataURL(selectedFile);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <Navbar />
      <ToastContainer position="bottom-right" theme="colored" />
      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1
            className={`text-5xl font-bold text-gray-900 ${nosifer.className}`}
          >
            Join Our Team
          </h1>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            We're always looking for talented professionals to join our creative
            team. Find your role below and apply!
          </p>
        </div>

        {/* Job Roles Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {/* Web Developer Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl mb-4 inline-block">
              <Code className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Web Developer
            </h3>
            <p className="text-gray-600 text-sm">
              Join us in creating cutting-edge web applications and experiences.
            </p>
            <ul className="mt-4 space-y-2 text-gray-500 text-sm">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                React/Next.js expertise
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                TypeScript proficiency
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                UI/UX best practices
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                API integration
              </li>
            </ul>
          </div>

          {/* UI/UX Designer Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="p-3 bg-pink-100 text-pink-600 rounded-xl mb-4 inline-block">
              <Palette className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              UI/UX Designer
            </h3>
            <p className="text-gray-600 text-sm">
              Help us craft beautiful and intuitive user experiences.
            </p>
            <ul className="mt-4 space-y-2 text-gray-500 text-sm">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Figma/Sketch expertise
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                User research
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Prototyping
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Design systems
              </li>
            </ul>
          </div>

          {/* 3D Artist Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl mb-4 inline-block">
              <Shapes className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">3D Artist</h3>
            <p className="text-gray-600 text-sm">
              Create stunning 3D visuals and animations.
            </p>
            <ul className="mt-4 space-y-2 text-gray-500 text-sm">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Blender/Maya expertise
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Character modeling
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Animation skills
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Texture mapping
              </li>
            </ul>
          </div>

          {/* Game Developer Card */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-200">
            <div className="p-3 bg-yellow-100 text-yellow-600 rounded-xl mb-4 inline-block">
              <Gamepad2 className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Game Developer
            </h3>
            <p className="text-gray-600 text-sm">
              Join us in creating engaging and immersive gaming experiences.
            </p>
            <ul className="mt-4 space-y-2 text-gray-500 text-sm">
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Unity/Unreal Engine expertise
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Game mechanics design
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Performance optimization
              </li>
              <li className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-500" />
                Cross-platform development
              </li>
            </ul>
          </div>
        </div>

        {/* Application Form Section */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 lg:p-12 max-w-4xl mx-auto border border-gray-200">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
            Apply Now
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Role */}
              <div className="flex flex-col">
                <label
                  htmlFor="role"
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  Role
                </label>
                <select
                  id="role"
                  value={application.role}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      role: e.target.value,
                    }))
                  }
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">Select a role</option>
                  <option value="frontend-developer">Frontend Developer</option>
                  <option value="backend-developer">Backend Developer</option>
                  <option value="full-stack-developer">
                    Full Stack Developer
                  </option>
                  <option value="ui-ux-designer">UI/UX Designer</option>
                  <option value="3d-artist">3D Artist</option>
                  <option value="game-developer">Game Developer</option>
                </select>
              </div>

              {/* First Name */}
              <div className="flex flex-col">
                <label
                  htmlFor="firstName"
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  First Name
                </label>
                <input
                  type="text"
                  id="firstName"
                  value={application.firstName}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      firstName: e.target.value,
                    }))
                  }
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Last Name */}
              <div className="flex flex-col">
                <label
                  htmlFor="lastName"
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastName"
                  value={application.lastName}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      lastName: e.target.value,
                    }))
                  }
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col">
                <label
                  htmlFor="email"
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={application.email}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Phone */}
              <div className="flex flex-col">
                <label
                  htmlFor="phone"
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={application.phone}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Portfolio URL */}
              <div className="flex flex-col">
                <label
                  htmlFor="portfolio"
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  Portfolio URL
                </label>
                <input
                  type="url"
                  id="portfolio"
                  value={application.portfolio}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      portfolio: e.target.value,
                    }))
                  }
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                />
              </div>

              {/* Years of Experience */}
              <div className="flex flex-col">
                <label
                  htmlFor="experience"
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  Years of Experience
                </label>
                <select
                  id="experience"
                  value={application.experience}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      experience: e.target.value,
                    }))
                  }
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">Select experience level</option>
                  <option value="0-2">0-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="5-8">5-8 years</option>
                  <option value="8+">8+ years</option>
                </select>
              </div>

              {/* Availability */}
              <div className="flex flex-col">
                <label
                  htmlFor="availability"
                  className="mb-2 text-sm font-medium text-gray-700"
                >
                  Availability
                </label>
                <select
                  id="availability"
                  value={application.availability}
                  onChange={(e) =>
                    setApplication((prev) => ({
                      ...prev,
                      availability: e.target.value,
                    }))
                  }
                  required
                  className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                >
                  <option value="">Select availability</option>
                  <option value="full-time">Full Time</option>
                  <option value="part-time">Part Time</option>
                  <option value="contract">Contract</option>
                  <option value="freelance">Freelance</option>
                </select>
              </div>
            </div>

            {/* Resume/CV Upload */}
            <div className="flex flex-col">
              <label
                htmlFor="resume"
                className="mb-2 text-sm font-medium text-gray-700"
              >
                Resume/CV
              </label>
              <div className="relative border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:bg-gray-50 transition-colors duration-200">
                <input
                  type="file"
                  id="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
                  required
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center space-y-2">
                  <Upload className="w-12 h-12 text-gray-400" />
                  <p className="text-gray-600">
                    Drag and drop your resume here or{" "}
                    <span className="text-blue-600 font-medium">
                      click to browse
                    </span>
                  </p>
                  <small className="text-gray-400">
                    Accepted formats: PDF, DOC, DOCX
                  </small>
                </div>
              </div>
            </div>
            {file && isSubmitting && !fileInfo ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-700">Uploading file...</span>
                <Progress value={0} />
              </div>
            ) : file && isSubmitting && fileInfo ? (
              <div className="flex items-center space-x-4">
                <span className="text-green-600">File Uploaded</span>
                <Progress value={100} />
              </div>
            ) : null}
            {file && (
              <FilesToUpload
                files={file}
                removeFile={() => {
                  setFile(null);
                  setFileInfo(null);
                }}
              />
            )}

            {/* Cover Letter */}
            <div className="flex flex-col">
              <label
                htmlFor="message"
                className="mb-2 text-sm font-medium text-gray-700"
              >
                Cover Letter
              </label>
              <textarea
                id="message"
                value={application.message}
                onChange={(e) =>
                  setApplication((prev) => ({
                    ...prev,
                    message: e.target.value,
                  }))
                }
                rows={5}
                required
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-lg font-bold text-base bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.96l2.1-.291z"
                    ></path>
                  </svg>
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>

            {/* Status Messages */}
            {submitStatus === "success" && (
              <div className="mt-4 p-4 text-center bg-green-100 text-green-700 rounded-lg">
                Thank you for your application! We'll review it and get back to
                you soon.
              </div>
            )}
            {submitStatus === "error" && (
              <div className="mt-4 p-4 text-center bg-red-100 text-red-700 rounded-lg">
                There was an error submitting your application. Please try
                again.
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
