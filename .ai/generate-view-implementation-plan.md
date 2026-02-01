# Plan implementacji widoku Generowanie fiszek

## 1. Przegląd
Widok umożliwia wklejenie tekstu źródłowego (1000–10000 znaków) i wysłanie go do API w celu wygenerowania propozycji fiszek przez AI. Następnie użytkownik może przeglądać, zawierdzać, edytować lub odrzucać wygenerowane propozycje fiszek. Na koniec może zapisać do bazy wszystkie bądź tylko zaakceptowane fiszki.

## 2. Routing widoku
Ścieżka: `/generate`

## 3. Struktura komponentów
- `GeneratePage` (Astro page)
- `GenerateView` (kontener React, logika widoku)
- `GenerationForm`
- `GenerationStatus`
- `ProposalList`
- `ProposalCard`
- `ProposalEditor` (tryb edycji w karcie)
- `BulkActionsBar`
- `InlineAlert`

## 4. Szczegóły komponentów
### GeneratePage
- Opis komponentu: Strona Astro osadzająca widok React i zapewniająca układ.
- Główne elementy: `Layout` + `GenerateView`.
- Obsługiwane interakcje: brak (statyczny wrapper).
- Obsługiwana walidacja: brak.
- Typy: brak.
- Propsy: brak.

### GenerateView
- Opis komponentu: Główny kontener widoku, utrzymuje stan procesu generowania i listy propozycji.
- Główne elementy: `GenerationForm`, `GenerationStatus`, `ProposalList`, `BulkActionsBar`, `InlineAlert`.
- Obsługiwane interakcje: submit formularza, akcje akceptuj/odrzuć/edytuj, zapis zbiorczy.
- Obsługiwana walidacja: deleguje do `GenerationForm` oraz waliduje warunki zapisu zbiorczego.
- Typy: `GenerationCreateResponseDto`, `FlashcardProposalDto`, `ProposalViewModel`, `GenerationState`.
- Propsy: brak.

### GenerationForm
- Opis komponentu: Formularz z polem tekstowym i przyciskiem uruchamiającym generowanie.
- Główne elementy: `textarea`, licznik znaków, `Button` (Shadcn), `InlineAlert`.
- Obsługiwane interakcje: `onChange` tekstu, `onSubmit`.
- Obsługiwana walidacja:
  - długość tekstu min 1000 i max 10000 znaków,
  - blokada submit gdy walidacja nie przechodzi lub trwa ładowanie.
- Typy: `GenerateFlashcardsCommand`, `GenerationFormState`.
- Propsy:
  - `value: string`
  - `onChange(value: string): void`
  - `onSubmit(): void`
  - `isSubmitting: boolean`
  - `validationError: string | null`

### GenerationStatus
- Opis komponentu: Pokazuje status ładowania, liczbę wygenerowanych propozycji i komunikaty o braku wyników.
- Główne elementy: `Skeleton`/spinner, tekst statusu.
- Obsługiwane interakcje: brak.
- Obsługiwana walidacja: brak.
- Typy: `GenerationState`.
- Propsy:
  - `status: "idle" | "loading" | "success" | "error"`
  - `generatedCount?: number`
  - `emptyResult?: boolean`

### ProposalList
- Opis komponentu: Lista propozycji fiszek wraz z filtrowaniem stanu (opcjonalnie).
- Główne elementy: lista `ProposalCard`.
- Obsługiwane interakcje: przekazywanie akcji do kart.
- Obsługiwana walidacja: brak.
- Typy: `ProposalViewModel[]`.
- Propsy:
  - `proposals: ProposalViewModel[]`
  - `onAccept(id: string): void`
  - `onReject(id: string): void`
  - `onEdit(id: string): void`
  - `onUpdate(id: string, front: string, back: string): void`

### ProposalCard
- Opis komponentu: Prezentacja pojedynczej propozycji z akcjami akceptuj/odrzuć/edytuj.
- Główne elementy: `Card`, pola `front` i `back`, przyciski akcji.
- Obsługiwane interakcje: kliknięcia akcji, przełączanie w tryb edycji.
- Obsługiwana walidacja: długości pól przy zapisie edycji (front 1–200, back 1–500).
- Typy: `ProposalViewModel`.
- Propsy:
  - `proposal: ProposalViewModel`
  - `onAccept(): void`
  - `onReject(): void`
  - `onEdit(): void`
  - `onUpdate(front: string, back: string): void`

### ProposalEditor
- Opis komponentu: Tryb edycji propozycji wewnątrz karty.
- Główne elementy: `input/textarea`, przyciski `Zapisz` i `Anuluj`.
- Obsługiwane interakcje: `onChange`, `onSave`, `onCancel`.
- Obsługiwana walidacja: front 1–200, back 1–500; blokada zapisu przy błędach.
- Typy: `ProposalEditState`.
- Propsy:
  - `initialFront: string`
  - `initialBack: string`
  - `onSave(front: string, back: string): void`
  - `onCancel(): void`

### BulkActionsBar
- Opis komponentu: Pasek akcji zbiorczych (np. zapisz zaakceptowane).
- Główne elementy: przycisk zapisu, licznik zaakceptowanych.
- Obsługiwane interakcje: `onSaveAccepted`.
- Obsługiwana walidacja: aktywność przycisku tylko gdy są zaakceptowane propozycje.
- Typy: brak.
- Propsy:
  - `acceptedCount: number`
  - `onSaveAccepted(): void`
  - `isSaving: boolean`

### InlineAlert
- Opis komponentu: Wspólny komponent komunikatów błędów/ostrzeżeń.
- Główne elementy: `Alert` (Shadcn).
- Obsługiwane interakcje: opcjonalne zamknięcie.
- Obsługiwana walidacja: brak.
- Typy: brak.
- Propsy:
  - `variant: "error" | "warning" | "success" | "info"`
  - `message: string`

## 5. Typy
### DTO z istniejących definicji
- `GenerateFlashcardsCommand`:
  - `source_text: string` (uwaga: endpoint wymaga `text`, dlatego w UI użyć mapowania)
- `FlashcardProposalDto`:
  - `front: string`
  - `back: string`
  - `source: "ai-full"`
- `GenerationCreateResponseDto`:
  - `generation_id: number`
  - `generated_count: number`
  - `proposals: FlashcardProposalDto[]`

### Nowe typy ViewModel (frontend)
- `GenerationStatusState`:
  - `status: "idle" | "loading" | "success" | "error"`
  - `message?: string`
  - `generatedCount?: number`
  - `emptyResult?: boolean`
- `ProposalDecision`:
  - `"pending" | "accepted" | "rejected" | "edited"`
- `ProposalViewModel`:
  - `id: string` (uuid lokalny)
  - `front: string`
  - `back: string`
  - `source: "ai-full"`
  - `decision: ProposalDecision`
  - `isEditing: boolean`
- `GenerationFormState`:
  - `text: string`
  - `validationError: string | null`
- `ProposalEditState`:
  - `front: string`
  - `back: string`
  - `validationError: string | null`

## 6. Zarządzanie stanem
- Lokalny stan w `GenerateView`:
  - `form: GenerationFormState`
  - `status: GenerationStatusState`
  - `proposals: ProposalViewModel[]`
  - `isSaving: boolean`
  - `apiError: string | null`
- Custom hook `useGeneration`:
  - enkapsulacja `fetch` do `/api/flashcard-generations`,
  - mapowanie `FlashcardProposalDto` -> `ProposalViewModel`,
  - obsługa stanu `status` i błędów.
- Custom hook `useProposals`:
  - zarządzanie decyzjami (accept/reject/edit),
  - walidacja edycji,
  - wyliczanie `acceptedCount`.

## 7. Integracja API
### POST `/api/flashcard-generations`
- Request body:
  - `{ "text": string }` (1000–10000 znaków)
- Response body:
  - `GenerationCreateResponseDto`
- Akcje frontendowe:
  - `onSubmit` formularza -> wywołanie `fetch`,
  - ustawienie `status: loading`,
  - po sukcesie: ustawienie `proposals`, `generatedCount`, `status: success`,
  - gdy `generated_count === 0`: `emptyResult: true`.

### POST `/flashcards` (zbiorczy zapis zaakceptowanych)
- Request body:
  - `FlashcardCreateCommand` z listą zaakceptowanych (source `"ai-full"` lub `"ai-edited"` jeśli edytowano)
- Response:
  - lista utworzonych fiszek (lub pojedyncze DTO zależnie od backendu)
- Akcje frontendowe:
  - `onSaveAccepted` -> wysłanie zaakceptowanych, reset stanu lub oznaczenie zapisanych.

## 8. Interakcje użytkownika
- Wklejenie tekstu -> licznik znaków i walidacja inline.
- Kliknięcie `Generuj` -> ładowanie i blokada formularza.
- Otrzymanie wyników -> wyświetlenie listy.
- Akceptuj/Odrzuć -> zmiana stanu decyzji i oznaczenie wizualne.
- Edytuj -> przejście w tryb edycji karty, walidacja pól.
- Zapisz edycję -> aktualizacja treści i decyzji na `edited`.
- Zapisz zaakceptowane -> wysyłka do `/flashcards`, potwierdzenie.

## 9. Warunki i walidacja
- `GenerationForm`:
  - tekst 1000–10000 znaków,
  - blokada submit przy błędzie lub `isSubmitting`.
- `ProposalEditor`:
  - front 1–200 znaków,
  - back 1–500 znaków,
  - blokada zapisu przy błędzie.
- `BulkActionsBar`:
  - aktywny tylko gdy `acceptedCount > 0`.
- `ProposalCard`:
  - decyzje mogą być zmieniane do momentu zapisu zbiorczego.

## 10. Obsługa błędów
- 400 z API (walidacja): pokazanie komunikatu z `message`.
- 500 z API: komunikat ogólny + możliwość ponowienia.
- Błędny JSON: fallback komunikatu ogólnego.
- Brak propozycji (`generated_count = 0`): komunikat i sugestia ponowienia.
- Błąd zapisu zbiorczego: pozostawienie stanu i umożliwienie ponowienia.

## 11. Kroki implementacji
1. Utwórz stronę `src/pages/generate.astro` i osadź `GenerateView`.
2. Zaimplementuj `GenerateView` jako kontener React i podłącz stan.
3. Dodaj `GenerationForm` z walidacją długości i licznikiem znaków.
4. Zaimplementuj `useGeneration` (fetch do `/api/flashcard-generations`).
5. Zaimplementuj `ProposalList` i `ProposalCard` z decyzjami.
6. Dodaj `ProposalEditor` z walidacją pól i obsługą edycji.
7. Zaimplementuj `useProposals` z logiką akceptuj/odrzuć/edytuj.
8. Dodaj `BulkActionsBar` i integrację z `/flashcards`.
9. Dodaj `GenerationStatus` i `InlineAlert` dla feedbacku.
10. Przetestuj scenariusze: sukces, walidacja, zero wyników, błędy API.
