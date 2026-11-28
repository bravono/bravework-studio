"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  HardDrive,
  RefreshCw,
  Server,
  Zap,
} from "lucide-react";
import StatusCard from "./StatusCard";
import MetricChart from "./MetricChart";
import HealthIndicator from "./HealthIndicator";

interface MonitoringData {
  timestamp: string;
  server: {
    uptime: number;
    memory: {
      used: number;
      total: number;
      percentage: number;
    };
    cpu: {
      usage: number;
    };
  };
  database: {
    status: "healthy" | "degraded" | "unhealthy";
    responseTime: number;
    connectionPoolStatus: string;
  };
  api: {
    responseTime: number;
    requestCount: number;
    errorRate: number;
  };
}

export default function ServerMonitorClient({ initialSession }: { initialSession: any }) {
  const [monitoringData, setMonitoringData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<MonitoringData[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchMonitoringData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("auth_token") || initialSession?.accessToken;
      
      const response = await fetch("/api/monitor", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch monitoring data");
      }

      const data = await response.json();
      setMonitoringData(data);
      setHistoryData((prev) => [...prev.slice(-9), data]); // Keep last 10 records
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMonitoringData();
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchMonitoringData();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const getStatusColor = (status: string) => {
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

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-50";
      case "degraded":
        return "bg-yellow-50";
      case "unhealthy":
        return "bg-red-50";
      default:
        return "bg-gray-50";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Server Monitor</h1>
            <p className="text-gray-600 mt-1">Real-time system health and performance metrics</p>
          </div>
          <button
            onClick={fetchMonitoringData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Auto-refresh toggle */}
        <div className="mb-6 flex items-center gap-3">
          <input
            type="checkbox"
            id="autoRefresh"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300"
          />
          <label htmlFor="autoRefresh" className="text-sm text-gray-700">
            Auto-refresh every 10 seconds
          </label>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">{error}</span>
          </div>
        )}

        {monitoringData ? (
          <>
            {/* Status Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Database Status */}
              <StatusCard
                title="Database"
                icon={<Database className="w-6 h-6" />}
                status={monitoringData.database.status}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Response Time:</span>
                    <span className="font-semibold text-gray-900">
                      {monitoringData.database.responseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pool Status:</span>
                    <span className="text-sm font-semibold text-green-600">
                      {monitoringData.database.connectionPoolStatus}
                    </span>
                  </div>
                </div>
              </StatusCard>

              {/* API Performance */}
              <StatusCard
                title="API Performance"
                icon={<Zap className="w-6 h-6" />}
                status={monitoringData.api.responseTime < 100 ? "healthy" : "degraded"}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Avg Response:</span>
                    <span className="font-semibold text-gray-900">
                      {monitoringData.api.responseTime}ms
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Error Rate:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {monitoringData.api.errorRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </StatusCard>

              {/* Server Status */}
              <StatusCard
                title="Server"
                icon={<Server className="w-6 h-6" />}
                status={monitoringData.server.memory.percentage > 80 ? "degraded" : "healthy"}
              >
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Uptime:</span>
                    <span className="font-semibold text-gray-900">
                      {formatUptime(monitoringData.server.uptime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Memory:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {monitoringData.server.memory.percentage}%
                    </span>
                  </div>
                </div>
              </StatusCard>
            </div>

            {/* Detailed Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Memory Usage */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <HardDrive className="w-5 h-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Memory Usage</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Used Memory</span>
                      <span className="font-semibold text-gray-900">
                        {monitoringData.server.memory.used} MB / {monitoringData.server.memory.total} MB
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          monitoringData.server.memory.percentage > 80
                            ? "bg-red-500"
                            : monitoringData.server.memory.percentage > 60
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{
                          width: `${monitoringData.server.memory.percentage}%`,
                        }}
                      />
                    </div>
                    <div className="mt-2 text-center text-sm font-semibold text-gray-900">
                      {monitoringData.server.memory.percentage}%
                    </div>
                  </div>
                </div>
              </div>

              {/* Request Statistics */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-green-600" />
                  <h3 className="text-lg font-semibold text-gray-900">Request Statistics</h3>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Total Requests</span>
                    <span className="text-xl font-bold text-gray-900">
                      {monitoringData.api.requestCount.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-600">Error Rate</span>
                    <span className={`text-xl font-bold ${monitoringData.api.errorRate > 5 ? "text-red-600" : "text-green-600"}`}>
                      {monitoringData.api.errorRate.toFixed(2)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Health Indicators Timeline */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-semibold text-gray-900">Health Timeline (Last 10 Checks)</h3>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {historyData.map((data, index) => (
                  <HealthIndicator
                    key={index}
                    timestamp={new Date(data.timestamp).toLocaleTimeString()}
                    databaseStatus={data.database.status}
                    apiStatus={data.api.responseTime < 100 ? "healthy" : "degraded"}
                    serverStatus={data.server.memory.percentage > 80 ? "degraded" : "healthy"}
                  />
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="mt-6 text-center text-sm text-gray-500">
              Last updated: {new Date(monitoringData.timestamp).toLocaleString()}
            </div>
          </>
        ) : loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading monitoring data...</p>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
