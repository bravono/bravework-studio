"use client";

import React from "react";
import { Share2 } from "lucide-react";

interface PostShareActionsProps {
  title: string;
  excerpt: string;
}

export default function PostShareActions({
  title,
  excerpt,
}: PostShareActionsProps) {
  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator
        .share({
          title: title,
          text: excerpt,
          url: window.location.href,
        })
        .catch(console.error);
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 text-gray-400 hover:text-indigo-600 transition-colors"
    >
      <Share2 className="w-4 h-4" />
      <span className="text-sm font-bold">Share</span>
    </button>
  );
}
