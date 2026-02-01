import * as React from "react";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/InlineAlert";
import { cn } from "@/lib/utils";

interface GenerationFormProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  validationError: string | null;
}

const MIN_LENGTH = 1000;
const MAX_LENGTH = 10000;

export function GenerationForm({ value, onChange, onSubmit, isSubmitting, validationError }: GenerationFormProps) {
  const textLength = value.length;
  const isValid = textLength >= MIN_LENGTH && textLength <= MAX_LENGTH;
  const canSubmit = isValid && !isSubmitting;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSubmit) {
      onSubmit();
    }
  };

  const getCharCountColor = () => {
    if (textLength < MIN_LENGTH) return "text-muted-foreground";
    if (textLength > MAX_LENGTH) return "text-destructive";
    return "text-green-600 dark:text-green-400";
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="source-text"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Tekst źródłowy
        </label>
        <textarea
          id="source-text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={isSubmitting}
          className={cn(
            "flex min-h-[200px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            textLength > MAX_LENGTH && "border-destructive"
          )}
          placeholder="Wklej tutaj tekst do wygenerowania fiszek (1000-10000 znaków)..."
        />
        <div className="flex justify-between items-center">
          <span className={cn("text-xs", getCharCountColor())}>
            {textLength} / {MAX_LENGTH} znaków
            {textLength < MIN_LENGTH && <span className="ml-2">(minimum {MIN_LENGTH - textLength} znaków)</span>}
          </span>
        </div>
      </div>

      {validationError && <InlineAlert variant="error" message={validationError} />}

      <Button type="submit" disabled={!canSubmit} className="w-full sm:w-auto">
        {isSubmitting ? "Generowanie..." : "Generuj fiszki"}
      </Button>
    </form>
  );
}
