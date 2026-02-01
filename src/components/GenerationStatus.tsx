import * as React from "react";

interface GenerationStatusProps {
  status: "idle" | "loading" | "success" | "error";
  generatedCount?: number;
  emptyResult?: boolean;
}

export function GenerationStatus({ status, generatedCount, emptyResult }: GenerationStatusProps) {
  if (status === "idle") {
    return null;
  }

  if (status === "loading") {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Generowanie fiszek...</p>
      </div>
    );
  }

  if (status === "success" && emptyResult) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nie udało się wygenerować żadnych fiszek.</p>
        <p className="text-sm text-muted-foreground mt-2">Spróbuj ponownie z innym tekstem źródłowym.</p>
      </div>
    );
  }

  if (status === "success" && generatedCount !== undefined) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <svg
          className="h-5 w-5 text-green-600 dark:text-green-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
        <span>
          Wygenerowano {generatedCount} {generatedCount === 1 ? "fiszkę" : generatedCount < 5 ? "fiszki" : "fiszek"}
        </span>
      </div>
    );
  }

  return null;
}
