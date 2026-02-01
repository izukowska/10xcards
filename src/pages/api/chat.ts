import type { APIRoute } from "astro";
import { z } from "zod";
import { OpenRouterService } from "../../lib/services/openrouter.service";
import { ConsoleLogger } from "../../lib/logger";
import type { ChatMessage, ChatResponse } from "../../types";
import { OpenRouterError } from "../../types";

export const prerender = false;

/**
 * Zod schema for chat message
 */
const chatMessageSchema = z.object({
  role: z.enum(["system", "user", "assistant"], {
    errorMap: () => ({ message: "Role must be one of: system, user, assistant" }),
  }),
  content: z.string().min(1, { message: "Content cannot be empty" }),
});

/**
 * Zod schema for model parameters
 */
const modelParamsSchema = z
  .object({
    temperature: z.number().min(0).max(2).optional(),
    top_p: z.number().min(0).max(1).optional(),
    frequency_penalty: z.number().min(-2).max(2).optional(),
    presence_penalty: z.number().min(-2).max(2).optional(),
    max_tokens: z.number().int().positive().optional(),
  })
  .optional();

/**
 * Zod schema for JSON schema (simplified)
 */
const jsonSchemaSchema = z.object({
  type: z.literal("object"),
  properties: z.record(z.unknown()),
  required: z.array(z.string()).optional(),
  additionalProperties: z.boolean().optional(),
});

/**
 * Zod schema for response format
 */
const responseFormatSchema = z
  .object({
    type: z.literal("json_schema"),
    json_schema: z.object({
      name: z.string(),
      strict: z.boolean(),
      schema: jsonSchemaSchema,
    }),
  })
  .optional();

/**
 * Zod schema for chat request
 */
const chatRequestSchema = z.object({
  messages: z
    .array(chatMessageSchema)
    .min(1, { message: "At least one message must be provided" })
    .max(50, { message: "Cannot send more than 50 messages at once" }),
  model: z.string().optional(),
  params: modelParamsSchema,
  responseFormat: responseFormatSchema,
});

/**
 * POST /api/chat
 *
 * Sends chat messages to OpenRouter and returns the AI response.
 *
 * Request Body:
 * {
 *   "messages": [
 *     {
 *       "role": "system" | "user" | "assistant",
 *       "content": string
 *     }
 *   ],
 *   "model": string (optional),
 *   "params": {
 *     "temperature": number (0-2, optional),
 *     "top_p": number (0-1, optional),
 *     "frequency_penalty": number (-2 to 2, optional),
 *     "presence_penalty": number (-2 to 2, optional),
 *     "max_tokens": number (optional)
 *   },
 *   "responseFormat": {
 *     "type": "json_schema",
 *     "json_schema": {
 *       "name": string,
 *       "strict": boolean,
 *       "schema": {...}
 *     }
 *   } (optional)
 * }
 *
 * Response (200):
 * {
 *   "content": string,
 *   "model": string,
 *   "usage": {
 *     "prompt_tokens": number,
 *     "completion_tokens": number,
 *     "total_tokens": number
 *   },
 *   "requestId": string,
 *   "finishReason": string
 * }
 *
 * Error Responses:
 * - 400: Validation failed
 * - 401: Unauthorized (invalid API key)
 * - 429: Rate limit exceeded
 * - 500: Internal server error
 * - 503: Service unavailable (OpenRouter error)
 */
export const POST: APIRoute = async ({ request }) => {
  const logger = new ConsoleLogger("ChatAPI");

  try {
    // Step 1: Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch (error) {
      logger.warn("Invalid JSON in request body");
      return new Response(
        JSON.stringify({
          error: "Bad Request",
          message: "Request body must be valid JSON",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Validate request schema
    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      logger.warn("Request validation failed", {
        errors: validationResult.error.issues,
      });
      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: "Invalid request format",
          details: validationResult.error.issues.map((issue) => ({
            path: issue.path.join("."),
            message: issue.message,
          })),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedData = validationResult.data;

    // Step 3: Get OpenRouter API key from environment
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.error("OPENROUTER_API_KEY not configured");
      return new Response(
        JSON.stringify({
          error: "Configuration Error",
          message: "OpenRouter API is not configured",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 4: Initialize OpenRouter service
    const openRouterService = new OpenRouterService({
      apiKey,
      baseUrl: import.meta.env.OPENROUTER_BASE_URL,
      defaultModel: import.meta.env.OPENROUTER_DEFAULT_MODEL || "openai/gpt-4o-mini",
      timeoutMs: 60000, // 60s timeout for chat requests
      maxRetries: 3,
      logger,
    });

    // Step 5: Send chat request
    logger.info("Processing chat request", {
      messageCount: validatedData.messages.length,
      hasResponseFormat: !!validatedData.responseFormat,
    });

    const response: ChatResponse = await openRouterService.sendChat({
      messages: validatedData.messages as ChatMessage[],
      model: validatedData.model,
      params: validatedData.params,
      responseFormat: validatedData.responseFormat,
    });

    // Step 6: Validate response if responseFormat was provided
    if (validatedData.responseFormat) {
      const validation = openRouterService.validateResponse(
        response.content,
        validatedData.responseFormat
      );

      if (!validation.valid) {
        logger.error("Response validation failed", {
          error: validation.error,
        });
        return new Response(
          JSON.stringify({
            error: "Response Validation Error",
            message: "AI response does not match expected format",
            details: validation.error,
          }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Step 7: Return successful response
    logger.info("Chat request successful", {
      requestId: response.requestId,
      tokensUsed: response.usage.total_tokens,
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Handle OpenRouter-specific errors
    if (error instanceof OpenRouterError) {
      logger.error("OpenRouter error", {
        type: error.type,
        message: error.message,
        statusCode: error.statusCode,
        requestId: error.requestId,
      });

      // Map error type to HTTP status
      const statusMap: Record<string, number> = {
        config: 500,
        auth: 401,
        rate_limit: 429,
        server: 503,
        network: 503,
        validation: 400,
        parse: 500,
        timeout: 504,
        unknown: 500,
      };

      const status = statusMap[error.type] || 500;

      return new Response(
        JSON.stringify({
          error: error.type,
          message: error.message,
          requestId: error.requestId,
        }),
        {
          status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Handle unexpected errors
    logger.error("Unexpected error in chat endpoint", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

/**
 * GET /api/chat
 *
 * Health check endpoint for OpenRouter service
 *
 * Response (200):
 * {
 *   "healthy": boolean,
 *   "message": string (optional),
 *   "latencyMs": number (optional)
 * }
 */
export const GET: APIRoute = async () => {
  const logger = new ConsoleLogger("ChatAPI");

  try {
    // Get OpenRouter API key from environment
    const apiKey = import.meta.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      logger.error("OPENROUTER_API_KEY not configured");
      return new Response(
        JSON.stringify({
          healthy: false,
          message: "OpenRouter API is not configured",
        }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Initialize OpenRouter service
    const openRouterService = new OpenRouterService({
      apiKey,
      baseUrl: import.meta.env.OPENROUTER_BASE_URL,
      defaultModel: import.meta.env.OPENROUTER_DEFAULT_MODEL || "openai/gpt-4o-mini",
      timeoutMs: 10000, // 10s timeout for health check
      maxRetries: 1,
      logger,
    });

    // Perform health check
    const healthStatus = await openRouterService.healthCheck();

    const status = healthStatus.healthy ? 200 : 503;

    return new Response(JSON.stringify(healthStatus), {
      status,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    logger.error("Health check failed", {
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return new Response(
      JSON.stringify({
        healthy: false,
        message: "Health check failed",
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
