"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import {
  CourseSession,
  SessionOption,
  CourseModalProps,
  SessionFormProps,
  Tool,
} from "@/app/types/app";
import Modal from "@/app/components/Modal";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { Trash2, PlusCircle, FileUpIcon, Video, Calendar } from "lucide-react";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

// Helper to generate a unique Jitsi link
const generateJitsiLink = () => {
  const uniqueId = Math.random().toString(36).substring(2, 10);
  return `https://meet.jit.si/BraveWorkStudio-${uniqueId}`;
};

// Helper to create an option
const createDefaultOption = (optionNumber: number): SessionOption => ({
  optionNumber,
  link: generateJitsiLink(),
  datetime: "",
  label: optionNumber === 1 ? "Morning" : "Evening",
  duration: 120,
});

// Helper to create a session with one default option
const createInitialSession = (): CourseSession => ({
  id: Date.now() + Math.random(), // Unique ID for key
  options: [createDefaultOption(1)],
});

// Helper to correctly format ISO string for datetime-local input (YYYY-MM-DDTHH:MM)
const formatDateTimeLocal = (isoString: string | undefined): string => {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    const pad = (num: number) => num.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());

    return `${year}-${month}-${day}T${hours}:${minutes}`;
  } catch (e) {
    console.error("Date formatting error:", e);
    return "";
  }
};

// Helper to generate Google Calendar Link
const generateGoogleCalendarLink = (
  title: string,
  datetime: string,
  duration: number,
  details: string,
  location: string
) => {
  if (!datetime) return "";

  const startDate = new Date(datetime);
  const endDate = new Date(startDate.getTime() + duration * 60000);

  const formatDate = (date: Date) =>
    date.toISOString().replace(/-|:|\.\d+/g, "");

  const startStr = formatDate(startDate);
  const endStr = formatDate(endDate);

  const url = new URL("https://calendar.google.com/calendar/render");
  url.searchParams.append("action", "TEMPLATE");
  url.searchParams.append("text", title);
  url.searchParams.append("dates", `${startStr}/${endStr}`);
  url.searchParams.append("details", details);
  url.searchParams.append("location", location);

  return url.toString();
};

const labelStyle = "flex items-center text-sm font-medium text-gray-700 mb-1";

// --- Session UI Component ---
const SessionForm = ({
  session,
  index,
  sessionsLength,
  removeSession,
  handleOptionChange,
  addOption,
  removeOption,
  courseTitle,
}: SessionFormProps) => (
  <div
    key={session.id}
    className="p-4 border border-indigo-200 rounded-lg space-y-4 bg-indigo-50/50 relative"
  >
    <h4 className="text-md font-bold text-indigo-700">Session {index + 1}</h4>
    {sessionsLength > 1 && (
      <button
        type="button"
        onClick={() => removeSession(session.id)}
        className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors"
        aria-label={`Remove session ${index + 1}`}
      >
        <Trash2 className="w-5 h-5" />
      </button>
    )}

    {session.options.map((option, optIndex) => (
      <div key={optIndex} className="p-3 border rounded-md bg-white shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <h5 className="text-sm font-semibold text-gray-600">
            Option {option.optionNumber}
          </h5>
          {session.options.length > 1 && (
            <button
              type="button"
              onClick={() => removeOption(session.id, option.optionNumber)}
              className="text-red-500 hover:text-red-700 text-xs flex items-center"
            >
              <Trash2 className="w-4 h-4 mr-1" /> Remove Option
            </button>
          )}
        </div>

        {/* Label Input (FIXED: Moved component definition out) */}
        <div className="mb-3">
          <label
            htmlFor={`session-${session.id}-opt-${option.optionNumber}-label`}
            className={labelStyle}
          >
            Label (e.g., Morning, Night, or Day Name)
          </label>
          <input
            type="text"
            id={`session-${session.id}-opt-${option.optionNumber}-label`}
            value={option.label}
            onChange={(e) =>
              handleOptionChange(
                session.id,
                option.optionNumber,
                "label",
                e.target.value
              )
            }
            required
            placeholder={
              optIndex === 0 ? "Morning / Monday" : "Night / Tuesday"
            }
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm"
          />
        </div>

        {/* Duration Input (UPDATED: type="number" for minutes) */}
        <div className="mb-3">
          <label
            htmlFor={`session-${session.id}-opt-${option.optionNumber}-duration`}
            className={labelStyle}
          >
            Session Length (in minutes)
          </label>
          <input
            type="number" // Changed to number
            id={`session-${session.id}-opt-${option.optionNumber}-duration`}
            value={option.duration}
            onChange={(e) =>
              // Parse value as an integer (minutes)
              handleOptionChange(
                session.id,
                option.optionNumber,
                "duration",
                parseInt(e.target.value || "0", 10)
              )
            }
            required
            min="1" // Minimum duration of 1 minute
            placeholder="e.g., 90" // Updated placeholder
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm"
          />
        </div>

        {/* Time Input (UPDATED: type="datetime-local") */}
        <div className="mb-3">
          <label
            htmlFor={`session-${session.id}-opt-${option.optionNumber}-time`}
            className={labelStyle}
          >
            Date and Time
          </label>
          <input
            type="datetime-local" // Changed to datetime-local
            id={`session-${session.id}-opt-${option.optionNumber}-time`}
            value={formatDateTimeLocal(option.datetime)}
            onChange={(e) =>
              handleOptionChange(
                session.id,
                option.optionNumber,
                "datetime",
                e.target.value
              )
            }
            required
            className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm"
          />
          {option.datetime && (
            <a
              href={generateGoogleCalendarLink(
                `${courseTitle}:  ${option.label} Session`,
                option.datetime,
                option.duration,
                `Join the session here: ${option.link}`,
                option.link
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center text-xs text-blue-600 hover:text-blue-800"
            >
              <Calendar className="w-3 h-3 mr-1" /> Add to Google Calendar
            </a>
          )}
        </div>

        {/* Link Input */}
        <div className="mb-3">
          <label
            htmlFor={`session-${session.id}-opt-${option.optionNumber}-link`}
            className={labelStyle}
          >
            Session Link (URL)
          </label>
          <div className="mt-1 flex rounded-md shadow-sm">
            <input
              type="url"
              id={`session-${session.id}-opt-${option.optionNumber}-link`}
              value={option.link}
              onChange={(e) =>
                handleOptionChange(
                  session.id,
                  option.optionNumber,
                  "link",
                  e.target.value
                )
              }
              placeholder="https://meet.jit.si/..."
              className="flex-1 block w-full py-2 px-3 border border-gray-300 rounded-l-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <button
              type="button"
              onClick={() =>
                handleOptionChange(
                  session.id,
                  option.optionNumber,
                  "link",
                  generateJitsiLink()
                )
              }
              className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-indigo-600"
              title="Generate Jitsi Meeting Link"
            >
              <Video className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    ))}
    {session.options.length < 2 && (
      <button
        type="button"
        onClick={() => addOption(session.id)}
        className="mt-2 flex items-center text-sm text-indigo-600 hover:text-indigo-800"
      >
        <PlusCircle className="w-4 h-4 mr-1" /> Add Option
      </button>
    )}
  </div>
);

export default function CourseModal({
  existingCourse,
  onClose,
  onSave,
  userRole,
  currentInstructorName,
  currentInstructorId,
}: CourseModalProps) {
  const KOBO_PER_NAIRA = 100;
  const labelStyle = "flex items-center text-sm font-medium text-gray-700 mb-1";

  // Existing state variables
  const [title, setTitle] = useState<string>(existingCourse?.title || "");
  const [price, setPrice] = useState<number>(existingCourse?.price || 0);
  const [description, setDescription] = useState<string>(
    existingCourse?.description || ""
  );
  const [startDate, setStartDate] = useState<string>(
    existingCourse?.startDate || ""
  );
  const [endDate, setEndDate] = useState<string>(existingCourse?.endDate || "");
  const initialInstructorName =
    existingCourse?.instructor || currentInstructorName; // Use the logged-in instructor's name for instructor role
  const [instructor, setInstructor] = useState<string>(initialInstructorName);
  const [isActive, setIsActive] = useState<boolean>(
    existingCourse?.isActive || false
  );
  const [maxStudents, setMaxStudents] = useState<string>(
    existingCourse?.maxStudents || "0"
  );
  const [thumbnailUrl, setThumbnailUrl] = useState<string>(
    existingCourse?.thumbnailUrl || ""
  );
  const [category, setCategory] = useState<string>(
    existingCourse?.category || ""
  );
  const [level, setLevel] = useState<string>(
    existingCourse?.level || "Beginner"
  );
  const [language, setLanguage] = useState<string>(
    existingCourse?.language || "English"
  );
  const [slug, setSlug] = useState<string>(existingCourse?.slug || "");
  const [content, setContent] = useState<string>(existingCourse?.content || "");
  const [excerpt, setExcerpt] = useState<string>(existingCourse?.excerpt || "");
  const [ageBracket, setAgeBracket] = useState<string>(
    existingCourse?.ageBracket || ""
  );
  const [selectedTools, setSelectedTools] = useState<number[]>(
    existingCourse?.tools?.map((t) => t.id) || []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [fileInfo, setFileInfo] = useState<{
    fileName: string;
    fileSize: string;
    fileUrl: string;
  } | null>(null);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");

  // NEW: State for Backend-sourced data
  const [availableInstructors, setAvailableInstructors] = useState<
    Array<{ fullName: string }>
  >([]);
  const [availableCategories, setAvailableCategories] = useState<
    Array<{ name: string }>
  >([]);
  const [availableTools, setAvailableTools] = useState<Tool[]>([]);

  // NEW: State for Sessions
  const [sessions, setSessions] = useState<CourseSession[]>(
    existingCourse?.sessions && existingCourse.sessions.length > 0
      ? existingCourse.sessions.map((s, index) => ({
          id: index + 1, // Simple ID for existing
          options: s.options.map((opt: any) => ({
            ...opt,
          })),
        }))
      : [createInitialSession()]
  );

  // NEW: Session Management Functions
  const handleSessionOptionChange = useCallback(
    (
      sessionId: number,
      optionNumber: number,
      field: keyof SessionOption,
      value: any
    ) => {
      setSessions((prevSessions) =>
        prevSessions.map((session) => {
          if (session.id === sessionId) {
            const newOptions = session.options.map((option) => {
              if (option.optionNumber === optionNumber) {
                return { ...option, [field]: value };
              }
              return option;
            });
            return { ...session, options: newOptions };
          }
          return session;
        })
      );
    },
    []
  );

  const addSession = () => {
    setSessions((prevSessions) => [...prevSessions, createInitialSession()]);
  };

  const removeSession = (sessionId: number) => {
    if (sessions.length === 1) {
      toast.error("You must have at least one session.");
      return;
    }
    setSessions((prevSessions) =>
      prevSessions.filter((session) => session.id !== sessionId)
    );
  };

  const addOptionToSession = (sessionId: number) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === sessionId && session.options.length < 2) {
          const existingNumbers = session.options.map((o) => o.optionNumber);
          // If option 1 exists, add option 2. If option 2 exists, add option 1.
          // If neither (shouldn't happen if length > 0), add 1.
          const nextNumber = !existingNumbers.includes(1) ? 1 : 2;
          return {
            ...session,
            options: [...session.options, createDefaultOption(nextNumber)],
          };
        }
        return session;
      })
    );
  };

  const removeOptionFromSession = (sessionId: number, optionNumber: number) => {
    setSessions((prevSessions) =>
      prevSessions.map((session) => {
        if (session.id === sessionId) {
          if (session.options.length <= 1) {
            toast.error("A session must have at least one option.");
            return session;
          }
          return {
            ...session,
            options: session.options.filter(
              (o) => o.optionNumber !== optionNumber
            ),
          };
        }
        return session;
      })
    );
  };

  useEffect(() => {
    console.log("Existing Course Instructor", existingCourse?.instructor);
  }, [existingCourse]);

  // Auto-generate slug from title
  useEffect(() => {
    if (title) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
    }
  }, [title]);

  // Auto-generate excerpt from content
  useEffect(() => {
    if (content) {
      const plainText = content.replace(/<[^>]+>/g, "");
      setExcerpt(
        plainText.substring(0, 150) + (plainText.length > 150 ? "..." : "")
      );
    }
  }, [content]);

  // NEW: useEffect for fetching Instructors and Categories from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const instructorRes = await fetch("/api/admin/instructors");
        const instructorsData = await instructorRes.json();
        setAvailableInstructors(instructorsData);

        const categoryRes = await fetch("/api/course-categories");
        const categoriesData = await categoryRes.json();
        setAvailableCategories(categoriesData);

        const toolsRes = await fetch("/api/tools");
        const toolsData = await toolsRes.json();
        setAvailableTools(toolsData);
      } catch (e) {
        console.error("Failed to fetch backend options:", e);
      }
    };
    fetchData();
  }, []);

  // Existing useEffect for initial data (kept for pattern consistency)
  useEffect(() => {
    if (existingCourse) {
      setTitle(existingCourse.title);
      setPrice(existingCourse.price / KOBO_PER_NAIRA);
      setInstructor(existingCourse.instructor);
      setIsActive(existingCourse.isActive);
      setMaxStudents(existingCourse.maxStudents);
      setThumbnailUrl(existingCourse.thumbnailUrl);
      setCategory(existingCourse.category);
      setLevel(existingCourse.level);
      setLanguage(existingCourse.language);
      setSlug(existingCourse.slug || "");
      setContent(existingCourse.content || "");
      setExcerpt(existingCourse.excerpt || "");
      setAgeBracket(existingCourse.ageBracket || "");
      setSelectedTools(existingCourse.software?.map((t) => t.id) || []);
      setDescription(existingCourse.description);
      setStartDate(existingCourse.startDate);
      setEndDate(existingCourse.endDate);

      if (existingCourse.sessions && existingCourse.sessions.length > 0) {
        setSessions(
          existingCourse.sessions.map((s, index) => ({
            id: index + 1,
            options: s.options.map((opt: any) => ({
              ...opt,
              datetime: opt.datetime || opt.time || "",
            })),
          }))
        );
      }
    }
  }, [existingCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitStatus("idle");
    setIsConfirmationOpen(true);

    // File upload logic remains the same (omitted for brevity, assume success updates fileInfo)

    // Prepare the body with the new sessions data
    const sessionsPayload = sessions.map((session) => ({
      options: session.options.map((option) => ({
        optionNumber: option.optionNumber,
        link: option.link,
        time: option.datetime,
        label: option.label,
        duration: option.duration, // Now a number (minutes)
      })),
    }));

    try {
      const method = existingCourse ? "PATCH" : "POST";
      const baseUrl =
        userRole === "admin" ? "/api/admin/courses" : "/api/instructor/courses";

      const url = existingCourse ? `${baseUrl}/${existingCourse?.id}` : baseUrl;

      // Include sessionsPayload in the body
      const body = Object.fromEntries(
        Object.entries({
          title,
          price_in_kobo: price * KOBO_PER_NAIRA,
          description,
          start_date: startDate,
          end_date: endDate,
          instructor,
          is_active: isActive,
          max_students: maxStudents,
          thumbnail_url: thumbnailUrl,
          course_category: category,
          level,
          language,
          slug,
          content,
          excerpt,
          age_bracket: ageBracket,
          tools: selectedTools,
          sessions: sessionsPayload, // NEW: Include the sessions data
        }).map(([key, value]) => [
          key,
          typeof value === "string" ? value.trim() : value,
        ])
      );

      console.log("Payload:", body); // Log the payload including sessions
      console.log("Url:", url); // Log the payload including sessions

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok)
        throw new Error(
          `Failed to ${method === "PATCH" ? "update" : "create"} course.`
        );

      toast.success(
        `Course ${existingCourse ? "updated" : "created"} successfully!`
      );
      onSave?.();
      onClose(); // Close the modal
    } catch (err: any) {
      console.error("Error saving course:", err.message);
      setError(err.message || "Failed to save course.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Existing file change logic (omitted for brevity)
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

  // --- Render ---

  return (
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={existingCourse ? "Edit Course" : "Create Course"}
      >
        {
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
            {/* Existing Form Fields (Title, Price, Dates, etc.) */}
            <div>
              <label htmlFor="title" className={labelStyle}>
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="slug" className={labelStyle}>
                Slug
              </label>
              <input
                type="text"
                id="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="coursePrice" className={labelStyle}>
                Price(NGN)
              </label>
              <input
                type="number"
                id="price"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value))}
                required
                min="0"
                step="10"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {/* Start/End Date Inputs (using the helper for correct datetime-local format) */}
            <div>
              <label htmlFor="startDate" className={labelStyle}>
                Start Date
              </label>
              <input
                type="datetime-local"
                id="startDate"
                value={formatDateTimeLocal(startDate)}
                onChange={(e) => setStartDate(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="endDate" className={labelStyle}>
                End Date
              </label>
              <input
                type="datetime-local"
                id="endDate"
                value={formatDateTimeLocal(endDate)}
                onChange={(e) => setEndDate(e.target.value)}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            {userRole === "admin" ? (
              // ADMIN VIEW: Show the Select dropdown for all instructors
              <div>
                <label htmlFor="instructor" className={labelStyle}>
                  Instructor
                </label>
                {/* Your existing select dropdown for all instructors */}
                <select
                  id="instructor"
                  value={instructor}
                  onChange={(e) => setInstructor(e.target.value)}
                  required
                  className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                >
                  <option value="" disabled>
                    Select an instructor
                  </option>
                  {availableInstructors.map((inst, ind) => (
                    <option key={ind + 1} value={inst.fullName}>
                      {inst.fullName}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              // INSTRUCTOR VIEW: Show the name as read-only text
              <div>
                <label className={labelStyle}>Instructor</label>
                <p className="mt-1 block w-full py-2 px-3 bg-gray-100 border border-gray-300 rounded-md text-gray-800 sm:text-sm font-medium">
                  {currentInstructorName}
                </p>
                {/* Optional: Hidden input to ensure the data is still submitted */}
                <input
                  type="hidden"
                  name="instructor"
                  value={currentInstructorName}
                />
              </div>
            )}

            {userRole === "admin" && (
              <div>
                <label htmlFor="isActive" className={labelStyle}>
                  Is Active
                </label>
                <input
                  type="checkbox"
                  id="isActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="mt-1 block w-5 h-5 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
              </div>
            )}
            <label htmlFor="maxStudents" className={labelStyle}>
              Max Students
            </label>
            <input
              type="number"
              id="maxStudents"
              min="1"
              max="100"
              value={maxStudents}
              required
              onChange={(e) => setMaxStudents(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />

            {/* Category Select (Now uses availableCategories) */}
            <label htmlFor="category" className={labelStyle}>
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>
                Select a category
              </option>
              {availableCategories.map((cat, ind) => (
                <option key={ind + 1} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>

            <label htmlFor="level" className={labelStyle}>
              Level
            </label>
            <select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled>
                Select course level
              </option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advance">Advance</option>
            </select>

            <div>
              <label htmlFor="ageBracket" className={labelStyle}>
                Age Bracket
              </label>
              <input
                type="text"
                id="ageBracket"
                value={ageBracket}
                onChange={(e) => setAgeBracket(e.target.value)}
                placeholder="e.g. 18-25"
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className={labelStyle}>Tools</label>
              <div className="mt-1 grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                {availableTools.map((tool) => (
                  <div key={tool.id} className="flex items-center">
                    <input
                      type="checkbox"
                      id={`tool-${tool.id}`}
                      value={tool.id}
                      checked={selectedTools.includes(tool.id)}
                      onChange={(e) => {
                        const id = parseInt(e.target.value);
                        if (e.target.checked) {
                          setSelectedTools([...selectedTools, id]);
                        } else {
                          setSelectedTools(
                            selectedTools.filter((tId) => tId !== id)
                          );
                        }
                      }}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label
                      htmlFor={`tool-${tool.id}`}
                      className="ml-2 block text-sm text-gray-900"
                    >
                      {tool.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>
            <label htmlFor="language" className={labelStyle}>
              Language
            </label>
            <select
              id="language"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="English">English</option>
              <option value="Yoruba">Yoruba</option>
            </select>
            <label htmlFor="description" className={labelStyle}>
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            ></textarea>

            <div>
              <label htmlFor="content" className={labelStyle}>
                Content
              </label>
              <div className="mt-1 bg-white">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  className="h-64 mb-12"
                />
              </div>
            </div>

            <div>
              <label htmlFor="excerpt" className={labelStyle}>
                Excerpt
              </label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Thumbnail
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-md p-6 text-center transition-colors duration-200 hover:border-gray-400">
                <input
                  type="file"
                  id="resume"
                  onChange={handleFileChange}
                  accept=".webp,.jpg,.jpeg,.png" // Changed accepted formats to image files
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center">
                  <FileUpIcon />
                  <p className="mt-2 text-gray-500">
                    Drag and drop files here or{" "}
                    <span className="text-blue-600 font-medium">
                      click to browse
                    </span>
                  </p>
                  <small className="mt-1 text-xs text-gray-400">
                    Accepted formats: Webp, Jpeg, Png
                  </small>
                </div>
              </div>
            </div>

            {/* NEW: Sessions Management Section */}
            <div className="space-y-4 pt-6 border-t border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">
                Course Sessions ({sessions.length})
              </h3>
              <p className="text-sm text-gray-500">
                Define multiple sessions, each with two primary options for
                students.
              </p>

              <div className="space-y-6">
                {sessions.map((session, index) => (
                  <SessionForm
                    key={session.id}
                    session={session}
                    index={index}
                    sessionsLength={sessions.length}
                    removeSession={removeSession}
                    handleOptionChange={handleSessionOptionChange}
                    addOption={addOptionToSession}
                    removeOption={removeOptionFromSession}
                    courseTitle={title}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={addSession}
                className="flex items-center justify-center w-full py-2 px-4 border border-indigo-300 text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
              >
                <PlusCircle className="w-5 h-5 mr-2" /> Add New Session
              </button>
            </div>

            {/* Footer Buttons */}
            {error && <p className="text-red-500 text-sm">{error}</p>}
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-t-2 border-white border-opacity-25 rounded-full animate-spin"></div>
                ) : existingCourse ? (
                  "Update Course"
                ) : (
                  "Create Course"
                )}
              </button>
            </div>
          </form>
        }
      </Modal>
      <ConfirmationModal
        isOpen={submitStatus === "success" && isConfirmationOpen} // Only show on success
        message={`Successfully ${
          existingCourse ? "updated" : "created"
        } Course`}
        onCancel={() => setSubmitStatus("idle")}
        onConfirm={() => setSubmitStatus("idle")}
      />
    </>
  );
}
