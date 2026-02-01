# Specyfikacja Techniczna Modułu Autentykacji (Auth Spec)

**Data utworzenia:** 31.01.2026
**Status:** Draft
**Na podstawie:** US-001, US-002, US-003, US-004 (częściowo - odzyskiwanie), Tech Stack

## 1. Architektura Interfejsu Użytkownika (Frontend)

System autentykacji zostanie podzielony na warstwę prezentacji (Astro + React) oraz warstwę logiczną (Supabase Client).

### 1.1. Struktura Stron i Routingu (Astro Pages)

W katalogu `src/pages` zostaną wydzielone następujące trasy publiczne:

1.  `/login` (`src/pages/login.astro`) - Strona logowania.
2.  `/register` (`src/pages/register.astro`) - Strona rejestracji.
3.  `/forgot-password` (`src/pages/forgot-password.astro`) - Strona inicjująca reset hasła.
4.  `/auth/callback` (`src/pages/auth/callback.ts`) - Endpoint API (nie widok) do obsługi przekierowań OAuth/Magic Link (wymagane dla flow PKCE w Supabase SSR).

**Ochrona tras (Protected Routes):**
Wszystkie strony wewnątrz aplikacji (np. `/dashboard`, `/decks/*`) będą chronione przez Middleware. Próba wejścia bez aktywnej sesji spowoduje przekierowanie (HTTP 302) do `/login`.

### 1.2. Layouty

Wprowadzony zostanie nowy layout dedykowany dla ekranów autentykacji, aby odróżnić je od głównego interfejsu aplikacji.

*   **`src/layouts/AuthLayout.astro`**:
    *   Minimalistyczny design (brak panelu bocznego, uproszczony nagłówek).
    *   Centralnie umieszczony kontener (Card z Shadcn/ui) na formularze.
    *   Responsywność (pełna szerokość na mobile, wycentrowana karta na desktop).

### 1.3. Komponenty React (Interaktywność)

Ze względu na potrzebę interaktywnej walidacji i obsługi stanu formularzy, użyjemy komponentów React ("Islands") osadzonych w stronach Astro.

*   **`src/components/auth/LoginForm.tsx`**:
    *   Pola: Email, Hasło.
    *   Akcje: Zaloguj, Link do "Zapomniałem hasła", Link do rejestracji.
    *   Logika: Wywołanie `supabase.auth.signInWithPassword`.
*   **`src/components/auth/RegisterForm.tsx`**:
    *   Pola: Email, Hasło, Potwierdź hasło.
    *   Akcje: Zarejestruj, Link do logowania.
    *   Logika: Wywołanie `supabase.auth.signUp`.
*   **`src/components/auth/ForgotPasswordForm.tsx`**:
    *   Pola: Email.
    *   Logika: Wywołanie `supabase.auth.resetPasswordForEmail`.

### 1.4. Walidacja i Obsługa Błędów (Client-side)

Do walidacji formularzy wykorzystana zostanie biblioteka **Zod** zintegrowana z **React Hook Form**.

*   **Schematy walidacji (`src/lib/validation/auth.ts`):**
    *   `loginSchema`: Email (wymagany, format email), Hasło (wymagane).
    *   `registerSchema`: Email (format), Hasło (min. 8 znaków, wielka litera, cyfra), Zgodność haseł (`refine`).
*   **Prezentacja błędów:**
    *   Błędy walidacji pola (np. "Niepoprawny format email") wyświetlane bezpośrednio pod polem (`FormMessage` z Shadcn).
    *   Błędy API (np. "Nieprawidłowe dane logowania", "Użytkownik już istnieje") wyświetlane jako globalny **Toast** (komponent `Sonner` lub `Toaster` z Shadcn) oraz ewentualnie jako `Alert` nad formularzem.

---

## 2. Logika Backendowa i Integracja (Astro SSR)

Aplikacja działa w trybie `output: "server"`, co wymusza specyficzne podejście do zarządzania sesją przy użyciu ciasteczek (Cookies).

### 2.1. Middleware (`src/middleware/index.ts`)

Jest to kluczowy element bezpieczeństwa. Middleware będzie uruchamiany przy każdym żądaniu do serwera.

**Zadania Middleware:**
1.  Tworzenie instancji klienta Supabase Server Client przy użyciu `@supabase/ssr`.
2.  Odczyt tokenów sesyjnych z ciasteczek (`sb-access-token`, `sb-refresh-token`).
3.  Weryfikacja sesji (`supabase.auth.getUser()`).
4.  Zapisanie danych użytkownika w `context.locals.user` (dla łatwego dostępu w komponentach Astro).
5.  **Logika przekierowań:**
    *   Jeśli użytkownik próbuje wejść na chronioną trasę (np. `/dashboard`) bez sesji -> Przekierowanie do `/login`.
    *   Jeśli zalogowany użytkownik wchodzi na `/login` lub `/register` -> Przekierowanie do `/dashboard`.

### 2.2. Endpointy API (`src/pages/api/auth/*`)

*   **`POST /api/auth/signout`**:
    *   Endpoint obsługujący wylogowanie.
    *   Wywołuje `supabase.auth.signOut()`.
    *   Czyści ciasteczka sesyjne.
    *   Przekierowuje na stronę główną/logowania.
*   **`GET /auth/callback`**:
    *   Obsługuje powrót użytkownika po potwierdzeniu adresu email lub resecie hasła.
    *   Wymienia jednorazowy `code` na sesję (exchange code for session).
    *   Ustawia ciasteczka sesyjne.
    *   Przekierowuje użytkownika do aplikacji.

### 2.3. Modele Danych

Wykorzystujemy typy wygenerowane z bazy Supabase (`Database` types).
*   Encja `User`: Zarządzana przez Supabase Auth (tabela `auth.users`).
*   Powiązania: Tabela `fiszki` i `logs` będą posiadały kolumnę `user_id` będącą kluczem obcym do `auth.users.id`.

---

## 3. System Autentykacji (Supabase Auth)

Integracja oparta o pakiet `@supabase/ssr` w celu obsługi Cookie-based Auth w środowisku Astro.

### 3.1. Konfiguracja Klienta

Będziemy potrzebować dwóch "fabryk" klientów w `src/lib/supabase.ts`:

1.  `createBrowserClient`: Dla komponentów React (Client Components). Używa `PUBLIC_SUPABASE_URL` i `PUBLIC_SUPABASE_ANON_KEY`.
2.  `createServerClient`: Dla Astro (Middleware, API Routes, `.astro` files). Ma dostęp do ciasteczek requestu i response, aby nimi zarządzać.

### 3.2. Scenariusze (Flow)

#### A. Rejestracja (US-001)
1.  Użytkownik wypełnia `RegisterForm`.
2.  React wywołuje `supabase.auth.signUp({ email, password })`.
3.  **Sukces:** Wyświetlany jest komunikat: "Sprawdź skrzynkę email w celu potwierdzenia konta".
4.  **Błąd:** Wyświetlany Toast z komunikatem (np. "Użytkownik o takim emailu już istnieje").

#### B. Logowanie (US-002)
1.  Użytkownik wypełnia `LoginForm`.
2.  React wywołuje `supabase.auth.signInWithPassword({ email, password })`.
3.  Klient Supabase ustawia ciasteczka w przeglądarce.
4.  Następuje przekierowanie (client-side router lub window.location) do `/dashboard`.
5.  Middleware weryfikuje ciasteczko przy wejściu na `/dashboard`.

#### C. Wylogowanie (US-003)
1.  Użytkownik klika "Wyloguj" w menu aplikacji.
2.  Wysyłane jest żądanie POST do `/api/auth/signout`.
3.  Serwer czyści ciasteczka i przekierowuje do `/login`.

#### D. Odzyskiwanie hasła
1.  Użytkownik podaje email w `ForgotPasswordForm`.
2.  System wysyła email z linkiem resetującym kierującym do `/auth/callback`.
3.  Po kliknięciu, użytkownik trafia na stronę zmiany hasła (chronioną, ale w trybie "recovery").

### 3.3. Bezpieczeństwo (RLS)

Chociaż ten dokument dotyczy autentykacji (kim jesteś), jest ona nierozerwalnie związana z autoryzacją (co możesz zrobić).
*   Po wdrożeniu Auth, należy upewnić się, że tabele w bazie danych (`decks`, `flashcards`) mają włączone **Row Level Security (RLS)**.
*   Polityki muszą zezwalać na `SELECT, INSERT, UPDATE, DELETE` tylko wtedy, gdy `auth.uid() = user_id`.

## 4. Wymagane Pakiety

```bash
npm install @supabase/ssr @supabase/supabase-js react-hook-form @hookform/resolvers zod lucide-react
```
