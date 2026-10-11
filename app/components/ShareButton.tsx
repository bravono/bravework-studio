"use client";

import React, { useState } from "react";
import { Share2, Check } from "lucide-react";
import { toast } from "react-toastify";
import { resolveShareUrl } from "@/lib/utils/share";

export interface ShareButtonProps {
  title: string;
  text?: string;
  url?: string;
  type?: "course" | "bundle";
  variant?: "outline" | "solid" | "ghost" | "icon" | "secondary";
  label?: string;
  showLabel?: boolean;
  className?: string;
  iconSize?: number;
}

export default function ShareButton({
  title,
  text,
  url,
  type = "course",
  variant = "outline",
  label,
  showLabel = true,
  className = "",
  iconSize = 16,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const resolvedUrl = resolveShareUrl(url);
    const itemLabel = type === "bundle" ? "Bundle" : "Course";

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({
          title,
          text: text || `Check out this ${itemLabel.toLowerCase()} on Bravework Studio`,
          url: resolvedUrl,
        });
        return;
      } catch (error: any) {
        if (error?.name === "AbortError") {
          return;
        }
      }
    }

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(resolvedUrl);
        setCopied(true);
        toast.success(`${itemLabel} link copied to clipboard!`);
        setTimeout(() => setCopied(false), 2000);
      } catch (clipError) {
        toast.error("Failed to copy link");
      }
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case "solid":
        return "bg-green-600 hover:bg-green-700 text-white shadow-sm";
      case "secondary":
        return "bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-200";
      case "ghost":
        return "bg-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-100";
      case "icon":
        return "p-2 rounded-xl text-gray-500 hover:text-gray-900 bg-white/80 hover:bg-white shadow-sm border border-gray-200";
      case "outline":
      default:
        return "bg-white text-gray-700 border border-gray-200 hover:border-gray-300 hover:bg-gray-50";
    }
  };

  const displayLabel = copied
    ? "Copied!"
    : label || (type === "bundle" ? "Share Bundle" : "Share Course");

  return (
    <button
      type="button"
      onClick={handleShare}
      className={`inline-flex items-center justify-center gap-2 text-xs font-bold transition-all duration-200 rounded-xl ${getVariantClasses()} ${className}`}
      aria-label={label || (type === "bundle" ? "Share Bundle" : "Share Course")}
      title={label || (type === "bundle" ? "Share Bundle" : "Share Course")}
    >
      {copied ? (
        <Check size={iconSize} className="text-green-600 animate-in fade-in zoom-in" />
      ) : (
        <Share2 size={iconSize} className="shrink-0" />
      )}
      {showLabel && variant !== "icon" && <span>{displayLabel}</span>}
    </button>
  );
}
