import { vi } from "vitest";

// Global test utilities and helpers

/**
 * Wait for a condition to be true
 */
export async function waitFor(
  condition: () => boolean | Promise<boolean>,
  timeout = 5000,
  interval = 100
): Promise<void> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  throw new Error(`Timeout waiting for condition after ${timeout}ms`);
}

/**
 * Create a mock function with TypeScript type safety
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createMockFn<T extends (...args: any[]) => any>(): T {
  return vi.fn() as T;
}

/**
 * Sleep for a specified duration
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate random test data
 */
export const testData = {
  randomEmail: () => `test-${Date.now()}@example.com`,
  randomString: (length = 10) =>
    Math.random()
      .toString(36)
      .substring(2, length + 2),
  randomNumber: (min = 0, max = 100) => Math.floor(Math.random() * (max - min + 1)) + min,
};
