import type { APIRoute } from "astro";
import { z } from "zod";
import type { FlashcardCreateCommand, FlashcardDto } from "../../types";
import { createFlashcards } from "../../lib/services/flashcard.service";

export const prerender = false;

/**
 * Zod schema for validating flashcard creation
 * Validates:
 * - front: 1-200 characters
 * - back: 1-500 characters
 * - source: must be one of 'ai-full', 'ai-edited', 'manual'
 * - generation_id: required for AI sources, must be null for manual
 */
const flashcardCreateSchema = z.object({
  front: z
    .string()
    .min(1, { message: "Front must be at least 1 character long" })
    .max(200, { message: "Front must not exceed 200 characters" }),
  back: z
    .string()
    .min(1, { message: "Back must be at least 1 character long" })
    .max(500, { message: "Back must not exceed 500 characters" }),
  source: z.enum(["ai-full", "ai-edited", "manual"], {
    errorMap: () => ({ message: "Source must be one of: ai-full, ai-edited, manual" }),
  }),
  generation_id: z.number().int().positive().nullable(),
});

// Custom refinement to validate generation_id based on source
const flashcardCreateWithGenerationIdValidation = flashcardCreateSchema.refine(
  (data) => {
    // For AI sources, generation_id must be provided
    if ((data.source === "ai-full" || data.source === "ai-edited") && data.generation_id === null) {
      return false;
    }
    // For manual source, generation_id must be null
    if (data.source === "manual" && data.generation_id !== null) {
      return false;
    }
    return true;
  },
  {
    message: "generation_id must be provided for AI sources and null for manual source",
    path: ["generation_id"],
  }
);

// Schema for the entire request body (array of flashcards)
const flashcardCreateCommandSchema = z.object({
  flashcards: z
    .array(flashcardCreateWithGenerationIdValidation)
    .min(1, { message: "At least one flashcard must be provided" })
    .max(100, { message: "Cannot create more than 100 flashcards at once" }),
});

/**
 * POST /api/flashcards
 *
 * Creates one or more flashcards for the authenticated user.
 * Can be used for:
 * - Manual flashcard creation (source: "manual", generation_id: null)
 * - Accepting AI-generated flashcards (source: "ai-full", generation_id: required)
 * - Accepting edited AI flashcards (source: "ai-edited", generation_id: required)
 *
 * Request Body:
 * {
 *   "flashcards": [
 *     {
 *       "front": string (1-200 chars),
 *       "back": string (1-500 chars),
 *       "source": "ai-full" | "ai-edited" | "manual",
 *       "generation_id": number | null
 *     }
 *   ]
 * }
 *
 * Response (201):
 * {
 *   "data": FlashcardDto[],
 *   "message": "Flashcards created successfully"
 * }
 *
 * Error Responses:
 * - 400: Validation failed
 * - 401: Unauthorized
 * - 404: Generation ID not found (when provided)
 * - 500: Internal server error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Step 1: Authentication check
    const { user, supabase } = locals;
    
    if (!user) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          message: "You must be logged in to create flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Parse and validate request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON",
          message: "Request body must be valid JSON",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Validate using Zod schema
    const validationResult = flashcardCreateCommandSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");

      return new Response(
        JSON.stringify({
          error: "Validation failed",
          message: errorMessages,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const command: FlashcardCreateCommand = validationResult.data;

    // Step 3: Call flashcard service to create flashcards
    // Service handles database operations and business logic
    const result = await createFlashcards(command, supabase, user.id);

    // Step 4: Return success response with 201 Created status
    return new Response(
      JSON.stringify({
        data: result,
        message: "Flashcards created successfully",
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    // Step 5: Error handling
    // eslint-disable-next-line no-console
    console.error("Error in flashcard creation endpoint:", error);

    // Handle specific error types
    if (error instanceof Error) {
      // Check for specific error messages from service layer
      if (error.message.includes("Generation not found")) {
        return new Response(
          JSON.stringify({
            error: "Not found",
            message: error.message,
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error.message.includes("Unauthorized") || error.message.includes("not belong to user")) {
        return new Response(
          JSON.stringify({
            error: "Unauthorized",
            message: error.message,
          }),
          {
            status: 401,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Generic error response
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred during flashcard creation";

    return new Response(
      JSON.stringify({
        error: "Internal server error",
        message: errorMessage,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
