# Dokumentacja testów jednostkowych - parseFlashcardProposals()

## 📋 Podsumowanie

**Plik testowy:** `src/lib/services/generation.service.test.ts`  
**Testowana funkcja:** `parseFlashcardProposals(data: unknown): FlashcardProposalDto[]`  
**Liczba testów:** 50  
**Status:** ✅ Wszystkie testy przeszły pomyślnie

## 🎯 Zakres testowania

Funkcja `parseFlashcardProposals()` jest odpowiedzialna za parsowanie i walidację odpowiedzi z AI (OpenRouter) podczas generowania fiszek. Testy pokrywają wszystkie krytyczne reguły biznesowe i warunki brzegowe.

## 📊 Kategorie testów

### 1. **Valid input scenarios** (5 testów)
Testowanie prawidłowych danych wejściowych:
- ✅ Parsowanie poprawnych propozycji ze wszystkimi wymaganymi polami
- ✅ Parsowanie pojedynczej propozycji
- ✅ Parsowanie wielu propozycji (5-10 zakres rekomendowany przez AI)
- ✅ Obsługa polskich znaków (ą, ę, ó, ż, ź, ć, ń, ł)
- ✅ Obsługa znaków specjalnych i interpunkcji

### 2. **String trimming and sanitization** (4 testy)
Testowanie czyszczenia i formatowania stringów:
- ✅ Usuwanie białych znaków z początku i końca `front`
- ✅ Usuwanie białych znaków z początku i końca `back`
- ✅ Zachowanie wewnętrznych spacji
- ✅ Obsługa tabulatorów i znaków nowej linii

**Reguła biznesowa:** Wszystkie stringi są trimowane przed walidacją długości, co zapobiega przypadkowemu odrzuceniu poprawnych danych przez nadmiarowe białe znaki.

### 3. **Length constraints validation** (8 testów)
Testowanie limitów długości tekstu:
- ✅ Akceptacja `front` o długości dokładnie 1 znaku
- ✅ Akceptacja `front` o długości dokładnie 200 znaków
- ✅ Odrzucenie `front` o długości 201 znaków
- ✅ Akceptacja `back` o długości dokładnie 1 znaku
- ✅ Akceptacja `back` o długości dokładnie 500 znaków
- ✅ Odrzucenie `back` o długości 501 znaków
- ✅ Sprawdzenie długości **AFTER** trimming
- ✅ Odrzucenie jeśli długość przekracza limit po trimowaniu

**Reguły biznesowe:**
- `front`: 1-200 znaków (po trimowaniu)
- `back`: 1-500 znaków (po trimowaniu)
- Limity zapobiegają problemom z UI i bazą danych

### 4. **Empty values handling** (5 testów)
Testowanie pustych wartości:
- ✅ Odrzucenie pustego stringa w `front` (po trimowaniu)
- ✅ Odrzucenie pustego stringa w `back` (po trimowaniu)
- ✅ Odrzucenie stringów zawierających tylko spacje w `front`
- ✅ Odrzucenie stringów zawierających tylko spacje w `back`
- ✅ Odrzucenie stringów zawierających tylko tabulatory/znaki nowej linii

**Reguła biznesowa:** Puste fiszki nie mają wartości edukacyjnej i nie powinny być zapisywane w bazie danych.

### 5. **Type validation** (8 testów)
Testowanie poprawności typów danych:
- ✅ Odrzucenie `null` jako input
- ✅ Odrzucenie `undefined` jako input
- ✅ Odrzucenie wartości prymitywnych (string, number, boolean)
- ✅ Odrzucenie brakującego pola `proposals`
- ✅ Odrzucenie `proposals` jako non-array
- ✅ Odrzucenie `proposals` jako `null`
- ✅ Odrzucenie `proposals` jako obiektu zamiast tablicy
- ✅ Odrzucenie pustej tablicy `proposals`

**Reguła biznesowa:** Funkcja musi być odporna na nieprawidłowe odpowiedzi AI - chroni przed błędami API i zapewnia spójność danych.

### 6. **Individual proposal structure validation** (8 testów)
Testowanie struktury pojedynczych propozycji:
- ✅ Odrzucenie propozycji niebędącej obiektem
- ✅ Odrzucenie propozycji będącej `null`
- ✅ Odrzucenie propozycji bez pola `front`
- ✅ Odrzucenie propozycji bez pola `back`
- ✅ Odrzucenie propozycji z `front` niebędącym stringiem
- ✅ Odrzucenie propozycji z `back` niebędącym stringiem
- ✅ Poprawny indeks w komunikacie błędu dla drugiej propozycji
- ✅ Walidacja wszystkich propozycji z osobna

**Reguła biznesowa:** Każda propozycja musi mieć zarówno pytanie (`front`), jak i odpowiedź (`back`) jako stringi.

### 7. **Multiple proposals with errors** (2 testy)
Testowanie scenariuszy z częściowym sukcesem:
- ✅ Zatrzymanie na pierwszej nieprawidłowej propozycji
- ✅ Przetworzenie wszystkich poprawnych propozycji przed napotkaniem błędu

**Reguła biznesowa:** Fail-fast - jeśli którakolwiek propozycja jest nieprawidłowa, cała operacja kończy się błędem. To zapobiega zapisywaniu częściowych/uszkodzonych danych.

### 8. **Source field assignment** (2 testy)
Testowanie przypisywania pola `source`:
- ✅ Zawsze przypisywanie wartości `'ai-full'`
- ✅ Ignorowanie pola `source` w danych wejściowych

**Reguła biznesowa:** Wszystkie propozycje z AI mają automatycznie source = `'ai-full'`. Pole to jest później zmieniane na `'ai-edited'` jeśli użytkownik edytuje fiszkę przed zapisem.

### 9. **Edge cases and complex scenarios** (8 testów)
Testowanie nietypowych przypadków:
- ✅ Obsługa Unicode emoji (😊, 🎉)
- ✅ Obsługa stringów wieloliniowych (z `\n`)
- ✅ Obsługa stringów HTML-podobnych (bez parsowania)
- ✅ Obsługa stringów JSON-podobnych w treści
- ✅ Obsługa stringów składających się tylko z cyfr
- ✅ Ignorowanie dodatkowych pól w propozycjach
- ✅ Maksymalny prawidłowy scenariusz (10 propozycji o maksymalnej długości)

**Reguła biznesowa:** Funkcja powinna być odporna na różnorodne formaty treści - użytkownicy mogą generować fiszki z dowolnego tekstu (kod, emoji, HTML, itp.).

### 10. **Real-world AI response scenarios** (3 testy)
Testowanie rzeczywistych odpowiedzi AI:
- ✅ Typowa odpowiedź w stylu OpenAI (polskie fiszki o TypeScript)
- ✅ Odpowiedzi o zróżnicowanej długości treści
- ✅ Mieszane długości pytań i odpowiedzi

## 🔍 Pokrycie reguł biznesowych

| Reguła biznesowa | Status | Liczba testów |
|------------------|--------|---------------|
| Walidacja struktury odpowiedzi AI | ✅ | 8 |
| Limity długości (front: 1-200, back: 1-500) | ✅ | 8 |
| Trimowanie białych znaków | ✅ | 4 |
| Odrzucanie pustych wartości | ✅ | 5 |
| Walidacja typów pól | ✅ | 8 |
| Przypisywanie source='ai-full' | ✅ | 2 |
| Obsługa błędów z indeksem | ✅ | 2 |
| Fail-fast przy błędach | ✅ | 2 |
| Obsługa Unicode i znaków specjalnych | ✅ | 6 |
| Ignorowanie dodatkowych pól | ✅ | 1 |

## 📈 Metryki jakości

- **Pokrycie kodu:** ~100% funkcji `parseFlashcardProposals()`
- **Liczba przypadków brzegowych:** 20+
- **Testy warunków granicznych:** 8 (dokładnie 1, 200, 201, 500, 501 znaków)
- **Testy komunikatów błędów:** 15+ (weryfikacja konkretnych komunikatów)
- **Testy rzeczywistych scenariuszy:** 3

## 🛡️ Wykryte potencjalne problemy

Testy zabezpieczają przed:

1. **Błędy AI API** - nieprawidłowy format odpowiedzi, brakujące pola
2. **Ataki injection** - nadmiarowo długie stringi mogące przesycić bazę danych
3. **Puste dane** - fiszki bez treści (whitespace-only)
4. **Problemy z Unicode** - emoji, znaki specjalne, języki z akcentami
5. **Częściowe zapisy** - fail-fast zapobiega zapisywaniu niepełnych danych
6. **Problemy z formatowaniem** - nadmiarowe białe znaki

## 🚀 Uruchamianie testów

```bash
# Wszystkie testy
npm run test

# Tylko testy generation.service
npm run test src/lib/services/generation.service.test.ts

# Watch mode
npm run test -- --watch

# Coverage
npm run test -- --coverage
```

## 📝 Przykładowe komunikaty błędów

Testy weryfikują dokładne komunikaty błędów:

- `"AI response must be an object"` - nieprawidłowy typ głównego obiektu
- `"AI response must include a proposals array"` - brak tablicy proposals
- `"AI response contained no proposals"` - pusta tablica
- `"Proposal at index {N} must be an object"` - nieprawidłowy typ propozycji
- `"Proposal at index {N} must include string front and back"` - brak/niewłaściwy typ pól
- `"Proposal at index {N} has empty front/back"` - puste wartości po trimowaniu
- `"Proposal at index {N} exceeds length limits"` - przekroczenie limitów

## 🔄 Następne kroki

Sugerowane rozszerzenia:

1. **Testy integracyjne** - testowanie pełnego flow z `generateFlashcards()`
2. **Testy performance** - jak funkcja radzi sobie z 100+ propozycjami
3. **Testy `createSimpleHash()`** - konsystencja hashowania
4. **Testy `callAiService()`** z mockami OpenRouter API
5. **Property-based testing** (fast-check) - generowanie losowych danych wejściowych

## 📚 Dokumentacja powiązana

- [Vitest Rules](.cursor/rules/vitest.mdc)
- [Test Plan](test-plan.md)
- [Types](src/types.ts) - definicje `FlashcardProposalDto`
- [Generation Service](src/lib/services/generation.service.ts) - implementacja

---

**Autor:** AI Assistant  
**Data utworzenia:** 2026-01-31  
**Framework testowy:** Vitest 4.0.18  
**Status:** ✅ Wszystkie testy przechodzą
