import * as React from "react";
import { Button } from "@/components/ui/button";
import { InlineAlert } from "@/components/InlineAlert";
import { cn } from "@/lib/utils";

interface ProposalEditorProps {
  initialFront: string;
  initialBack: string;
  onSave: (front: string, back: string) => void;
  onCancel: () => void;
  validateEdit: (front: string, back: string) => string | null;
}

const FRONT_MAX = 200;
const BACK_MAX = 500;

export function ProposalEditor({
  initialFront,
  initialBack,
  onSave,
  onCancel,
  validateEdit,
}: ProposalEditorProps) {
  const [front, setFront] = React.useState(initialFront);
  const [back, setBack] = React.useState(initialBack);
  const [validationError, setValidationError] = React.useState<string | null>(
    null
  );

  const handleSave = () => {
    const error = validateEdit(front, back);
    if (error) {
      setValidationError(error);
      return;
    }
    onSave(front, back);
  };

  const handleCancel = () => {
    setFront(initialFront);
    setBack(initialBack);
    setValidationError(null);
    onCancel();
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="edit-front"
          className="text-sm font-medium leading-none"
        >
          Przód fiszki
        </label>
        <input
          id="edit-front"
          type="text"
          value={front}
          onChange={(e) => {
            setFront(e.target.value);
            setValidationError(null);
          }}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            front.length > FRONT_MAX && "border-destructive"
          )}
          placeholder="Pytanie lub termin..."
        />
        <div className="text-xs text-muted-foreground">
          {front.length} / {FRONT_MAX} znaków
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="edit-back" className="text-sm font-medium leading-none">
          Tył fiszki
        </label>
        <textarea
          id="edit-back"
          value={back}
          onChange={(e) => {
            setBack(e.target.value);
            setValidationError(null);
          }}
          className={cn(
            "flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
            back.length > BACK_MAX && "border-destructive"
          )}
          placeholder="Odpowiedź lub definicja..."
        />
        <div className="text-xs text-muted-foreground">
          {back.length} / {BACK_MAX} znaków
        </div>
      </div>

      {validationError && (
        <InlineAlert variant="error" message={validationError} />
      )}

      <div className="flex gap-2">
        <Button onClick={handleSave} size="sm">
          Zapisz
        </Button>
        <Button onClick={handleCancel} variant="outline" size="sm">
          Anuluj
        </Button>
      </div>
    </div>
  );
}
