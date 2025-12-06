"use client";

import React, { useState, useEffect } from "react";
import { Course, ExchangeRates } from "app/types/app";
import {
  CheckCircle,
  Circle,
  Download,
  PlayCircle,
  Clock,
  Calendar,
  Loader2,
  Award,
  Video,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";

interface CourseDetailCardProps {
  course: Course;
  selectedCurrency: string;
  exchangeRates: ExchangeRates | null;
}

export default function CourseDetailCard({
  course,
  selectedCurrency,
  exchangeRates,
}: CourseDetailCardProps) {
  const [completedSessions, setCompletedSessions] = useState<Set<number>>(
    new Set()
  );
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [certificateLoading, setCertificateLoading] = useState(false);
  const [isCertificateAvailable, setIsCertificateAvailable] = useState(false);

  // Fetch progress on mount
  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const res = await fetch(`/api/user/courses/${course.id}/progress`);
        if (res.ok) {
          const data = await res.json();
          setCompletedSessions(new Set(data.completedSessions));
          setProgress(data.progressPercentage);
          setIsCertificateAvailable(data.allSessionsComplete);
        }
      } catch (error) {
        console.error("Error fetching progress:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [course.id]);

  const toggleSession = async (sessionId: number) => {
    // Optimistic update
    const isCompleted = completedSessions.has(sessionId);
    const newCompletedSessions = new Set(completedSessions);
    
    if (isCompleted) {
        // If already completed, we don't allow un-completing via this UI for now 
        // or we can allow it if the API supports it. 
        // Assuming the API is a toggle or we only support "complete".
        // The user requirement said "mark sessions as complete".
        // Let's assume we can only mark as complete for now, or check API.
        // History says: "POST /api/user/sessions/[sessionId]/complete".
        // Usually "complete" implies one-way, but let's see.
        return; 
    }

    newCompletedSessions.add(sessionId);
    setCompletedSessions(newCompletedSessions);

    // Calculate new progress locally
    const totalSessions = course.sessionGroup?.length || 0;
    const newProgress = Math.round((newCompletedSessions.size / totalSessions) * 100);
    setProgress(newProgress);
    if (newCompletedSessions.size === totalSessions) {
        setIsCertificateAvailable(true);
    }

    try {
      const res = await fetch(`/api/user/sessions/${sessionId}/complete`, {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Failed to update session");
      }
      
      toast.success("Session marked as complete!");
    } catch (error) {
      console.error("Error updating session:", error);
      // Revert on error
      const revertedSessions = new Set(completedSessions);
      setCompletedSessions(revertedSessions);
      // Revert progress
      const revertedProgress = Math.round((revertedSessions.size / totalSessions) * 100);
      setProgress(revertedProgress);
      setIsCertificateAvailable(revertedSessions.size === totalSessions);
      
      toast.error("Failed to mark session as complete");
    }
  };

  const handleDownloadCertificate = async () => {
    setCertificateLoading(true);
    try {
      const res = await fetch(`/api/user/courses/${course.id}/certificate`);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate certificate");
      }

      // Create a blob from the response
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${course.title.replace(/\s+/g, "_")}_Certificate.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Certificate downloaded successfully!");
    } catch (error: any) {
      console.error("Error downloading certificate:", error);
      toast.error(error.message || "Failed to download certificate");
    } finally {
      setCertificateLoading(false);
    }
  };

  const sessions = course.sessionGroup || [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
            <p className="text-gray-500 text-sm mt-1 line-clamp-2">
              {course.description}
            </p>
          </div>
          
          {/* Progress Section */}
          <div className="flex items-center gap-4 min-w-[200px]">
            <div className="flex-1">
              <div className="flex justify-between text-xs font-medium text-gray-500 mb-1">
                <span>Progress</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                <div
                  className="bg-green-600 h-2.5 rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            {isCertificateAvailable && (
               <div className="hidden md:block">
                  <Award className="w-8 h-8 text-yellow-500" />
               </div>
            )}
          </div>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-gray-50 p-6">
        <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-600" />
          Course Sessions
        </h4>
        
        {sessions.length > 0 ? (
          <div className="space-y-3">
            {sessions.map((session, index) => {
              const isCompleted = session.id ? completedSessions.has(session.id) : false;
              const isPast = new Date(session.datetime) < new Date();
              
              return (
                <div
                  key={session.id || index}
                  className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-lg border transition-all ${
                    isCompleted
                      ? "bg-green-50 border-green-200"
                      : "bg-white border-gray-200 hover:border-green-300"
                  }`}
                >
                  <div className="flex items-start gap-4 mb-3 sm:mb-0">
                    <button
                      onClick={() => session.id && toggleSession(session.id)}
                      disabled={isCompleted || !session.id}
                      className={`mt-1 flex-shrink-0 transition-colors ${
                        isCompleted
                          ? "text-green-600 cursor-default"
                          : "text-gray-300 hover:text-green-500 cursor-pointer"
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <Circle className="w-6 h-6" />
                      )}
                    </button>
                    
                    <div>
                      <h5 className={`font-medium ${isCompleted ? "text-green-900" : "text-gray-900"}`}>
                        {session.label || `Session ${index + 1}`}
                      </h5>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-sm text-gray-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {new Date(session.datetime).toLocaleDateString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(session.datetime).toLocaleTimeString(undefined, {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                        {/* <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {session.duration} mins
                        </span> */}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto pl-10 sm:pl-0">
                    {session.link && !session.recordingLink && (
                      <a
                        href={session.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Join
                      </a>
                    )}
                    {session.recordingLink && (
                       <a
                       href={session.recordingLink}
                       target="_blank"
                       rel="noopener noreferrer"
                       className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-purple-600 bg-purple-50 rounded-md hover:bg-purple-100 transition-colors"
                     >
                       <PlayCircle className="w-4 h-4" />
                       Replay
                     </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-gray-500 italic">No sessions scheduled yet.</p>
        )}
      </div>

      {/* Footer / Actions */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 flex justify-end">
        <button
          onClick={handleDownloadCertificate}
          disabled={!isCertificateAvailable || certificateLoading}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-semibold transition-all ${
            isCertificateAvailable
              ? "bg-green-600 text-white hover:bg-green-700 shadow-sm"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          {certificateLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Award className="w-5 h-5" />
          )}
          {certificateLoading ? "Generating..." : "Download Certificate"}
        </button>
      </div>
    </div>
  );
}
