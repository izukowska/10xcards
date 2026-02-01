import * as React from "react";
import { GenerationForm } from "@/components/GenerationForm";
import { ProposalList } from "@/components/ProposalList";
import { BulkActionsBar } from "@/components/BulkActionsBar";
import { GenerationStatus } from "@/components/GenerationStatus";
import { InlineAlert } from "@/components/InlineAlert";
import { useGeneration } from "@/components/hooks/useGeneration";
import { useProposals } from "@/components/hooks/useProposals";
import type { GenerationFormState, FlashcardCreateCommand, ProposalViewModel } from "@/types";

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

export function GenerateView() {
  const [form, setForm] = React.useState<GenerationFormState>({
    text: "",
    validationError: null,
  });

  const { status, proposals: generatedProposals, error: apiError, generateFlashcards } = useGeneration();

  const {
    proposals,
    acceptedCount,
    savedCount,
    rejectedCount,
    acceptProposal,
    rejectProposal,
    startEditing,
    cancelEditing,
    updateProposal,
    markSaved,
    rejectAll,
    validateEdit,
  } = useProposals(generatedProposals);

  const [isSaving, setIsSaving] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = React.useState(false);

  const validateForm = (text: string): string | null => {
    if (text.length < MIN_LENGTH) {
      return `Tekst jest za krótki. Minimum ${MIN_LENGTH} znaków.`;
    }
    if (text.length > MAX_LENGTH) {
      return `Tekst jest za długi. Maksimum ${MAX_LENGTH} znaków.`;
    }
    return null;
  };

  const handleTextChange = (text: string) => {
    setForm({
      text,
      validationError: null,
    });
  };

  const handleSubmit = async () => {
    const validationError = validateForm(form.text);
    if (validationError) {
      setForm((prev) => ({ ...prev, validationError }));
      return;
    }

    setSaveSuccess(false);
    setSaveError(null);
    await generateFlashcards(form.text);
  };

  const saveProposals = async (proposalsToSave: ProposalViewModel[]) => {
    if (proposalsToSave.length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const flashcardsToCreate = proposalsToSave.map((proposal) => ({
        front: proposal.front,
        back: proposal.back,
        source: proposal.decision === "edited" ? ("ai-edited" as const) : ("ai-full" as const),
        generation_id: proposal.generation_id,
      }));

      const command: FlashcardCreateCommand = {
        flashcards: flashcardsToCreate,
      };

      const response = await fetch("/api/flashcards", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(command),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Błąd HTTP: ${response.status}`);
      }

      markSaved(proposalsToSave.map((proposal) => proposal.id));
      setSaveSuccess(true);
      setTimeout(() => {
        setForm({ text: "", validationError: null });
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      setSaveError(
        error instanceof Error ? error.message : "Wystąpił błąd podczas zapisywania fiszek. Spróbuj ponownie."
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAccepted = async () => {
    const acceptedProposals = proposals.filter((p) => p.decision === "accepted" || p.decision === "edited");

    await saveProposals(acceptedProposals);
  };

  const handleAcceptAll = async () => {
    await saveProposals(proposals);
  };

  const handleRejectAll = () => {
    rejectAll();
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Generowanie fiszek</h1>
          <p className="text-muted-foreground mt-2">
            Wklej tekst źródłowy, aby automatycznie wygenerować propozycje fiszek przy pomocy AI.
          </p>
        </div>

        <GenerationForm
          value={form.text}
          onChange={handleTextChange}
          onSubmit={handleSubmit}
          isSubmitting={status.status === "loading"}
          validationError={form.validationError}
        />

        {apiError && <InlineAlert variant="error" message={apiError} />}
        {saveError && <InlineAlert variant="error" message={saveError} />}
        {saveSuccess && <InlineAlert variant="success" message="Fiszki zostały pomyślnie zapisane!" />}

        <GenerationStatus
          status={status.status}
          generatedCount={status.generatedCount}
          emptyResult={status.emptyResult}
        />

        {status.status === "success" && proposals.length > 0 && (
          <div className="space-y-6 pb-24">
            <ProposalList
              proposals={proposals}
              onAccept={acceptProposal}
              onReject={rejectProposal}
              onEdit={startEditing}
              onUpdate={updateProposal}
              onCancelEdit={cancelEditing}
              validateEdit={validateEdit}
            />
          </div>
        )}

        <BulkActionsBar
          totalCount={proposals.length}
          acceptedCount={acceptedCount}
          savedCount={savedCount}
          rejectedCount={rejectedCount}
          onSaveAccepted={handleSaveAccepted}
          onAcceptAll={handleAcceptAll}
          onRejectAll={handleRejectAll}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
