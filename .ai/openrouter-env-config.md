# OpenRouter Service - Environment Configuration

## Required Environment Variables

### OPENROUTER_API_KEY (Required)
Your OpenRouter API key for accessing LLM models.

**How to get:**
1. Visit [https://openrouter.ai/keys](https://openrouter.ai/keys)
2. Sign up or log in
3. Create a new API key
4. Copy the key to your `.env` file

**Example:**
```
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Security Notes:**
- Never commit this key to version control
- Keep it in `.env` file (ignored by git)
- Only use on server-side (Astro API routes)
- API key is masked in logs

---

## Optional Environment Variables

### OPENROUTER_BASE_URL (Optional)
Override the default OpenRouter API base URL.

**Default:** `https://openrouter.ai/api/v1`

**When to use:**
- Testing with a proxy
- Using a custom OpenRouter endpoint
- Development with mock server

**Example:**
```
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
```

---

### OPENROUTER_DEFAULT_MODEL (Optional)
Override the default LLM model used by the service.

**Default:** `openai/gpt-4o-mini`

**Popular models:**
- `openai/gpt-4o-mini` - Fast, cost-effective GPT-4 variant
- `openai/gpt-4o` - More capable GPT-4 variant
- `anthropic/claude-3.5-sonnet` - Anthropic's Claude 3.5
- `google/gemini-pro` - Google's Gemini Pro
- `meta-llama/llama-3.1-70b-instruct` - Meta's Llama 3.1

**Example:**
```
OPENROUTER_DEFAULT_MODEL=openai/gpt-4o-mini
```

**Notes:**
- Can be overridden per request via API
- Different models have different costs
- Check [OpenRouter models](https://openrouter.ai/models) for full list

---

## Setup Instructions

1. **Copy the example configuration:**
   ```bash
   # Create .env file if it doesn't exist
   touch .env
   ```

2. **Add required variables to .env:**
   ```
   OPENROUTER_API_KEY=your_actual_api_key_here
   ```

3. **Optional: Add custom configuration:**
   ```
   OPENROUTER_DEFAULT_MODEL=openai/gpt-4o-mini
   ```

4. **Verify configuration:**
   ```bash
   # Start the development server
   npm run dev
   
   # Test health check endpoint
   curl http://localhost:3000/api/chat
   ```

   Expected response:
   ```json
   {
     "healthy": true,
     "latencyMs": 150
   }
   ```

---

## Troubleshooting

### Error: "OpenRouter API is not configured"
- Make sure `OPENROUTER_API_KEY` is set in your `.env` file
- Restart the development server after adding environment variables

### Error: "Unauthorized" (401)
- Check that your API key is valid
- Verify you have credits in your OpenRouter account
- Visit [https://openrouter.ai/settings/keys](https://openrouter.ai/settings/keys)

### Error: "Rate limit exceeded" (429)
- Wait a few seconds and try again
- Consider upgrading your OpenRouter plan
- Implement rate limiting on your application side

### Health check fails
- Verify your internet connection
- Check OpenRouter status: [https://status.openrouter.ai](https://status.openrouter.ai)
- Verify API key has sufficient credits

---

## Type Definitions

TypeScript types for environment variables are automatically inferred by Astro.

**Usage in code:**
```typescript
// In API routes or server-side code only
const apiKey = import.meta.env.OPENROUTER_API_KEY;
const baseUrl = import.meta.env.OPENROUTER_BASE_URL;
const defaultModel = import.meta.env.OPENROUTER_DEFAULT_MODEL;
```

**⚠️ Security Warning:**
These variables are ONLY available server-side. Never expose them to client-side code.

---

## Cost Management

### Default Parameters
The service uses cost-optimized defaults:
- `max_tokens: 1000` - Limits response length
- `temperature: 0.7` - Balanced creativity/consistency
- `timeout: 60s` - Prevents long-running requests

### Monitoring Usage
- Track token usage in API responses (`usage.total_tokens`)
- Monitor costs in OpenRouter dashboard
- Set up billing alerts in your OpenRouter account

### Best Practices
- Use cheaper models for simple tasks (e.g., `gpt-4o-mini`)
- Implement rate limiting per user
- Cache responses when appropriate
- Set reasonable `max_tokens` limits
