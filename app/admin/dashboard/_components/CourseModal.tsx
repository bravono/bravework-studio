"use client";

import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { Course } from "../../../types/app";
import Modal from "@/app/components/Modal";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import { FileUpIcon } from "lucide-react";

interface CourseModalProps {
  onClose: () => void;
  existingCourse?: Course;
  onCourseUpdated: () => void;
}

export default function CourseModal({
  existingCourse,
  onClose,
  onCourseUpdated,
}: CourseModalProps) {
  const KOBO_PER_NAIRA = 100;
  const labelStyle = "flex items-center text-sm font-medium text-gray-700 mb-1";
  const [title, setTitle] = useState<string>(existingCourse?.title || "");
  const [price, setPrice] = useState<number>(existingCourse?.price || 0);
  const [description, setDescription] = useState<string>(
    existingCourse?.description || ""
  );
  const [startDate, setStartDate] = useState<string>(
    existingCourse?.startDate || ""
  );
  const [endDate, setEndDate] = useState<string>(existingCourse?.endDate || "");
  const [instructor, setInstructor] = useState<string>(
    existingCourse?.firstName + existingCourse?.lastName || ""
  );

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
    existingCourse?.language || ""
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

  const [formData, setFormData] = useState({
    title: existingCourse?.title || "",
    price_in_kobo: existingCourse?.price || 0,
    description: existingCourse?.description || "",
    start_date: existingCourse?.startDate || null,
    end_date: existingCourse?.endDate || null,
    instructor: existingCourse?.firstName + existingCourse?.lastName || "",
    is_active: existingCourse?.isActive || false,
    max_students: existingCourse?.maxStudents || 0,
    thumbnail_url: existingCourse?.thumbnailUrl || "",
    course_category: existingCourse?.category || "",
    level: existingCourse?.level || "",
    language: existingCourse?.language || "",
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (existingCourse) {
      setFormData({
        title: existingCourse.title,
        price_in_kobo: existingCourse.price,
        description: existingCourse.description,
        start_date: existingCourse.startDate,
        end_date: existingCourse.endDate,
        instructor: existingCourse.firstName + existingCourse.lastName,
        is_active: existingCourse.isActive,
        max_students: existingCourse.maxStudents,
        thumbnail_url: existingCourse.thumbnailUrl,
        course_category: existingCourse.category,
        level: existingCourse.level,
        language: existingCourse.language,
      });
    } else {
      setFormData({
        title: "",
        price_in_kobo: 0,
        description: "",
        start_date: "",
        end_date: "",
        instructor: "",
        is_active: false,
        max_students: 0,
        thumbnail_url: "",
        course_category: "",
        level: "Beginner",
        language: "",
      });
    }
  }, [existingCourse]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSubmitStatus("idle");

    // Prepare file upload if a file is selected
    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      try {
        formData.append("category", "course");

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

    try {
      const method = existingCourse ? "PATCH" : "POST";
      const url = existingCourse
        ? `/api/admin/courses/${existingCourse?.id}`
        : "/api/admin/courses";
      const body = {
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
      };

      console.log("ID", existingCourse?.id);
      console.log("URL", url);
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      console.log("Response", res);
      if (!res.ok) throw new Error(`Failed to update course.`);

      toast.success(`Course "updated" successfully!`);
      onCourseUpdated?.();
      onClose(); // Close the modal
    } catch (err: any) {
      console.error("Error saving course:", err.message);
      setError(err.message || "Failed to save course.");
    } finally {
      setLoading(false);
    }
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
    <>
      <Modal
        isOpen={true}
        onClose={onClose}
        title={existingCourse ? "Edit Course" : "Create Course"}
      >
        {
          <form onSubmit={handleSubmit} className="p-4 space-y-6">
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
            <label htmlFor="coursePrice" className={labelStyle}>
              ₦ Price
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
            <label htmlFor="startDate" className={labelStyle}>
              Start Date
            </label>
            <input
              type="datetime-local"
              id="startDate"
              value={
                existingCourse
                  ? new Date(startDate).toISOString().split("T")[0]
                  : startDate
              }
              onChange={(e) => setStartDate(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <label className="block"></label>
            <label htmlFor="endDate" className={labelStyle}>
              End Date
            </label>
            <input
              type="datetime-local"
              id="endDate"
              value={
                existingCourse
                  ? new Date(endDate).toISOString().split("T")[0]
                  : endDate
              }
              onChange={(e) => setEndDate(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            <label htmlFor="instructor" className={labelStyle}>
              Instructor
            </label>
            <select
              id="instructor"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              required
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled selected>
                Select an instructor
              </option>
              <option value="Ahbideen Yusuf">Ahbideen Yusuf</option>
              <option value="Adeshina Atanda">Adeshina Atanda</option>
            </select>

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
            <label htmlFor="category" className={labelStyle}>
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="" disabled selected>
                Select a category
              </option>
              <option value="3D Animation">3D Animation</option>
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
              <option value="" disabled selected>
                Select course level
              </option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advance">Advance</option>
            </select>
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
              <option value="" disabled selected>
                Select a language
              </option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Thumbnail
              </label>
              <div className="relative border-2 border-dashed border-gray-300 rounded-md p-6 text-center transition-colors duration-200 hover:border-gray-400">
                <input
                  type="file"
                  id="resume"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx"
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
                  {
                    <small className="mt-1 text-xs text-gray-400">
                      Accepted formats: Webp
                    </small>
                  }
                </div>
              </div>
            </div>

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
                onClick={() => setIsConfirmationOpen(true)}
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
        isOpen={isConfirmationOpen}
        message="Successfully created Course"
        onCancel={() => setIsConfirmationOpen(false)}
        onConfirm={() => setIsConfirmationOpen(false)}
      />
    </>
  );
}
