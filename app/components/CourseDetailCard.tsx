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
import VideoModal from "./VideoModal";

interface CourseDetailCardProps {
  course: Course;
  allCourses?: Course[];
  userCourses?: Course[];
  selectedCurrency: string;
  exchangeRates: ExchangeRates | null;
}

export default function CourseDetailCard({
  course,
  allCourses,
  userCourses,
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
  const [introWatched, setIntroWatched] = useState(course.introVideoWatched || false);
  const [playingVideoUrl, setPlayingVideoUrl] = useState<string | null>(null);

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

  const toggleSession = async (sessionId: number | string) => {
    if (sessionId === "intro-video") {
      if (introWatched) return;
      setIntroWatched(true);
      try {
        const res = await fetch(`/api/user/courses/${course.id}/intro-watched`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ watched: true })
        });
        if (!res.ok) throw new Error("Failed to update intro video status");
        toast.success("Intro video marked as watched!");
      } catch (error) {
        setIntroWatched(false);
        toast.error("Failed to mark video as watched");
      }
      return;
    }

    // Optimistic update for regular sessions
    const numSessionId = sessionId as number;
    const isCompleted = completedSessions.has(numSessionId);
    const newCompletedSessions = new Set(completedSessions);
    
    if (isCompleted) {
        // If already completed, we don't allow un-completing via this UI for now 
        // or we can allow it if the API supports it. 
        return; 
    }

    newCompletedSessions.add(numSessionId);
    setCompletedSessions(newCompletedSessions);

    // Calculate new progress locally
    const totalSessions = course.sessionGroup?.length || 0;
    const newProgress = Math.round((newCompletedSessions.size / totalSessions) * 100);
    setProgress(newProgress);
    if (newCompletedSessions.size === totalSessions) {
        setIsCertificateAvailable(true);
    }

    try {
      const res = await fetch(`/api/user/sessions/${numSessionId}/complete`, {
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

  let sessions: any[] = [...(course.sessionGroup || [])];
  
  if (course.category && course.category.includes("3D")) {
    sessions.unshift({
      id: "intro-video",
      label: "Blender Installation & Interface Walkthrough",
      datetime: course.startDate || new Date().toISOString(),
      link: "https://www.youtube.com/embed/4U0ONHj3_hw?autoplay=1",
      duration: 0,
    });
  }

  const getRecommendations = () => {
    const currentLevel = course.level;
    const recommendations: { level: string; course: Course | null }[] = [];

    if (currentLevel === "Intermediate") {
      recommendations.push({ level: "Beginner", course: allCourses.find(c => c.level === "Beginner") || null });
      recommendations.push({ level: "Advance", course: allCourses.find(c => c.level === "Advance") || null });
    } else if (currentLevel === "Beginner") {
      recommendations.push({ level: "Intermediate", course: allCourses.find(c => c.level === "Intermediate") || null });
    } else if (currentLevel === "Advance") {
      recommendations.push({ level: "Intermediate", course: allCourses.find(c => c.level === "Intermediate") || null });
    }

    // Filter out recommendations that the user is already enrolled in
    return recommendations.filter(rec => 
      rec.course && !userCourses.some(uc => uc.id === rec.course?.id)
    );
  };

  const recommendedCourses = getRecommendations();

  return (
    <div id={`item-${course.id}`} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-xl font-bold text-gray-900">{course.title}</h3>
              <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-bold uppercase rounded-md border border-blue-100">
                {course.level}
              </span>
            </div>
            <p className="text-gray-500 text-sm line-clamp-2">
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

        {recommendedCourses.length > 0 && (
          <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
            <p className="text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
              Recommended Path
            </p>
            <div className="flex flex-wrap gap-3">
              {recommendedCourses.map((rec, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-white p-2 pr-3 rounded-lg border border-blue-100 shadow-sm">
                  <div className="w-8 h-8 bg-blue-600 text-white rounded-md flex items-center justify-center font-black text-xs">
                    {rec.level[0]}
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase leading-none mb-1">
                      {rec.level}
                    </p>
                    <p className="text-xs font-bold text-gray-900 line-clamp-1 max-w-[150px]">
                      {rec.course?.title}
                    </p>
                  </div>
                  <a
                    href={`/academy/courses/${rec.course?.id}`}
                    className="ml-2 p-1.5 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-600 hover:text-white transition-all"
                    title="Enroll Now"
                  >
                    <ExternalLink size={14} />
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
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
              const isIntro = session.id === "intro-video";
              const isCompleted = isIntro ? introWatched : (session.id ? completedSessions.has(session.id) : false);
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
                    {isIntro ? (
                      <button
                        onClick={() => setPlayingVideoUrl(session.link)}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-md hover:bg-emerald-100 transition-colors"
                      >
                        <Video className="w-4 h-4" />
                        Play Video
                      </button>
                    ) : session.link && !session.recordingLink && (
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

      <VideoModal
        isOpen={!!playingVideoUrl}
        onClose={() => setPlayingVideoUrl(null)}
        videoUrl={playingVideoUrl || ""}
      />
    </div>
  );
}
