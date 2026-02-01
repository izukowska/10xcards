# Environment Setup Guide

## Current Status (Mock Implementation)

✅ **No environment variables required** - The current implementation uses only mocks and doesn't connect to Supabase.

The middleware has been simplified to skip Supabase initialization.

## Future Setup (When Database Integration is Added)

When you're ready to integrate with the database, you'll need to:

### 1. Start Local Supabase

```bash
npx supabase start
```

This will output connection details including:
- API URL (typically `http://127.0.0.1:54321`)
- Anon key (JWT token for public access)

### 2. Create `.env` File

Create a `.env` file in the project root with:

```bash
# Supabase Configuration
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_KEY=your-anon-key-from-supabase-start

# OpenRouter API Key (for AI generation)
OPENROUTER_API_KEY=your-openrouter-api-key
```

### 3. Restore Middleware

Uncomment the Supabase initialization in `/src/middleware/index.ts`:

```typescript
import { defineMiddleware } from "astro:middleware";
import { supabaseClient } from "../db/supabase.client.ts";

export const onRequest = defineMiddleware((context, next) => {
  context.locals.supabase = supabaseClient;
  return next();
});
```

### 4. Update Service

Add back database operations in `/src/lib/services/generation.service.ts`:
- Hash source text with MD5
- Save to `flashcard_generations` table
- Log errors to `generation_error_logs` table

## Testing Without Database

Current setup allows you to test the API endpoint without any database:

```bash
npm run dev
```

Then test with:

```bash
curl -X POST http://localhost:4321/api/flashcard-generations \
  -H "Content-Type: application/json" \
  -d '{"text": "'"$(python3 -c "print('Lorem ipsum dolor sit amet. ' * 100)")"'"}'
```

Expected response with mock data:
```json
{
  "generation_id": 123,
  "generated_count": 5,
  "proposals": [
    {
      "front": "Mock Question 1 - What is the key concept from the text?",
      "back": "Mock Answer 1 - This is a generated answer based on the provided text content.",
      "source": "ai-full"
    }
    // ... more proposals
  ]
}
```

## Troubleshooting

### Error: "supabaseUrl is required"

This means the middleware is trying to initialize Supabase without environment variables.

**Solution**: Make sure `/src/middleware/index.ts` has the Supabase import commented out (as in current implementation).

### Error: "SUPABASE_URL is not defined"

This will happen when you uncomment the middleware but haven't created `.env` file.

**Solution**: 
1. Run `npx supabase start` to start local Supabase
2. Create `.env` file with the connection details
3. Restart the dev server
