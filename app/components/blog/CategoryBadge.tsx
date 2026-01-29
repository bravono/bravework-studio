import React from "react";
import { cn } from "@/lib/utils/cn";

interface CategoryBadgeProps {
  category: string;
  className?: string;
}

const categoryStyles: Record<string, string> = {
  Academy: "bg-blue-100 text-blue-700",
  Kids: "bg-pink-100 text-pink-700",
  Studio: "bg-purple-100 text-purple-700",
  Rentals: "bg-green-100 text-green-700",
  General: "bg-gray-100 text-gray-700",
  Company: "bg-indigo-100 text-indigo-700",
};

export default function CategoryBadge({
  category,
  className,
}: CategoryBadgeProps) {
  const style = categoryStyles[category] || "bg-gray-100 text-gray-700";

  return (
    <span
      className={cn(
        "px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300",
        style,
        className,
      )}
    >
      {category}
    </span>
  );
}
