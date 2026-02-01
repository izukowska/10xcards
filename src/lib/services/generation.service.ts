import { DEFAULT_USER_ID } from "../../db/supabase.client";
import { ConsoleLogger } from "../logger";
import { OpenRouterService } from "./openrouter.service";
import type { FlashcardProposalDto, GenerationCreateResponseDto, ResponseFormat } from "../../types";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";

/**
 * Generation Service
 *
 * Handles AI flashcard generation logic with mocked AI responses.
 */

const RESPONSE_FORMAT: ResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "flashcard_proposals",
    strict: true,
    schema: {
      type: "object",
      required: ["proposals"],
      additionalProperties: false,
      properties: {
        proposals: {
          type: "array",
          items: {
            type: "object",
            required: ["front", "back"],
            additionalProperties: false,
            properties: {
              front: { type: "string" },
              back: { type: "string" },
            },
          },
        },
      },
    },
  },
};

/**
 * OpenRouter AI service call for flashcard proposals
 *
 * @param text - Source text for flashcard generation (1000-10000 characters)
 * @returns Proposals and model metadata
 */
async function callAiService(text: string): Promise<{ proposals: FlashcardProposalDto[]; model: string }> {
  const apiKey = import.meta.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("OpenRouter API is not configured");
  }

  const logger = new ConsoleLogger("GenerationService");
  const openRouterService = new OpenRouterService({
    apiKey,
    baseUrl: import.meta.env.OPENROUTER_BASE_URL,
    defaultModel: import.meta.env.OPENROUTER_DEFAULT_MODEL || "openai/gpt-4o-mini",
    timeoutMs: 60000,
    maxRetries: 3,
    logger,
  });

  const response = await openRouterService.sendChat({
    messages: [
      {
        role: "system",
        content:
          "Generujesz zwięzłe propozycje fiszek w języku polskim. Odpowiadasz wyłącznie poprawnym JSON-em zgodnym z podanym schematem.",
      },
      {
        role: "user",
        content: [
          "Wygeneruj 5-10 fiszek na podstawie tekstu poniżej.",
          "Zasady:",
          "- Każda fiszka ma zwięzłe pytanie (front) i zwięzłą odpowiedź (back).",
          "- Unikaj duplikatów i trywialności; skup się na kluczowych pojęciach.",
          "- Odpowiedzi mają być po polsku.",
          "",
          "TEKST:",
          text,
        ].join("\n"),
      },
    ],
    responseFormat: RESPONSE_FORMAT,
  });

  const validation = openRouterService.validateResponse(response.content, RESPONSE_FORMAT);
  if (!validation.valid) {
    throw new Error(`Invalid AI response format: ${validation.error || "Unknown validation error"}`);
  }

  const proposals = parseFlashcardProposals(validation.data);
  return { proposals, model: response.model };
}

/**
 * Main function to generate flashcards from source text
 *
 * Process:
 * 1. Call mock AI service to generate proposals
 * 2. Save generation metadata to database
 * 3. Return generation_id and proposals to the client
 *
 * @param text - Source text for generation
 * @param supabase - Authenticated Supabase client
 * @param userId - ID of the user requesting generation
 * @returns Generation response with proposals
 */
export async function generateFlashcards(
  text: string,
  supabase: SupabaseClient<Database>,
  userId: string = DEFAULT_USER_ID
): Promise<GenerationCreateResponseDto> {
  // Step 1: Call AI service to generate flashcard proposals (with timing)
  const startTime = Date.now();
  const { proposals, model } = await callAiService(text);
  const generationDuration = Date.now() - startTime;
  const generatedCount = proposals.length;

  // Step 2: Create hash of source text for deduplication
  const sourceTextHash = createSimpleHash(text);

  // Step 3: Save generation metadata to database
  const { data: generation, error: insertError } = await supabase
    .from("flashcard_generations")
    .insert({
      user_id: userId,
      source_text_hash: sourceTextHash,
      source_text_length: text.length,
      generated_count: generatedCount,
      accepted_unedited_count: 0,
      model,
      generation_duration: generationDuration, // Time taken for AI generation in milliseconds
    })
    .select("id")
    .single();

  if (insertError || !generation) {
    throw new Error(`Failed to save generation metadata: ${insertError?.message || "Unknown error"}`);
  }

  // Step 4: Return generation response with database ID
  return {
    generation_id: generation.id,
    generated_count: generatedCount,
    proposals,
  };
}

/**
 * Creates a simple hash of the text for deduplication
 * This is a basic implementation - in production, use a proper hashing library
 */
function createSimpleHash(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

function parseFlashcardProposals(data: unknown): FlashcardProposalDto[] {
  if (!data || typeof data !== "object") {
    throw new Error("AI response must be an object");
  }

  const proposals = (data as { proposals?: unknown }).proposals;
  if (!Array.isArray(proposals)) {
    throw new Error("AI response must include a proposals array");
  }

  if (proposals.length === 0) {
    throw new Error("AI response contained no proposals");
  }

  return proposals.map((proposal, index) => {
    if (!proposal || typeof proposal !== "object") {
      throw new Error(`Proposal at index ${index} must be an object`);
    }

    const front = (proposal as { front?: unknown }).front;
    const back = (proposal as { back?: unknown }).back;

    if (typeof front !== "string" || typeof back !== "string") {
      throw new Error(`Proposal at index ${index} must include string front and back`);
    }

    const trimmedFront = front.trim();
    const trimmedBack = back.trim();

    if (trimmedFront.length === 0 || trimmedBack.length === 0) {
      throw new Error(`Proposal at index ${index} has empty front/back`);
    }

    if (trimmedFront.length > 200 || trimmedBack.length > 500) {
      throw new Error(`Proposal at index ${index} exceeds length limits`);
    }

    return {
      front: trimmedFront,
      back: trimmedBack,
      source: "ai-full",
    };
  });
}
