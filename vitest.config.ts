import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Use jsdom environment for DOM testing
    environment: "jsdom",

    // Global test setup
    setupFiles: ["./src/test/setup.ts"],

    // Include test files
    include: ["src/**/*.{test,spec}.{js,ts,jsx,tsx}"],

    // Exclude directories
    exclude: ["node_modules", "dist", ".astro", "e2e"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "json-summary", "html"],
      exclude: ["node_modules/", "src/test/", "**/*.d.ts", "**/*.config.*", "**/mockData", "dist/"],
    },

    // Global test configuration
    globals: true,

    // Test timeout
    testTimeout: 10000,
  },

  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
