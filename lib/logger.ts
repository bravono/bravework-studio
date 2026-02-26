import pino from "pino";
import * as Sentry from "@sentry/nextjs";

const logger = pino({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    process.env.NODE_ENV !== "production"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        }
      : undefined,
});

export const log = {
  info: (msg: string, obj?: any) => {
    if (obj) logger.info(obj, msg);
    else logger.info(msg);
  },
  debug: (msg: string, obj?: any) => {
    if (obj) logger.debug(obj, msg);
    else logger.debug(msg);
  },
  warn: (msg: string, obj?: any) => {
    if (obj) logger.warn(obj, msg);
    else logger.warn(msg);
  },
  error: (msg: string, err?: any) => {
    if (err) {
      logger.error(err, msg);
      Sentry.captureException(err, { extra: { message: msg } });
    } else {
      logger.error(msg);
      Sentry.captureMessage(msg, "error");
    }
  },
};

export default log;
