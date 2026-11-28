"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle, Clock, Plus, Upload, Paperclip } from "lucide-react";
import { TodoMediaGallery, TodoAttachment } from "./TodoMediaGallery";
import { TodoCommentsDrawer, TodoComment } from "./TodoCommentsDrawer";

export interface TodoItem {
  todo_id: number;
  project_id: number;
  titile: string;
  description?: string | null;
  milestone_title?: string | null;
  status: string;
  is_completed: boolean;
  completed_at?: string | null;
  position_order: number;
  todo_attachments?: TodoAttachment[];
  todo_comments?: TodoComment[];
}

interface TodoItemCardProps {
  orderId: number;
  todo: TodoItem;
  isAdminOrTeam?: boolean;
  currentUserId?: number;
  onStatusChange?: (updated: TodoItem) => void;
}

export function TodoItemCard({
  orderId,
  todo: initialTodo,
  isAdminOrTeam = true, // Set to true by default to allow manual checking off & media uploads
  currentUserId,
  onStatusChange,
}: TodoItemCardProps) {
  const [todo, setTodo] = useState<TodoItem>(initialTodo);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAttachInput, setShowAttachInput] = useState(false);
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaName, setMediaName] = useState("");
  const [mediaType, setMediaType] = useState("image");

  const toggleCheck = async () => {
    if (!isAdminOrTeam || isUpdating) return;
    const nextCompleted = !todo.is_completed;

    setIsUpdating(true);
    // Optimistic UI update
    setTodo((prev) => ({
      ...prev,
      is_completed: nextCompleted,
      status: nextCompleted ? "completed" : "in_progress",
    }));

    try {
      const res = await fetch(`/api/projects/${orderId}/todos/${todo.todo_id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCompleted: nextCompleted }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setTodo(json.data);
        if (onStatusChange) onStatusChange(json.data);
      }
    } catch (err) {
      console.error("Failed to toggle checkoff:", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAddAttachment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mediaUrl.trim()) return;

    try {
      const res = await fetch(
        `/api/projects/${orderId}/todos/${todo.todo_id}/attachments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            fileUrl: mediaUrl.trim(),
            fileName: mediaName.trim() || undefined,
            fileType: mediaType,
          }),
        }
      );

      const json = await res.json();
      if (json.success && json.data) {
        setTodo((prev) => ({
          ...prev,
          todo_attachments: [json.data, ...(prev.todo_attachments || [])],
        }));
        setMediaUrl("");
        setMediaName("");
        setShowAttachInput(false);
      }
    } catch (err) {
      console.error("Failed to add attachment:", err);
    }
  };

  return (
    <div
      className={`group relative rounded-2xl p-5 border transition-all duration-300 ${
        todo.is_completed
          ? "bg-slate-900/60 border-emerald-500/30 shadow-lg shadow-emerald-950/10"
          : "bg-slate-900/90 border-slate-800 hover:border-slate-700/80 shadow-md"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Checkbox Trigger */}
        <button
          type="button"
          onClick={toggleCheck}
          disabled={!isAdminOrTeam || isUpdating}
          className={`mt-0.5 shrink-0 transition-transform ${
            isAdminOrTeam ? "hover:scale-110 cursor-pointer" : "cursor-default"
          }`}
          title={isAdminOrTeam ? "Click to toggle completion status" : "Status indicator"}
        >
          {todo.is_completed ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 fill-emerald-500/10" />
          ) : (
            <Circle className="w-6 h-6 text-slate-500 hover:text-slate-400" />
          )}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3
              className={`text-sm font-semibold transition-colors ${
                todo.is_completed
                  ? "text-slate-400 line-through decoration-slate-600"
                  : "text-slate-100"
              }`}
            >
              {todo.titile}
            </h3>

            {/* Completion Timestamp Badge */}
            {todo.is_completed && todo.completed_at && (
              <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <Clock className="w-3 h-3" />
                Done
              </span>
            )}
          </div>

          {todo.description && (
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              {todo.description}
            </p>
          )}

          {/* Admin Attach Media trigger */}
          {isAdminOrTeam && (
            <div className="mt-3">
              {!showAttachInput ? (
                <button
                  type="button"
                  onClick={() => setShowAttachInput(true)}
                  className="inline-flex items-center gap-1.5 text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  <Paperclip className="w-3.5 h-3.5" />
                  <span>Attach Media / Deliverable</span>
                </button>
              ) : (
                <form
                  onSubmit={handleAddAttachment}
                  className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between font-semibold text-slate-300">
                    <span>Attach Deliverable Media</span>
                    <button
                      type="button"
                      onClick={() => setShowAttachInput(false)}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="File / Media URL (Direct Link, Video, Image)..."
                    required
                    className="w-full bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-200"
                  />
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={mediaName}
                      onChange={(e) => setMediaName(e.target.value)}
                      placeholder="Title (e.g. Preview Video)"
                      className="flex-1 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-200"
                    />
                    <select
                      value={mediaType}
                      onChange={(e) => setMediaType(e.target.value)}
                      className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg text-slate-200"
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                      <option value="document">Document</option>
                    </select>
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}

          {/* Media Deliverables Gallery */}
          <TodoMediaGallery attachments={todo.todo_attachments || []} />

          {/* Inline Comments Drawer */}
          <TodoCommentsDrawer
            orderId={orderId}
            todoId={todo.todo_id}
            comments={todo.todo_comments || []}
            currentUserId={currentUserId}
          />
        </div>
      </div>
    </div>
  );
}
