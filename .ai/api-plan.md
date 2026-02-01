# REST API Plan

## 1. Resources

- **Users**: Managed by Supabase Auth. Although there is a `users` table, authentication and basic user info are handled via Supabase; therefore, user-related endpoints focus on authentication and profile management (if needed).

- **Flashcards**: Represents individual flashcards. Corresponds to the `flashcards` table containing fields such as `id`, `user_id`, `front`, `back`, `source`, `generation_id`, `created_at`, and `updated_at`.

- **Flashcard Generations**: Represents sessions of AI-generated flashcards. Maps to the `flashcard_generations` table with fields like `id`, `user_id`, `model`, `generated_count`, `accepted_unedited_count`, `source_text_hash`, `source_text_length`, `generation_duration`, `created_at`, and `updated_at`.

- **Generation Error Logs**: Captures errors during flashcard generation. Reflects the `generation_error_logs` table with fields such as `id`, `user_id`, `model`, `source_text_hash`, `source_text_length`, `error_code`, `error_message`, and `created_at`.

## 2. Endpoints

### A. Flashcards Endpoints

1. **List Flashcards**
   - **Method:** GET
   - **URL:** `/flashcards`
   - **Description:** Retrieves a paginated list of flashcards for the authenticated user.
   - **Query Parameters:**
     - `page` (default: 1)
     - `limit` (default: 10)
     - `sort` (e.g. created_at)
     - `order` (`asc` or `desc`)
     - Optional filters (e.g. `source`, `generation_id`)
   - **Response Structure (200):**
     ```json
     {
       "data": [
         { "id": "<uuid>", "front": "...", "back": "...", "source": "...", "created_at": "...", "updated_at": "..." }
         // ... more flashcards
       ],
       "pagination": { "page": 1, "limit": 10, "total": 100 }
     }
     ```
   - **Error Codes:**
     - 401 Unauthorized (if the user is not authenticated).
     - 500 Internal Server Error.

2. **List Flashcards**
   - **Method:** GET
   - **URL:** `/flashcards/{id}`
   - **Description:** Retrieves details for a specific flashcards.
   - **Response JSON:** Flashcard object.
   - **Error Codes:** 404 Not Found, 401 Unuathorized

3. **Create Flashcard (Manual Creation or Acceptance)**
   - **Method:** POST
   - **URL:** `/flashcards`
   - **Description:** Creates a new flashcard. Can be used for manual entry or saving an accepted AI-generated flashcard.
   - \*\*Request Body:
     ```json
     {
       "front": "<string, max 200 characters>",
       "back": "<string, max 500 characters>",
       "source": "<one of: 'ai-full', 'ai-edited', 'manual'>",
       "generation_id": "<optional, number>"
     }
     ```
   - **Response Structure (201):**
     ```json
     {
       "id": "<uuid>",
       "front": "...",
       "back": "...",
       "source": "...",
       "generation_id": "<id>",
       "created_at": "...",
       "updated_at": "..."
     }
     ```
   - **Error Codes:**
     - 400 Bad Request (if validation fails).
     - 401 Unauthorized.
     - 500 Internal Server Error.

4. **Update Flashcard**
   - **Method:** PUT
   - **URL:** `/flashcards/:id`
   - **Description:** Updates an existing flashcard. Used for editing a flashcard's front/back content.
   - **URL Parameters:**
     - `id`: Flashcard identifier.
   - \*\*Request Body:
     ```json
     {
       "front": "<string, max 200 characters, optional>",
       "back": "<string, max 500 characters, optional>",
       "source": "<optional: update source if needed>"
     }
     ```
   - **Response Structure (200):**
     ```json
     {
       "id": "<uuid>",
       "front": "...",
       "back": "...",
       "source": "...",
       "generation_id": "<id>",
       "created_at": "...",
       "updated_at": "..."
     }
     ```
   - **Error Codes:**
     - 400 Bad Request.
     - 401 Unauthorized.
     - 404 Not Found (if flashcard doesn’t exist).
     - 500 Internal Server Error.
     - **Validations:**
     - 'front' maximum length 200 characters.
     - 'back' maximum length 500 characters.
     - 'source' Must be one of 'ai-edited' or 'manual'.

5. **Delete Flashcard**
   - **Method:** DELETE
   - **URL:** `/flashcards/:id`
   - **Description:** Deletes the specified flashcard belonging to the authenticated user.
   - **URL Parameters:**
     - `id`: Flashcard identifier.
   - **Response Structure (200):**
     ```json
     { "message": "Flashcard deleted successfully." }
     ```
   - **Error Codes:**
     - 401 Unauthorized.
     - 404 Not Found.
     - 500 Internal Server Error.

### B. Flashcard Generation Endpoints

1. **Initiate AI Generation**
   - **Method:** POST
   - **URL:** `/flashcard-generations`
   - **Description:** Sends user-provided text (1000 to 10,000 characters) to the AI model, receives proposals for flashcards, and logs the generation session.
   - \*\*Request Body:
     ```json
     {
       "text": "<string, 1000-10000 characters>"
     }
     ```
   - **Response Structure (200):**
     ```json
     {
       "generation_id": "<number>",
       "generated_count": <number>,
       "proposals": [
         { "front": "...", "back": "..." }
         // ... proposals
       ],
       "message": "AI generation completed successfully."
     }
     ```
   - **Error Codes:**
     - 400 Bad Request (if text length is invalid).
     - 401 Unauthorized.
     - 429 Too Many Requests (rate limiting on generation endpoint).
     - 500 Internal Server Error.

2. **Retrieve Generation Session**
   - **Method:** GET
   - **URL:** `/flashcard-generations/:id`
   - **Description:** Retrieves details of a specific flashcard generation session, including summary metrics.
   - **URL Parameters:**
     - `id`: Generation session identifier.
   - **Response Structure (200):**
     ```json
     {
       "id": "<number>",
       "user_id": "<uuid>",
       "model": "...",
       "generated_count": <number>,
       "accepted_unedited_count": <number>,
       "generation_duration": <number>,
       "created_at": "...",
       "updated_at": "..."
     }
     ```
   - **Error Codes:**
     - 401 Unauthorized.
     - 404 Not Found.
     - 500 Internal Server Error.

### C. Generation Error Logs Endpoints

1. **List Generation Error Logs**
   - **Method:** GET
   - **URL:** `/generation-error-logs`
   - **Description:** Retrieves a list of generation error logs for the authenticated user (or for admin users).
   - **Query Parameters:** Pagination parameters (`page`, `limit`) and optional filters by `error_code`.
   - **Response Structure (200):**
     ```json
     {
       "data": [
         { "id": "<number>", "error_code": "...", "error_message": "...", "created_at": "..." }
         // ... more logs
       ],
       "pagination": { "page": 1, "limit": 10, "total": 20 }
     }
     ```
   - **Error Codes:**
     - 401 Unauthorized.
     - 500 Internal Server Error.

## 3. Authentication and Authorization

- **Mechanism:** Use Supabase Auth for user authentication. Endpoints require a valid access token (typically sent in the `Authorization` header as a Bearer token).
- **Authorization:**
  - RLS (Row Level Security) policies in Supabase ensure that users can only access and modify data associated with their own `user_id`.
  - Endpoints for flashcards and generations will use the authenticated user's ID to filter data.

## 4. Validation and Business Logic

- **Data Validation:**
  - For flashcards, validate that the `front` does not exceed 200 characters and `back` does not exceed 500 characters.
  - For flashcard generation requests, validate that the input text length is between 1000 and 10,000 characters.

- \*\*Business Logic:
  - AI Generation:\*\*
  - Validate inputs and call the AI service upon POST '/generations'.
  - Record generation metadata (model, generated_count, duration) and send generated flashcards proposal to the user.
  - Log any errors in 'generation_error_logs' for auditing and debugging.
    - If the AI model returns zero proposals, the API should return a clear message indicating no proposals were generated and provide an option to retry.
  - Bulk Save:\*\*
    - When accepting AI-generated flashcards, the API supports a bulk save operation where only accepted proposals are saved to the database.
  - **Manual Operations:**
    - Users are allowed to create, update, and delete flashcards manually. All these operations are subject to field validations and RLS.

---

**Assumptions:**

- User management (registration, login, password change, etc.) is fully handled by Supabase Auth.
- Admin-level operations (e.g., viewing all generation error logs) might require additional role-based checks.
- AI integration details (such as which LLM model is used and the communication protocol) are abstracted behind the AI generation endpoint.

This REST API plan provides a comprehensive structure that addresses all key aspects derived from the database schema, PRD, and technical stack specifications.
