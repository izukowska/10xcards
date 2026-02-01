import * as React from "react";
import { ProposalCard } from "@/components/ProposalCard";
import type { ProposalViewModel } from "@/types";

interface ProposalListProps {
  proposals: ProposalViewModel[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  onUpdate: (id: string, front: string, back: string) => void;
  onCancelEdit: (id: string) => void;
  validateEdit: (front: string, back: string) => string | null;
}

export function ProposalList({
  proposals,
  onAccept,
  onReject,
  onEdit,
  onUpdate,
  onCancelEdit,
  validateEdit,
}: ProposalListProps) {
  if (proposals.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {proposals.map((proposal) => (
        <ProposalCard
          key={proposal.id}
          proposal={proposal}
          onAccept={() => onAccept(proposal.id)}
          onReject={() => onReject(proposal.id)}
          onEdit={() => onEdit(proposal.id)}
          onUpdate={(front, back) => onUpdate(proposal.id, front, back)}
          onCancelEdit={() => onCancelEdit(proposal.id)}
          validateEdit={validateEdit}
        />
      ))}
    </div>
  );
}
