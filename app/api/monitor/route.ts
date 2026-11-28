import os from "os";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";
import {
  getApiMetricsSnapshot,
  ApiMetricsSnapshot,
} from "@/lib/observability/metrics";
import { withObservability } from "@/lib/observability/with-observability";

export const dynamic = "force-dynamic";

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
  api: ApiMetricsSnapshot;
}

async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  connectionPoolStatus: string;
}> {
  try {
    const startTime = Date.now();
    await prisma.$queryRaw`SELECT 1 as health_check`;
    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 100 ? "healthy" : "degraded",
      responseTime,
      connectionPoolStatus: "active",
    };
  } catch (error) {
    logger.error({ err: error }, "Database health check failed in monitor");
    return {
      status: "unhealthy",
      responseTime: 0,
      connectionPoolStatus: "error",
    };
  }
}

function getServerMetrics() {
  const uptime = process.uptime();
  const totalMemory = os.totalmem();
  const freeMemory = os.freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    uptime,
    memory: {
      used: Math.round(usedMemory / 1024 / 1024),
      total: Math.round(totalMemory / 1024 / 1024),
      percentage: Math.round((usedMemory / totalMemory) * 100),
    },
    cpu: {
      usage: Math.round(process.cpuUsage().user / 1000000),
    },
  };
}

async function handleMonitor(req: NextRequest) {
  try {
    const authError = await verifyAdmin(req);
    if (authError) {
      return authError;
    }

    const [dbHealth, serverMetrics, apiMetrics] = await Promise.all([
      checkDatabaseHealth(),
      Promise.resolve(getServerMetrics()),
      Promise.resolve(getApiMetricsSnapshot()),
    ]);

    const monitoringData: MonitoringData = {
      timestamp: new Date().toISOString(),
      server: serverMetrics,
      database: dbHealth,
      api: apiMetrics,
    };

    return NextResponse.json(monitoringData);
  } catch (error) {
    logger.error({ err: error }, "Monitoring endpoint error");
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export const GET = withObservability(handleMonitor, {
  routeName: "/api/monitor",
});
