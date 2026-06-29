/**
 * Simple logger utility
 * Wraps console with log level awareness and structured output.
 */

const isDev = process.env.NODE_ENV !== "production";

const timestamp = () => new Date().toISOString();

const logger = {
  info: (...args) => {
    console.log(`[${timestamp()}] [INFO]`, ...args);
  },

  warn: (...args) => {
    console.warn(`[${timestamp()}] [WARN]`, ...args);
  },

  error: (...args) => {
    console.error(`[${timestamp()}] [ERROR]`, ...args);
  },

  debug: (...args) => {
    if (isDev) {
      console.debug(`[${timestamp()}] [DEBUG]`, ...args);
    }
  },

  request: (req) => {
    logger.info(`${req.method} ${req.originalUrl} — ${req.ip}`);
  },
};

export default logger;
