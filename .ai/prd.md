# Dokument wymagań produktu (PRD) - AI Fiszki

## 1. Przegląd produktu

Projekt 10x-cards ma na celu przyspieszenie i uproszczenie tworzenia i zarządzania zestawami fiszek edukacyjnych poprzez generowanie propozycji fiszek przez AI oraz prosty edytor manualny.
Aplikacja wykorzystuje modele LLM (poprzez API) do generowania sugestii fiszek na podstawie dostarczonego tekstu.

## 2. Problem użytkownika

Użytkownicy chcą korzystać z metody spaced repetition, ale:

- Ręczne tworzenie wysokiej jakości fiszek jest czasochłonne.
- Początkujący mają trudność z właściwym dzieleniem treści na krótkie, skuteczne fiszki.
  Produkt ma skrócić czas przygotowania fiszek i ułatwić decyzje o tym, co powinno znaleźć się na przodzie i tyle fiszki.

## 3. Wymagania funkcjonalne

1. Generowanie fiszek przez AI
   - Wejściowy tekst ma długość od 1000 do 10 000 znaków.
   - Użytkownik wkleja dowolny tekst (np. fragment podręcznika).
   - Aplikacja wysyła tekst do modelu LLM za pośrednictwem API.
   - Model LLM proponuje zestaw fiszek (pytania i odpowiedzi).
   - Fiszki są przedstawiane użytkownikowi w formie listy.
   - Każda propozycja ma pola: przód do 200 znaków, tył do 500 znaków.
   - Użytkownik może zaakceptować, edytować lub odrzucić każdą propozycję.
   - Zapis do bazy obejmuje wyłącznie zaakceptowane propozycje, wykonywanym w jednym zapisie zbiorczym.
2. Manualne tworzenie fiszek
   - Formularz umożliwia utworzenie fiszki z polami przód i tył z limitami znaków.
   - Opcje edycji i usuwania istniejących fiszek.
   - Ręczne tworzenie fiszek i wyświetlanie w ramach widoku listy "Moje fiszki".
3. Przeglądanie, edycja i usuwanie fiszek
   - Użytkownik widzi listę swoich fiszek.
   - Może edytować pola przód i tył istniejących fiszek.
   - Może usuwać fiszki.
4. Podstawowy system uwierzytelniania:
   - Rejestracja, logowanie i wylogowanie.
   - Edycja hasła oraz usunięcie konta (wraz z powiązanymi fiszkami).
   - Autoryzacja dostępu do fiszek użytkownika z użyciem RLS.
   - Standardowe praktyki bezpieczeństwa dla danych i sesji.
5. Algorytm powtórek
   - Zapisane fiszki są zintegrowane z gotowym algorytmem powtórek.
   - Brak dodatkowych metadanych i zawansowanych funkcji powiadomień dla MVP.
6. Walidacja danych
   - Walidacja limitów znaków dla przodu, tyłu i tekstu wejściowego na frontendzie, backendzie i w bazie danych.
   - Błędy walidacji są prezentowane użytkownikowi w zrozumiały sposób.
7. Logowanie procesu generowania
   - Dedykowana tabela logów przechowuje metadane generowania (np. liczba propozycji, liczba zaakceptowanych, odrzuconych, edytowanych).
   - Logi służą do pomiaru metryk sukcesu.
   - Zbieranie informacji o tym ile fiszek zostało wygenerowanych przez AI i ile z nich ostatecznie zaakceptowano.
8. Wymagania prawne i ograniczenia:
   - Dane osobowe użytkowników i fiszek przechowywane zgodnie z RODO.
   - Prawo do wglądu i usunięcia danych (konto wraz z fiszkami) na wniosek użytkownika.

## 4. Granice produktu

1. Brak własnego, zaawansowanego algorytmu powtórek (korzystamy z gotowego rozwiązania, biblioteki open-source)
2. Brak importu wielu formatów (PDF, DOCX i inne).
3. Brak współdzielenia zestawów fiszek między użytkownikami.
4. Brak integracji z innymi platformami edukacyjnymi.
5. Brak aplikacji mobilnych w MVP, tylko aplikacja webowa.

## 5. Historyjki użytkowników

- ID: US-001
  Tytuł: Rejestracja konta
  Opis: Jako nowy użytkownik chcę założyć konto, aby móc zapisywać fiszki i mieć do nich dostęp.
  Kryteria akceptacji:
  - Formularz rejestracji tworzy konto przy poprawnych danych (adres e-mail i hasło).
  - Błędy walidacji są wyświetlane użytkownikowi.
  - Po poprawnym wypełnieniu formularza i weryfikacji danych konto jest aktywowane.
  - Po rejestracji użytkownik jest zalogowany lub otrzymuje jasną informację o konieczności logowania.

- ID: US-002
  Tytuł: Logowanie do konta
  Opis: Jako użytkownik chcę się zalogować, aby uzyskać dostęp do swoich fiszek.
  Kryteria akceptacji:
  - Logowanie działa przy poprawnych danych.
  - Błędne dane powodują komunikat o błędzie bez ujawniania szczegółów.
  - Po zalogowaniu użytkownik ma dostęp tylko do swoich fiszek.

- ID: US-003
  Tytuł: Wylogowanie
  Opis: Jako użytkownik chcę się wylogować, aby zakończyć sesję.
  Kryteria akceptacji:
  - Wylogowanie kończy sesję i usuwa dostęp do fiszek.
  - Próba wejścia do chronionych widoków wymaga ponownego logowania.

- ID: US-004
  Tytuł: Zmiana hasła
  Opis: Jako użytkownik chcę zmienić hasło, aby zwiększyć bezpieczeństwo konta.
  Kryteria akceptacji:
  - Formularz zmiany hasła wymaga obecnego i nowego hasła.
  - Po zmianie hasła użytkownik otrzymuje potwierdzenie.
  - Nowe hasło obowiązuje przy kolejnym logowaniu.

- ID: US-005
  Tytuł: Usunięcie konta
  Opis: Jako użytkownik chcę usunąć konto, aby usunąć swoje dane.
  Kryteria akceptacji:
  - Użytkownik musi potwierdzić usunięcie konta.
  - Po usunięciu konta fiszki użytkownika nie są dostępne.
  - Sesja zostaje zakończona.

- ID: US-006
  Tytuł: Wprowadzenie tekstu do generowania fiszek
  Opis: Jako zalogowany użytkownik chcę wkleić tekst do formularza AI, aby otrzymać propozycje fiszek.
  Kryteria akceptacji:
  - Formularz akceptuje tekst od 1000 do 10 000 znaków.
  - Zbyt krótki lub zbyt długi tekst jest odrzucany z komunikatem walidacyjnym.
  - Po poprawnym wprowadzeniu tekstu użytkownik może uruchomić generowanie.

- ID: US-007
  Tytuł: Generowanie propozycji fiszek przez AI
  Opis: Jako zalogowany użytkownik chcę wkleić kawałek tekstu i za pomocą przycisku wygenerować listę propozycji fiszek, aby móc je zweryfikować w ten sposób oszczędzając czas na tworzenie pytań i odpowiedzi.
  Kryteria akceptacji:
  - W widoku generowania fiszek znajduje się pole tekstowe, w którym użytkownik może wkleić swój tekst.
  - Pole tekstowe oczekuje od 1000 do 10 000 znaków.
  - Po kliknięciu przycysiku generowania aplikacja komunikuje się z API modelu LLM i wyświetla listę wygenerowanych propozycji fiszek do akceptacji przez użytkownika.
  - Gdy AI zwróci zero propozycji, użytkownik widzi jasny komunikat i możliwość spróbowania ponownie.

- ID: US-008
  Tytuł: Przegląd propozycji AI
  Opis: Jako zalgoowany użytkownik chcę przeglądać propozycje AI, aby zdecydować, które zachować.
  Kryteria akceptacji:
  - Lista propozycji jest czytelna i zawiera pola przód i tył.
  - Dla każdej propozycji dostępne są akcje zaakceptuj, edytuj, odrzuć.
  - Stan decyzji jest widoczny przed zapisem.

- ID: US-009
  Tytuł: Edycja propozycji AI
  Opis: Jako użytkownik chcę edytować przód i tył propozycji, aby dopasować ją do swoich potrzeb.
  Kryteria akceptacji:
  - Istnieje lista zapisanych fiszek (zarówno ręcznie tworzonych, jak i zatwierdzonych wygenerowanych)
  - Każdą fiszkę można kliknąć i wejśc w tryb edycji.
  - Zmiany są zapisywane w bazie danych po zatwierdzeniu.

- ID: US-010
  Tytuł: Akceptacja propozycji AI
  Opis: Jako użytkownik chcę zaakceptować propozycję AI, aby została zapisana jako fiszka.
  Kryteria akceptacji:
  - Lista wygenerowanych fiszek jest wyświetlana pod formularzem generowania.
  - Przy każdej fiszce znajduje się przycisk pozwalający na jej zatwierdzenie, edycje lub odrzucenie.
  - Akceptowana propozycja trafia do listy zapisanych w ramach zbiorczego zapisu.
  - Użytkownik widzi informację o liczbie zaakceptowanych propozycji.

- ID: US-011
  Tytuł: Odrzucenie propozycji AI
  Opis: Jako użytkownik chcę odrzucić propozycję, aby nie była zapisana.
  Kryteria akceptacji:
  - Odrzucona propozycja nie trafia do zapisu.
  - Użytkownik widzi, że propozycja została odrzucona.

- ID: US-012
  Tytuł: Zbiorczy zapis zaakceptowanych propozycji
  Opis: Jako użytkownik chcę zapisać wszystkie zaakceptowane propozycje jedną akcją.
  Kryteria akceptacji:
  - Zapis obejmuje tylko propozycje zaakceptowane.
  - Jeśli żadna propozycja nie jest zaakceptowana, użytkownik otrzymuje komunikat i zapis nie jest wykonywany.
  - Po zapisie użytkownik widzi potwierdzenie i nowe fiszki na liście.

- ID: US-013
  Tytuł: Manualne tworzenie fiszki
  Opis: Jako użytkownik chcę ręcznie utworzyć fiszkę, aby dodać treść niezależnie od AI.
  Kryteria akceptacji:
  - W widoku "Moje fiszki" znajduje się przycisk dodania nowej fiszki.
  - Formularz pozwala wprowadzić przód i tył.
  - Limity znaków są walidowane.
  - Po zapisaniu fiszka pojawia się na liście.

- ID: US-014
  Tytuł: Przeglądanie listy fiszek
  Opis: Jako użytkownik chcę przeglądać swoje fiszki, aby zarządzać wiedzą.
  Kryteria akceptacji:
  - Lista pokazuje fiszki należące do zalogowanego użytkownika.
  - Lista aktualizuje się po dodaniu lub usunięciu fiszek.

- ID: US-015
  Tytuł: Edycja zapisanej fiszki
  Opis: Jako użytkownik chcę edytować przód i tył istniejącej fiszki.
  Kryteria akceptacji:
  - Edycja obejmuje wyłącznie przód i tył.
  - Limity znaków są walidowane.
  - Zmiany są zapisywane i widoczne na liście.

- ID: US-016
  Tytuł: Usuwanie fiszki
  Opis: Jako użytkownik chcę usunąć fiszkę, aby pozbyć się niepotrzebnej treści.
  Kryteria akceptacji:
  - Przy każdej fiszce na liście (w widoku "Moje fiszki") widoczna jest opcja usunięcia.
  - Po wybraniu usuwania użytkownik musi potwierdzić operację, zanim fiszka zostanie trwale usunięta.
  - Fiszki zostają trwale usunięte z bacy danych po potwierdzeniu.
  - Po usunięciu fiszka znika z listy.

- ID: US-017
  Tytuł: Sesja nauki z algorytem powtórek
  Opis: Jako użytkownik chcę, aby dodane fiszki były dostępne w widoku "Sesja nauki" opartym na zewnętrzym algorytmie, aby móc efektywnie uczyć się (spaced repetition).
  Kryteria akceptacji:
  - W widoku "Sesja nauki" algorytm przygotowuje dla mnie sesje nauki fiszek.
  - Na start wyświetlany jest przód fiszki, poprzec interakcję użytkownik wyświetla jej tył.
  - Użytkownik ocenia zgodnie z oczekiwaniami algorytmu na ile przyswoił wiedzę.
  - Następnie algorytm pokazuje kolejną fiszkę w ramach sesji nauki.

- ID: US-018
  Tytuł: Walidacja danych po stronie backendu i bazy
  Opis: Jako użytkownik chcę mieć pewność, że dane są spójne niezależnie od źródła.
  Kryteria akceptacji:
  - Backend odrzuca zapisy z przekroczonymi limitami znaków.
  - Baza danych wymusza limity na poziomie schematu.
  - Użytkownik otrzymuje czytelny komunikat o błędzie.

- ID: US-019
  Tytuł: Izolacja danych użytkowników
  Opis: Jako użytkownik chcę, aby moje fiszki były dostępne tylko dla mnie.
  Kryteria akceptacji:
  - Próba odczytu lub zapisu fiszek innych użytkowników jest blokowana.
  - Reguły RLS są aktywne dla tabel fiszek i logów.

- ID: US-020
  Tytuł: Rejestracja logu generowania
  Opis: Jako właściciel produktu chcę logować proces generowania, aby mierzyć skuteczność AI.
  Kryteria akceptacji:
  - Dla każdego procesu generowania tworzony jest wpis logu.
  - Log zawiera co najmniej liczbę propozycji oraz liczbę zaakceptowanych, odrzuconych i edytowanych.
  - Log jest powiązany z użytkownikiem.

## 6. Metryki sukcesu

1. Co najmniej 75 procent fiszek wygenerowanych przez AI jest akceptowanych przez użytkowników.
2. Co najmniej 75 procent nowych fiszek jest tworzonych z wykorzystaniem AI.
3. Metryki są liczone na podstawie danych z dedykowanej tabeli logów generowania.
