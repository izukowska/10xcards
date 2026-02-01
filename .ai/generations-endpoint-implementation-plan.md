# API Endpoint Implementation Plan: POST /flashcard-generations

## 1. Przegląd punktu końcowego

- **Cel:** Rozpoczęcie procesu generowania fiszek przez AI na podstawie dostarczonego tekstu. Punkt końcowy przyjmuje tekst w żądaniu, waliduje jego długość oraz inicjuje wywołanie zewnętrznego serwisu AI. Po otrzymaniu wyników system zapisuje metadane sesji generacji w bazie danych i zwraca propozycje fiszek oraz liczby wygenerowanych pozycji.
- **Funkcjonalność:**
  - Walidacja wejściowego tekstu (1000-10000 znaków)
  - Uwierzytelnienie użytkownika (z pomocą Supabase Auth i RLS)
  - Wywołanie usługi AI (w warstwie service)
  - Zapis sesji generacji w tabeli `flashcard_generations`
  - Logowanie błędów w tabeli `generation_error_logs` (jeśli wystąpią)
  - Zwracanie propozycji fiszek w odpowiedzi

## 2. Szczegóły żądania

- **Metoda HTTP:** POST
- **Struktura URL:** `/flashcard-generations`
- **Parametry:**
  - **Body (wymagane):**
    - `text` (string): Tekst wejściowy do generacji fiszek, którego długość musi wynosić od 1000 do 10000 znaków.
- **Walidacja danych wejściowych:**
  - Użycie Zod (lub innej biblioteki walidacyjnej) do sprawdzenia, że:
    - `text` jest typu string
    - `text.length` mieści się w przedziale 1000-10000 znaków

## 3. Wykorzystywane typy

- **Request DTO / Command Model:**
  - `GenerateFlashcardsCommand` (zdefiniowany w `src/types.ts` jako interfejs z polem `source_text`)
- **Response DTO:**
  - `GenerationCreateResponseDto` – zawiera `generation_id`, `generated_count`, `proposals` (tablica obiektów typu `FlashcardProposalDto`)
- **FlashcardProposalDto**: Pojedyncza propozycja fiszki z polami:
  - `front` (string)
  - `back` (string)
  - `source` - wartość stała "ai-full"
- **Powiązane typy:**
  - Typy dla sesji generacji (`FlashcardGeneration`)
  - Typy dla błędów (np. `GenerationErrorLogDto` w przypadku logowania błędów)

## 3.1. Szczegóły odpowiedzi

- **Kod statusu 200 (OK):**
  ```json
  {
    "generation_id": 123,
    "generated_count": 15,
    "proposals": [
      {
        "front": "Pytanie na fiszce",
        "back": "Odpowiedź na fiszce",
        "source": "ai-full"
      }
      // ... więcej propozycji
    ]
  }
  ```
- **Kod statusu 400 (Bad Request):**
  ```json
  {
    "error": "Validation failed",
    "message": "Text length must be between 1000 and 10000 characters"
  }
  ```
- **Kod statusu 401 (Unauthorized):**
  ```json
  {
    "error": "Unauthorized",
    "message": "Authentication required"
  }
  ```
- **Kod statusu 429 (Too Many Requests):**
  ```json
  {
    "error": "Rate limit exceeded",
    "message": "Too many generation requests. Please try again later."
  }
  ```
- **Kod statusu 500 (Internal Server Error):**
  ```json
  {
    "error": "Internal server error",
    "message": "An unexpected error occurred during flashcard generation"
  }
  ```

## 4. Przepływ danych

1. **Odbiór żądania:**
   - Odbiór żądania POST z ciałem zawierającym `text` .
2. **Walidacja:**
   - Walidacja długości tekstu w warstwie API (np. przy użyciu Zod). Biblioteka sprawdza, że długość `text` wynosi od 1000 do 10000 znaków.
3. **Uwierzytelnienie:**
   - Middleware sprawdza token autoryzacyjny i ustawia `context.locals.supabase` oraz identyfikuje `user_id`.
4. **Przetwarzanie przez serwis:**
   - Kontroler wywołuje funkcję w warstwie service (np. `generation.service`) przekazując `text` oraz `user_id`.
   - Serwis wykonuje wywołanie do zewnętrznego serwisu AI, przetwarza wynik oraz mierzy czas generacji.
5. **Rejestracja w bazie:**
   - Wyniki (np. liczba wygenerowanych propozycji, trwanie generacji, model użyty itp.) są zapisywane w tabeli `flashcard_generations`.
6. **Logowanie błędów:**
   - W przypadku wystąpienia błędu wykonuje się zapis logu w tabeli `generation_error_logs`.
7. **Odpowiedź:**
   - Zwrócenie odpowiedzi do klienta z danymi zgodnymi z modelem `GenerationCreateResponseDto`.

## 5. Względy bezpieczeństwa

- **Uwierzytelnienie:**
  - Używamy Supabase Auth; endpoint wymaga ważnego tokena Bearer przesyłanego w nagłówku `Authorization`.
  - Mechanizmy RLS (Row Level Security) zapewniają, że użytkownik uzyskuje dostęp jedynie do swoich danych.
- **Walidacja danych:**
  - Użyjemy Zod lub podobnej biblioteki, aby upewnić się, że `text` spełnia wymagania długości.
- **Rate Limiting:**
  - Endpoint powinien zaimplementować rate limiting (np. poprzez middleware lub konfigurację serwera), aby zapobiec nadużyciom, zwracając kod 429 w przypadku przekroczenia limitów.

## 6. Obsługa błędów

- **Błędy walidacji:**
  - Jeśli `text` nie spełnia wymagań długościowych, zwróć 400 (Bad Request) z odpowiednim komunikatem.
- **Błędy uwierzytelnienia:**
  - Jeśli użytkownik nie jest uwierzytelniony, zwróć 401 (Unauthorized).
- **Rate Limiting:**
  - W przypadku zbyt wielu żądań zwróć 429 (Too Many Requests).
- **Błędy serwera:**
  - Nieoczekiwane błędy (np. błąd wywołania usługi AI lub błędy bazy danych) powinny skutkować 500 (Internal Server Error).
- **Logowanie:**
  - Błędy krytyczne są rejestrowane w tabeli `generation_error_logs` wraz ze szczegółowym komunikatem błędu, kodem błędu oraz czasem wystąpienia.

## 7. Rozważania dotyczące wydajności

- **Timeout dla wywołania AI:** 60 sekund na czas oczekiwnia, inaczej błąd timeout.
- **Asynchroniczność:**
  - Wywołanie do zewnętrznego serwisu AI powinno być asynchroniczne, aby nie blokować głównego wątku.
- **Buforowanie:**
  - W przyszłości, dla powtarzalnych żądań, można rozważyć mechanizmy cache'ujące.
- **Skalowalność:**
  - Monitorowanie i debugowanie czasu odpowiedzi usługi AI oraz operacji bazy danych poprzez logowanie i metryki.

## 8. Etapy wdrożenia

1. **Utworzenie endpointu API:**
   - Dodaj nowy plik np. `src/pages/api/flashcard-generations.ts`.
   - Skonfiguruj podstawową strukturę API zgodnie z wytycznymi Astro.
2. **Implementacja walidacji:**
   - Zdefiniuj Zod schema dla żądania, wymagającą pole `text` o długości 1000–10000 znaków.
3. **Autoryzacja i uwierzytelnienie:**
   - Zaimplementuj sprawdzanie tokena z nagłówka `Authorization`.
   - Upewnij się, że middleware ustawia `context.locals.supabase` oraz `user_id`.
4. **Integracja z warstwą service:**
   - Stworzenie serwisu (`generation.service`), który:
     - Integruje się z zewnętrznym serwisem AI. Na etapie developmentu skorzystamy z mocków zamiast wywołąnia serwisu AI.
5. **Rejestracja danych w bazie:**
   - Zapisz dane sesji generacji w tabeli `flashcard_generations`.
   - W przypadku błędów, zapisz logi w tabeli `generation_error_logs`.
6. **Budowa odpowiedzi:**
   - Sformatuj odpowiedź zgodnie z DTO (GenerationCreateResponseDto) i zwróć ją z kodem statusu 200.
