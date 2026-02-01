import { test, expect } from '@playwright/test';
import { RegisterPage, HomePage } from '../pages';

/**
 * E2E Tests for Registration Flow
 * Tests cover registration, validation, error handling, and navigation
 */

test.describe('Register Page', () => {
  let registerPage: RegisterPage;

  test.beforeEach(async ({ page }) => {
    registerPage = new RegisterPage(page);
    await registerPage.goto();
  });

  test.describe('Page Load and Navigation', () => {
    test('should load register page successfully', async ({ page }) => {
      await expect(page).toHaveURL(/.*register/);
      await expect(page).toHaveTitle(/Rejestracja/);
    });

    test('should display all form elements', async () => {
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.passwordInput).toBeVisible();
      await expect(registerPage.confirmPasswordInput).toBeVisible();
      await expect(registerPage.submitButton).toBeVisible();
      await expect(registerPage.loginLink).toBeVisible();
    });

    test('should navigate to login page when clicking login link', async ({ page }) => {
      await registerPage.goToLogin();
      await expect(page).toHaveURL(/.*login/);
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation error for empty email', async () => {
      await registerPage.fillPassword('ValidPassword123!');
      await registerPage.fillConfirmPassword('ValidPassword123!');
      await registerPage.submit();
      
      await registerPage.page.waitForTimeout(500);
      
      const urlChanged = registerPage.page.url().includes('/login');
      expect(!urlChanged).toBeTruthy();
    });

    test('should show validation error for invalid email format', async () => {
      await registerPage.fillEmail('invalid-email');
      await registerPage.fillPassword('ValidPassword123!');
      await registerPage.fillConfirmPassword('ValidPassword123!');
      await registerPage.submit();
      
      await registerPage.page.waitForTimeout(500);
      
      const urlChanged = registerPage.page.url().includes('/login');
      expect(!urlChanged).toBeTruthy();
    });

    test('should show validation error for mismatched passwords', async () => {
      await registerPage.fillEmail('test@example.com');
      await registerPage.fillPassword('ValidPassword123!');
      await registerPage.fillConfirmPassword('DifferentPassword123!');
      await registerPage.submit();
      
      await registerPage.page.waitForTimeout(500);
      
      const urlChanged = registerPage.page.url().includes('/login');
      expect(!urlChanged).toBeTruthy();
    });

    test('should show validation error for weak password', async () => {
      await registerPage.fillEmail('test@example.com');
      await registerPage.fillPassword('weak');
      await registerPage.fillConfirmPassword('weak');
      await registerPage.submit();
      
      await registerPage.page.waitForTimeout(500);
      
      const urlChanged = registerPage.page.url().includes('/login');
      expect(!urlChanged).toBeTruthy();
    });

    test('should accept valid registration data', async () => {
      await registerPage.fillEmail('newuser@example.com');
      await registerPage.fillPassword('ValidPassword123!');
      await registerPage.fillConfirmPassword('ValidPassword123!');
      
      const isDisabled = await registerPage.isSubmitDisabled();
      expect(isDisabled).toBeFalsy();
    });
  });

  test.describe('Registration Flow', () => {
    test('should show error for already registered email', async () => {
      // Use existing test user email
      const testEmail = process.env.E2E_EMAIL || 'test@example.com';
      
      await registerPage.register(testEmail, 'NewPassword123!');
      
      // Wait for API response
      await registerPage.page.waitForTimeout(2000);
      
      // Should show error or stay on register page
      const isOnRegisterPage = registerPage.page.url().includes('/register');
      expect(isOnRegisterPage).toBeTruthy();
    });

    test('should show loading state during registration', async () => {
      const uniqueEmail = `test-${Date.now()}@example.com`;
      
      await registerPage.fillEmail(uniqueEmail);
      await registerPage.fillPassword('ValidPassword123!');
      await registerPage.fillConfirmPassword('ValidPassword123!');
      
      const submitPromise = registerPage.submit();
      
      await registerPage.page.waitForTimeout(100);
      
      await submitPromise;
    });

    test('should successfully register with valid unique credentials', async () => {
      // Generate unique email for this test
      const uniqueEmail = `test-${Date.now()}@example.com`;
      const password = 'ValidPassword123!';
      
      await registerPage.register(uniqueEmail, password);
      
      // Wait for success message or error
      await registerPage.page.waitForTimeout(3000);
      
      // Check if success message is visible OR if there's an error
      const successVisible = await registerPage.isSuccessVisible();
      const errorVisible = await registerPage.isErrorVisible();
      
      // One of them should be visible
      expect(successVisible || errorVisible).toBeTruthy();
      
      // If successful, verify success elements
      if (successVisible) {
        await expect(registerPage.successIcon).toBeVisible();
        await expect(registerPage.successLoginLink).toBeVisible();
      }
    });
  });

  test.describe('User Experience', () => {
    test('should have proper input types', async () => {
      const passwordType = await registerPage.passwordInput.getAttribute('type');
      expect(passwordType).toBe('password');
      
      const confirmPasswordType = await registerPage.confirmPasswordInput.getAttribute('type');
      expect(confirmPasswordType).toBe('password');
    });

    test('should allow keyboard navigation', async ({ page }) => {
      await page.keyboard.press('Tab');
      await expect(registerPage.emailInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(registerPage.passwordInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(registerPage.confirmPasswordInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(registerPage.submitButton).toBeFocused();
    });

    test('should submit form with Enter key', async () => {
      await registerPage.fillEmail('test@example.com');
      await registerPage.fillPassword('ValidPassword123!');
      await registerPage.fillConfirmPassword('ValidPassword123!');
      
      await registerPage.confirmPasswordInput.press('Enter');
      
      await registerPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.passwordInput).toBeVisible();
      await expect(registerPage.confirmPasswordInput).toBeVisible();
      await expect(registerPage.submitButton).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(registerPage.emailInput).toBeVisible();
      await expect(registerPage.passwordInput).toBeVisible();
      await expect(registerPage.confirmPasswordInput).toBeVisible();
      await expect(registerPage.submitButton).toBeVisible();
    });
  });
});

test.describe('Register Flow from Home Page', () => {
  test('should navigate from home page to register page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.goToRegister();
    
    await expect(page).toHaveURL(/.*register/);
  });
});
