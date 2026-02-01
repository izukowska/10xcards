import * as React from "react";
import type { ProposalViewModel, ProposalDecision } from "@/types";

interface UseProposalsResult {
  proposals: ProposalViewModel[];
  acceptedCount: number;
  savedCount: number;
  rejectedCount: number;
  acceptProposal: (id: string) => void;
  rejectProposal: (id: string) => void;
  startEditing: (id: string) => void;
  cancelEditing: (id: string) => void;
  updateProposal: (id: string, front: string, back: string) => void;
  markSaved: (ids: string[]) => void;
  rejectAll: () => void;
  validateEdit: (front: string, back: string) => string | null;
}

const FRONT_MIN = 1;
const FRONT_MAX = 200;
const BACK_MIN = 1;
const BACK_MAX = 500;

export function useProposals(
  initialProposals: ProposalViewModel[]
): UseProposalsResult {
  const [proposals, setProposals] = React.useState<ProposalViewModel[]>(
    initialProposals
  );

  // Update proposals when initialProposals changes
  React.useEffect(() => {
    setProposals(initialProposals);
  }, [initialProposals]);

  const acceptedCount = React.useMemo(() => {
    return proposals.filter(
      (p) =>
        p.decision === "accepted" ||
        p.decision === "edited"
    ).length;
  }, [proposals]);

  const savedCount = React.useMemo(() => {
    return proposals.filter((p) => p.decision === "saved").length;
  }, [proposals]);

  const rejectedCount = React.useMemo(() => {
    return proposals.filter((p) => p.decision === "rejected").length;
  }, [proposals]);

  const acceptProposal = React.useCallback((id: string) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, decision: "accepted" as ProposalDecision } : p
      )
    );
  }, []);

  const rejectProposal = React.useCallback((id: string) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, decision: "rejected" as ProposalDecision } : p
      )
    );
  }, []);

  const startEditing = React.useCallback((id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEditing: true } : p))
    );
  }, []);

  const cancelEditing = React.useCallback((id: string) => {
    setProposals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isEditing: false } : p))
    );
  }, []);

  const updateProposal = React.useCallback(
    (id: string, front: string, back: string) => {
      setProposals((prev) =>
        prev.map((p) =>
          p.id === id
            ? {
                ...p,
                front,
                back,
                decision: "edited" as ProposalDecision,
                isEditing: false,
              }
            : p
        )
      );
    },
    []
  );

  const markSaved = React.useCallback((ids: string[]) => {
    if (ids.length === 0) {
      return;
    }

    const idSet = new Set(ids);
    setProposals((prev) =>
      prev.map((p) =>
        idSet.has(p.id)
          ? {
              ...p,
              decision: "saved" as ProposalDecision,
              isEditing: false,
            }
          : p
      )
    );
  }, []);

  const rejectAll = React.useCallback(() => {
    setProposals((prev) =>
      prev.map((p) => ({
        ...p,
        decision: "rejected" as ProposalDecision,
        isEditing: false,
      }))
    );
  }, []);

  const validateEdit = React.useCallback(
    (front: string, back: string): string | null => {
      if (front.length < FRONT_MIN || front.length > FRONT_MAX) {
        return `Przód fiszki musi mieć od ${FRONT_MIN} do ${FRONT_MAX} znaków.`;
      }
      if (back.length < BACK_MIN || back.length > BACK_MAX) {
        return `Tył fiszki musi mieć od ${BACK_MIN} do ${BACK_MAX} znaków.`;
      }
      return null;
    },
    []
  );

  return {
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
  };
}
