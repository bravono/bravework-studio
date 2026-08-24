"use client";

import React from "react";
import {
  Clock,
  Calendar,
  Github,
  DollarSign,
  User,
  Activity,
  CheckCircle,
  Eye,
} from "lucide-react";
import Modal from "@/app/components/Modal";
import { Course } from "@/app/types/app";
import { KOBO_PER_NAIRA } from "@/lib/constants";
import { format } from "date-fns";

interface CoursePreviewModalProps {
  course: Course | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function CoursePreviewModal({
  course,
  isOpen,
  onClose,
  onEdit,
}: CoursePreviewModalProps) {
  if (!isOpen || !course) return null;

  const formattedPrice =
    course.price === 0
      ? "Free"
      : `₦${(course.price / KOBO_PER_NAIRA).toLocaleString()}`;

  const formattedStartDate = course.startDate
    ? format(new Date(course.startDate), "PPP")
    : "TBD";
  const formattedEndDate = course.endDate
    ? format(new Date(course.endDate), "PPP")
    : "TBD";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Course Preview">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Banner/Header */}
        <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-gray-100 border border-gray-250 shadow-sm">
          {course.thumbnailUrl ? (
            <img
              src={course.thumbnailUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              <Eye size={48} />
            </div>
          )}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-indigo-600 text-white text-[10px] font-black uppercase tracking-wider rounded-full shadow">
              {course.category || "Academy"}
            </span>
            <span className="px-3 py-1 bg-white/90 text-gray-800 text-[10px] font-bold uppercase tracking-wider rounded-full shadow">
              {course.level}
            </span>
          </div>
        </div>

        {/* Title & Price */}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-2xl font-black text-gray-900 dark:text-white capitalize">
              {course.title}
            </h3>
            <p className="text-xs text-gray-500 mt-1">ID: #{course.id}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
              {formattedPrice}
            </p>
            <p className="text-[10px] font-bold text-gray-400 uppercase">Tuition Fee</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Quick Specs
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Duration: {course.duration || "N/A"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Start: {formattedStartDate}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  End: {formattedEndDate}
                </span>
              </div>
              {course.software && course.software.length > 0 && (
                <div className="flex items-center gap-2">
                  <Github size={16} className="text-indigo-500" />
                  <span className="text-gray-700 dark:text-gray-300 truncate">
                    Software: {course.software.map((s) => s.name).join(", ")}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-xl border border-gray-100 dark:border-gray-800 space-y-3">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Status & Config
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Active: {course.isActive ? "Yes" : "No (Draft)"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={16} className="text-green-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Published: {course.isPublished ? "Approved" : "Pending Approval"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <User size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300 truncate">
                  Instructor: {course.instructor || "Ahbideen Yusuf"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-indigo-500" />
                <span className="text-gray-700 dark:text-gray-300">
                  Max Students: {course.maxStudents || "Unlimited"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Description
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            {course.description || "No description provided."}
          </p>
        </div>

        {/* Syllabus / Content */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Syllabus (Curriculum)
          </h4>
          <div className="ql-snow bg-gray-50 dark:bg-gray-900/30 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
            <div
              className="ql-editor !p-0 text-sm prose prose-indigo max-w-none text-gray-700 dark:text-gray-300"
              dangerouslySetInnerHTML={{
                __html: course.content || "<p className='italic text-gray-400'>Syllabus outline not specified.</p>",
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all"
            >
              Edit Course
            </button>
          )}
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-all"
          >
            Close Preview
          </button>
        </div>
      </div>
    </Modal>
  );
}
