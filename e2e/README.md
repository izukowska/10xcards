# E2E Tests - 10x-cards

Testy end-to-end dla aplikacji 10x-cards wykorzystujące Playwright.

## 📁 Struktura

```
e2e/
├── auth/                    # Testy autentykacji
│   ├── login.spec.ts       # Testy logowania
│   └── register.spec.ts    # Testy rejestracji
├── fixtures/               # Custom fixtures dla testów
│   └── auth.fixture.ts    # Fixture z autentykacją
├── pages/                  # Page Object Models
│   ├── HomePage.ts        # Model strony głównej
│   ├── LoginPage.ts       # Model strony logowania
│   ├── RegisterPage.ts    # Model strony rejestracji
│   └── index.ts          # Eksport wszystkich modeli
└── README.md             # Ten plik
```

## 🚀 Uruchamianie testów

### Wszystkie testy
```bash
npm run test:e2e
```

### Testy w trybie UI (interaktywny)
```bash
npm run test:e2e:ui
```

### Testy w trybie debug
```bash
npm run test:e2e:debug
```

### Tylko testy logowania
```bash
npx playwright test auth/login
```

### Tylko testy rejestracji
```bash
npx playwright test auth/register
```

## 🔧 Konfiguracja

### Zmienne środowiskowe

Utwórz plik `.env.test` w głównym katalogu projektu:

```env
E2E_EMAIL=test@example.com
E2E_PASSWORD=Abcd1234!
```

### Playwright Config

Konfiguracja znajduje się w `playwright.config.ts`:
- Używamy tylko przeglądarki Chromium (zgodnie z wytycznymi)
- Testy uruchamiane równolegle
- Automatyczne screenshoty i wideo przy błędach
- Trace viewer dla debugowania

## 📝 Page Object Model

Wszystkie testy wykorzystują wzorzec Page Object Model dla lepszej maintainability:

### LoginPage
```typescript
const loginPage = new LoginPage(page);
await loginPage.goto();
await loginPage.login('email@example.com', 'password');
await loginPage.waitForSuccessfulLogin();
```

### RegisterPage
```typescript
const registerPage = new RegisterPage(page);
await registerPage.goto();
await registerPage.register('email@example.com', 'password');
```

### HomePage
```typescript
const homePage = new HomePage(page);
await homePage.goto();
await homePage.goToLogin();
```

## 🎯 Pokrycie testów

### Testy logowania (`auth/login.spec.ts`)

#### ✅ Page Load and Navigation
- Ładowanie strony logowania
- Wyświetlanie wszystkich elementów formularza
- Nawigacja do strony rejestracji
- Nawigacja do strony odzyskiwania hasła

#### ✅ Form Validation
- Walidacja pustego emaila
- Walidacja niepoprawnego formatu emaila
- Walidacja pustego hasła
- Akceptacja poprawnych danych

#### ✅ Authentication Flow
- Błąd dla niepoprawnych danych logowania
- Stan ładowania podczas próby logowania
- Pomyślne logowanie z poprawnymi danymi

#### ✅ User Experience
- Poprawne typy inputów
- Nawigacja klawiaturą (Tab)
- Submit formularza klawiszem Enter

#### ✅ Responsive Design
- Wyświetlanie na mobile (375px)
- Wyświetlanie na tablet (768px)

#### ✅ Protected Routes
- Redirect z `/generate` do `/login` dla niezalogowanych
- Redirect z `/` do `/generate` dla zalogowanych

### Testy rejestracji (`auth/register.spec.ts`)

#### ✅ Page Load and Navigation
- Ładowanie strony rejestracji
- Wyświetlanie wszystkich elementów formularza
- Nawigacja do strony logowania

#### ✅ Form Validation
- Walidacja pustego emaila
- Walidacja niepoprawnego formatu emaila
- Walidacja niezgodnych haseł
- Walidacja słabego hasła
- Akceptacja poprawnych danych

#### ✅ Registration Flow
- Błąd dla już zarejestrowanego emaila
- Stan ładowania podczas rejestracji
- Pomyślna rejestracja z unikalnymi danymi
- Wyświetlanie komunikatu sukcesu

#### ✅ User Experience
- Poprawne typy inputów
- Nawigacja klawiaturą
- Submit formularza klawiszem Enter

#### ✅ Responsive Design
- Wyświetlanie na mobile
- Wyświetlanie na tablet

## 🏷️ Data Test IDs

Wszystkie elementy używają atrybutów `data-test-id` dla stabilnych selectorów:

### Login Form
- `login-form-container` - kontener formularza
- `login-email-input` - pole email
- `login-password-input` - pole hasła
- `login-submit-button` - przycisk submit
- `login-error-alert` - alert błędu
- `login-error-message` - treść błędu
- `login-register-link` - link do rejestracji
- `login-forgot-password-link` - link do odzyskiwania hasła
- `login-loading-spinner` - spinner ładowania

### Register Form
- `register-form-container` - kontener formularza
- `register-email-input` - pole email
- `register-password-input` - pole hasła
- `register-confirm-password-input` - pole potwierdzenia hasła
- `register-submit-button` - przycisk submit
- `register-error-alert` - alert błędu
- `register-error-message` - treść błędu
- `register-success-message` - komunikat sukcesu
- `register-login-link` - link do logowania
- `register-loading-spinner` - spinner ładowania

### Home Page
- `home-login-button` - przycisk logowania
- `home-register-button` - przycisk rejestracji

## 🔍 Debugowanie

### Trace Viewer
Po nieudanym teście, otwórz trace viewer:
```bash
npx playwright show-trace trace.zip
```

### Codegen
Nagraj nowe testy interaktywnie:
```bash
npm run test:e2e:codegen
```

### Screenshots i Video
Automatycznie zapisywane przy błędach w folderze `test-results/`

## 📊 Raporty

Po uruchomieniu testów, raport HTML jest dostępny:
```bash
npx playwright show-report
```

## ✨ Best Practices

1. **Używaj Page Object Model** - wszystkie interakcje przez page objects
2. **Używaj data-test-id** - stabilne selektory zamiast CSS/XPath
3. **Izoluj testy** - każdy test powinien być niezależny
4. **Czekaj na stan** - używaj `waitForLoadState`, `waitForURL` zamiast `waitForTimeout`
5. **Testuj user flow** - nie tylko happy path, ale też edge cases
6. **Responsive testing** - testuj na różnych rozdzielczościach

## 🐛 Znane problemy

- Testy rejestracji mogą wymagać czyszczenia bazy danych między uruchomieniami
- Niektóre testy mogą być flaky ze względu na timing API calls

## 📚 Dokumentacja

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Page Object Model](https://playwright.dev/docs/pom)
