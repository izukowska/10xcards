# Test Generation Endpoint

## Quick Test Guide

### Start the development server

```bash
npm run dev
```

### Test 1: Valid Request (Success Case)

```bash
curl -X POST http://localhost:4321/api/flashcard-generations \
  -H "Content-Type: application/json" \
  -d '{
    "text": "'"$(python3 -c "print('Lorem ipsum dolor sit amet, consectetur adipiscing elit. ' * 100)")"'"
  }'
```

Expected Response (200):

```json
{
  "generation_id": 1,
  "generated_count": 5-10,
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

### Test 2: Text Too Short (Validation Error)

```bash
curl -X POST http://localhost:4321/api/flashcard-generations \
  -H "Content-Type: application/json" \
  -d '{
    "text": "This text is too short"
  }'
```

Expected Response (400):

```json
{
  "error": "Validation failed",
  "message": "Text must be at least 1000 characters long"
}
```

### Test 3: Text Too Long (Validation Error)

```bash
curl -X POST http://localhost:4321/api/flashcard-generations \
  -H "Content-Type: application/json" \
  -d '{
    "text": "'"$(python3 -c "print('a' * 10001)")"'"
  }'
```

Expected Response (400):

```json
{
  "error": "Validation failed",
  "message": "Text must not exceed 10000 characters"
}
```

### Test 4: Invalid JSON (Parse Error)

```bash
curl -X POST http://localhost:4321/api/flashcard-generations \
  -H "Content-Type: application/json" \
  -d 'invalid json'
```

Expected Response (400):

```json
{
  "error": "Invalid JSON",
  "message": "Request body must be valid JSON"
}
```

### Test 5: Missing text field (Validation Error)

```bash
curl -X POST http://localhost:4321/api/flashcard-generations \
  -H "Content-Type: application/json" \
  -d '{}'
```

Expected Response (400):

```json
{
  "error": "Validation failed",
  "message": "Text must be at least 1000 characters long"
}
```

## Database Verification

⚠️ **NOTE**: Database integration is not yet implemented in this version.
The endpoint currently returns mock data only.

Database integration will be added in future implementation including:

- Saving to `flashcard_generations` table
- Error logging to `generation_error_logs` table

## Implementation Status

✅ Endpoint created: `/api/flashcard-generations`
✅ Zod validation: Text length 1000-10000 characters
✅ Authentication: Using DEFAULT_USER_ID (development)
✅ Service layer: generation.service.ts with mocked AI
✅ Response format: GenerationCreateResponseDto
✅ Error handling: 400, 401, 500 status codes
✅ Mock generation_id: Random ID for development
⏳ Database recording: Will be added in future implementation
⏳ Error logging: Will be added in future implementation
⏳ MD5 hashing: Will be added with database integration
⏳ Duration tracking: Will be added with database integration

## Next Steps (Future Implementation)

### Phase 1: Database Integration

- [ ] Add MD5 hashing for source text
- [ ] Implement saving to `flashcard_generations` table
- [ ] Implement error logging to `generation_error_logs` table
- [ ] Add generation duration tracking

### Phase 2: Production Features

- [ ] Replace DEFAULT_USER_ID with actual Supabase Auth
- [ ] Integrate real AI service (OpenRouter.ai)
- [ ] Implement rate limiting (429 responses)
- [ ] Add request timeout (60 seconds)
- [ ] Implement caching for duplicate text hashes
- [ ] Add monitoring and metrics
