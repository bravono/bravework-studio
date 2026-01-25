import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyAdmin } from "@/lib/auth/admin-auth-guard";

const prisma = new PrismaClient();

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

async function checkDatabaseHealth(): Promise<{
  status: "healthy" | "degraded" | "unhealthy";
  responseTime: number;
  connectionPoolStatus: string;
}> {
  try {
    const startTime = Date.now();

    // Check database connection with a simple query
    const result = await prisma.$queryRaw`SELECT 1 as health_check`;
    const responseTime = Date.now() - startTime;

    return {
      status: responseTime < 100 ? "healthy" : "degraded",
      responseTime,
      connectionPoolStatus: "active",
    };
  } catch (error) {
    return {
      status: "unhealthy",
      responseTime: 0,
      connectionPoolStatus: "error",
    };
  }
}

function getServerMetrics() {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  const totalMemory = require("os").totalmem();
  const freeMemory = require("os").freemem();
  const usedMemory = totalMemory - freeMemory;

  return {
    uptime,
    memory: {
      used: Math.round(usedMemory / 1024 / 1024), // MB
      total: Math.round(totalMemory / 1024 / 1024), // MB
      percentage: Math.round((usedMemory / totalMemory) * 100),
    },
    cpu: {
      usage: Math.round(process.cpuUsage().user / 1000000), // seconds
    },
  };
}

function getAPIMetrics() {
  // Simulated metrics - in production, integrate with APM tools
  return {
    responseTime: Math.floor(Math.random() * 100) + 20, // 20-120ms
    requestCount: Math.floor(Math.random() * 10000) + 1000,
    errorRate: Math.random() * 5, // 0-5%
  };
}

export async function GET(req: NextRequest) {
  try {
    // Verify admin access
    const authError = await verifyAdmin(req);
    if (authError) {
      return authError;
    }

    const [dbHealth, serverMetrics, apiMetrics] = await Promise.all([
      checkDatabaseHealth(),
      Promise.resolve(getServerMetrics()),
      Promise.resolve(getAPIMetrics()),
    ]);

    const monitoringData: MonitoringData = {
      timestamp: new Date().toISOString(),
      server: serverMetrics,
      database: dbHealth,
      api: apiMetrics,
    };

    return NextResponse.json(monitoringData);
  } catch (error) {
    console.error("Monitoring endpoint error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}
