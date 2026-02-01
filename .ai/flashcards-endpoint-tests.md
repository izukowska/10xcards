# Test Plan for POST /flashcards Endpoint

## Endpoint: POST /api/flashcards

### Overview
This document contains test cases and examples for testing the POST /flashcards endpoint implementation.

## Test Cases

### 1. Success Cases

#### Test 1.1: Create single manual flashcard
**Request:**
```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "What is TypeScript?",
        "back": "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
        "source": "manual",
        "generation_id": null
      }
    ]
  }'
```

**Expected Response (201):**
```json
{
  "data": [
    {
      "id": "<uuid>",
      "front": "What is TypeScript?",
      "back": "TypeScript is a typed superset of JavaScript that compiles to plain JavaScript.",
      "source": "manual",
      "generation_id": null,
      "created_at": "2026-01-27T...",
      "updated_at": "2026-01-27T..."
    }
  ],
  "message": "Flashcards created successfully"
}
```

#### Test 1.2: Create multiple manual flashcards
**Request:**
```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "What is React?",
        "back": "React is a JavaScript library for building user interfaces.",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "What is Astro?",
        "back": "Astro is a modern web framework for building fast, content-focused websites.",
        "source": "manual",
        "generation_id": null
      }
    ]
  }'
```

**Expected Response (201):**
```json
{
  "data": [
    {
      "id": "<uuid>",
      "front": "What is React?",
      "back": "React is a JavaScript library for building user interfaces.",
      "source": "manual",
      "generation_id": null,
      "created_at": "2026-01-27T...",
      "updated_at": "2026-01-27T..."
    },
    {
      "id": "<uuid>",
      "front": "What is Astro?",
      "back": "Astro is a modern web framework for building fast, content-focused websites.",
      "source": "manual",
      "generation_id": null,
      "created_at": "2026-01-27T...",
      "updated_at": "2026-01-27T..."
    }
  ],
  "message": "Flashcards created successfully"
}
```

#### Test 1.3: Create AI-generated flashcard (ai-full)
**Prerequisites:** 
- Have a valid generation_id from a previous POST /flashcard-generations call

**Request:**
```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "What is polymorphism?",
        "back": "Polymorphism is the ability of objects to take on multiple forms.",
        "source": "ai-full",
        "generation_id": 1
      }
    ]
  }'
```

**Expected Response (201):**
```json
{
  "data": [
    {
      "id": "<uuid>",
      "front": "What is polymorphism?",
      "back": "Polymorphism is the ability of objects to take on multiple forms.",
      "source": "ai-full",
      "generation_id": 1,
      "created_at": "2026-01-27T...",
      "updated_at": "2026-01-27T..."
    }
  ],
  "message": "Flashcards created successfully"
}
```

**Side Effect:** 
- The `accepted_unedited_count` in `flashcard_generations` table for generation_id=1 should be incremented by 1

#### Test 1.4: Create edited AI flashcard (ai-edited)
**Prerequisites:** 
- Have a valid generation_id from a previous POST /flashcard-generations call

**Request:**
```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "What is encapsulation? (Edited)",
        "back": "Encapsulation is bundling data and methods that operate on that data within a single unit. (My custom edit)",
        "source": "ai-edited",
        "generation_id": 1
      }
    ]
  }'
```

**Expected Response (201):**
- Similar to Test 1.3, but source is "ai-edited"

**Side Effect:** 
- The `accepted_unedited_count` should NOT be incremented (only ai-full increments this)

#### Test 1.5: Bulk create mixed sources
**Request:**
```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -d '{
    "flashcards": [
      {
        "front": "Manual card",
        "back": "Manual answer",
        "source": "manual",
        "generation_id": null
      },
      {
        "front": "AI Full card",
        "back": "AI Full answer",
        "source": "ai-full",
        "generation_id": 1
      },
      {
        "front": "AI Edited card",
        "back": "AI Edited answer",
        "source": "ai-edited",
        "generation_id": 1
      }
    ]
  }'
```

**Expected Response (201):**
- All three flashcards created successfully
- accepted_unedited_count incremented by 1 (only for ai-full)

### 2. Validation Error Cases (400 Bad Request)

#### Test 2.1: Front text too short
**Request:**
```json
{
  "flashcards": [
    {
      "front": "",
      "back": "Valid back text",
      "source": "manual",
      "generation_id": null
    }
  ]
}
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "message": "flashcards.0.front: Front must be at least 1 character long"
}
```

#### Test 2.2: Front text too long
**Request:**
```json
{
  "flashcards": [
    {
      "front": "<string with 201 characters>",
      "back": "Valid back text",
      "source": "manual",
      "generation_id": null
    }
  ]
}
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "message": "flashcards.0.front: Front must not exceed 200 characters"
}
```

#### Test 2.3: Back text too long
**Request:**
```json
{
  "flashcards": [
    {
      "front": "Valid front",
      "back": "<string with 501 characters>",
      "source": "manual",
      "generation_id": null
    }
  ]
}
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "message": "flashcards.0.back: Back must not exceed 500 characters"
}
```

#### Test 2.4: Invalid source value
**Request:**
```json
{
  "flashcards": [
    {
      "front": "Valid front",
      "back": "Valid back",
      "source": "invalid-source",
      "generation_id": null
    }
  ]
}
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "message": "flashcards.0.source: Source must be one of: ai-full, ai-edited, manual"
}
```

#### Test 2.5: Missing generation_id for AI source
**Request:**
```json
{
  "flashcards": [
    {
      "front": "Valid front",
      "back": "Valid back",
      "source": "ai-full",
      "generation_id": null
    }
  ]
}
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "message": "flashcards.0.generation_id: generation_id must be provided for AI sources and null for manual source"
}
```

#### Test 2.6: generation_id provided for manual source
**Request:**
```json
{
  "flashcards": [
    {
      "front": "Valid front",
      "back": "Valid back",
      "source": "manual",
      "generation_id": 1
    }
  ]
}
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "message": "flashcards.0.generation_id: generation_id must be provided for AI sources and null for manual source"
}
```

#### Test 2.7: Empty flashcards array
**Request:**
```json
{
  "flashcards": []
}
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "message": "flashcards: At least one flashcard must be provided"
}
```

#### Test 2.8: Too many flashcards (>100)
**Request:**
```json
{
  "flashcards": [
    // ... 101 flashcards
  ]
}
```

**Expected Response (400):**
```json
{
  "error": "Validation failed",
  "message": "flashcards: Cannot create more than 100 flashcards at once"
}
```

#### Test 2.9: Invalid JSON
**Request:**
```bash
curl -X POST http://localhost:4321/api/flashcards \
  -H "Content-Type: application/json" \
  -d 'invalid json{'
```

**Expected Response (400):**
```json
{
  "error": "Invalid JSON",
  "message": "Request body must be valid JSON"
}
```

### 3. Not Found Cases (404)

#### Test 3.1: Non-existent generation_id
**Request:**
```json
{
  "flashcards": [
    {
      "front": "Valid front",
      "back": "Valid back",
      "source": "ai-full",
      "generation_id": 999999
    }
  ]
}
```

**Expected Response (404):**
```json
{
  "error": "Not found",
  "message": "Generation with ID 999999 not found"
}
```

### 4. Authorization Cases (401)

#### Test 4.1: generation_id belongs to different user
**Prerequisites:**
- Have a generation_id that belongs to a different user

**Request:**
```json
{
  "flashcards": [
    {
      "front": "Valid front",
      "back": "Valid back",
      "source": "ai-full",
      "generation_id": 123
    }
  ]
}
```

**Expected Response (401):**
```json
{
  "error": "Unauthorized",
  "message": "Generation 123 does not belong to user"
}
```

## Edge Cases to Consider

### Edge Case 1: Maximum length fields
- Test with front exactly 200 characters
- Test with back exactly 500 characters
- Both should succeed

### Edge Case 2: Unicode and special characters
- Test with emoji in front/back
- Test with multi-byte characters (e.g., Chinese, Arabic)
- Test with special characters (quotes, backslashes, etc.)

### Edge Case 3: Whitespace handling
- Test with leading/trailing whitespace
- Test with only whitespace (should fail minimum length validation)

### Edge Case 4: Concurrent requests
- Test creating flashcards with same generation_id concurrently
- Verify accepted_unedited_count is correctly updated

### Edge Case 5: Database constraints
- Test inserting duplicate content (should succeed - no unique constraint)
- Test with invalid user_id (should fail at database level)

## Testing Strategy

### Manual Testing
1. Use curl commands provided above
2. Test in sequence: success cases first, then error cases
3. Verify database state after each test (check flashcards and flashcard_generations tables)

### Automated Testing (Future)
- Create integration tests using Vitest
- Mock Supabase client for unit tests
- Test service layer independently from API layer

## Database Verification Queries

After creating flashcards, verify using these SQL queries:

```sql
-- Check created flashcards
SELECT * FROM flashcards 
WHERE user_id = 'efc8e5fc-cfa7-4b39-956f-6e135061e331' 
ORDER BY created_at DESC 
LIMIT 10;

-- Check generation stats
SELECT id, generated_count, accepted_unedited_count 
FROM flashcard_generations 
WHERE user_id = 'efc8e5fc-cfa7-4b39-956f-6e135061e331'
ORDER BY created_at DESC;

-- Count flashcards by source
SELECT source, COUNT(*) as count
FROM flashcards
WHERE user_id = 'efc8e5fc-cfa7-4b39-956f-6e135061e331'
GROUP BY source;
```

## Notes

- All tests assume development environment with DEFAULT_USER_ID
- In production, authentication will be required (Authorization header with Bearer token)
- Rate limiting is not yet implemented
- Error logging to generation_error_logs is not yet implemented for this endpoint
