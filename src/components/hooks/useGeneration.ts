import * as React from "react";
import type { GenerationStatusState, ProposalViewModel, GenerationCreateResponseDto } from "@/types";

interface UseGenerationResult {
  status: GenerationStatusState;
  proposals: ProposalViewModel[];
  error: string | null;
  generateFlashcards: (text: string) => Promise<void>;
  reset: () => void;
}

export function useGeneration(): UseGenerationResult {
  const [status, setStatus] = React.useState<GenerationStatusState>({
    status: "idle",
  });
  const [proposals, setProposals] = React.useState<ProposalViewModel[]>([]);
  const [error, setError] = React.useState<string | null>(null);

  const generateFlashcards = React.useCallback(async (text: string) => {
    setStatus({ status: "loading" });
    setError(null);
    setProposals([]);

    try {
      const response = await fetch("/api/flashcard-generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Błąd HTTP: ${response.status}`);
      }

      const data: GenerationCreateResponseDto = await response.json();

      // Map proposals to ViewModel with local UUIDs
      const proposalViewModels: ProposalViewModel[] = data.proposals.map((proposal) => ({
        id: crypto.randomUUID(),
        front: proposal.front,
        back: proposal.back,
        source: "ai-full" as const,
        decision: "pending" as const,
        isEditing: false,
        generation_id: data.generation_id,
      }));

      setProposals(proposalViewModels);
      setStatus({
        status: "success",
        generatedCount: data.generated_count,
        emptyResult: data.generated_count === 0,
      });

      if (data.generated_count === 0) {
        setError("Nie udało się wygenerować żadnych fiszek. Spróbuj ponownie z innym tekstem.");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.";

      setStatus({ status: "error", message: errorMessage });
      setError(errorMessage);
    }
  }, []);

  const reset = React.useCallback(() => {
    setStatus({ status: "idle" });
    setProposals([]);
    setError(null);
  }, []);

  return {
    status,
    proposals,
    error,
    generateFlashcards,
    reset,
  };
}
