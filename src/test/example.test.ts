import { expect, test, vi } from "vitest";

/**
 * Example unit test demonstrating Vitest configuration
 */
test("basic math operations", () => {
  expect(1 + 1).toBe(2);
  expect(2 * 3).toBe(6);
});

test("string manipulation", () => {
  const str = "Hello, World!";
  expect(str).toContain("World");
  expect(str.toLowerCase()).toBe("hello, world!");
});

test("array operations", () => {
  const arr = [1, 2, 3, 4, 5];
  expect(arr).toHaveLength(5);
  expect(arr).toContain(3);
  expect(arr.filter((x) => x > 3)).toEqual([4, 5]);
});

test("mock functions", () => {
  const mockFn = vi.fn();

  mockFn("test");
  mockFn("another test");

  expect(mockFn).toHaveBeenCalledTimes(2);
  expect(mockFn).toHaveBeenCalledWith("test");
  expect(mockFn).toHaveBeenLastCalledWith("another test");
});

test("async operations", async () => {
  const promise = Promise.resolve("success");
  await expect(promise).resolves.toBe("success");
});

test("inline snapshot example", () => {
  const data = {
    name: "Test User",
    age: 25,
    active: true,
  };

  expect(data).toMatchInlineSnapshot(`
    {
      "active": true,
      "age": 25,
      "name": "Test User",
    }
  `);
});
