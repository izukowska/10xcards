import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for Home Page (Landing Page)
 * Encapsulates all interactions with the home page
 */
export class HomePage {
  readonly page: Page;
  
  // Locators
  readonly loginButton: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators using data-test-id
    this.loginButton = page.getByTestId('home-login-button');
    this.registerButton = page.getByTestId('home-register-button');
  }

  /**
   * Navigate to the home page
   */
  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Click on login button
   */
  async goToLogin() {
    await this.loginButton.click();
  }

  /**
   * Click on register button
   */
  async goToRegister() {
    await this.registerButton.click();
  }
}
