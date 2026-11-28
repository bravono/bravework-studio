import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import logger from "@/lib/logger";
import { withObservability } from "@/lib/observability/with-observability";

export const dynamic = "force-dynamic";

async function handleHealthCheck() {
  const dbStart = performance.now();
  let dbStatus: "up" | "down" = "up";

  try {
    await prisma.$queryRaw`SELECT 1 as health_check`;
  } catch (error) {
    dbStatus = "down";
    logger.error({ err: error }, "Health check database ping failed");
  }

  const dbLatencyMs = Math.round(performance.now() - dbStart);
  const isHealthy = dbStatus === "up";

  return NextResponse.json(
    {
      status: isHealthy ? "healthy" : "unhealthy",
      timestamp: new Date().toISOString(),
      uptimeSeconds: Math.round(process.uptime()),
      checks: {
        database: {
          status: dbStatus,
          latencyMs: dbLatencyMs,
        },
      },
    },
    { status: isHealthy ? 200 : 503 },
  );
}

export const GET = withObservability(handleHealthCheck, {
  routeName: "/api/health",
  skipSuccessLog: true,
});
