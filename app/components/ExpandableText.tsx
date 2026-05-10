"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface ExpandableTextProps {
  text: string;
  maxChars?: number;
  className?: string;
  buttonClassName?: string;
}

export default function ExpandableText({
  text,
  maxChars = 200,
  className = "",
  buttonClassName = "",
}: ExpandableTextProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!text) return null;

  const shouldTruncate = text.length > maxChars;
  const displayedText = isExpanded ? text : text.slice(0, maxChars) + (shouldTruncate ? "..." : "");

  return (
    <div className={className}>
      <span className="whitespace-pre-wrap">{displayedText}</span>
      {shouldTruncate && (
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsExpanded(!isExpanded);
          }}
          className={`ml-1 text-blue-600 font-bold hover:underline inline-flex items-center gap-1 transition-colors ${buttonClassName}`}
        >
          {isExpanded ? (
            <>
              Show less <ChevronUp size={14} />
            </>
          ) : (
            <>
              Read more <ChevronDown size={14} />
            </>
          )}
        </button>
      )}
    </div>
  );
}
