"use client";

import React, { useState } from "react";
import { MessageSquare, Send, Image as ImageIcon, X, User } from "lucide-react";

export interface TodoComment {
  comment_id: number;
  todo_id: number;
  user_id: number;
  content: string;
  image_url?: string | null;
  created_at?: string;
  users?: {
    user_id: number;
    first_name: string;
    last_name: string;
    profile_picture_url?: string | null;
  };
}

interface TodoCommentsDrawerProps {
  orderId: number;
  todoId: number;
  comments: TodoComment[];
  currentUserId?: number;
  onCommentAdded?: (comment: TodoComment) => void;
}

export function TodoCommentsDrawer({
  orderId,
  todoId,
  comments: initialComments,
  currentUserId = 1, // Fallback default user ID if not provided in mock context
  onCommentAdded,
}: TodoCommentsDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comments, setComments] = useState<TodoComment[]>(initialComments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [showImageInput, setShowImageInput] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim() && !imageUrl.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(
        `/api/projects/${orderId}/todos/${todoId}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUserId,
            content: newCommentText.trim(),
            imageUrl: imageUrl.trim() || undefined,
          }),
        }
      );

      const json = await res.json();
      if (json.success && json.data) {
        setComments((prev) => [...prev, json.data]);
        setNewCommentText("");
        setImageUrl("");
        setShowImageInput(false);
        if (onCommentAdded) onCommentAdded(json.data);
      } else {
        alert(json.message || "Failed to post comment");
      }
    } catch (err) {
      console.error("Error posting comment:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-3">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-violet-400 transition-colors"
      >
        <MessageSquare className="w-3.5 h-3.5" />
        <span>
          {comments.length === 0
            ? "Leave a comment"
            : `${comments.length} comment${comments.length > 1 ? "s" : ""}`}
        </span>
      </button>

      {isOpen && (
        <div className="mt-3 p-4 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Discussion & Feedback
            </h4>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              Close
            </button>
          </div>

          {/* Comment list */}
          <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
            {comments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No comments yet. Have a question or feedback on this item? Post below!
              </p>
            ) : (
              comments.map((c) => (
                <div
                  key={c.comment_id}
                  className="flex gap-2.5 items-start text-xs bg-slate-950/60 p-3 rounded-lg border border-slate-800/50"
                >
                  <div className="w-6 h-6 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-violet-300 shrink-0 mt-0.5">
                    {c.users?.profile_picture_url ? (
                      <img
                        src={c.users.profile_picture_url}
                        alt={c.users.first_name}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">
                        {c.users
                          ? `${c.users.first_name} ${c.users.last_name}`
                          : "User"}
                      </span>
                      {c.created_at && (
                        <span className="text-[10px] text-slate-500">
                          {new Date(c.created_at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      )}
                    </div>
                    {c.content && (
                      <p className="text-slate-300 leading-relaxed break-words">
                        {c.content}
                      </p>
                    )}
                    {c.image_url && (
                      <div className="mt-2 overflow-hidden rounded-lg border border-slate-800 max-w-xs">
                        <img
                          src={c.image_url}
                          alt="Comment attachment"
                          className="w-full max-h-48 object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => window.open(c.image_url!, "_blank")}
                        />
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* New Comment Input */}
          <form onSubmit={handleSend} className="space-y-2 pt-2 border-t border-slate-800">
            <div className="relative flex items-center">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-violet-500 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none transition-colors pr-16"
              />
              <div className="absolute right-2 flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setShowImageInput(!showImageInput)}
                  className={`p-1 rounded-lg transition-colors ${
                    imageUrl || showImageInput
                      ? "text-violet-400 bg-violet-950/60"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                  title="Attach Image URL"
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || (!newCommentText.trim() && !imageUrl.trim())}
                  className="p-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white transition-all shadow-sm shadow-violet-600/30"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Optional Image URL Input field */}
            {showImageInput && (
              <div className="flex items-center gap-2 bg-slate-950 p-2 rounded-lg border border-slate-800">
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="Paste image URL (e.g. screenshot link)..."
                  className="flex-1 bg-transparent text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
                />
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl("")}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </form>
        </div>
      )}
    </div>
  );
}
