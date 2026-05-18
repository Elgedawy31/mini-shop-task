type LoggerMethod = (...args: any[]) => void;

interface Logger {
  log: LoggerMethod;
  warn: LoggerMethod;
  error: LoggerMethod;
  info: LoggerMethod;
  debug: LoggerMethod;
}

function stringifyArgs(args: any[]): string {
  return args
    .map((arg) => {
      try {
        if (typeof arg === "object" && arg !== null) {
          return JSON.stringify(arg, null, 2);
        }
        return String(arg);
      } catch (e) {
        return `[Unserializable: ${(e as Error).message}]`;
      }
    })
    .join(" ");
}

export const logger: Logger = {
  log: (...args: any[]): void => {
    if (process.env.NODE_ENV !== "production") {
      console.log(stringifyArgs(args));
    }
  },

  warn: (...args: any[]): void => {
    if (process.env.NODE_ENV !== "production") {
      console.warn(stringifyArgs(args));
    }
  },

  error: (...args: any[]): void => {
    // Always show errors in production too
    console.error(stringifyArgs(args));
  },

  info: (...args: any[]): void => {
    if (process.env.NODE_ENV !== "production") {
      console.info(stringifyArgs(args));
    }
  },

  debug: (...args: any[]): void => {
    if (process.env.NODE_ENV !== "production") {
      console.debug(stringifyArgs(args));
    }
  },
};

/**
 * Create a logger factory that can generate namespaced loggers
 */
export function createNamespacedLogger(namespace: string): Logger {
  return {
    log: (...args: any[]): void => logger.log(`[${namespace}]`, ...args),
    warn: (...args: any[]): void => logger.warn(`[${namespace}]`, ...args),
    error: (...args: any[]): void => logger.error(`[${namespace}]`, ...args),
    info: (...args: any[]): void => logger.info(`[${namespace}]`, ...args),
    debug: (...args: any[]): void => logger.debug(`[${namespace}]`, ...args),
  };
}

/**
 * For easy module import throughout the app
 */
export default logger;
