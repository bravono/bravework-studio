"use client";

import { CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface HealthIndicatorProps {
  timestamp: string;
  databaseStatus: "healthy" | "degraded" | "unhealthy";
  apiStatus: "healthy" | "degraded" | "unhealthy";
  serverStatus: "healthy" | "degraded" | "unhealthy";
}

export default function HealthIndicator({
  timestamp,
  databaseStatus,
  apiStatus,
  serverStatus,
}: HealthIndicatorProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "degraded":
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case "unhealthy":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="flex-shrink-0 p-3 border border-gray-200 rounded-lg bg-white hover:shadow-md transition-shadow">
      <div className="text-xs font-semibold text-gray-600 mb-2">
        {timestamp}
      </div>
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          {getStatusIcon(databaseStatus)}
          <span className="text-xs text-gray-700">DB</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(apiStatus)}
          <span className="text-xs text-gray-700">API</span>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon(serverStatus)}
          <span className="text-xs text-gray-700">Server</span>
        </div>
      </div>
    </div>
  );
}
