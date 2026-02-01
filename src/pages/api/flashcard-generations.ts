import type { APIRoute } from "astro";
import { z } from "zod";
import { generateFlashcards } from "../../lib/services/generation.service";

export const prerender = false;

/**
 * Zod schema for validating the request body
 * Validates that text is between 1000 and 10000 characters
 */
const generateFlashcardsSchema = z.object({
  text: z
    .string()
    .min(1000, { message: "Text must be at least 1000 characters long" })
    .max(10000, { message: "Text must not exceed 10000 characters" }),
});

/**
 * POST /api/flashcard-generations
 *
 * Initiates AI flashcard generation process based on provided text.
 *
 * Request Body:
 * - text: string (1000-10000 characters)
 *
 * Response (200):
 * - generation_id: number
 * - generated_count: number
 * - proposals: FlashcardProposalDto[]
 *
 * Error Responses:
 * - 400: Validation failed
 * - 401: Unauthorized
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
          message: "You must be logged in to generate flashcards",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Parse and validate request body
    let body;
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
    const validationResult = generateFlashcardsSchema.safeParse(body);

    if (!validationResult.success) {
      const errorMessages = validationResult.error.errors.map((err) => err.message).join(", ");

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

    const { text } = validationResult.data;

    // Step 3: Call generation service
    // Service handles AI generation mock and database saving
    const result = await generateFlashcards(text, supabase, user.id);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Step 4: Error logging and handling
    // Error logging will be added in future implementation
    // eslint-disable-next-line no-console
    console.error("Error in flashcard generation endpoint:", error);

    const errorMessage =
      error instanceof Error ? error.message : "An unexpected error occurred during flashcard generation";

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
