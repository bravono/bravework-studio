import pino from "pino";
import * as Sentry from "@sentry/nextjs";
import { getRequestContext } from "./observability/context";

const isDevelopment = process.env.NODE_ENV === "development";

export const REDACTED_PATHS = [
  "password",
  "newPassword",
  "currentPassword",
  "token",
  "accessToken",
  "refreshToken",
  "secret",
  "apiKey",
  "authorization",
  "cookie",
  "creditCard",
  "cvv",
  "otp",
  "mfaCode",
  "*.password",
  "*.newPassword",
  "*.currentPassword",
  "*.token",
  "*.accessToken",
  "*.refreshToken",
  "*.secret",
  "*.apiKey",
  "*.authorization",
  "*.cookie",
  "*.otp",
  "*.mfaCode",
  "headers.authorization",
  "headers.cookie",
  "headers['x-paystack-signature']",
];

const SENSITIVE_KEY_PATTERN =
  /^(password|newpassword|currentpassword|token|accesstoken|refreshtoken|secret|apikey|authorization|cookie|creditcard|cvv|otp|mfacode|x-paystack-signature)$/i;

/**
 * Recursively redacts sensitive fields and formats Error instances for safe
 * transmission to Sentry Logs and breadcrumbs.
 */
export function sanitizeForSentry(
  value: unknown,
  depth = 0,
): Record<string, unknown> {
  if (!value || typeof value !== "object" || depth > 4) {
    return {};
  }

  const output: Record<string, unknown> = {};
  for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
    if (SENSITIVE_KEY_PATTERN.test(key)) {
      output[key] = "[REDACTED]";
      continue;
    }

    if (val instanceof Error) {
      output[key] = {
        name: val.name,
        message: val.message,
      };
    } else if (Array.isArray(val)) {
      output[key] = val.slice(0, 20).map((item) =>
        item && typeof item === "object" ? sanitizeForSentry(item, depth + 1) : item,
      );
    } else if (val && typeof val === "object") {
      output[key] = sanitizeForSentry(val, depth + 1);
    } else {
      output[key] = val;
    }
  }
  return output;
}

function extractLogParts(args: unknown[]): {
  message: string;
  attributes: Record<string, unknown>;
  errorObj?: Error;
} {
  let message = "";
  let attributes: Record<string, unknown> = {};
  let errorObj: Error | undefined;

  for (const arg of args) {
    if (arg instanceof Error) {
      errorObj = arg;
      if (!message) {
        message = arg.message;
      }
      attributes.errorName = arg.name;
      attributes.errorMessage = arg.message;
    } else if (typeof arg === "string") {
      message = message ? `${message} ${arg}` : arg;
    } else if (arg && typeof arg === "object") {
      const record = arg as Record<string, unknown>;
      if (record.err instanceof Error) {
        errorObj = record.err;
      } else if (record.error instanceof Error) {
        errorObj = record.error;
      }
      attributes = { ...attributes, ...sanitizeForSentry(record) };
    }
  }

  return {
    message: message || "Log event",
    attributes,
    errorObj,
  };
}

function forwardToSentry(level: number, args: unknown[]): void {
  try {
    const ctx = getRequestContext();
    const { message, attributes, errorObj } = extractLogParts(args);

    const enrichedAttributes: Record<string, unknown> = {
      ...attributes,
      ...(ctx?.requestId ? { requestId: ctx.requestId } : {}),
      ...(ctx?.method ? { method: ctx.method } : {}),
      ...(ctx?.path ? { path: ctx.path } : {}),
      ...(ctx?.userId ? { userId: ctx.userId } : {}),
    };

    const sentryLogger = Sentry.logger;
    if (sentryLogger) {
      if (level <= 10 && typeof sentryLogger.trace === "function") {
        sentryLogger.trace(message, enrichedAttributes);
      } else if (level <= 20 && typeof sentryLogger.debug === "function") {
        sentryLogger.debug(message, enrichedAttributes);
      } else if (level <= 30 && typeof sentryLogger.info === "function") {
        sentryLogger.info(message, enrichedAttributes);
      } else if (level <= 40 && typeof sentryLogger.warn === "function") {
        sentryLogger.warn(message, enrichedAttributes);
      } else if (level <= 50 && typeof sentryLogger.error === "function") {
        sentryLogger.error(message, enrichedAttributes);
      } else if (typeof sentryLogger.fatal === "function") {
        sentryLogger.fatal(message, enrichedAttributes);
      }
    }

    if (level >= 30 && typeof Sentry.addBreadcrumb === "function") {
      const breadcrumbLevel =
        level >= 60
          ? "fatal"
          : level >= 50
            ? "error"
            : level >= 40
              ? "warning"
              : "info";

      Sentry.addBreadcrumb({
        category: "logger",
        message,
        level: breadcrumbLevel,
        data: enrichedAttributes,
      });
    }

    if (
      level >= 50 &&
      errorObj &&
      typeof Sentry.captureException === "function"
    ) {
      Sentry.captureException(errorObj, {
        tags: ctx?.requestId ? { request_id: ctx.requestId } : undefined,
        extra: enrichedAttributes,
      });
    }
  } catch {
    // Never allow observability forwarding to disrupt application execution
  }
}

const pinoOptions: pino.LoggerOptions = {
  level: process.env.LOG_LEVEL || (isDevelopment ? "debug" : "info"),
  base: {
    env: process.env.NODE_ENV || "development",
    service: "bravework-studio",
  },
  redact: {
    paths: REDACTED_PATHS,
    censor: "[REDACTED]",
  },
  mixin() {
    const ctx = getRequestContext();
    if (!ctx) return {};
    return {
      requestId: ctx.requestId,
      ...(ctx.method ? { method: ctx.method } : {}),
      ...(ctx.path ? { path: ctx.path } : {}),
      ...(ctx.userId ? { userId: ctx.userId } : {}),
    };
  },
  hooks: {
    logMethod(inputArgs, method, level) {
      forwardToSentry(level, inputArgs);
      return method.apply(this, inputArgs);
    },
  },
};

// In development, we use pino-pretty as a destination stream instead of a transport.
// This avoids using worker threads (thread-stream) which can crash during Next.js hot reloads.
const logger = isDevelopment
  ? pino(
      pinoOptions,
      require("pino-pretty")({
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "SYS:standard",
      }),
    )
  : pino(pinoOptions);

/**
 * Creates a scoped child logger with persistent structured metadata (e.g. module or route).
 */
export function createChildLogger(
  bindings: Record<string, unknown>,
): pino.Logger {
  return logger.child(bindings);
}

export default logger;
