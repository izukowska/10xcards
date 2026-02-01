# Running E2E Tests in WSL

## Problem: Missing System Dependencies

W WSL może brakować bibliotek systemowych wymaganych przez Chromium (`libnspr4.so`, `libnss3.so`, itp.).

## Rozwiązanie

### Opcja 1: Zainstaluj zależności systemowe (Zalecane)

```bash
# Zainstaluj zależności Playwright dla Chromium
sudo npx playwright install-deps chromium
```

### Opcja 2: Uruchom testy w trybie UI (nie wymaga sudo)

Jeśli nie możesz zainstalować zależności, użyj trybu UI który może mieć lepszą kompatybilność:

```bash
# UI Mode - interaktywny interfejs
npm run test:e2e:ui
```

### Opcja 3: Manualnie zainstaluj wymagane biblioteki

```bash
sudo apt-get update
sudo apt-get install -y \
    libnss3 \
    libnspr4 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2
```

## Weryfikacja

Po zainstalowaniu zależności, przetestuj:

```bash
# Pojedynczy test
npm run test:e2e auth/login.spec.ts

# Wszystkie testy auth
npm run test:e2e auth/

# Z UI
npm run test:e2e:ui
```

## Troubleshooting

### Error: "libnspr4.so: cannot open shared object file"
→ Zainstaluj zależności opcją 1 lub 3

### Error: "Target page, context or browser has been closed"
→ Brak wymaganych bibliotek systemowych

### Error: "Timed out waiting from config.webServer"
→ Serwer dev nie startuje poprawnie, sprawdź czy Supabase działa

## Uwagi WSL

- W WSL2 czasami trzeba wyłączyć sandbox: dodaj `--no-sandbox` flag (już skonfigurowane w playwright.config.ts)
- Upewnij się że masz wystarczająco RAM (minimum 4GB)
- Jeśli używasz Display Server (X11/Wayland), możesz uruchomić testy w trybie headed: `npx playwright test --headed`
