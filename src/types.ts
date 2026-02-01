import type { Database } from "./db/database.types";

// ---------------------------------------------------------------------------
// Aliases for base database types extracted from the database model definitions
// ---------------------------------------------------------------------------
export type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
export type CreateFlashcards = Database["public"]["Tables"]["flashcards"]["Insert"];
export type UpdateFlashcards = Database["public"]["Tables"]["flashcards"]["Update"];
export type FlashcardGeneration = Database["public"]["Tables"]["flashcard_generations"]["Row"];
export type GenerationErrorLog = Database["public"]["Tables"]["generation_error_logs"]["Row"];

/**
 * FlashcardDto - represents a flashcard as returned by the API endpoints (GET /flashcards and GET /flashcards/{id})
 */
export type FlashcardDto = Pick<
  Flashcard,
  "id" | "front" | "back" | "source" | "generation_id" | "created_at" | "updated_at"
>;

/**
 * PaginationDto - contains pagination metadata for list responses.
 */
export interface PaginationDto {
  page: number;
  limit: number;
  total: number;
}

/**
 * Flashcard List Response DTO - represents a paginated list of flashcards as returned by the API endpoints (GET /flashcards).
 */

export interface FlashcardListResponseDto {
  data: FlashcardDto[];
  pagination: PaginationDto;
}
/**
 * Flashcard Create DTO & Command Model
 * Used in the POST /flashcards endpoint to create one or more flashcards.
 * Validation rules:
 * - front must be between 1 and 200 characters-
 * - back must be between 1 and 500 characters-
 * - source must be one of 'ai-full', 'ai-edited', 'manual'
 * - generation_id required for "ai-full" and "ai-edited", must be null for "manual"
 */

export type Source = "ai-full" | "ai-edited" | "manual";

export interface FlashcardCreateDto {
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}

export interface FlashcardCreateCommand {
  flashcards: FlashcardCreateDto[];
}

/**
 * Flashcard update dto & command model
 * Used in the PUT /flashcards/:id endpoint to update a flashcard.
 * Validation rules:
 * - front must be between 1 and 200 characters-
 * - back must be between 1 and 500 characters-
 * - source must be one of 'ai-full', 'ai-edited', 'manual'
 * - generation_id required for "ai-full" and "ai-edited", must be null for "manual"
 */
export type FlashcardUpdateDto = Partial<{
  front: string;
  back: string;
  source: Source;
  generation_id: number | null;
}>;

/**
 * Generate Flashcards Command
 * Used in the POST /generations endpoint to initiate an AI flashcard generation process.
 * The "source_text" must be between 1000 and 10000 characters.
 */

export interface GenerateFlashcardsCommand {
  source_text: string;
}

/**
 * Flashcard Proposal DTO
 * Represents a single flashcard proposal generated from AI, always with source "ai-full".
 */
export interface FlashcardProposalDto {
  front: string;
  back: string;
  source: "ai-full";
}

/**
 * Generation Create Response DTO
 * This type describes the response from the POST /flashcard-generations endpoint.
 */
export interface GenerationCreateResponseDto {
  generation_id: number;
  generated_count: number;
  proposals: FlashcardProposalDto[];
}

/**
 * Generation Detail DTO
 * Provides detailed information for a generationrequest (GET /flashcard-generations/:id)
 * including metadata from the generations table and o0ptionally, the associated flashcards.
 */
export type GenerationDetailDto = FlashcardGeneration & {
  flashcards: FlashcardDto[];
};

/**
 * Generation Error Log DTO
 * Represents an error log entry for the AI flashcard generation process (GET /generation-error-logs)
 */
export type GenerationErrorLogDto = Pick<
  GenerationErrorLog,
  "id" | "error_code" | "error_message" | "created_at" | "model" | "source_text_hash" | "source_text_length" | "user_id"
>;

// ---------------------------------------------------------------------------
// Frontend ViewModel types for Generation View
// ---------------------------------------------------------------------------

/**
 * Generation Status State
 * Represents the current status of the generation process in the UI
 */
export interface GenerationStatusState {
  status: "idle" | "loading" | "success" | "error";
  message?: string;
  generatedCount?: number;
  emptyResult?: boolean;
}

/**
 * Proposal Decision
 * Represents the user's decision on a flashcard proposal
 */
export type ProposalDecision = "pending" | "accepted" | "rejected" | "edited" | "saved";

/**
 * Proposal ViewModel
 * Frontend representation of a flashcard proposal with user decision state
 */
export interface ProposalViewModel {
  id: string; // local uuid
  front: string;
  back: string;
  source: "ai-full";
  decision: ProposalDecision;
  isEditing: boolean;
  generation_id: number | null;
}

/**
 * Generation Form State
 * Local state for the generation form component
 */
export interface GenerationFormState {
  text: string;
  validationError: string | null;
}

/**
 * Proposal Edit State
 * Local state for editing a proposal
 */
export interface ProposalEditState {
  front: string;
  back: string;
  validationError: string | null;
}

// ---------------------------------------------------------------------------
// OpenRouter Service Types
// ---------------------------------------------------------------------------

/**
 * Chat message role
 */
export type ChatMessageRole = "system" | "user" | "assistant";

/**
 * Chat message structure for OpenRouter API
 */
export interface ChatMessage {
  role: ChatMessageRole;
  content: string;
}

/**
 * Model parameters for OpenRouter API
 */
export interface ModelParams {
  temperature?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  max_tokens?: number;
}

/**
 * JSON schema for structured output (response_format)
 */
export interface JsonSchema {
  type: "object";
  properties: Record<string, unknown>;
  required?: string[];
  additionalProperties?: boolean;
  [key: string]: unknown;
}

/**
 * Response format configuration for OpenRouter API
 */
export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: JsonSchema;
  };
}

/**
 * Chat request options for OpenRouter service
 */
export interface ChatRequestOptions {
  messages: ChatMessage[];
  model?: string;
  params?: ModelParams;
  responseFormat?: ResponseFormat;
  requestId?: string;
}

/**
 * Usage statistics from OpenRouter API response
 */
export interface UsageStats {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

/**
 * Chat response from OpenRouter service
 */
export interface ChatResponse {
  content: string;
  model: string;
  usage: UsageStats;
  requestId?: string;
  finishReason?: string;
}

/**
 * Validation result for response validation
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
  data?: unknown;
}

/**
 * Health status for service health check
 */
export interface HealthStatus {
  healthy: boolean;
  message?: string;
  latencyMs?: number;
}

/**
 * Error types for OpenRouter service
 */
export type OpenRouterErrorType =
  | "config"
  | "auth"
  | "rate_limit"
  | "server"
  | "network"
  | "validation"
  | "parse"
  | "timeout"
  | "unknown";

/**
 * OpenRouter service error
 */
export class OpenRouterError extends Error {
  constructor(
    message: string,
    public type: OpenRouterErrorType,
    public statusCode?: number,
    public requestId?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * Logger interface for OpenRouter service
 */
export interface Logger {
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
}

/**
 * Rate limiter interface for OpenRouter service
 */
export interface RateLimiter {
  checkLimit(userId: string): Promise<boolean>;
  recordRequest(userId: string): Promise<void>;
}
