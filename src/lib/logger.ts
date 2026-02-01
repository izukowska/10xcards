import type { Logger } from "../types";

/**
 * Console logger implementation
 * Provides structured logging for server-side operations
 */
export class ConsoleLogger implements Logger {
  private readonly prefix: string;

  constructor(prefix = "OpenRouter") {
    this.prefix = prefix;
  }

  info(message: string, meta?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.log(`[${this.prefix}] INFO: ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.warn(`[${this.prefix}] WARN: ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
  }

  error(message: string, meta?: Record<string, unknown>): void {
    // eslint-disable-next-line no-console
    console.error(`[${this.prefix}] ERROR: ${message}`, meta ? JSON.stringify(meta, null, 2) : "");
  }
}

/**
 * No-op logger for production or when logging is disabled
 */
export class NoOpLogger implements Logger {
  info(): void {
    // no-op
  }

  warn(): void {
    // no-op
  }

  error(): void {
    // no-op
  }
}
