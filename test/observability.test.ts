import { NextRequest, NextResponse } from "next/server";

jest.mock("@sentry/nextjs", () => ({
  logger: {
    trace: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
    fatal: jest.fn(),
  },
  addBreadcrumb: jest.fn(),
  captureException: jest.fn(),
  setTag: jest.fn(),
}));

jest.mock("@/lib/prisma", () => ({
  __esModule: true,
  default: {
    $queryRaw: jest.fn(),
  },
}));

import * as Sentry from "@sentry/nextjs";
import prisma from "@/lib/prisma";
import logger, { createChildLogger, sanitizeForSentry } from "@/lib/logger";
import {
  getRequestContext,
  runWithRequestContext,
  setRequestContextUser,
} from "@/lib/observability/context";
import {
  getApiMetricsSnapshot,
  recordApiMetric,
  resetApiMetrics,
} from "@/lib/observability/metrics";
import { withObservability } from "@/lib/observability/with-observability";
import { GET as healthGet } from "@/app/api/health/route";

describe("Observability & Centralized Logging", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetApiMetrics();
  });

  describe("Request Context (AsyncLocalStorage)", () => {
    it("isolates request context per async execution", async () => {
      expect(getRequestContext()).toBeUndefined();

      const results = await Promise.all([
        runWithRequestContext(
          { requestId: "req-1", method: "GET", path: "/api/a" },
          async () => {
            await new Promise((r) => setTimeout(r, 10));
            setRequestContextUser("user-1");
            return getRequestContext();
          },
        ),
        runWithRequestContext(
          { requestId: "req-2", method: "POST", path: "/api/b" },
          async () => {
            await new Promise((r) => setTimeout(r, 5));
            return getRequestContext();
          },
        ),
      ]);

      expect(results[0]).toEqual({
        requestId: "req-1",
        method: "GET",
        path: "/api/a",
        userId: "user-1",
      });
      expect(results[1]).toEqual({
        requestId: "req-2",
        method: "POST",
        path: "/api/b",
      });
      expect(getRequestContext()).toBeUndefined();
    });
  });

  describe("API Metrics Collector", () => {
    it("computes counts, error rate, avg and p95 latency", () => {
      for (let i = 1; i <= 20; i++) {
        recordApiMetric({
          route: "/api/courses",
          method: "GET",
          statusCode: i === 20 ? 500 : i === 19 ? 404 : 200,
          durationMs: i * 10,
        });
      }

      const snapshot = getApiMetricsSnapshot();
      expect(snapshot.requestCount).toBe(20);
      expect(snapshot.errorCount).toBe(1);
      expect(snapshot.clientErrorCount).toBe(1);
      expect(snapshot.errorRate).toBe(5);
      expect(snapshot.responseTime).toBe(105);
      expect(snapshot.p95ResponseTime).toBe(200);
      expect(snapshot.routes[0]).toEqual({
        route: "GET /api/courses",
        count: 20,
        errorCount: 1,
        avgDurationMs: 105,
      });
    });

    it("bounds recent sample window to 1000 entries", () => {
      for (let i = 0; i < 1100; i++) {
        recordApiMetric({
          route: "/api/test",
          method: "GET",
          statusCode: 200,
          durationMs: 15,
        });
      }

      const snapshot = getApiMetricsSnapshot();
      expect(snapshot.requestCount).toBe(1100);
      expect(snapshot.windowSize).toBe(1000);
    });
  });

  describe("Centralized Logger & Sentry Bridge", () => {
    it("redacts sensitive fields in sanitizeForSentry", () => {
      const sanitized = sanitizeForSentry({
        email: "user@example.com",
        password: "super-secret-password",
        token: "jwt-token",
        nested: {
          apiKey: "key-123",
          safeValue: "ok",
        },
        err: new Error("DB connection failed"),
      });

      expect(sanitized).toEqual({
        email: "user@example.com",
        password: "[REDACTED]",
        token: "[REDACTED]",
        nested: {
          apiKey: "[REDACTED]",
          safeValue: "ok",
        },
        err: {
          name: "Error",
          message: "DB connection failed",
        },
      });
    });

    it("forwards info and error logs with request context to Sentry", () => {
      runWithRequestContext(
        { requestId: "req-xyz", method: "POST", path: "/api/orders" },
        () => {
          logger.info({ orderId: 42 }, "Order processed");

          const boom = new Error("Payment gateway timeout");
          logger.error({ err: boom, password: "secret" }, "Order failed");
        },
      );

      expect(Sentry.logger.info).toHaveBeenCalledWith(
        "Order processed",
        expect.objectContaining({
          orderId: 42,
          requestId: "req-xyz",
          method: "POST",
          path: "/api/orders",
        }),
      );

      expect(Sentry.logger.error).toHaveBeenCalledWith(
        "Order failed",
        expect.objectContaining({
          password: "[REDACTED]",
          requestId: "req-xyz",
        }),
      );

      expect(Sentry.addBreadcrumb).toHaveBeenCalledTimes(2);
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: { request_id: "req-xyz" },
        }),
      );
    });

    it("supports createChildLogger", () => {
      const child = createChildLogger({ module: "billing" });
      child.warn("Low balance");
      expect(Sentry.logger.warn).toHaveBeenCalledWith(
        "Low balance",
        expect.any(Object),
      );
    });
  });

  describe("withObservability Wrapper", () => {
    it("propagates incoming x-request-id and records metrics", async () => {
      const handler = withObservability(
        async () => NextResponse.json({ ok: true }, { status: 200 }),
        { routeName: "/api/ping" },
      );

      const req = new NextRequest("http://localhost:3000/api/ping", {
        headers: { "x-request-id": "trace-123" },
      });

      const res = await handler(req, {});
      expect(res.status).toBe(200);
      expect(res.headers.get("x-request-id")).toBe("trace-123");
      expect(Sentry.setTag).toHaveBeenCalledWith("request_id", "trace-123");

      const metrics = getApiMetricsSnapshot();
      expect(metrics.requestCount).toBe(1);
      expect(metrics.errorCount).toBe(0);
    });

    it("generates x-request-id and captures unhandled errors as 500", async () => {
      const handler = withObservability(
        async () => {
          throw new Error("Unexpected crash");
        },
        { routeName: "/api/boom" },
      );

      const req = new NextRequest("http://localhost:3000/api/boom");
      const res = await handler(req, {});
      const body = await res.json();

      expect(res.status).toBe(500);
      expect(res.headers.get("x-request-id")).toBeTruthy();
      expect(body.error).toBe("Internal server error");
      expect(body.requestId).toBe(res.headers.get("x-request-id"));
      expect(Sentry.captureException).toHaveBeenCalledWith(
        expect.any(Error),
        expect.objectContaining({
          tags: expect.objectContaining({ route: "/api/boom" }),
        }),
      );

      const metrics = getApiMetricsSnapshot();
      expect(metrics.errorCount).toBe(1);
    });
  });

  describe("GET /api/health", () => {
    it("returns 200 healthy when database ping succeeds", async () => {
      (prisma.$queryRaw as jest.Mock).mockResolvedValueOnce([{ health_check: 1 }]);

      const req = new NextRequest("http://localhost:3000/api/health");
      const res = await healthGet(req, {});
      const body = await res.json();

      expect(res.status).toBe(200);
      expect(body.status).toBe("healthy");
      expect(body.checks.database.status).toBe("up");
    });

    it("returns 503 unhealthy when database ping fails", async () => {
      (prisma.$queryRaw as jest.Mock).mockRejectedValueOnce(
        new Error("Connection refused"),
      );

      const req = new NextRequest("http://localhost:3000/api/health");
      const res = await healthGet(req, {});
      const body = await res.json();

      expect(res.status).toBe(503);
      expect(body.status).toBe("unhealthy");
      expect(body.checks.database.status).toBe("down");
    });
  });
});
