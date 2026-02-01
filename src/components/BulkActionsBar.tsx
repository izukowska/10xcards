import * as React from "react";
import { Button } from "@/components/ui/button";

interface BulkActionsBarProps {
  totalCount: number;
  acceptedCount: number;
  savedCount: number;
  rejectedCount: number;
  onSaveAccepted: () => void;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  isSaving: boolean;
}

export function BulkActionsBar({
  totalCount,
  acceptedCount,
  savedCount,
  rejectedCount,
  onSaveAccepted,
  onAcceptAll,
  onRejectAll,
  isSaving,
}: BulkActionsBarProps) {
  if (totalCount === 0) {
    return null;
  }

  return (
    <div className="sticky bottom-4 left-0 right-0 z-10">
      <div className="bg-card border rounded-lg shadow-lg p-4 mx-auto max-w-4xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium">
              Fiszki: {totalCount}
            </span>
            <span className="text-sm text-muted-foreground">Zaakceptowane: {acceptedCount}</span>
            <span className="text-sm text-muted-foreground">Zapisane: {savedCount}</span>
            <span className="text-sm text-muted-foreground">Odrzucone: {rejectedCount}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={onRejectAll}
              disabled={isSaving}
              variant="outline"
              size="sm"
            >
              Odrzuć wszystkie
            </Button>
            <Button
              onClick={onAcceptAll}
              disabled={isSaving}
              size="sm"
            >
              Zaakceptuj wszystkie
            </Button>
            {acceptedCount > 0 && (
              <Button
                onClick={onSaveAccepted}
                disabled={isSaving}
                size="default"
              >
                {isSaving ? "Zapisywanie..." : "Zapisz zaakceptowane"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
