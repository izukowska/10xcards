import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for Login Page
 * Encapsulates all interactions with the login page
 */
export class LoginPage {
  readonly page: Page;
  
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators using data-test-id
    this.emailInput = page.getByTestId('login-email-input');
    this.passwordInput = page.getByTestId('login-password-input');
    this.submitButton = page.getByTestId('login-submit-button');
    this.errorAlert = page.getByTestId('login-error-alert');
    this.errorMessage = page.getByTestId('login-error-message');
    this.emailError = page.getByTestId('login-email-error');
    this.passwordError = page.getByTestId('login-password-error');
    this.registerLink = page.getByTestId('login-register-link');
    this.forgotPasswordLink = page.getByTestId('login-forgot-password-link');
    this.loadingSpinner = page.getByTestId('login-loading-spinner');
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    await this.page.goto('/login');
    await this.page.waitForLoadState('domcontentloaded');
    // Wait for React to hydrate - wait for any input to appear
    await this.page.waitForSelector('input[type="password"]', { timeout: 15000 });
    // Additional wait for network to settle
    await this.page.waitForLoadState('networkidle');
  }

  /**
   * Fill in the email field
   */
  async fillEmail(email: string) {
    await this.emailInput.fill(email);
  }

  /**
   * Fill in the password field
   */
  async fillPassword(password: string) {
    await this.passwordInput.fill(password);
  }

  /**
   * Submit the login form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete login flow with email and password
   */
  async login(email: string, password: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }

  /**
   * Check if error alert is visible
   */
  async isErrorVisible(): Promise<boolean> {
    return await this.errorAlert.isVisible();
  }

  /**
   * Get error message text
   */
  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() || '';
  }

  /**
   * Check if email validation error is visible
   */
  async isEmailErrorVisible(): Promise<boolean> {
    try {
      return await this.emailError.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if password validation error is visible
   */
  async isPasswordErrorVisible(): Promise<boolean> {
    try {
      return await this.passwordError.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Check if submit button is disabled
   */
  async isSubmitDisabled(): Promise<boolean> {
    return await this.submitButton.isDisabled();
  }

  /**
   * Check if loading spinner is visible
   */
  async isLoading(): Promise<boolean> {
    try {
      return await this.loadingSpinner.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Click on register link
   */
  async goToRegister() {
    await this.registerLink.click();
  }

  /**
   * Click on forgot password link
   */
  async goToForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Wait for navigation to complete after successful login
   */
  async waitForSuccessfulLogin() {
    await this.page.waitForURL('**/generate', { timeout: 10000 });
  }
}
