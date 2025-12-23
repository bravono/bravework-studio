"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "react-toastify";
import { useSession } from "next-auth/react";

import { format } from "date-fns";
import {
  PlusCircle,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

import Loader from "@/app/components/Loader";
import ConfirmationModal from "@/app/components/ConfirmationModal";
import CourseModal from "../../../components/CourseModal";
import { Course } from "@/app/types/app";
import { cn } from "@/lib/utils/cn";
import { KOBO_PER_NAIRA } from "@/lib/constants";


// Main CourseTab component
export default function AdminCourseSection() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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

  // Pagination logic
  const indexOfLastCourse = currentPage * coursesPerPage;
  const indexOfFirstCourse = indexOfLastCourse - coursesPerPage;
  const currentCourses = useMemo(
    () => courses.slice(indexOfFirstCourse, indexOfLastCourse),
    [courses, indexOfFirstCourse, indexOfLastCourse]
  );
  const totalPages = Math.ceil(courses.length / coursesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

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
      toast.success("course deleted successfully!");
      fetchCourses();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
      setIsDeleteModalOpen(false);
      setCourseToDelete(null);
    }
  };

  if (isLoading) {
    return <Loader user={"admin"} />;
  }

  return (
    <div className="space-y-6 p-4 md:p-6 lg:p-8 bg-gray-100 rounded-xl shadow-lg">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
          Courses Management
        </h2>
        <button
          onClick={handleCreateCourse}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors font-semibold"
        >
          <PlusCircle size={20} className="mr-2" />
          Create New Course
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded-lg shadow-inner">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Course ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Instructor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tags
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Language
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Start Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                End Date
              </th>
              <th className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCourses.length > 0 ? (
              currentCourses.map((course) => (
                <tr
                  key={course.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {course.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {course.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.instructor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.isActive ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {/* {Array.isArray(course.tags)
                ? course.tags.join(", ")
                : course.tags ?? "-"} */}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {course.language ?? "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {course.price === 0
                      ? "Free"
                      : "₦" + (course.price / KOBO_PER_NAIRA).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(course.startDate), "dd MMM yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(course.endDate), "dd MMM yyyy")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEditCourse(course)}
                      className="text-blue-600 hover:text-blue-900 transition-colors mr-3"
                      title="Edit Course"
                    >
                      <Edit size={18} />
                    </button>
                    <button
                      onClick={() => handleDeleteCourseClick(course.id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                      title="Delete Course"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={10}
                  className="px-6 py-4 text-center text-gray-500"
                >
                  No courses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center space-x-2 mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={cn(
                "px-4 py-2 rounded-md font-semibold transition-colors",
                currentPage === index + 1
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 hover:bg-gray-100"
              )}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-md bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 disabled:opacity-50 transition-colors"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Modals */}
      {isModalOpen && (
        <CourseModal
          existingCourse={selectedCourse}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchCourses}
          userRole="admin"
          currentInstructorName={session?.user?.name}
          currentInstructorId={session.user.id}
        />
      )}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onCancel={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteCourseConfirm}
        message={`Are you sure you want to delete offer ID: ${courseToDelete}? This action cannot be undone.`}
      />
    </div>
  );
}
