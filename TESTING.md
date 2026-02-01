# Testing Guide - 10xcards

Kompletny przewodnik po testowaniu aplikacji 10xcards.

## Spis treści

1. [Przegląd](#przegląd)
2. [Testy jednostkowe (Vitest)](#testy-jednostkowe-vitest)
3. [Testy E2E (Playwright)](#testy-e2e-playwright)
4. [Uruchamianie testów](#uruchamianie-testów)
5. [Pisanie testów](#pisanie-testów)
6. [Best Practices](#best-practices)
7. [CI/CD](#cicd)

## Przegląd

Projekt wykorzystuje dwa frameworki testowe:

- **Vitest** - szybkie testy jednostkowe i integracyjne komponentów
- **Playwright** - testy E2E symulujące prawdziwe interakcje użytkownika

### Stack technologiczny testów

- Vitest 4.0+ z obsługą TypeScript
- @testing-library/react dla testowania komponentów React
- @testing-library/jest-dom dla rozszerzonych asercji DOM
- Playwright z przeglądarką Chromium
- jsdom jako środowisko testowe

## Testy jednostkowe (Vitest)

### Struktura

```
src/
├── test/
│   ├── setup.ts              # Globalna konfiguracja testów
│   ├── helpers.ts            # Pomocnicze funkcje
│   ├── example.test.ts       # Przykładowe testy
│   ├── component.test.tsx    # Przykładowe testy komponentów
│   └── README.md             # Dokumentacja
└── [moduł]/
    └── [nazwa].test.ts       # Testy dla modułu
```

### Konfiguracja

Plik `vitest.config.ts` zawiera:
- Środowisko jsdom dla testowania DOM
- Alias ścieżek (`@/` → `./src/`)
- Konfigurację pokrycia kodu
- Globalne setupy testowe

### Przykłady użycia

#### Test jednostkowy funkcji

```typescript
import { expect, test } from 'vitest';

test('should calculate sum correctly', () => {
  const result = sum(2, 3);
  expect(result).toBe(5);
});
```

#### Test z mockiem

```typescript
import { vi, test, expect } from 'vitest';

test('should call API', async () => {
  const mockFetch = vi.fn().mockResolvedValue({ data: 'test' });
  global.fetch = mockFetch;
  
  const result = await fetchData('/api/test');
  
  expect(mockFetch).toHaveBeenCalledWith('/api/test');
  expect(result.data).toBe('test');
});
```

#### Test komponentu React

```typescript
import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';
import { Button } from './Button';

test('renders button with text', () => {
  render(<Button>Click me</Button>);
  expect(screen.getByRole('button')).toHaveTextContent('Click me');
});
```

#### Test z interakcjami użytkownika

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { test, expect, vi } from 'vitest';

test('calls onClick when clicked', async () => {
  const handleClick = vi.fn();
  render(<Button onClick={handleClick}>Click</Button>);
  
  await userEvent.click(screen.getByRole('button'));
  
  expect(handleClick).toHaveBeenCalledTimes(1);
});
```

### Techniki mockowania

#### Mockowanie modułów

```typescript
vi.mock('@/lib/api', () => ({
  fetchUser: vi.fn().mockResolvedValue({ id: 1, name: 'Test' })
}));
```

#### Mockowanie z factory

```typescript
vi.mock('@/lib/api', () => {
  return {
    default: {
      fetchUser: vi.fn(),
    }
  };
});
```

#### Spy na metodzie

```typescript
const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
// ... kod testowy
expect(spy).toHaveBeenCalled();
spy.mockRestore();
```

## Testy E2E (Playwright)

### Struktura

```
e2e/
├── auth/
│   ├── login.spec.ts         # Testy logowania
│   └── register.spec.ts      # Testy rejestracji
├── fixtures/
│   └── auth.fixture.ts       # Custom fixtures z autentykacją
├── pages/
│   ├── HomePage.ts           # Page Object Model - strona główna
│   ├── LoginPage.ts          # Page Object Model - logowanie
│   ├── RegisterPage.ts       # Page Object Model - rejestracja
│   └── index.ts              # Eksport wszystkich POM
├── example.spec.ts           # Przykładowe testy
├── README.md                 # Dokumentacja testów E2E
└── .gitignore                # Ignorowane pliki testów
```

### Konfiguracja

Plik `playwright.config.ts` zawiera:
- Konfigurację przeglądarki Chromium (Desktop Chrome)
- Automatyczne uruchamianie dev servera
- Ustawienia retry i timeout
- Konfigurację raportów i artefaktów

### Zmienne środowiskowe

Utwórz plik `.env.test` w głównym katalogu projektu:

```env
E2E_EMAIL=test@example.com
E2E_PASSWORD=Abcd1234!
PLAYWRIGHT_TEST_BASE_URL=http://localhost:4321
```

**Uwaga:** Plik `.env.test` jest w `.gitignore` i nie powinien być commitowany.

### Przykłady użycia

#### Podstawowy test E2E

```typescript
import { test, expect } from '@playwright/test';

test('should load homepage', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/10x/i);
});
```

#### Test z nawigacją

```typescript
test('should navigate between pages', async ({ page }) => {
  await page.goto('/');
  await page.click('a[href="/dashboard"]');
  await expect(page).toHaveURL(/.*dashboard/);
});
```

#### Test formularza

```typescript
test('should submit login form', async ({ page }) => {
  await page.goto('/login');
  
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL(/.*dashboard/);
});
```

#### Test z Page Object Model

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages';

test('should login successfully', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('test@example.com', 'password');
  await loginPage.waitForSuccessfulLogin();
  await expect(page).toHaveURL(/.*generate/);
});
```

#### Test z custom fixture (authenticated context)

```typescript
import { test, expect } from '../fixtures/auth.fixture';

test('should access protected route', async ({ authenticatedPage }) => {
  // authenticatedPage jest już zalogowany
  await authenticatedPage.goto('/generate');
  await expect(authenticatedPage).toHaveURL(/.*generate/);
});
```

#### Test API

```typescript
test('should handle API requests', async ({ page, request }) => {
  const response = await request.get('/api/users');
  expect(response.ok()).toBeTruthy();
  
  const data = await response.json();
  expect(data).toHaveLength(10);
});
```

#### Visual regression testing

```typescript
test('should match screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

## Uruchamianie testów

### Testy jednostkowe

```bash
# Uruchom wszystkie testy jednostkowe
npm test

# Uruchom testy w trybie watch
npm run test:watch

# Uruchom testy z interfejsem UI
npm run test:ui

# Wygeneruj raport pokrycia kodu
npm run test:coverage
```

### Testy E2E

```bash
# Uruchom testy E2E
npm run test:e2e

# Uruchom testy z interfejsem UI
npm run test:e2e:ui

# Uruchom testy w trybie debugowania
npm run test:e2e:debug

# Wygeneruj testy za pomocą codegen
npm run test:e2e:codegen

# Uruchom tylko testy logowania
npx playwright test auth/login

# Uruchom tylko testy rejestracji
npx playwright test auth/register
```

### Filtrowanie testów

```bash
# Vitest - uruchom testy z danym wzorcem
npm test -- -t "test name pattern"

# Vitest - uruchom testy z danego pliku
npm test -- src/lib/api.test.ts

# Playwright - uruchom konkretny plik
npm run test:e2e -- example.spec.ts

# Playwright - uruchom testy z tytułem
npm run test:e2e -- --grep "login"
```

## Pisanie testów

### Struktura testu (AAA Pattern)

```typescript
test('should do something', () => {
  // Arrange - przygotuj dane i stan
  const input = { value: 'test' };
  
  // Act - wykonaj akcję
  const result = processInput(input);
  
  // Assert - sprawdź wynik
  expect(result).toBe('processed: test');
});
```

### Dobre praktyki - nazewnictwo

```typescript
// ✅ Dobre - opisuje co i dlaczego
test('should return error when email is invalid', () => {});

// ❌ Złe - niejasne
test('email test', () => {});
```

### Grupowanie testów

```typescript
import { describe, test, expect } from 'vitest';

describe('UserService', () => {
  describe('createUser', () => {
    test('should create user with valid data', () => {});
    test('should throw error with invalid email', () => {});
  });
  
  describe('updateUser', () => {
    test('should update user name', () => {});
    test('should not update user ID', () => {});
  });
});
```

### Setup i Teardown

```typescript
import { beforeEach, afterEach, test } from 'vitest';

describe('DatabaseTests', () => {
  let db;
  
  beforeEach(async () => {
    db = await createTestDatabase();
  });
  
  afterEach(async () => {
    await db.cleanup();
  });
  
  test('should insert record', async () => {
    await db.insert({ name: 'Test' });
    // ...
  });
});
```

## Best Practices

### Vitest

1. **Izolacja testów** - każdy test powinien być niezależny
2. **Używaj descriptive names** - nazwa testu = dokumentacja
3. **Mock external dependencies** - testuj tylko swoją logikę
4. **Prefer spies over mocks** - gdy tylko chcesz weryfikować wywołania
5. **Use inline snapshots** - dla czytelności i łatwiejszego review
6. **Test edge cases** - null, undefined, puste tablice, itp.
7. **Keep tests simple** - jeden test = jedna rzecz
8. **Avoid implementation details** - testuj zachowanie, nie implementację

### Playwright

1. **Use Page Object Model** - dla wielokrotnie używanych interakcji
2. **Use data-test-id attributes** - stabilne selektory zamiast CSS/XPath
3. **Wait for network idle** - `await page.waitForLoadState('networkidle')`
4. **Test from user perspective** - używaj interakcji jak prawdziwy użytkownik
5. **Isolate tests** - każdy test w czystym kontekście
6. **Use fixtures** - dla reusable setup code (np. authenticated context)
7. **Visual regression carefully** - tylko dla krytycznych widoków
8. **Debug with trace viewer** - `npx playwright show-trace trace.zip`
9. **Test responsive design** - różne viewporty (mobile, tablet, desktop)
10. **Test keyboard navigation** - Tab, Enter, Escape dla accessibility

### Ogólne

1. **Don't test framework code** - testuj swoją logikę biznesową
2. **Avoid testing private methods** - testuj publiczne API
3. **Keep tests maintainable** - kod testów też wymaga jakości
4. **Use test helpers** - eliminuj duplikację kodu
5. **Run tests in CI/CD** - zawsze przed mergem
6. **Monitor coverage** - ale nie traktuj go jako jedyny metric
7. **Fix flaky tests immediately** - niestabilne testy tracą wartość

## CI/CD

### GitHub Actions

Plik `.github/workflows/tests.yml` uruchamia:

1. **Unit Tests** - przy każdym push i PR
   - Uruchamia `npm test`
   - Generuje raport pokrycia
   - Uploaduje do Codecov

2. **E2E Tests** - przy każdym push i PR
   - Instaluje Playwright + przeglądarki
   - Uruchamia `npm run test:e2e`
   - Uploaduje raporty jako artefakty

### Lokalne uruchomienie jak w CI

```bash
# Symulacja CI dla unit testów
npm ci
npm test -- --run

# Symulacja CI dla E2E
npm ci
npx playwright install chromium --with-deps
npm run test:e2e
```

## Debugowanie testów

### Vitest

```bash
# Uruchom testy w trybie debug
node --inspect-brk ./node_modules/.bin/vitest --run

# UI mode dla wizualnego debugowania
npm run test:ui
```

### Playwright

```bash
# Debug mode - krok po kroku
npm run test:e2e:debug

# Trace viewer po nieudanym teście
npx playwright show-trace trace.zip

# Headed mode - zobacz przeglądarkę
npx playwright test --headed

# Slowmo - spowolnij wykonanie
npx playwright test --slow-mo=1000
```

## Troubleshooting

### Częste problemy

#### "Cannot find module '@/...'"
- Sprawdź alias w `vitest.config.ts` i `tsconfig.json`
- Upewnij się, że `baseUrl` i `paths` są poprawnie skonfigurowane

#### "ReferenceError: window is not defined"
- Upewnij się, że `environment: 'jsdom'` jest w `vitest.config.ts`
- Sprawdź czy setupFiles jest prawidłowo zaimportowany

#### "Test timeout"
- Zwiększ timeout: `test('...', async () => {}, { timeout: 10000 })`
- Sprawdź czy nie ma deadlocków w asynchronicznym kodzie

#### Playwright "Browser not found"
- Uruchom: `npx playwright install chromium`
- Sprawdź czy nie ma błędów podczas instalacji

#### Flaky E2E tests
- Dodaj explicit waits: `await page.waitForSelector(...)`
- Użyj `waitForLoadState('networkidle')`
- Sprawdź czy elementy są widoczne przed interakcją

## Dodatkowe zasoby

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library](https://testing-library.com/)
- [Playwright Documentation](https://playwright.dev/)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)

## Wsparcie

Jeśli masz pytania lub problemy z testami:
1. Sprawdź ten przewodnik
2. Zobacz przykładowe testy w `src/test/` i `e2e/`
3. Przeczytaj dokumentację frameworków
4. Zgłoś issue z tagiem `testing`
