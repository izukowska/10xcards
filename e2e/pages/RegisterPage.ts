import { type Page, type Locator } from '@playwright/test';

/**
 * Page Object Model for Register Page
 * Encapsulates all interactions with the registration page
 */
export class RegisterPage {
  readonly page: Page;
  
  // Locators
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorAlert: Locator;
  readonly errorMessage: Locator;
  readonly emailError: Locator;
  readonly passwordError: Locator;
  readonly confirmPasswordError: Locator;
  readonly loginLink: Locator;
  readonly loadingSpinner: Locator;
  readonly successMessage: Locator;
  readonly successIcon: Locator;
  readonly successLoginLink: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Initialize locators using data-test-id
    this.emailInput = page.getByTestId('register-email-input');
    this.passwordInput = page.getByTestId('register-password-input');
    this.confirmPasswordInput = page.getByTestId('register-confirm-password-input');
    this.submitButton = page.getByTestId('register-submit-button');
    this.errorAlert = page.getByTestId('register-error-alert');
    this.errorMessage = page.getByTestId('register-error-message');
    this.emailError = page.getByTestId('register-email-error');
    this.passwordError = page.getByTestId('register-password-error');
    this.confirmPasswordError = page.getByTestId('register-confirm-password-error');
    this.loginLink = page.getByTestId('register-login-link');
    this.loadingSpinner = page.getByTestId('register-loading-spinner');
    this.successMessage = page.getByTestId('register-success-message');
    this.successIcon = page.getByTestId('register-success-icon');
    this.successLoginLink = page.getByTestId('register-success-login-link');
  }

  /**
   * Navigate to the register page
   */
  async goto() {
    await this.page.goto('/register');
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
   * Fill in the confirm password field
   */
  async fillConfirmPassword(password: string) {
    await this.confirmPasswordInput.fill(password);
  }

  /**
   * Submit the registration form
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Complete registration flow
   */
  async register(email: string, password: string, confirmPassword?: string) {
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.fillConfirmPassword(confirmPassword || password);
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
   * Check if success message is visible
   */
  async isSuccessVisible(): Promise<boolean> {
    return await this.successMessage.isVisible();
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
   * Click on login link
   */
  async goToLogin() {
    await this.loginLink.click();
  }

  /**
   * Click on success login link (after successful registration)
   */
  async goToLoginFromSuccess() {
    await this.successLoginLink.click();
  }
}
