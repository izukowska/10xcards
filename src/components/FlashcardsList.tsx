import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FlashcardListResponseDto } from "@/types";

interface FlashcardsListProps {
  initialData?: FlashcardListResponseDto;
}

const sourceLabels = {
  "ai-full": "AI",
  "ai-edited": "AI (edytowano)",
  "manual": "Ręcznie utworzona",
};

const sourceColors = {
  "ai-full": "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  "ai-edited": "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  "manual": "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
};

export function FlashcardsList({ initialData }: FlashcardsListProps) {
  const [data, setData] = React.useState<FlashcardListResponseDto | null>(initialData || null);
  const [loading, setLoading] = React.useState(!initialData);
  const [error, setError] = React.useState<string | null>(null);
  const [currentPage, setCurrentPage] = React.useState(1);

  const fetchFlashcards = React.useCallback(async (page: number) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/flashcards?page=${page}&limit=20`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Nie udało się pobrać fiszek");
      }

      const result: FlashcardListResponseDto = await response.json();
      setData(result);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    if (!initialData) {
      fetchFlashcards(1);
    }
  }, [initialData, fetchFlashcards]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">Ładowanie fiszek...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
        <p className="text-sm text-destructive">{error}</p>
        <Button 
          onClick={() => fetchFlashcards(currentPage)} 
          variant="outline" 
          size="sm" 
          className="mt-2"
        >
          Spróbuj ponownie
        </Button>
      </div>
    );
  }

  if (!data || data.data.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-muted-foreground/25 p-12 text-center">
        <svg
          className="mx-auto h-12 w-12 text-muted-foreground/50"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="mt-4 text-sm font-semibold">Brak fiszek</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Nie masz jeszcze żadnych zapisanych fiszek.
        </p>
        <div className="mt-6">
          <Button asChild>
            <a href="/generate">Wygeneruj fiszki</a>
          </Button>
        </div>
      </div>
    );
  }

  const { data: flashcards, pagination } = data;
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Moje fiszki</h2>
          <p className="text-sm text-muted-foreground">
            {pagination.total} {pagination.total === 1 ? "fiszka" : "fiszek"}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {flashcards.map((flashcard) => (
          <Card key={flashcard.id}>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <CardTitle className="text-base break-words flex-1">
                  {flashcard.front}
                </CardTitle>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-md shrink-0 ${
                    sourceColors[flashcard.source as keyof typeof sourceColors]
                  }`}
                >
                  {sourceLabels[flashcard.source as keyof typeof sourceLabels]}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-sm whitespace-pre-wrap break-words">
                {flashcard.back}
              </CardDescription>
              <div className="mt-4 text-xs text-muted-foreground">
                Utworzono:{" "}
                {new Date(flashcard.created_at).toLocaleDateString("pl-PL", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <Button
            onClick={() => fetchFlashcards(currentPage - 1)}
            disabled={currentPage === 1 || loading}
            variant="outline"
            size="sm"
          >
            Poprzednia
          </Button>
          <span className="text-sm text-muted-foreground">
            Strona {currentPage} z {totalPages}
          </span>
          <Button
            onClick={() => fetchFlashcards(currentPage + 1)}
            disabled={currentPage === totalPages || loading}
            variant="outline"
            size="sm"
          >
            Następna
          </Button>
        </div>
      )}
    </div>
  );
}
