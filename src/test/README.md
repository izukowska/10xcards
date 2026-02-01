# Test Environment Setup

This directory contains the test infrastructure for the 10xcards project.

## Structure

```
/
├── src/
│   └── test/
│       ├── setup.ts              # Global test setup for Vitest
│       ├── example.test.ts       # Example unit tests
│       └── component.test.tsx    # Example React component tests
├── e2e/
│   ├── fixtures/
│   │   └── auth.fixture.ts       # Page Object Model examples
│   └── example.spec.ts           # Example E2E tests
├── vitest.config.ts              # Vitest configuration
└── playwright.config.ts          # Playwright configuration
```

## Unit Tests (Vitest)

### Running Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### Writing Tests

Unit tests should be placed in `src/**/*.test.ts` or `src/**/*.spec.ts` files.

Example:
```typescript
import { expect, test, vi } from 'vitest';

test('should do something', () => {
  expect(true).toBe(true);
});
```

### Testing React Components

```typescript
import { render, screen } from '@testing-library/react';
import { test, expect } from 'vitest';

test('renders component', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

## E2E Tests (Playwright)

### Running Tests

```bash
# Run all E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in debug mode
npm run test:e2e:debug

# Generate E2E tests with codegen
npm run test:e2e:codegen
```

### Writing Tests

E2E tests should be placed in `e2e/**/*.spec.ts` files.

Example:
```typescript
import { test, expect } from '@playwright/test';

test('should navigate to page', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/10x/i);
});
```

### Using Page Object Model

```typescript
import { test, expect } from './fixtures/auth.fixture';

test('should login', async ({ authPage }) => {
  await authPage.goto();
  await authPage.login('user@example.com', 'password');
});
```

## Best Practices

### Vitest
- Use `vi.fn()` for mocks and `vi.spyOn()` for spies
- Leverage inline snapshots for complex assertions
- Structure tests with Arrange-Act-Assert pattern
- Use descriptive test names
- Keep tests isolated and independent

### Playwright
- Use browser contexts for test isolation
- Implement Page Object Model for maintainability
- Use specific locators (role, text, data-testid)
- Leverage trace viewer for debugging
- Run tests in parallel when possible
- Use visual comparisons with screenshots

## Configuration

### Vitest Configuration
See `vitest.config.ts` for:
- Environment setup (jsdom)
- Coverage thresholds
- Test file patterns
- Path aliases

### Playwright Configuration
See `playwright.config.ts` for:
- Browser configuration (Chromium only)
- Timeout settings
- Screenshot and video capture
- Base URL configuration

## CI/CD Integration

Both test suites are designed to run in CI/CD pipelines:
- Vitest runs quickly and can be used for every commit
- Playwright tests can be run on pull requests
- Coverage reports can be uploaded to services like Codecov

## Troubleshooting

### Vitest Issues
- If imports fail, check path aliases in `vitest.config.ts`
- For DOM-related errors, ensure jsdom environment is configured
- Check `src/test/setup.ts` for global mocks

### Playwright Issues
- Ensure dev server is running (`npm run dev`)
- Check browser installation: `npx playwright install chromium`
- Use `--debug` flag to step through tests
- Check traces in `playwright-report/` directory
