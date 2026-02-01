import { test, expect } from "@playwright/test";

/**
 * Example E2E test demonstrating Playwright configuration
 * This test assumes the app is running on http://localhost:4321
 */

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Wait for the page to load
    await page.waitForLoadState("networkidle");

    // Verify the page loaded successfully
    expect(page.url()).toContain("localhost:4321");
  });

  test("should have correct title", async ({ page }) => {
    await page.goto("/");

    // Check if the page has a title
    await expect(page).toHaveTitle(/10x/i);
  });
});

test.describe("Navigation", () => {
  test("should navigate using links", async ({ page }) => {
    await page.goto("/");

    // Example: Click on a navigation link (adjust selector based on your app)
    // await page.click('nav a[href="/about"]');
    // await expect(page).toHaveURL(/.*about/);
  });
});

test.describe("Form Interactions", () => {
  test("should handle form submission", async ({ page }) => {
    await page.goto("/");

    // Example form interaction (adjust based on your app)
    // await page.fill('input[name="email"]', 'test@example.com');
    // await page.fill('input[name="password"]', 'password123');
    // await page.click('button[type="submit"]');

    // Verify the result
    // await expect(page.locator('.success-message')).toBeVisible();
  });
});

test.describe("Responsive Design", () => {
  test("should work on mobile viewport", async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");

    // Verify mobile-specific elements
    await page.waitForLoadState("networkidle");
    expect(page.viewportSize()).toEqual({ width: 375, height: 667 });
  });

  test("should work on tablet viewport", async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto("/");

    await page.waitForLoadState("networkidle");
    expect(page.viewportSize()).toEqual({ width: 768, height: 1024 });
  });
});
