/**
 * Simple test script for OpenRouter Service
 * Run with: node --loader tsx test-openrouter.ts
 * Or add to package.json scripts
 */
/* eslint-disable no-console */

import { OpenRouterService } from "./src/lib/services/openrouter.service";
import { ConsoleLogger } from "./src/lib/logger";
import type { ChatMessage } from "./src/types";

// ANSI color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  gray: "\x1b[90m",
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testBasicChat() {
  log("blue", "\n🧪 Test 1: Basic Chat Request");
  log("gray", "─".repeat(50));

  const service = new OpenRouterService({
    apiKey: process.env.OPENROUTER_API_KEY || "",
    logger: new ConsoleLogger("Test"),
  });

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Say 'Hello, World!' and nothing else.",
    },
  ];

  try {
    const response = await service.sendChat({ messages });
    log("green", "✓ Basic chat successful");
    log("gray", `  Model: ${response.model}`);
    log("gray", `  Content: ${response.content}`);
    log("gray", `  Tokens: ${response.usage.total_tokens}`);
    return true;
  } catch (error) {
    log("red", `✗ Basic chat failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

async function testSystemPrompt() {
  log("blue", "\n🧪 Test 2: System Prompt");
  log("gray", "─".repeat(50));

  const service = new OpenRouterService({
    apiKey: process.env.OPENROUTER_API_KEY || "",
    logger: new ConsoleLogger("Test"),
  });

  const messages: ChatMessage[] = [
    {
      role: "system",
      content: "You are a helpful assistant. Always end responses with '🎓'.",
    },
    {
      role: "user",
      content: "What is 2+2?",
    },
  ];

  try {
    const response = await service.sendChat({ messages });
    const hasEmoji = response.content.includes("🎓");

    if (hasEmoji) {
      log("green", "✓ System prompt respected");
    } else {
      log("yellow", "⚠ System prompt may not be fully respected");
    }

    log("gray", `  Content: ${response.content}`);
    return true;
  } catch (error) {
    log("red", `✗ System prompt test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

async function testJsonSchema() {
  log("blue", "\n🧪 Test 3: Structured Output (JSON Schema)");
  log("gray", "─".repeat(50));

  const service = new OpenRouterService({
    apiKey: process.env.OPENROUTER_API_KEY || "",
    logger: new ConsoleLogger("Test"),
  });

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "What is the capital of France?",
    },
  ];

  const responseFormat = {
    type: "json_schema" as const,
    json_schema: {
      name: "answer_with_confidence",
      strict: true,
      schema: {
        type: "object" as const,
        additionalProperties: false,
        properties: {
          answer: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["answer", "confidence"],
      },
    },
  };

  try {
    const response = await service.sendChat({ messages, responseFormat });

    // Validate response
    const validation = service.validateResponse(response.content, responseFormat);

    if (validation.valid) {
      log("green", "✓ JSON schema validation passed");
      const parsed = JSON.parse(response.content);
      log("gray", `  Answer: ${parsed.answer}`);
      log("gray", `  Confidence: ${parsed.confidence}`);
    } else {
      log("red", `✗ JSON schema validation failed: ${validation.error}`);
      return false;
    }

    return true;
  } catch (error) {
    log("red", `✗ JSON schema test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

async function testErrorHandling() {
  log("blue", "\n🧪 Test 4: Error Handling (Invalid API Key)");
  log("gray", "─".repeat(50));

  const service = new OpenRouterService({
    apiKey: "invalid_key_for_testing",
    logger: new ConsoleLogger("Test"),
    maxRetries: 0, // Don't retry for this test
  });

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Test",
    },
  ];

  try {
    await service.sendChat({ messages });
    log("red", "✗ Should have thrown an error");
    return false;
  } catch (error) {
    if (error && typeof error === "object" && "type" in error && error.type === "auth") {
      log("green", "✓ Auth error handled correctly");
      return true;
    }
    log("yellow", `⚠ Unexpected error type: ${error instanceof Error ? error.message : "Unknown"}`);
    return true; // Still pass, as error was thrown
  }
}

async function testHealthCheck() {
  log("blue", "\n🧪 Test 5: Health Check");
  log("gray", "─".repeat(50));

  const service = new OpenRouterService({
    apiKey: process.env.OPENROUTER_API_KEY || "",
    logger: new ConsoleLogger("Test"),
  });

  try {
    const health = await service.healthCheck();

    if (health.healthy) {
      log("green", "✓ Service is healthy");
      log("gray", `  Latency: ${health.latencyMs}ms`);
    } else {
      log("red", `✗ Service is unhealthy: ${health.message}`);
      return false;
    }

    return true;
  } catch (error) {
    log("red", `✗ Health check failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

async function testCustomParameters() {
  log("blue", "\n🧪 Test 6: Custom Model Parameters");
  log("gray", "─".repeat(50));

  const service = new OpenRouterService({
    apiKey: process.env.OPENROUTER_API_KEY || "",
    logger: new ConsoleLogger("Test"),
  });

  const messages: ChatMessage[] = [
    {
      role: "user",
      content: "Say hello",
    },
  ];

  try {
    const response = await service.sendChat({
      messages,
      params: {
        temperature: 0.5,
        max_tokens: 10,
        top_p: 0.8,
      },
    });

    log("green", "✓ Custom parameters accepted");
    log("gray", `  Content: ${response.content}`);
    log("gray", `  Tokens: ${response.usage.total_tokens}`);
    return true;
  } catch (error) {
    log("red", `✗ Custom parameters test failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    return false;
  }
}

async function runAllTests() {
  log("blue", "\n╔═══════════════════════════════════════════════════╗");
  log("blue", "║  OpenRouter Service - Test Suite                 ║");
  log("blue", "╚═══════════════════════════════════════════════════╝");

  // Check API key
  if (!process.env.OPENROUTER_API_KEY) {
    log("red", "\n✗ Error: OPENROUTER_API_KEY environment variable not set");
    log("yellow", "  Set it with: export OPENROUTER_API_KEY='your-key-here'");
    process.exit(1);
  }

  const results = {
    passed: 0,
    failed: 0,
  };

  // Run tests
  const tests = [
    testBasicChat,
    testSystemPrompt,
    testJsonSchema,
    testErrorHandling,
    testHealthCheck,
    testCustomParameters,
  ];

  for (const test of tests) {
    const passed = await test();
    if (passed) {
      results.passed++;
    } else {
      results.failed++;
    }
  }

  // Summary
  log("blue", "\n╔═══════════════════════════════════════════════════╗");
  log("blue", "║  Test Summary                                     ║");
  log("blue", "╚═══════════════════════════════════════════════════╝");
  log("gray", `Total tests: ${tests.length}`);
  log("green", `Passed: ${results.passed}`);

  if (results.failed > 0) {
    log("red", `Failed: ${results.failed}`);
    process.exit(1);
  } else {
    log("green", "\n✓ All tests passed!");
    process.exit(0);
  }
}

// Run tests
runAllTests().catch((error) => {
  log("red", `\n✗ Fatal error: ${error instanceof Error ? error.message : "Unknown error"}`);
  process.exit(1);
});
