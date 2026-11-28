"use client";

import { ReactNode } from "react";

interface StatusCardProps {
  title: string;
  icon: ReactNode;
  status: "healthy" | "degraded" | "unhealthy";
  children: ReactNode;
}

export default function StatusCard({
  title,
  icon,
  status,
  children,
}: StatusCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "border-green-200 bg-green-50";
      case "degraded":
        return "border-yellow-200 bg-yellow-50";
      case "unhealthy":
        return "border-red-200 bg-red-50";
      default:
        return "border-gray-200 bg-white";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-700";
      case "degraded":
        return "text-yellow-700";
      case "unhealthy":
        return "text-red-700";
      default:
        return "text-gray-700";
    }
  };

  const getIconColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600";
      case "degraded":
        return "text-yellow-600";
      case "unhealthy":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const statusLabel = {
    healthy: "Healthy",
    degraded: "Degraded",
    unhealthy: "Unhealthy",
  }[status];

  return (
    <div
      className={`rounded-lg border-2 p-6 transition-all ${getStatusColor(
        status,
      )}`}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`${getIconColor(status)}`}>{icon}</div>
        <span
          className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusTextColor(
            status,
          )} bg-white/60`}
        >
          {statusLabel}
        </span>
      </div>

      <h3 className="text-lg font-semibold text-gray-900 mb-3">{title}</h3>

      <div className="text-sm space-y-2">{children}</div>
    </div>
  );
}
