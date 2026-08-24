"use client";

import React, { useState } from "react";
import {
  FileText,
  Image as ImageIcon,
  Video,
  ExternalLink,
  Download,
  X,
  Play,
} from "lucide-react";

export interface TodoAttachment {
  attachment_id: number;
  todo_id: number;
  file_name: string | null;
  file_url: string;
  file_type: string;
  file_size?: string | null;
  created_at?: string;
}

interface TodoMediaGalleryProps {
  attachments: TodoAttachment[];
}

export function TodoMediaGallery({ attachments }: TodoMediaGalleryProps) {
  const [selectedMedia, setSelectedMedia] = useState<TodoAttachment | null>(
    null
  );

  if (!attachments || attachments.length === 0) return null;

  const isImage = (type: string, url: string) =>
    type.startsWith("image") ||
    /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url);

  const isVideo = (type: string, url: string) =>
    type.startsWith("video") ||
    /\.(mp4|webm|mov|ogg)($|\?)/i.test(url) ||
    url.includes("youtube.com") ||
    url.includes("vimeo.com");

  return (
    <div className="mt-4 pt-3 border-t border-slate-700/50">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
        <span>Attached Media & Deliverables</span>
        <span className="bg-slate-800 text-slate-300 text-[10px] px-2 py-0.5 rounded-full">
          {attachments.length}
        </span>
      </h4>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {attachments.map((item) => {
          const img = isImage(item.file_type, item.file_url);
          const vid = isVideo(item.file_type, item.file_url);

          return (
            <div
              key={item.attachment_id}
              onClick={() => setSelectedMedia(item)}
              className="group relative cursor-pointer overflow-hidden rounded-xl bg-slate-900 border border-slate-700/60 hover:border-violet-500/60 transition-all duration-200 aspect-video flex flex-col justify-center items-center p-2 text-center"
            >
              {img ? (
                /* Image thumbnail */
                <div className="absolute inset-0 bg-slate-950">
                  <img
                    src={item.file_url}
                    alt={item.file_name || "Deliverable photo"}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                    <span className="text-[11px] font-medium text-white truncate w-full text-left">
                      {item.file_name || "View Image"}
                    </span>
                  </div>
                </div>
              ) : vid ? (
                /* Video thumbnail representation */
                <div className="flex flex-col items-center justify-center space-y-1 text-violet-400 group-hover:text-violet-300">
                  <div className="w-9 h-9 rounded-full bg-violet-500/20 border border-violet-500/40 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Play className="w-4 h-4 fill-current ml-0.5" />
                  </div>
                  <span className="text-[11px] font-medium text-slate-300 truncate max-w-[90%]">
                    {item.file_name || "Watch Video"}
                  </span>
                </div>
              ) : (
                /* Document thumbnail */
                <div className="flex flex-col items-center justify-center space-y-1 text-slate-400 group-hover:text-slate-200">
                  <FileText className="w-6 h-6 text-indigo-400" />
                  <span className="text-[11px] font-medium text-slate-300 truncate max-w-[90%]">
                    {item.file_name || "Attachment"}
                  </span>
                  {item.file_size && (
                    <span className="text-[9px] text-slate-500">
                      {item.file_size}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Media Lightbox / Modal */}
      {selectedMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="relative max-w-4xl w-full bg-slate-900 border border-slate-700/80 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900/90">
              <h3 className="text-sm font-semibold text-slate-200 truncate">
                {selectedMedia.file_name || "Attachment Deliverable"}
              </h3>
              <div className="flex items-center gap-3">
                <a
                  href={selectedMedia.file_url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  onClick={() => setSelectedMedia(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-auto flex items-center justify-center bg-slate-950 min-h-[300px]">
              {isImage(selectedMedia.file_type, selectedMedia.file_url) ? (
                <img
                  src={selectedMedia.file_url}
                  alt={selectedMedia.file_name || "Deliverable"}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg shadow-lg"
                />
              ) : isVideo(selectedMedia.file_type, selectedMedia.file_url) ? (
                <video
                  src={selectedMedia.file_url}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-full rounded-lg shadow-lg"
                />
              ) : (
                <div className="text-center py-12 space-y-4">
                  <FileText className="w-16 h-16 text-indigo-400 mx-auto" />
                  <p className="text-slate-300 text-sm">
                    {selectedMedia.file_name || "Document File"}
                  </p>
                  <a
                    href={selectedMedia.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all"
                  >
                    <span>Open External Document</span>
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
