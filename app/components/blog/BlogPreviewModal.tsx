"use client";

import React from "react";
import { X, Calendar, User, Tag } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Modal from "@/app/components/Modal";
import { format } from "date-fns";

interface BlogPreviewModalProps {
  post: {
    slug: string;
    title: string;
    date: string;
    excerpt: string;
    category: string;
    author: string;
    tags: string;
    content: string;
    coverImage: string;
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: () => void;
}

export default function BlogPreviewModal({
  post,
  isOpen,
  onClose,
  onEdit,
}: BlogPreviewModalProps) {
  if (!isOpen || !post) return null;

  const formattedDate = post.date
    ? format(new Date(post.date), "MMMM dd, yyyy")
    : "Recently";

  const tagsList = post.tags
    ? post.tags.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Blog Post Preview">
      <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-2">
        {/* Cover Image */}
        <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-gray-150 border border-gray-200 shadow-sm">
          {post.coverImage ? (
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-gray-400">
              No Cover Image
            </div>
          )}
          <div className="absolute top-4 left-4">
            <span className="px-3.5 py-1.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-wider rounded-full shadow">
              {post.category || "General"}
            </span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-3xl font-black text-gray-900 leading-tight">
            {post.title || "Untitled Post"}
          </h2>
          <p className="text-sm text-gray-500 mt-2 font-mono">Slug: {post.slug}</p>
        </div>

        {/* Author and Date */}
        <div className="flex flex-wrap items-center gap-6 text-gray-500 pb-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
              {post.author?.charAt(0) || "B"}
            </div>
            <div>
              <p className="text-xs font-bold text-gray-900">
                {post.author || "Bravework Team"}
              </p>
              <p className="text-[10px]">Author</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-450" />
            <div>
              <p className="text-xs font-bold text-gray-900">{formattedDate}</p>
              <p className="text-[10px]">Published</p>
            </div>
          </div>
        </div>

        {/* Excerpt */}
        {post.excerpt && (
          <div>
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
              Excerpt
            </h4>
            <p className="text-sm text-gray-650 italic leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
              {post.excerpt}
            </p>
          </div>
        )}

        {/* Content (Markdown) */}
        <div>
          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Content Preview
          </h4>
          <div className="prose prose-indigo max-w-none text-sm text-gray-700 bg-white border border-gray-100 rounded-xl p-4 min-h-[150px]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                img: ({ node, ...props }) => (
                  <img
                    src={props.src}
                    alt={props.alt || "Article Image"}
                    className="rounded-2xl shadow-md my-4 max-w-full object-cover"
                  />
                ),
                h2: ({ node, ...props }) => (
                  <h2
                    {...props}
                    className="text-xl font-bold text-gray-900 mt-6 mb-3"
                  />
                ),
                p: ({ node, ...props }) => (
                  <p {...props} className="text-gray-700 leading-relaxed mb-3" />
                ),
              }}
            >
              {post.content || "*No content written yet.*"}
            </ReactMarkdown>
          </div>
        </div>

        {/* Tags */}
        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-100">
            <Tag className="w-4 h-4 text-gray-400 self-center mr-1" />
            {tagsList.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 bg-gray-50 text-gray-600 rounded-lg text-xs font-semibold"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4 pt-4 border-t border-gray-100">
          {onEdit && (
            <button
              onClick={onEdit}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl transition-all"
            >
              Edit Post
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
