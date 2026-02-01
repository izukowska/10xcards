import type {
  ChatRequestOptions,
  ChatResponse,
  Logger,
  ModelParams,
  OpenRouterError,
  RateLimiter,
  ResponseFormat,
  UsageStats,
  ValidationResult,
  HealthStatus,
} from "../../types";
import { OpenRouterError as OpenRouterErrorClass } from "../../types";

/**
 * OpenRouter API payload structure
 */
interface OpenRouterPayload {
  model: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
  response_format?: ResponseFormat;
}

/**
 * OpenRouter API response structure
 */
interface OpenRouterApiResponse {
  id: string;
  model: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason?: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * OpenRouter service constructor configuration
 */
interface OpenRouterServiceConfig {
  apiKey: string;
  baseUrl?: string;
  defaultModel?: string;
  defaultParams?: ModelParams;
  timeoutMs?: number;
  maxRetries?: number;
  logger?: Logger;
  rateLimiter?: RateLimiter;
}

/**
 * Default model parameters with cost optimization
 */
const DEFAULT_MODEL_PARAMS: Required<ModelParams> = {
  temperature: 0.7,
  top_p: 0.9,
  frequency_penalty: 0.0,
  presence_penalty: 0.0,
  max_tokens: 1000,
};

/**
 * OpenRouter Service
 * Provides secure and testable communication with OpenRouter API
 * for generating LLM responses in chat applications.
 */
export class OpenRouterService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly defaultModel: string;
  private readonly defaultParams: ModelParams;
  private readonly timeoutMs: number;
  private readonly maxRetries: number;
  private readonly logger?: Logger;
  private readonly rateLimiter?: RateLimiter;

  /**
   * Creates a new OpenRouter service instance
   *
   * @param config - Service configuration
   * @throws OpenRouterError if apiKey is missing
   */
  constructor(config: OpenRouterServiceConfig) {
    // Guard clause: validate API key
    if (!config.apiKey || config.apiKey.trim() === "") {
      throw new OpenRouterErrorClass("API key is required", "config");
    }

    // Initialize configuration with secure defaults
    this.apiKey = config.apiKey;
    this.baseUrl = this.normalizeBaseUrl(config.baseUrl);
    this.defaultModel = config.defaultModel || "openai/gpt-4o-mini";
    this.defaultParams = config.defaultParams || {};
    this.timeoutMs = this.normalizeTimeout(config.timeoutMs);
    this.maxRetries = Math.max(0, Math.min(config.maxRetries ?? 3, 5)); // Clamp between 0-5
    this.logger = config.logger;
    this.rateLimiter = config.rateLimiter;

    // Log initialization (mask API key)
    this.logger?.info("OpenRouterService initialized", {
      baseUrl: this.baseUrl,
      defaultModel: this.defaultModel,
      timeoutMs: this.timeoutMs,
      maxRetries: this.maxRetries,
    });
  }

  /**
   * Sends chat messages to OpenRouter and returns the model's response
   *
   * @param options - Chat request options including messages, model, and parameters
   * @returns Normalized chat response with content, usage stats, and metadata
   * @throws OpenRouterError for various error scenarios
   */
  async sendChat(options: ChatRequestOptions): Promise<ChatResponse> {
    const requestId = options.requestId || this.generateRequestId();

    try {
      // Log request (without sensitive content)
      this.logger?.info("Sending chat request", {
        requestId,
        model: options.model || this.defaultModel,
        messageCount: options.messages.length,
      });

      // Validate input
      this.validateChatRequest(options);

      // Build API payload
      const payload = this.buildPayload(options);

      // Execute request with retry logic
      const response = await this.retryWithBackoff(async () => {
        return await this.executeRequest(payload, requestId);
      });

      // Parse and normalize response
      const chatResponse = this.parseApiResponse(response, requestId);

      // Log success
      this.logger?.info("Chat request successful", {
        requestId,
        model: chatResponse.model,
        tokensUsed: chatResponse.usage.total_tokens,
      });

      return chatResponse;
    } catch (error) {
      // Handle and log error
      const openRouterError = this.handleHttpError(error, requestId);
      this.logger?.error("Chat request failed", {
        requestId,
        errorType: openRouterError.type,
        message: openRouterError.message,
      });
      throw openRouterError;
    }
  }

  /**
   * Validates response data, especially when using response_format
   *
   * @param response - Response data to validate
   * @param responseFormat - Optional JSON schema for validation
   * @returns Validation result with parsed data or error
   */
  validateResponse(response: unknown, responseFormat?: ResponseFormat): ValidationResult {
    // Basic validation: check if response is a string
    if (typeof response !== "string") {
      return {
        valid: false,
        error: "Response must be a string",
      };
    }

    // If no response format specified, basic validation is sufficient
    if (!responseFormat) {
      return {
        valid: true,
        data: response,
      };
    }

    // Parse JSON response
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(response);
    } catch (error) {
      return {
        valid: false,
        error: `Invalid JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
      };
    }

    // Validate against schema
    const schema = responseFormat.json_schema.schema;
    const validation = this.validateAgainstSchema(parsedData, schema);

    return validation;
  }

  /**
   * Performs a health check to test API connectivity and authentication
   *
   * @returns Health status with latency information
   */
  async healthCheck(): Promise<HealthStatus> {
    const startTime = Date.now();

    try {
      // Send minimal chat request to test connectivity
      const testPayload: OpenRouterPayload = {
        model: this.defaultModel,
        messages: [{ role: "user", content: "Hello" }],
        max_tokens: 5,
      };

      await this.executeRequest(testPayload, "health-check");

      const latencyMs = Date.now() - startTime;

      this.logger?.info("Health check successful", { latencyMs });

      return {
        healthy: true,
        latencyMs,
      };
    } catch (error) {
      const latencyMs = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      this.logger?.error("Health check failed", { latencyMs, error: errorMessage });

      return {
        healthy: false,
        message: errorMessage,
        latencyMs,
      };
    }
  }

  /**
   * Builds OpenRouter API payload from chat request options
   *
   * @param options - Chat request options
   * @returns Structured payload for OpenRouter API
   */
  private buildPayload(options: ChatRequestOptions): OpenRouterPayload {
    const normalizedParams = this.normalizeParams(options.params);

    const payload: OpenRouterPayload = {
      model: options.model || this.defaultModel,
      messages: options.messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      ...normalizedParams,
    };

    // Add response_format if specified
    if (options.responseFormat) {
      payload.response_format = options.responseFormat;
    }

    return payload;
  }

  /**
   * Normalizes model parameters to ensure they are within allowed ranges
   *
   * @param params - Optional model parameters
   * @returns Normalized parameters with defaults filled in
   */
  private normalizeParams(params?: ModelParams): ModelParams {
    const merged = {
      ...DEFAULT_MODEL_PARAMS,
      ...this.defaultParams,
      ...params,
    };

    return {
      temperature: this.clamp(merged.temperature, 0, 2),
      top_p: this.clamp(merged.top_p, 0, 1),
      frequency_penalty: this.clamp(merged.frequency_penalty, -2, 2),
      presence_penalty: this.clamp(merged.presence_penalty, -2, 2),
      max_tokens: Math.max(1, Math.min(merged.max_tokens, 4096)),
    };
  }

  /**
   * Executes HTTP request to OpenRouter API
   *
   * @param payload - Request payload
   * @param requestId - Request identifier for logging
   * @returns API response
   * @throws OpenRouterError for various HTTP errors
   */
  private async executeRequest(payload: OpenRouterPayload, requestId: string): Promise<OpenRouterApiResponse> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "HTTP-Referer": "https://10xcards.app", // Optional: for OpenRouter analytics
          "X-Title": "10xCards", // Optional: for OpenRouter analytics
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Handle HTTP errors
      if (!response.ok) {
        const errorBody = await response.text();
        throw new OpenRouterErrorClass(
          `HTTP ${response.status}: ${errorBody}`,
          this.mapStatusToErrorType(response.status),
          response.status,
          requestId,
          this.isRetryableStatus(response.status)
        );
      }

      const data = await response.json();
      return data as OpenRouterApiResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      // Handle abort/timeout
      if (error instanceof Error && error.name === "AbortError") {
        throw new OpenRouterErrorClass("Request timeout", "timeout", undefined, requestId, true);
      }

      throw error;
    }
  }

  /**
   * Retries a function with exponential backoff strategy
   *
   * @param fn - Function to retry
   * @returns Result of the function
   * @throws Last error if all retries fail
   */
  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: OpenRouterError | undefined;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        const openRouterError = error instanceof OpenRouterErrorClass ? error : this.handleHttpError(error);

        lastError = openRouterError;

        // Don't retry if error is not retryable
        if (!openRouterError.retryable) {
          throw openRouterError;
        }

        // Don't retry on last attempt
        if (attempt === this.maxRetries) {
          throw openRouterError;
        }

        // Calculate backoff delay: 1s, 2s, 4s, 8s, etc.
        const delayMs = Math.min(1000 * Math.pow(2, attempt), 10000);

        this.logger?.warn("Retrying request", {
          attempt: attempt + 1,
          maxRetries: this.maxRetries,
          delayMs,
          errorType: openRouterError.type,
        });

        await this.sleep(delayMs);
      }
    }

    // This should never happen, but TypeScript needs it
    throw lastError || new OpenRouterErrorClass("Retry failed", "unknown");
  }

  /**
   * Handles HTTP errors and maps them to OpenRouterError
   *
   * @param error - Error object
   * @param requestId - Optional request ID
   * @returns OpenRouterError instance
   */
  private handleHttpError(error: unknown, requestId?: string): OpenRouterError {
    if (error instanceof OpenRouterErrorClass) {
      return error;
    }

    if (error instanceof Error) {
      return new OpenRouterErrorClass(error.message, "network", undefined, requestId, false);
    }

    return new OpenRouterErrorClass("Unknown error occurred", "unknown", undefined, requestId, false);
  }

  /**
   * Parses OpenRouter API response into normalized ChatResponse
   *
   * @param apiResponse - Raw API response
   * @param requestId - Request identifier
   * @returns Normalized chat response
   * @throws OpenRouterError if response format is invalid
   */
  private parseApiResponse(apiResponse: OpenRouterApiResponse, requestId: string): ChatResponse {
    // Validate response structure
    if (!apiResponse.choices || apiResponse.choices.length === 0) {
      throw new OpenRouterErrorClass("Invalid API response: no choices", "parse", undefined, requestId, false);
    }

    const choice = apiResponse.choices[0];
    if (!choice.message || !choice.message.content) {
      throw new OpenRouterErrorClass("Invalid API response: no message content", "parse", undefined, requestId, false);
    }

    // Build normalized response
    const usage: UsageStats = {
      prompt_tokens: apiResponse.usage?.prompt_tokens || 0,
      completion_tokens: apiResponse.usage?.completion_tokens || 0,
      total_tokens: apiResponse.usage?.total_tokens || 0,
    };

    return {
      content: choice.message.content,
      model: apiResponse.model,
      usage,
      requestId,
      finishReason: choice.finish_reason,
    };
  }

  /**
   * Validates chat request options
   *
   * @param options - Chat request options
   * @throws OpenRouterError if validation fails
   */
  private validateChatRequest(options: ChatRequestOptions): void {
    // Validate messages array
    if (!options.messages || options.messages.length === 0) {
      throw new OpenRouterErrorClass("Messages array cannot be empty", "validation");
    }

    // Validate each message
    for (const message of options.messages) {
      if (!message.role || !["system", "user", "assistant"].includes(message.role)) {
        throw new OpenRouterErrorClass(`Invalid message role: ${message.role}`, "validation");
      }

      if (!message.content || message.content.trim() === "") {
        throw new OpenRouterErrorClass("Message content cannot be empty", "validation");
      }
    }
  }

  /**
   * Validates data against JSON schema
   *
   * @param data - Data to validate
   * @param schema - JSON schema
   * @returns Validation result
   */
  private validateAgainstSchema(data: unknown, schema: { type: string; properties?: Record<string, unknown>; required?: string[]; additionalProperties?: boolean }): ValidationResult {
    // Basic type validation
    if (schema.type === "object") {
      if (typeof data !== "object" || data === null || Array.isArray(data)) {
        return {
          valid: false,
          error: "Data must be an object",
        };
      }

      const dataObj = data as Record<string, unknown>;

      // Check required properties
      if (schema.required) {
        for (const requiredProp of schema.required) {
          if (!(requiredProp in dataObj)) {
            return {
              valid: false,
              error: `Missing required property: ${requiredProp}`,
            };
          }
        }
      }

      // Check additional properties
      if (schema.additionalProperties === false && schema.properties) {
        const allowedProps = Object.keys(schema.properties);
        for (const prop of Object.keys(dataObj)) {
          if (!allowedProps.includes(prop)) {
            return {
              valid: false,
              error: `Additional property not allowed: ${prop}`,
            };
          }
        }
      }
    }

    return {
      valid: true,
      data,
    };
  }

  /**
   * Normalizes base URL by removing trailing slash
   *
   * @param baseUrl - Optional base URL
   * @returns Normalized base URL
   */
  private normalizeBaseUrl(baseUrl?: string): string {
    const url = baseUrl || "https://openrouter.ai/api/v1";
    return url.endsWith("/") ? url.slice(0, -1) : url;
  }

  /**
   * Normalizes timeout value to be within reasonable range
   *
   * @param timeoutMs - Optional timeout in milliseconds
   * @returns Normalized timeout value
   */
  private normalizeTimeout(timeoutMs?: number): number {
    const timeout = timeoutMs ?? 30000; // Default 30s
    return Math.max(1000, Math.min(timeout, 120000)); // Clamp between 1s and 120s
  }

  /**
   * Maps HTTP status code to error type
   *
   * @param status - HTTP status code
   * @returns Error type
   */
  private mapStatusToErrorType(status: number): "auth" | "rate_limit" | "server" | "validation" | "unknown" {
    if (status === 401 || status === 403) return "auth";
    if (status === 429) return "rate_limit";
    if (status >= 500) return "server";
    if (status >= 400 && status < 500) return "validation";
    return "unknown";
  }

  /**
   * Checks if HTTP status code is retryable
   *
   * @param status - HTTP status code
   * @returns True if status is retryable
   */
  private isRetryableStatus(status: number): boolean {
    return status === 429 || status >= 500;
  }

  /**
   * Clamps a value between min and max
   *
   * @param value - Value to clamp
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Clamped value
   */
  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(value, max));
  }

  /**
   * Generates a unique request ID
   *
   * @returns Random request ID
   */
  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
  }

  /**
   * Sleep utility for retry backoff
   *
   * @param ms - Milliseconds to sleep
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
