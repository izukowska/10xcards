# OpenRouter Service - Quick Start Guide

## 🚀 Quick Setup

### 1. Get API Key
1. Visit [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up and create an API key
3. Add credits to your account (required for API calls)

### 2. Configure Environment
Create or update `.env` file in project root:

```env
OPENROUTER_API_KEY=sk-or-v1-your-actual-api-key-here
```

**⚠️ Security:** Never commit `.env` file to git!

### 3. Test the Service

#### Start Development Server
```bash
npm run dev
```

#### Test Health Check
```bash
curl http://localhost:3000/api/chat
```

Expected response:
```json
{
  "healthy": true,
  "latencyMs": 150
}
```

#### Test Basic Chat
```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello!"}
    ]
  }'
```

---

## 📚 Documentation

Detailed documentation available in `.ai/` directory:

- **[openrouter-service-implementation-plan.md](.ai/openrouter-service-implementation-plan.md)** - Full implementation plan
- **[openrouter-usage-examples.md](.ai/openrouter-usage-examples.md)** - Usage examples and API reference
- **[openrouter-env-config.md](.ai/openrouter-env-config.md)** - Environment configuration guide

---

## 🎯 Basic Usage

### In API Routes

```typescript
import { OpenRouterService } from "../../lib/services/openrouter.service";
import { ConsoleLogger } from "../../lib/logger";

const service = new OpenRouterService({
  apiKey: import.meta.env.OPENROUTER_API_KEY,
  logger: new ConsoleLogger(),
});

const response = await service.sendChat({
  messages: [
    { role: "system", content: "You are a helpful assistant." },
    { role: "user", content: "Explain TypeScript in one sentence." }
  ]
});

console.log(response.content);
```

### From Frontend

```typescript
const response = await fetch("/api/chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    messages: [
      { role: "user", content: "What is React?" }
    ]
  })
});

const data = await response.json();
console.log(data.content);
```

---

## ✨ Key Features

- ✅ **Type-safe** - Full TypeScript support
- ✅ **Error handling** - Comprehensive error scenarios
- ✅ **Retry logic** - Exponential backoff for transient errors
- ✅ **Structured output** - JSON schema validation
- ✅ **Cost control** - Default limits and monitoring
- ✅ **Security** - API key protection and validation
- ✅ **Logging** - Structured logging with request tracking
- ✅ **Testable** - Clean architecture with dependency injection

---

## 🏗️ Architecture

```
src/
├── types.ts                          # Type definitions
├── lib/
│   ├── logger.ts                     # Logger implementations
│   └── services/
│       └── openrouter.service.ts     # OpenRouter service
└── pages/
    └── api/
        └── chat.ts                   # API endpoint
```

---

## 🔍 API Endpoints

### POST /api/chat
Send chat messages and get AI response.

**Request:**
```json
{
  "messages": [
    {"role": "user", "content": "Hello"}
  ],
  "model": "openai/gpt-4o-mini",
  "params": {
    "temperature": 0.7,
    "max_tokens": 1000
  }
}
```

**Response:**
```json
{
  "content": "Hello! How can I help you?",
  "model": "openai/gpt-4o-mini",
  "usage": {
    "prompt_tokens": 10,
    "completion_tokens": 8,
    "total_tokens": 18
  },
  "requestId": "req_123_abc"
}
```

### GET /api/chat
Health check endpoint.

**Response:**
```json
{
  "healthy": true,
  "latencyMs": 150
}
```

---

## 🛡️ Error Handling

The service handles all error scenarios:

| Error Type | HTTP Status | Retry? | Description |
|------------|-------------|---------|-------------|
| `config` | 500 | ❌ | Missing/invalid configuration |
| `auth` | 401 | ❌ | Invalid API key |
| `rate_limit` | 429 | ✅ | Rate limit exceeded |
| `server` | 503 | ✅ | OpenRouter server error |
| `network` | 503 | ✅ | Network connectivity issue |
| `validation` | 400 | ❌ | Invalid request format |
| `parse` | 500 | ❌ | Invalid response format |
| `timeout` | 504 | ✅ | Request timeout |

---

## 💰 Cost Management

### Default Limits
- **max_tokens:** 1000
- **temperature:** 0.7
- **timeout:** 60s

### Monitor Usage
```typescript
const response = await service.sendChat(options);
console.log(`Tokens used: ${response.usage.total_tokens}`);
```

### Recommended Models
- **Development:** `openai/gpt-4o-mini` (~$0.15 per 1M tokens)
- **Production:** `openai/gpt-4o` (~$5 per 1M tokens)

Check current pricing: [https://openrouter.ai/models](https://openrouter.ai/models)

---

## 🐛 Troubleshooting

### "OpenRouter API is not configured"
- Ensure `OPENROUTER_API_KEY` is set in `.env`
- Restart dev server after adding env variables

### "Unauthorized" (401)
- Verify API key is valid
- Check you have credits in OpenRouter account

### "Rate limit exceeded" (429)
- Wait a few seconds and retry
- Service automatically retries with backoff

### Health check fails
- Check internet connection
- Verify OpenRouter status: [status.openrouter.ai](https://status.openrouter.ai)

---

## 📝 Next Steps

1. ✅ Service implemented and tested
2. ⏭️ Integrate with flashcard generation
3. ⏭️ Add rate limiting per user
4. ⏭️ Implement response caching
5. ⏭️ Add usage analytics

---

## 📄 License

Part of 10xCards project.
