# OpenRouter Service - Usage Examples

## Basic Chat Example

### Simple Question/Answer

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Explain the difference between HTTP and HTTPS in one sentence."
      }
    ]
  }'
```

**Response:**
```json
{
  "content": "HTTPS is the secure version of HTTP that encrypts data transmission between client and server using SSL/TLS protocol.",
  "model": "openai/gpt-4o-mini",
  "usage": {
    "prompt_tokens": 18,
    "completion_tokens": 23,
    "total_tokens": 41
  },
  "requestId": "req_1706789123456_abc123",
  "finishReason": "stop"
}
```

---

## System Prompt Example

### Chat with Context

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant for learning flashcards. Keep answers concise."
      },
      {
        "role": "user",
        "content": "What is photosynthesis?"
      }
    ]
  }'
```

**Response:**
```json
{
  "content": "Photosynthesis is the process by which plants convert sunlight, water, and carbon dioxide into glucose (food) and oxygen.",
  "model": "openai/gpt-4o-mini",
  "usage": {
    "prompt_tokens": 35,
    "completion_tokens": 28,
    "total_tokens": 63
  },
  "requestId": "req_1706789123457_def456"
}
```

---

## Structured Output (JSON Schema)

### Generate Flashcard with Confidence Score

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "You generate flashcard answers with confidence scores."
      },
      {
        "role": "user",
        "content": "What is the capital of France?"
      }
    ],
    "responseFormat": {
      "type": "json_schema",
      "json_schema": {
        "name": "flashcard_answer",
        "strict": true,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "answer": { "type": "string" },
            "confidence": { "type": "number", "minimum": 0, "maximum": 1 }
          },
          "required": ["answer", "confidence"]
        }
      }
    }
  }'
```

**Response:**
```json
{
  "content": "{\"answer\":\"Paris\",\"confidence\":1.0}",
  "model": "openai/gpt-4o-mini",
  "usage": {
    "prompt_tokens": 45,
    "completion_tokens": 15,
    "total_tokens": 60
  },
  "requestId": "req_1706789123458_ghi789"
}
```

**Parsed Content:**
```json
{
  "answer": "Paris",
  "confidence": 1.0
}
```

---

## Custom Model and Parameters

### Creative Writing with GPT-4

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "user",
        "content": "Write a creative mnemonic for remembering the order of planets."
      }
    ],
    "model": "openai/gpt-4o",
    "params": {
      "temperature": 0.9,
      "max_tokens": 100,
      "presence_penalty": 0.3
    }
  }'
```

---

## Multi-Turn Conversation

### Conversation with History

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "You are a tutor helping with math problems."
      },
      {
        "role": "user",
        "content": "What is the Pythagorean theorem?"
      },
      {
        "role": "assistant",
        "content": "The Pythagorean theorem states that in a right triangle, a² + b² = c², where c is the hypotenuse."
      },
      {
        "role": "user",
        "content": "Can you give me an example with numbers?"
      }
    ]
  }'
```

---

## Health Check

### Check Service Status

**Request:**
```bash
curl http://localhost:3000/api/chat
```

**Response (Healthy):**
```json
{
  "healthy": true,
  "latencyMs": 150
}
```

**Response (Unhealthy):**
```json
{
  "healthy": false,
  "message": "Connection timeout",
  "latencyMs": 10000
}
```

---

## Error Handling Examples

### 400 - Validation Error

**Request (invalid message role):**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "invalid_role",
        "content": "Test"
      }
    ]
  }'
```

**Response:**
```json
{
  "error": "Validation Error",
  "message": "Invalid request format",
  "details": [
    {
      "path": "messages.0.role",
      "message": "Role must be one of: system, user, assistant"
    }
  ]
}
```

### 401 - Unauthorized

**Response (invalid API key):**
```json
{
  "error": "auth",
  "message": "HTTP 401: Invalid API key",
  "requestId": "req_1706789123459_jkl012"
}
```

### 429 - Rate Limit

**Response:**
```json
{
  "error": "rate_limit",
  "message": "HTTP 429: Rate limit exceeded. Please try again later.",
  "requestId": "req_1706789123460_mno345"
}
```

---

## TypeScript/JavaScript Usage

### In Astro API Route

```typescript
import { OpenRouterService } from "../../lib/services/openrouter.service";
import { ConsoleLogger } from "../../lib/logger";

// Initialize service
const service = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  defaultModel: "openai/gpt-4o-mini",
  logger: new ConsoleLogger("MyService"),
});

// Send chat request
const response = await service.sendChat({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Hello!" },
  ],
});

console.log(response.content);
```

### In Frontend (via API)

```typescript
// Frontend code (React component, etc.)
async function askQuestion(question: string) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [
        {
          role: "user",
          content: question,
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message);
  }

  const data = await response.json();
  return data.content;
}

// Usage
const answer = await askQuestion("What is TypeScript?");
console.log(answer);
```

---

## Advanced: Flashcard Generation with JSON Schema

### Generate Multiple Flashcards

**Request:**
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {
        "role": "system",
        "content": "Generate flashcards from the provided text. Each flashcard should have a front (question) and back (answer)."
      },
      {
        "role": "user",
        "content": "Photosynthesis is the process by which plants use sunlight to produce glucose from carbon dioxide and water. It takes place primarily in the chloroplasts."
      }
    ],
    "responseFormat": {
      "type": "json_schema",
      "json_schema": {
        "name": "flashcard_list",
        "strict": true,
        "schema": {
          "type": "object",
          "additionalProperties": false,
          "properties": {
            "flashcards": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "front": { "type": "string" },
                  "back": { "type": "string" }
                },
                "required": ["front", "back"],
                "additionalProperties": false
              }
            }
          },
          "required": ["flashcards"]
        }
      }
    }
  }'
```

**Response:**
```json
{
  "content": "{\"flashcards\":[{\"front\":\"What is photosynthesis?\",\"back\":\"The process by which plants use sunlight to produce glucose from carbon dioxide and water.\"},{\"front\":\"Where does photosynthesis take place?\",\"back\":\"Primarily in the chloroplasts.\"}]}",
  "model": "openai/gpt-4o-mini",
  "usage": {
    "prompt_tokens": 80,
    "completion_tokens": 55,
    "total_tokens": 135
  }
}
```

---

## Best Practices

### 1. Always Use System Prompts
Define the AI's role and behavior:
```json
{
  "role": "system",
  "content": "You are a concise tutor. Keep answers under 100 words."
}
```

### 2. Validate Structured Outputs
When using `responseFormat`, always validate the response:
```typescript
const validation = service.validateResponse(
  response.content,
  responseFormat
);

if (!validation.valid) {
  throw new Error(validation.error);
}

const data = JSON.parse(response.content);
```

### 3. Handle Errors Gracefully
```typescript
try {
  const response = await service.sendChat(options);
  return response;
} catch (error) {
  if (error instanceof OpenRouterError) {
    if (error.type === "rate_limit") {
      // Wait and retry
    } else if (error.type === "auth") {
      // Check API key
    }
  }
  throw error;
}
```

### 4. Monitor Token Usage
Track costs by monitoring token usage:
```typescript
const response = await service.sendChat(options);
console.log(`Tokens used: ${response.usage.total_tokens}`);
```

### 5. Use Appropriate Models
- Simple tasks → `openai/gpt-4o-mini` (cheap, fast)
- Complex reasoning → `openai/gpt-4o` (expensive, better)
- Long context → Check model's context window

---

## Testing Checklist

- [ ] Basic chat request works
- [ ] System prompts are respected
- [ ] Structured output (JSON schema) works
- [ ] Custom model selection works
- [ ] Custom parameters work
- [ ] Multi-turn conversations work
- [ ] Health check endpoint works
- [ ] Validation errors are clear
- [ ] Auth errors are handled
- [ ] Rate limiting is handled
- [ ] Timeout works correctly
- [ ] Token usage is tracked
