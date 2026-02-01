## Schemat bazy danych dla projektu 10xcards

### 1. Lista tabel

#### 1.1. Tabela `users`

Tabela 'users' będzie obsługiwana przez Supabase Aut.

| Kolumna       | Typ danych   | Ograniczenia                            |
| ------------- | ------------ | --------------------------------------- |
| id            | UUID         | PRIMARY KEY, default: gen_random_uuid() |
| email         | VARCHAR(255) | NOT NULL, UNIQUE                        |
| password_hash | VARCHAR      | NOT NULL                                |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP     |
| confirmed_at  | TIMESTAMP    |                                         |

#### 1.2. Tabela `flashcards`

| Kolumna       | Typ danych   | Ograniczenia                                                    |
| ------------- | ------------ | --------------------------------------------------------------- |
| id            | UUID         | PRIMARY KEY, default: gen_random_uuid()                         |
| user_id       | UUID         | NOT NULL, FOREIGN KEY REFERENCES users(id)                      |
| front         | VARCHAR(200) | NOT NULL, CHECK (char_length(front) <= 200)                     |
| back          | VARCHAR(500) | NOT NULL, CHECK (char_length(back) <= 500)                      |
| source        | VARCHAR(50)  | NOT NULL, CHECK (source IN ('ai-full', 'ai-edited', 'manual') ) |
| created_at    | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP                             |
| updated_at    | TIMESTAMP    | NOT NULL, DEFAULT CURRENT_TIMESTAMP                             |
| generation_id | BIGINT       | REFERENCES generation(id) ON DELETE SET NULL                    |

_Trigger: Automaticaly update the 'updatet_at' column on record updates._

#### 1.3. Tabela `flashcard_generations`

- id: BIGSERIAL PRIMARY KEY
- user_id UUID NOT NULL REFERENCES users(id)
- model: VARCHAR NOT NULL
- generated_count: INTEGER NOT NULL
- accepted_unedited_count: INTEGER NULLABLE
- soruce_text_hash: VARCHAR NOT NULL
- source_text_length: INTEGER NOT NULL CHECHK (source_text_length BETWEEN 1000 AND 10000)
- generation_duration: INTEGER NOT NULL
- created_at: TIMESTAMPTZ not null default(now)
- updatet_at: TIMESTAMPTZ not null default(now)

#### 1.4. Tabela `generation_error_logs`

- id: BIGSERIAL PRIMARY KET
- user_id: UUID NOT NULL REFERENCES users(id)
- model: VARCHAR NOT NULL
- source_text_hash: VARCHAR NOT NULL
- source_text_length: INTEGER NOT NULL CHECK (souce_text_length BETWEEN 1000 AND 10000)
- error_code: VARCHAR(100) not null
- error_message: TEXT NOT NULL
- created_at: TIMESTAMPTZ NOT NULL DEFUALT now()

### 2. Relacje między tabelami

- Tabela `users` ma relację jeden-do-wielu z tabelą `flashcards` (każdy użytkownik może posiadać wiele fiszek).
- Tabela `users` ma relację jeden-do-wielu z tabelą `flashcard_generations` (każdy użytkownik może mieć wiele sesji generowania fiszek).
- Jeden użytkownik (users) ma wiele rekordów w tabeli generation_error_logs.
- Kazda fiszka (flashcard) może odnosić się do jednej generacji (flashcard_generations) poprzez generation_id.

### 3. Indeksy

- Utworzyć indeks na kolumnie `user_id` w tabeli `flashcards`:
  ```sql
  CREATE INDEX idx_flashcards_user_id ON flashcards(user_id);
  ```
- Utworzyć indeks na kolumnie `user_id` w tabeli `flashcard_generations`:
  ```sql
  CREATE INDEX idx_generations_user_id ON flashcard_generations(user_id);
  ```

### 4. Zasady PostgreSQL (RLS)

- W tabelach flashcards, generation_flashcards oraz generation_error_logs wdrożyć polityki RLS, które pozwalają użytkownikowi na dostęp tylko do rekordów, gdzie 'user_id' odpowiada identyfikatorowi użytkownika z Supabase Auth (np. auth.uid() = user_id ).

### 5. Dodatkowe uwagi

- Trigger w tabeli flashcards ma automatycznie aktualizować kolumnę 'updated_at' przy każdej modyfikacji rekordu.
