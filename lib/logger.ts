import pino from "pino";

const isProduction = process.env.NODE_ENV === "production";

// In development, we use pino-pretty as a destination stream instead of a transport.
// This avoids using worker threads (thread-stream) which can crash during Next.js hot reloads.
// The user suggested using { worker: false } to disable the worker thread.
const logger = isProduction
  ? pino({
      level: process.env.LOG_LEVEL || "info",
      base: {
        env: process.env.NODE_ENV,
      },
    })
  : pino(
      {
        level: process.env.LOG_LEVEL || "debug",
        base: {
          env: process.env.NODE_ENV,
        },
      },
      // Using pino-pretty's stream directly in development avoids the worker thread issues
      // inherent in pino's transport mechanism during Next.js hot reloads.
      require("pino-pretty")({
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "SYS:standard",
      })
    );

export default logger;
