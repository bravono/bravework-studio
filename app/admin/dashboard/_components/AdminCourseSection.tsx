"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { PlusCircle, Edit, Trash2, Search } from "lucide-react";

import ConfirmationModal from "@/app/components/ConfirmationModal";
import CourseModal from "../../../components/CourseModal";
import { Course } from "@/app/types/app";
import { KOBO_PER_NAIRA } from "@/lib/constants";
import Pagination from "@/app/components/Pagination";

export default function AdminCourseSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const coursesPerPage = 10;

  const { data: session } = useSession();

  // State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const fetchCourses = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/courses");
      if (!res.ok) {
        throw new Error("Failed to fetch courses");
      }
      const data = await res.json();
      setCourses(data);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = (course: Course) => {
    setSelectedCourse(course);
    setIsModalOpen(true);
  };

  const handleDeleteCourseClick = (courseId: string) => {
    setCourseToDelete(courseId);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteCourseConfirm = async () => {
    if (!courseToDelete) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/courses/${courseToDelete}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        throw new Error("Failed to delete course");
      }
      toast.success("Course deleted successfully!");
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  const filteredCourses = useMemo(() => {
    return courses.filter(
      (course) =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [courses, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / coursesPerPage);
  const startIndex = (currentPage - 1) * coursesPerPage;
  const currentCourses = filteredCourses.slice(
    startIndex,
    startIndex + coursesPerPage,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Courses Management
        </h2>
        <button
          onClick={handleCreateCourse}
          className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-xl shadow-md hover:bg-indigo-700 transition-all font-semibold"
        >
          <PlusCircle size={20} className="mr-2" />
          Create New Course
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search by title or instructor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Course Info
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Pricing
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Date Range
                </th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td
                      colSpan={5}
                      className="px-6 py-4 h-16 bg-gray-50/50 dark:bg-gray-800/50"
                    ></td>
                  </tr>
                ))
              ) : currentCourses.length > 0 ? (
                currentCourses.map((course) => (
                  <tr
                    key={course.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {course.title}
                        </p>
                        <p className="text-xs text-gray-500">
                          ID: #{course.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-bold">Instructor:</span>{" "}
                          {course.instructor}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          <span className="font-bold">Language:</span>{" "}
                          {course.language ?? "-"}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {course.price === 0 ? (
                        <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 px-2 py-1 rounded-full text-xs font-bold">
                          Free
                        </span>
                      ) : (
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          ₦{(course.price / KOBO_PER_NAIRA).toLocaleString()}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-500">
                      <p>
                        Start:{" "}
                        {format(new Date(course.startDate), "dd MMM yyyy")}
                      </p>
                      <p>
                        End: {format(new Date(course.endDate), "dd MMM yyyy")}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="p-2 text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-300 rounded-lg hover:bg-blue-100 transition-colors"
                          title="Edit Course"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteCourseClick(course.id)}
                          className="p-2 text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-300 rounded-lg hover:bg-red-100 transition-colors"
                          title="Delete Course"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    No courses found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modals */}
      {isModalOpen && (
        <CourseModal
          existingCourse={selectedCourse}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchCourses}
          userRole="admin"
          currentInstructorName={session?.user?.name || ""}
          currentInstructorId={(session?.user as any)?.id}
        />
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCourseConfirm}
        message={`Are you sure you want to delete course: ${selectedCourse?.title || courseToDelete}? This action cannot be undone.`}
      />
    </div>
  );
}
