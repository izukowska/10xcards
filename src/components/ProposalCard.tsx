import * as React from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProposalEditor } from "@/components/ProposalEditor";
import { cn } from "@/lib/utils";
import type { ProposalViewModel } from "@/types";

interface ProposalCardProps {
  proposal: ProposalViewModel;
  onAccept: () => void;
  onReject: () => void;
  onEdit: () => void;
  onUpdate: (front: string, back: string) => void;
  onCancelEdit: () => void;
  validateEdit: (front: string, back: string) => string | null;
}

const decisionStyles = {
  pending: "",
  accepted: "border-green-500 bg-green-50/50 dark:bg-green-950/20",
  rejected: "border-red-500 bg-red-50/50 dark:bg-red-950/20 opacity-60",
  edited: "border-green-600 bg-green-50/50 dark:bg-green-950/20", // Green like accepted, slightly darker border
  saved: "border-blue-500 bg-blue-50/50 dark:bg-blue-950/20",
};

const decisionLabels = {
  pending: "",
  accepted: "Zaakceptowano",
  rejected: "Odrzucono",
  edited: "Zaakceptowano (edytowano)", // Clear indication it's accepted
  saved: "Zapisano",
};

export function ProposalCard({
  proposal,
  onAccept,
  onReject,
  onEdit,
  onUpdate,
  onCancelEdit,
  validateEdit,
}: ProposalCardProps) {
  if (proposal.isEditing) {
    return (
      <Card className="border-primary">
        <CardHeader>
          <CardTitle className="text-base">Edycja propozycji</CardTitle>
        </CardHeader>
        <CardContent>
          <ProposalEditor
            initialFront={proposal.front}
            initialBack={proposal.back}
            onSave={onUpdate}
            onCancel={onCancelEdit}
            validateEdit={validateEdit}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(decisionStyles[proposal.decision])}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base break-words">{proposal.front}</CardTitle>
          </div>
          {proposal.decision !== "pending" && (
            <span className="text-xs font-medium px-2 py-1 rounded-md bg-background/50 shrink-0 flex items-center gap-1">
              {proposal.decision === "edited" && (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              )}
              {decisionLabels[proposal.decision]}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm whitespace-pre-wrap break-words">{proposal.back}</CardDescription>
      </CardContent>
      <CardFooter className="gap-2">
        {proposal.decision === "saved" ? null : proposal.decision === "rejected" ? (
          <Button onClick={onAccept} variant="outline" size="sm">
            Przywróć
          </Button>
        ) : (
          <>
            {proposal.decision === "pending" ? (
              <>
                <Button onClick={onAccept} size="sm">
                  Akceptuj
                </Button>
                <Button onClick={onReject} variant="destructive" size="sm">
                  Odrzuć
                </Button>
                <Button onClick={onEdit} variant="outline" size="sm">
                  Edytuj
                </Button>
              </>
            ) : (
              <>
                {(proposal.decision === "accepted" || proposal.decision === "edited") && (
                  <Button onClick={onReject} variant="destructive" size="sm">
                    Odrzuć
                  </Button>
                )}
                <Button onClick={onEdit} variant="outline" size="sm">
                  Edytuj
                </Button>
              </>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}
