# OpenRouter Service — Plan implementacji

## 1. Opis usługi
Usługa `OpenRouterService` zapewnia spójny, bezpieczny i testowalny sposób komunikacji z API OpenRouter w celu generowania odpowiedzi LLM dla czatów w aplikacji. Obejmuje walidację wejścia/wyjścia, obsługę błędów, normalizację parametrów modeli, wsparcie dla `response_format` (JSON schema) oraz kontrolę czasu i limitów.

## 2. Opis konstruktora
Konstruktor inicjalizuje konfigurację usługi, klient HTTP i polityki bezpieczeństwa.

**Wejścia konstruktora (przykład):**
- `apiKey: string` — klucz OpenRouter z bezpiecznego źródła (np. zmienna środowiskowa w Astro).
- `baseUrl?: string` — domyślnie `https://openrouter.ai/api/v1`.
- `defaultModel: string` — np. `openai/gpt-4.1-mini`.
- `defaultParams?: ModelParams` — parametry modelu.
- `timeoutMs?: number` — timeout requestów.
- `maxRetries?: number` — liczba ponowień dla błędów tymczasowych.
- `logger?: Logger` — interfejs logowania.
- `rateLimiter?: RateLimiter` — opcjonalny limiter.

**Walidacje w konstruktorze:**
- Guard clause na brak `apiKey`.
- Ustawienie bezpiecznych wartości domyślnych.
- Normalizacja `baseUrl` i `timeoutMs`.

## 3. Publiczne metody i pola

### 3.1 `sendChat(options: ChatRequestOptions): Promise<ChatResponse>`
Wysyła wiadomości do OpenRouter i zwraca odpowiedź modelu.

**Wejścia:**
- `messages: ChatMessage[]` — lista wiadomości (system, user, assistant).
- `model?: string` — nazwa modelu.
- `params?: ModelParams` — parametry modelu.
- `responseFormat?: ResponseFormat` — schemat JSON.
- `requestId?: string` — idempotencja/logowanie.

**Wyjście:**
- `ChatResponse` — znormalizowana odpowiedź: treść, metadane, statystyki.

**Przykłady konfiguracji elementów wymaganych przez OpenRouter API:**

1. **Komunikat systemowy**
```ts
const systemMessage: ChatMessage = {
  role: "system",
  content: "Jesteś asystentem pomagającym w nauce fiszek."
};
```

2. **Komunikat użytkownika**
```ts
const userMessage: ChatMessage = {
  role: "user",
  content: "Wyjaśnij różnicę między HTTP a HTTPS."
};
```

3. **response_format (JSON schema)**
```ts
const responseFormat: ResponseFormat = {
  type: "json_schema",
  json_schema: {
    name: "flashcard_answer",
    strict: true,
    schema: {
      type: "object",
      additionalProperties: false,
      properties: {
        answer: { type: "string" },
        confidence: { type: "number", minimum: 0, maximum: 1 }
      },
      required: ["answer", "confidence"]
    }
  }
};
```

4. **Nazwa modelu**
```ts
const model = "openai/gpt-4.1-mini";
```

5. **Parametry modelu**
```ts
const params: ModelParams = {
  temperature: 0.7,
  top_p: 0.9,
  frequency_penalty: 0.2,
  presence_penalty: 0.1
};
```

### 3.2 `validateResponse(response: unknown, responseFormat?: ResponseFormat): ValidationResult`
Waliduje odpowiedź modelu, szczególnie gdy użyto `response_format`.

### 3.3 `healthCheck(): Promise<HealthStatus>`
Opcjonalna metoda do testów połączenia i klucza API.

## 4. Prywatne metody i pola

### 4.1 `buildPayload(options: ChatRequestOptions): OpenRouterPayload`
Składa payload zgodny z OpenRouter API, łącznie z `messages`, `model`, `response_format` i parametrami.

### 4.2 `normalizeParams(params?: ModelParams): ModelParams`
Zapewnia wartości w dozwolonym zakresie i uzupełnia brakujące parametry.

### 4.3 `handleHttpError(error: unknown): OpenRouterError`
Mapuje błędy HTTP na spójne typy aplikacyjne.

### 4.4 `retryWithBackoff(fn: () => Promise<T>): Promise<T>`
Strategia ponowień dla 429 i 5xx.

### 4.5 Pola prywatne
- `apiKey`, `baseUrl`, `defaultModel`, `defaultParams`
- `timeoutMs`, `maxRetries`
- `logger`, `rateLimiter`

## 5. Obsługa błędów
Potencjalne scenariusze i reakcje:

1. **Brak/nieprawidłowy klucz API** — szybki błąd konfiguracji, brak retry.
2. **401/403 z OpenRouter** — błąd autoryzacji; log + komunikat użytkowy.
3. **429 (rate limit)** — retry z exponential backoff.
4. **5xx (błędy serwera)** — retry; po wyczerpaniu: błąd tymczasowy.
5. **Timeout** — retry do limitu; potem błąd sieci.
6. **Niepoprawny `response_format`** — błąd walidacji po stronie klienta.
7. **Niepoprawny JSON w odpowiedzi** — walidacja i błąd parse.
8. **Nieobsługiwany model** — błąd konfiguracji, fallback do domyślnego.
9. **Nieprawidłowe parametry modelu** — normalizacja lub błąd walidacji.
10. **Brak wymaganych pól w odpowiedzi** — błąd walidacji schema.

## 6. Kwestie bezpieczeństwa
- Przechowywanie klucza API w zmiennych środowiskowych.
- Klucz API tylko po stronie serwera (Astro API routes), nigdy w kliencie.
- Maskowanie klucza w logach; logować jedynie `requestId`.
- Walidacja wejścia/wyjścia (JSON schema).
- Rate limiting per użytkownik/akcja.
- Ochrona przed prompt injection (wymuszenie systemowego kontekstu).
- Timeouty i ograniczenia rozmiaru payloadu.
- Zgodność z polityką kosztów i limitów OpenRouter.

## 7. Plan wdrożenia krok po kroku

1. **Zdefiniuj typy**
   - Dodaj typy w `src/types.ts`: `ChatMessage`, `ModelParams`, `ResponseFormat`, `ChatRequestOptions`, `ChatResponse`, `OpenRouterError`.

2. **Utwórz serwis**
   - Plik `src/lib/openrouter.service.ts`.
   - Implementuj konstruktor, metody publiczne i prywatne zgodnie z powyższym opisem.

3. **Walidacja i schema**
   - Zaimplementuj walidację `response_format` i odpowiedzi.
   - Przy błędach: szybki zwrot z komunikatem użytkowym.

4. **Integracja z API Astro**
   - Endpoint w `src/pages/api` (np. `chat.ts`).
   - Endpoint przyjmuje dane wejściowe, korzysta z `OpenRouterService`, zwraca znormalizowaną odpowiedź.

5. **Konfiguracja środowiska**
   - Zmienna środowiskowa `OPENROUTER_API_KEY`.
   - Opcjonalnie: `OPENROUTER_BASE_URL`, `OPENROUTER_DEFAULT_MODEL`.

6. **Obsługa błędów i logowanie**
   - Wspólny format błędów.
   - Logowanie ostrzeżeń i błędów po stronie serwera.

8. **Kontrola kosztów**
   - Defaultowe parametry ograniczające długość i temperaturę.
   - Rate limiting per user.

10. **Weryfikacja bezpieczeństwa**
   - Sprawdź brak wycieków klucza API.
   - Przejrzyj logi i politykę retry.
