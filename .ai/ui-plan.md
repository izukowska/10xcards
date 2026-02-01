# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

Projekt interfejsu użytkownika jest zbudowany wokóół widoku generowania fiszek dostępnego po autoryzacji. Struktura obejmuje widoki uwierzytelniania, generowania fiszek, listy fiszek z modalem edycji, panel oraz widok sesji powtórek. Nawigacja odbywa się poprzez topbar oparty na Navigation Menu od Shadcn/ui, z elastycznym układem opartym na Tailwind CSS, zapewniającym spójność, dostępność (standard WCAG AA) i bezpieczeństwo.

## 2. Lista widoków

1. **Ekran uwierzytelniania**
   - **Ścieżka widoku:** `/login` i `/register`
   - **Główny cel:** Umożliwienie użytkownikowi logowania oraz rejestracji.
   - **Kluczowe informacje:** Formularze z po0lami e-mail i hasło; wiadomości o błędach uwierzytelniania.
   - **Kluczowe komponenty:** Formularz logowania/rejestracji, komonent walidajci, przyciski, komunikaty błędów.
   - **Uwagi UX i dostępności:** Prosty formularz, czytelne komunikaty błędów, obsługa klawiatury, zabezpiecznia JWT>

2. **Widok generowania fiszek **
   - **Ścieżka widoku:** `/generate`
   - **Główny cel:** Umożliwienie użytkownikowi generowania propozycji fiszek przez AI i ich rewizję (zaakceptu, edytuj, odrzuć).
   - **Kluczowe informacje:** Pole tekstowe dla danych wejściowych, przycisk uruchamiający generowanie, lista wygenerowanych propozycji, opcje akceptacji, edycji lub odrzucenia dla każdej fiszki.
   - **Kluczowe komponenty:** Formularz tekstowy, przycisk generowania, lista fiszek, przyciski akcji (zapisz wszystkie, zapisz zaakceptowane), wskaźnik ładowania (skeleton), komunikaty o błędach..
   - **Uwagi UX i dostępności:** Intuicyjny formularz, walidacja długości tekstu, feedback inline, responsywność, czytelne komunikaty inline komunikaty o błędach.

3. **Widok listy fiszek (Moje fiszki)**
   - **Ścieżka widoku:** `/flashcards`
   - **Główny cel:** Przegląd wszystkich fiszek (AI zatwierdzonych oraz manualnych) użytkownika, edycja oraz usuwanie zapisanych fiszek.
   - **Kluczowe informacje:** Lista zapisanych fiszek z informacjammi o pytaniu o odpowiedzi.
   - **Kluczowe komponenty:** Lista elementów, kompponent modal edycji, przyciski usuwania, potwierdzenie operacji.
   - **Uwagi UX i dostępności:** Czytelny układ listy, dostępność klawiaturowa modyfikacji, potwierdzenie usunięcia.

4. **Widok edycji fiszki (Modal)**
   - **Ścieżka widoku:** Wyświetlany nad widokiem listy fiszek.
   - **Główny cel:** Edycja zawartości fiszki (przód i tył), z walidacją danych bez zapisu w czasie rzeczywistym.
   - **Kluczowe informacje:** Aktualne dane fiszki, pola do edycji, przycisk zatwierdzający zmiany.
   - **Kluczowe komponenty:** Formularz edycji, przyciski "Zapisz" i "Anuluj", walidacja limitów znaków.
   - **Uwagi UX i dostępności:** Modal znika po akcji, wyraźne komunikaty walidacyjne, dostępność dla użytkowników klawiaturowych.

5. **Panel użytkownika**
   - **Ścieżka widoku:** `/profile`
   - **Główny cel:** Zarządzanie informacjami o koncie użytkownika i ustawieniami.
   - **Kluczowe informacje:**Dane użytkownika, opcje edycji profilu, przycisk wylogowania.
   - **Kluczowe komponenty:** Formularz edycji profilu, przyciski akcji.
   - **Uwagi UX i dostępności:** Czytelność informacji, szybki dostęp do najważniejszych funkcji, bezpieczeństwo danych, bezpieczne wylogowaniie.

6. **Widok sesji powtórek**
   - **Ścieżka widoku:** `/session
   - **Główny cel:** Realizacja sesji nauki z wykorzystaniem algorytmu powtórek, prezentacja fiszek jedna po drugiej.
   - **Kluczowe informacje:** Pokaż przód fiszki, interakcja użytkownika (np. przycisk pokazujący tył), wskaźnik postępu sesji.
   - **Kluczowe komponenty:** Komponent sesji nauki, przyciski interakcyjne, wskaźnik postępu i oceny.
   - **Uwagi UX i dostępności:** Przyjazny interfejs, prostota interakcji, wsparcie dla kontroli klawiaturowych oraz czytelność na dużym ekranie.

## 3. Mapa podróży użytkownika

1. Użytkownik wchodzi na stronę i trafia do widoku logowania/rejestracji (`/login`, `/register`').
2. Po poprawnym uwierzytelnieniu następuje przekierowanie do widoku generowania fiszek (`/generations`).
3. Api zwraca propozyje fiszek, które są prezentowane w widoku generowania.
4. Użytkownik przegląda propozycje fiszek i decyduje, które fiszki zaakceptuje, edytuje lub odrzuci. Pojawia się opcja zbiorczego zatwierdzenia wygenerowanych fiszek.
5. Użytkownik zatwierdza wybrane fiszki o dokonuje zbiorczego zapisu poprzez interakcję z API.
6. W widoku listy fiszek (Moje fiszki) użytkownik może przeglądać, edytować lub usuwać fiszki.
7. Dodatkowo, użytkownik ma dostęp do panelu użytkownika, gdzie zarządza profilem i ustawieniami konta.
8. W razie potrzeby użytkownik może przejść do widoku sesji powtórek (`/session`), aby rozpocząć naukę z fiszkami.
9. W przypadku błędów użytkownik otrzymuje komunikaty inline.

## 4. Układ i struktura nawigacji

- **Główna nawigacja:** Główny element nawigacyjny umieszczony u góry, oparty na Navigation Menu od Shadcn/ui. Zawiera odnośniki do głównych widoków: Generowanie fiszek, Lista fiszek, Panel użytkownika oraz Sesja powtórek.
- **Boczny pasek (opcjonalnie):** W większych ekranach można dodać boczny pasek z dodatkowymi filtrami lub skrótami.
- **Breadcrumbs:** W widokach edycji oraz sesji mogą być stosowane breadcrumbs lub jasne przyciski nawigacyjne umożliwiające powrót do głównego dashboardu.
- **Responsywność:** Mimo że projekt jest desktopowy, powinno się zapewnić elastyczność układu i czytelność przy różnych rozdzielczościach.

## 5. Kluczowe komponenty

- **Navigation Menu (Topbar):** Umożliwia szybkie przejście między widokami, zapewnia spójność nawigacyjną oraz łatwy dostęp do ustawień/profile.
- **Formularze:** Standardowe pola wejściowe, przyciski i walidacja inline dla logowania, generowania fiszek oraz edycji fiszek.
- **Listy/Karty:** Prezentacja fiszek w formie kart lub w tabeli, z możliwością dynamicznej aktualizacji.
- **Modal edycji:** Warstwa do edycji zawartości fiszki, z wyraźnymi komunikatami walidacyjnymi i przyciskami akcji.
- **Komponent sesji:** Interaktywny moduł do realizacji sesji nauki z fiszkami, z prostymi interakcjami i wskaźnikiem postępu.
- **Alerty i komunikaty błędów:** Mechanizm wyświetlania inline komunikatów o błędach oraz potwierdzenia sukcesów, zgodny ze standardami dostępności.

