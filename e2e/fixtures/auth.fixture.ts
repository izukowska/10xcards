import { test as base } from '@playwright/test';
import { LoginPage, RegisterPage, HomePage } from '../pages';

/**
 * Custom fixtures for authentication tests
 * Provides pre-configured page objects and authenticated contexts
 */

type AuthFixtures = {
  loginPage: LoginPage;
  registerPage: RegisterPage;
  homePage: HomePage;
  authenticatedPage: any;
};

/**
 * Extended test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  /**
   * Login page fixture - automatically initialized
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * Register page fixture - automatically initialized
   */
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  /**
   * Home page fixture - automatically initialized
   */
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  /**
   * Authenticated page fixture - logs in before test
   * Use this fixture when you need to test features that require authentication
   */
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const testEmail = process.env.E2E_EMAIL || process.env.E2E_USERNAME || 'test@example.com';
    const testPassword = process.env.E2E_PASSWORD || 'Abcd1234!';

    console.log(`🔐 Logging in with: ${testEmail}`);

    await loginPage.login(testEmail, testPassword);
    
    try {
      await loginPage.waitForSuccessfulLogin();
      console.log('✅ Successfully authenticated');
    } catch (error) {
      console.error('❌ Authentication failed:', error);
      throw error;
    }

    await use(page);
  },
});

export { expect } from '@playwright/test';
