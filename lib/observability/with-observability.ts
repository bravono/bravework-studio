import crypto from "crypto";
import { NextRequest, NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import logger from "@/lib/logger";
import { runWithRequestContext } from "./context";
import { recordApiMetric } from "./metrics";

export interface ObservabilityOptions {
  /** Override the route name used in logs and metrics (defaults to request pathname). */
  routeName?: string;
  /** Skip info-level completion logs (useful for high-frequency health checks). */
  skipSuccessLog?: boolean;
  /** Skip recording into in-memory API metrics. */
  skipMetrics?: boolean;
}

type RouteHandler<TContext = unknown> = (
  req: NextRequest,
  context: TContext,
) => Promise<Response> | Response;

function resolvePathname(req: NextRequest): string {
  if (req.nextUrl?.pathname) {
    return req.nextUrl.pathname;
  }
  try {
    return new URL(req.url).pathname;
  } catch {
    return "/unknown";
  }
}

function attachRequestIdHeader(res: Response, requestId: string): Response {
  try {
    res.headers.set("x-request-id", requestId);
    return res;
  } catch {
    const headers = new Headers(res.headers);
    headers.set("x-request-id", requestId);
    return new NextResponse(res.body, {
      status: res.status,
      statusText: res.statusText,
      headers,
    });
  }
}

/**
 * Wraps a Next.js App Router handler with correlation IDs (x-request-id),
 * AsyncLocalStorage context, latency measurement, structured logging,
 * in-memory metrics recording, and Sentry error capture.
 */
export function withObservability<TContext = unknown>(
  handler: RouteHandler<TContext>,
  options: ObservabilityOptions = {},
): RouteHandler<TContext> {
  return async (req: NextRequest, context: TContext): Promise<Response> => {
    const requestId = req.headers.get("x-request-id") || crypto.randomUUID();
    const method = req.method || "GET";
    const path = resolvePathname(req);
    const routeName = options.routeName || path;
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || undefined;
    const startTime = performance.now();

    return runWithRequestContext({ requestId, method, path, ip }, async () => {
      try {
        if (typeof Sentry.setTag === "function") {
          Sentry.setTag("request_id", requestId);
        }
      } catch {
        // Ignore Sentry tag errors
      }

      try {
        const response = await handler(req, context);
        const durationMs = Math.round(performance.now() - startTime);
        const statusCode = response.status;

        if (!options.skipMetrics) {
          recordApiMetric({
            route: routeName,
            method,
            statusCode,
            durationMs,
          });
        }

        if (statusCode >= 500) {
          logger.error(
            { statusCode, durationMs, route: routeName },
            "API request failed",
          );
        } else if (statusCode >= 400) {
          logger.warn(
            { statusCode, durationMs, route: routeName },
            "API request client error",
          );
        } else if (!options.skipSuccessLog) {
          logger.info(
            { statusCode, durationMs, route: routeName },
            "API request completed",
          );
        }

        return attachRequestIdHeader(response, requestId);
      } catch (error) {
        const durationMs = Math.round(performance.now() - startTime);

        if (!options.skipMetrics) {
          recordApiMetric({
            route: routeName,
            method,
            statusCode: 500,
            durationMs,
          });
        }

        try {
          if (typeof Sentry.captureException === "function") {
            Sentry.captureException(error, {
              tags: { request_id: requestId, route: routeName },
            });
          }
        } catch {
          // Ignore Sentry capture errors
        }

        logger.error(
          { err: error, durationMs, route: routeName },
          "Unhandled API route error",
        );

        return NextResponse.json(
          { error: "Internal server error", requestId },
          {
            status: 500,
            headers: { "x-request-id": requestId },
          },
        );
      }
    });
  };
}
