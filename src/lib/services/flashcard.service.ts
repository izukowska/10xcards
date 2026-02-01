import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "../../db/database.types";
import type { FlashcardCreateCommand, FlashcardDto, CreateFlashcards } from "../../types";

/**
 * Service for managing flashcard operations
 */

/**
 * Validates that a generation_id exists and belongs to the user
 * @param generationId - The generation ID to validate
 * @param userId - The user ID to verify ownership
 * @param supabase - Authenticated Supabase client
 * @returns true if valid, throws error otherwise
 */
async function validateGenerationId(
  generationId: number,
  userId: string,
  supabase: SupabaseClient<Database>
): Promise<boolean> {
  const { data: generation, error } = await supabase
    .from("flashcard_generations")
    .select("id, user_id")
    .eq("id", generationId)
    .single();

  if (error || !generation) {
    throw new Error(`Generation with ID ${generationId} not found`);
  }

  if (generation.user_id !== userId) {
    throw new Error(`Generation ${generationId} does not belong to user`);
  }

  return true;
}

/**
 * Creates one or more flashcards in the database
 *
 * Business logic:
 * - Validates generation_id if provided (checks existence and ownership)
 * - For AI sources (ai-full, ai-edited), increments accepted_unedited_count for ai-full
 * - Performs bulk insert for all flashcards
 * - Returns created flashcards as DTOs
 *
 * @param command - FlashcardCreateCommand containing array of flashcards to create
 * @param supabase - Authenticated Supabase client
 * @param userId - ID of the user creating flashcards
 * @returns Promise<FlashcardDto[]> - Array of created flashcards
 * @throws Error if validation fails or database operation fails
 */
export async function createFlashcards(
  command: FlashcardCreateCommand,
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<FlashcardDto[]> {
  // Step 1: Validate generation_ids if any are provided
  const uniqueGenerationIds = new Set(
    command.flashcards.filter((fc) => fc.generation_id !== null).map((fc) => fc.generation_id as number)
  );

  // Validate each unique generation_id
  for (const genId of uniqueGenerationIds) {
    await validateGenerationId(genId, userId, supabase);
  }

  // Step 2: Prepare flashcards for insertion
  const flashcardsToInsert: CreateFlashcards[] = command.flashcards.map((fc) => ({
    user_id: userId,
    front: fc.front,
    back: fc.back,
    source: fc.source,
    generation_id: fc.generation_id,
  }));

  // Step 3: Insert flashcards into database
  const { data: createdFlashcards, error: insertError } = await supabase
    .from("flashcards")
    .insert(flashcardsToInsert)
    .select("id, front, back, source, generation_id, created_at, updated_at");

  if (insertError || !createdFlashcards) {
    throw new Error(`Failed to create flashcards: ${insertError?.message || "Unknown error"}`);
  }

  // Step 4: Update accepted_unedited_count for AI-full flashcards
  // Group flashcards by generation_id and count ai-full sources
  const generationStats = new Map<number, number>();
  command.flashcards.forEach((fc) => {
    if (fc.generation_id !== null && fc.source === "ai-full") {
      const currentCount = generationStats.get(fc.generation_id) || 0;
      generationStats.set(fc.generation_id, currentCount + 1);
    }
  });

  // Update each generation's accepted_unedited_count
  for (const [genId, count] of generationStats.entries()) {
    // First, get the current count
    const { data: currentGeneration } = await supabase
      .from("flashcard_generations")
      .select("accepted_unedited_count")
      .eq("id", genId)
      .single();

    const currentAcceptedCount = currentGeneration?.accepted_unedited_count || 0;
    const newCount = currentAcceptedCount + count;

    // Update the count
    const { error: updateError } = await supabase
      .from("flashcard_generations")
      .update({ accepted_unedited_count: newCount })
      .eq("id", genId);

    if (updateError) {
      // Log error but don't fail the entire operation
      // eslint-disable-next-line no-console
      console.error(`Failed to update accepted_unedited_count for generation ${genId}:`, updateError);
    }
  }

  // Step 5: Return created flashcards as DTOs
  return createdFlashcards.map(
    (fc): FlashcardDto => ({
      id: fc.id,
      front: fc.front,
      back: fc.back,
      source: fc.source,
      generation_id: fc.generation_id,
      created_at: fc.created_at,
      updated_at: fc.updated_at,
    })
  );
}
