"use client";

import React, { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { TodoItemCard, TodoItem } from "./TodoItemCard";

interface LiveProjectTrackerProps {
  orderId: number;
  projectTitle?: string;
  categoryName?: string;
  startDate?: string;
  endDate?: string;
  amountPaidFormatted?: string;
  isAdminOrTeam?: boolean;
  currentUserId?: number;
}

export function LiveProjectTracker({
  orderId,
  projectTitle = "Project Tracking",
  categoryName = "Custom Development",
  startDate,
  endDate,
  amountPaidFormatted,
  isAdminOrTeam = true,
  currentUserId,
}: LiveProjectTrackerProps) {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTodos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/projects/${orderId}/todos`);
      const json = await res.json();
      if (json.success) {
        setTodos(json.data || []);
      } else {
        setError(json.message || "Failed to load project milestones");
      }
    } catch (err: any) {
      console.error("Error fetching project todos:", err);
      setError("Unable to connect to live tracking server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderId) {
      fetchTodos();
    }
  }, [orderId]);

  // Group todos by milestone
  const milestones = todos.reduce((acc, todo) => {
    const title = todo.milestone_title || "General Tasks";
    if (!acc[title]) acc[title] = [];
    acc[title].push(todo);
    return acc;
  }, {} as Record<string, TodoItem[]>);

  const totalTasks = todos.length;
  const completedTasks = todos.filter((t) => t.is_completed).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-4 md:p-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950/80 to-slate-950 p-6 md:p-10 border border-slate-800/80 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-violet-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-violet-500/10 border border-violet-500/30 text-violet-300 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Live Project Tracker</span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold text-white tracking-tight">
                {projectTitle}
              </h1>
              <p className="text-sm text-slate-400 mt-1">{categoryName}</p>
            </div>

            <button
              onClick={fetchTodos}
              className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all text-xs font-medium inline-flex items-center gap-1.5"
              title="Refresh status"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>

          {/* Progress Overview Bar */}
          <div className="space-y-2 pt-2">
            <div className="flex justify-between items-center text-xs font-medium">
              <span className="text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Overall Progress</span>
              </span>
              <span className="text-violet-300 font-bold text-sm">
                {progressPercent}% ({completedTasks}/{totalTasks} Completed)
              </span>
            </div>
            <div className="w-full bg-slate-950/80 rounded-full h-3 p-0.5 border border-slate-800 overflow-hidden">
              <div
                className="bg-gradient-to-r from-violet-600 via-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500 shadow-lg shadow-violet-500/30"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Todo Milestone Breakdown */}
      {isLoading ? (
        <div className="py-16 text-center space-y-3">
          <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-400 text-xs font-medium">
            Generating & Syncing Live Todo List...
          </p>
        </div>
      ) : error ? (
        <div className="p-6 rounded-2xl bg-red-950/30 border border-red-800/40 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
          <p className="text-red-300 text-sm">{error}</p>
          <button
            onClick={fetchTodos}
            className="px-4 py-2 rounded-xl bg-red-900/40 text-red-200 text-xs hover:bg-red-900/60 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : Object.keys(milestones).length === 0 ? (
        <div className="py-12 text-center text-slate-500 text-sm">
          No tasks found for this project.
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(milestones).map(([milestoneTitle, items]) => {
            const milestoneTotal = items.length;
            const milestoneCompleted = items.filter((i) => i.is_completed).length;
            const isMilestoneDone = milestoneTotal > 0 && milestoneTotal === milestoneCompleted;

            return (
              <div
                key={milestoneTitle}
                className="space-y-4 bg-slate-950/40 border border-slate-800/60 rounded-3xl p-6 shadow-xl"
              >
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-violet-600/10 border border-violet-500/20 text-violet-400">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-slate-100">
                        {milestoneTitle}
                      </h2>
                      <span className="text-xs text-slate-400">
                        {milestoneCompleted} of {milestoneTotal} tasks checked off
                      </span>
                    </div>
                  </div>

                  {isMilestoneDone && (
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950 border border-emerald-500/40 text-emerald-400 shadow-sm shadow-emerald-900/20">
                      Milestone Completed
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {items.map((todo) => (
                    <TodoItemCard
                      key={todo.todo_id}
                      orderId={orderId}
                      todo={todo}
                      isAdminOrTeam={isAdminOrTeam}
                      currentUserId={currentUserId}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
