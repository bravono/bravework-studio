"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Users, 
  BookOpen, 
  Calendar, 
  PlusCircle, 
  Edit3, 
  BarChart3,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { toast } from "react-toastify";
import { format } from "date-fns";
import Loader from "@/app/components/Loader";
import CourseModal from "@/app/components/CourseModal";
import { Course } from "@/app/types/app";
import { cn } from "@/lib/utils/cn";

interface Stats {
  totalEnrollments: number;
  totalCourses: number;
  activeCourses: number;
}

interface CohortCourse {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  isPublished: boolean;
  maxStudents: number;
  studentCount: number;
}

interface InstructorAcademySectionProps {
  instructorId: string | number;
  instructorName: string;
}

export default function InstructorAcademySection({ 
  instructorId, 
  instructorName 
}: InstructorAcademySectionProps) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [presentCohorts, setPresentCohorts] = useState<CohortCourse[]>([]);
  const [pastCohorts, setPastCohorts] = useState<CohortCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/instructor/stats");
      if (!res.ok) throw new Error("Failed to fetch statistics");
      const data = await res.json();
      setStats(data.stats);
      setPresentCohorts(data.presentAndFutureCohorts);
      setPastCohorts(data.pastCohorts);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsModalOpen(true);
  };

  const handleEditCourse = async (courseId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/instructor/courses/${courseId}`);
      if (!res.ok) throw new Error("Failed to fetch course details");
      const courseData = await res.json();
      setSelectedCourse(courseData);
      setIsModalOpen(true);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !stats) return <Loader user="user" />;

  const StatCard = ({ icon: Icon, label, value, colorClass }: any) => (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center space-x-4">
      <div className={cn("p-3 rounded-xl", colorClass)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">{label}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      </div>
    </div>
  );

  const CohortTable = ({ title, courses, type }: { title: string; courses: CohortCourse[]; type: "present" | "past" }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
          {type === "present" ? <Clock className="w-5 h-5 text-green-500" /> : <CheckCircle2 className="w-5 h-5 text-gray-400" />}
          {title}
        </h3>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
          {courses.length} Courses
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50 dark:bg-gray-800/50">
            <tr>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Course</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date Range</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Enrollment</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {courses.length > 0 ? (
              courses.map((course) => (
                <tr key={course.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-gray-900 dark:text-white">{course.title}</p>
                    <p className="text-xs text-gray-500">ID: {course.id}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {course.startDate ? format(new Date(course.startDate), "MMM d, yyyy") : "N/A"} - 
                      <br />
                      {course.endDate ? format(new Date(course.endDate), "MMM d, yyyy") : "N/A"}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 max-w-[100px]">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${Math.min((course.studentCount / (course.maxStudents || 1)) * 100, 100)}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {course.studentCount}/{course.maxStudents || "∞"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        course.isActive ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                      )}>
                        {course.isActive ? "Active" : "Draft"}
                      </span>
                      <span className={cn(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                        course.isPublished ? "bg-blue-100 text-blue-700" : "bg-orange-100 text-orange-700"
                      )}>
                        {course.isPublished ? "Approved" : "Pending Approval"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => handleEditCourse(course.id)}
                      className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                    >
                      <Edit3 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                  No courses found in this category.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Academy Dashboard</h2>
          <p className="text-gray-500 dark:text-gray-400">Welcome back, {instructorName}. Manage your courses and track performance.</p>
        </div>
        <button 
          onClick={handleCreateCourse}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-green-200 dark:shadow-none transition-all hover:scale-105 active:scale-95"
        >
          <PlusCircle className="w-5 h-5" />
          Create New Course
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatCard 
            icon={Users} 
            label="Total Students" 
            value={stats.totalEnrollments} 
            colorClass="bg-blue-100 text-blue-600" 
          />
          <StatCard 
            icon={BookOpen} 
            label="Managed Courses" 
            value={stats.totalCourses} 
            colorClass="bg-purple-100 text-purple-600" 
          />
          <StatCard 
            icon={BarChart3} 
            label="Active Courses" 
            value={stats.activeCourses} 
            colorClass="bg-green-100 text-green-600" 
          />
        </div>
      )}

      <div className="space-y-8">
        <CohortTable title="Present & Future Cohorts" courses={presentCohorts} type="present" />
        <CohortTable title="Past Cohorts" courses={pastCohorts} type="past" />
      </div>

      {isModalOpen && (
        <CourseModal
          onClose={() => setIsModalOpen(false)}
          existingCourse={selectedCourse}
          onSave={fetchStats}
          userRole="instructor"
          currentInstructorName={instructorName}
          currentInstructorId={instructorId as any}
        />
      )}
    </div>
  );
}
