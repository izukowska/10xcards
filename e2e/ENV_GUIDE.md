# 🔐 Environment Variables Guide for E2E Tests

## Overview

This project uses **two separate environment files** to manage configurations:
- `.env` - for local development (local Supabase)
- `.env.test` - for E2E tests (cloud Supabase)

## How It Works

### Priority System

When running E2E tests with Playwright, **`.env.test` has priority**:

```typescript
// playwright.config.ts
dotenv.config({ path: resolve(__dirname, '.env.test') });          // Load first
dotenv.config({ path: resolve(__dirname, '.env'), override: false }); // Load missing vars only
```

This means:
1. ✅ Variables in `.env.test` are loaded **first**
2. ✅ Variables in `.env` are loaded **only if not already set**
3. ✅ You can develop locally with local Supabase, test with cloud Supabase

## File Structure

### `.env` (Local Development)

```bash
# Supabase Local Development Configuration
PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
PUBLIC_SUPABASE_KEY=eyJhbGci...
OPENROUTER_API_KEY=sk-or-v1-...
```

**Used when:**
- Running `npm run dev`
- Developing locally
- Manual testing in browser

### `.env.test` (E2E Tests)

```bash
# Supabase Configuration (Test Environment - Cloud)
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...

# Playwright Configuration
PLAYWRIGHT_TEST_BASE_URL=http://localhost:4321

# E2E Test Credentials
E2E_EMAIL=test@example.com
E2E_PASSWORD=TestPassword123!
```

**Used when:**
- Running `npm run test:e2e`
- CI/CD pipelines
- Automated testing

## Required Variables

### For Astro Application

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_SUPABASE_URL` | Supabase project URL | `https://xxx.supabase.co` |
| `PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGci...` |
| `OPENROUTER_API_KEY` | OpenRouter API key for AI | `sk-or-v1-...` |

⚠️ **Important:** Astro uses `PUBLIC_` prefix for client-side variables!

### For E2E Tests

| Variable | Description | Example |
|----------|-------------|---------|
| `E2E_EMAIL` | Test user email | `test@example.com` |
| `E2E_PASSWORD` | Test user password | `TestPassword123!` |
| `PLAYWRIGHT_TEST_BASE_URL` | Base URL for tests | `http://localhost:4321` |

## Getting Your Supabase Keys

### Cloud Supabase (for `.env.test`)

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Go to **Settings → API**
4. Copy:
   - **Project URL** → `PUBLIC_SUPABASE_URL`
   - **anon/public key** → `PUBLIC_SUPABASE_ANON_KEY`

### Local Supabase (for `.env`)

```bash
# Start local Supabase
supabase start

# You'll see:
# API URL: http://127.0.0.1:54321
# anon key: eyJhbGci...
```

## Common Issues

### ❌ "Failed to fetch" Error

**Cause:** Wrong Supabase URL or key

**Solution:** 
1. Check if URL starts with `https://` (cloud) or `http://127.0.0.1` (local)
2. Verify anon key is complete (very long JWT token)

### ❌ Tests Use Wrong Database

**Cause:** `.env.test` not configured properly

**Solution:**
```bash
# Make sure .env.test has cloud Supabase credentials
PUBLIC_SUPABASE_URL=https://your-project.supabase.co
PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### ❌ "Test user not found" Error

**Cause:** User doesn't exist in cloud Supabase

**Solution:**
1. Go to Supabase Dashboard → Authentication → Users
2. Create a user with credentials from `.env.test`
3. Or let `global-setup.ts` create it automatically (if email confirmation is disabled)

## Best Practices

### ✅ DO

- ✅ Keep `.env` for local development
- ✅ Keep `.env.test` for E2E tests with cloud database
- ✅ Use strong passwords for test users
- ✅ Add both files to `.gitignore`

### ❌ DON'T

- ❌ Don't commit `.env` or `.env.test` to git
- ❌ Don't use production database for tests
- ❌ Don't use `NEXT_PUBLIC_*` prefix (that's for Next.js, not Astro!)
- ❌ Don't share API keys publicly

## Security Notes

### Anon Key vs Service Key

- **Anon Key (Public)** - Safe to use in browser, limited permissions ✅
- **Service Key (Secret)** - Full access, NEVER expose in frontend ❌

### GitHub Actions / CI

For CI/CD, set secrets in GitHub:

```yaml
# .github/workflows/test.yml
env:
  PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
  PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
  E2E_EMAIL: ${{ secrets.E2E_EMAIL }}
  E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}
```

## Testing the Configuration

### Test Local Setup

```bash
npm run dev
# Should connect to local Supabase at http://127.0.0.1:54321
```

### Test E2E Setup

```bash
npm run test:e2e
# Should connect to cloud Supabase from .env.test
```

### Verify Variables Are Loaded

Add to test file temporarily:

```typescript
test('debug env vars', async () => {
  console.log('SUPABASE_URL:', process.env.PUBLIC_SUPABASE_URL);
  console.log('E2E_EMAIL:', process.env.E2E_EMAIL);
});
```

## Questions?

- Check `playwright.config.ts` for loading logic
- Check `e2e/global-setup.ts` for test user creation
- Check `.cursor/rules/playwright.mdc` for test guidelines
