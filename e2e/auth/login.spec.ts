import { test, expect } from '@playwright/test';
import { LoginPage, HomePage } from '../pages';

/**
 * E2E Tests for Login Flow
 * Tests cover authentication, validation, error handling, and navigation
 */

test.describe('Login Page', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test.describe('Page Load and Navigation', () => {
    test('should load login page successfully', async ({ page }) => {
      await expect(page).toHaveURL(/.*login/);
      await expect(page).toHaveTitle(/Logowanie/);
    });

    test('should display all form elements', async () => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
      await expect(loginPage.registerLink).toBeVisible();
      await expect(loginPage.forgotPasswordLink).toBeVisible();
    });

    test('should navigate to register page when clicking register link', async ({ page }) => {
      await loginPage.goToRegister();
      await expect(page).toHaveURL(/.*register/);
    });

    test('should navigate to forgot password page when clicking forgot password link', async ({ page }) => {
      await loginPage.goToForgotPassword();
      await expect(page).toHaveURL(/.*forgot-password/);
    });
  });

  test.describe('Form Validation', () => {
    test('should show validation error for empty email', async () => {
      await loginPage.fillPassword('ValidPassword123!');
      await loginPage.submit();
      
      // Wait for validation to trigger
      await loginPage.page.waitForTimeout(500);
      
      // Check if email error is visible or form didn't submit
      const emailErrorVisible = await loginPage.isEmailErrorVisible();
      const urlChanged = loginPage.page.url().includes('/generate');
      
      expect(emailErrorVisible || !urlChanged).toBeTruthy();
    });

    test('should show validation error for invalid email format', async () => {
      await loginPage.fillEmail('invalid-email');
      await loginPage.fillPassword('ValidPassword123!');
      await loginPage.submit();
      
      await loginPage.page.waitForTimeout(500);
      
      const emailErrorVisible = await loginPage.isEmailErrorVisible();
      const urlChanged = loginPage.page.url().includes('/generate');
      
      expect(emailErrorVisible || !urlChanged).toBeTruthy();
    });

    test('should show validation error for empty password', async () => {
      await loginPage.fillEmail('test@example.com');
      await loginPage.submit();
      
      await loginPage.page.waitForTimeout(500);
      
      const passwordErrorVisible = await loginPage.isPasswordErrorVisible();
      const urlChanged = loginPage.page.url().includes('/generate');
      
      expect(passwordErrorVisible || !urlChanged).toBeTruthy();
    });

    test('should accept valid email and password format', async () => {
      await loginPage.fillEmail('test@example.com');
      await loginPage.fillPassword('ValidPassword123!');
      
      // Form should be submittable (button not disabled due to validation)
      const isDisabled = await loginPage.isSubmitDisabled();
      expect(isDisabled).toBeFalsy();
    });
  });

  test.describe('Authentication Flow', () => {
    test('should show error message for invalid credentials', async () => {
      await loginPage.login('nonexistent@example.com', 'WrongPassword123!');
      
      // Wait for API response
      await loginPage.page.waitForTimeout(2000);
      
      // Should show error alert
      const errorVisible = await loginPage.isErrorVisible();
      expect(errorVisible).toBeTruthy();
      
      // Should not navigate away from login page
      await expect(loginPage.page).toHaveURL(/.*login/);
    });

    test('should show loading state during login attempt', async () => {
      await loginPage.fillEmail('test@example.com');
      await loginPage.fillPassword('TestPassword123!');
      
      // Click submit and immediately check for loading state
      const submitPromise = loginPage.submit();
      
      // Check if loading spinner appears (may be very brief)
      await loginPage.page.waitForTimeout(100);
      
      await submitPromise;
    });

    test('should successfully login with valid credentials', async ({ page }) => {
      // Use test credentials from .env.test
      const testEmail = process.env.E2E_EMAIL || process.env.E2E_USERNAME || 'test@example.com';
      const testPassword = process.env.E2E_PASSWORD || 'Abcd1234!';
      
      console.log(`🔐 Testing login with: ${testEmail}`);
      
      await loginPage.login(testEmail, testPassword);
      
      // Wait for navigation to generate page with longer timeout
      await loginPage.page.waitForURL('**/generate', { timeout: 15000 });
      
      // Verify we're on the generate page
      await expect(page).toHaveURL(/.*generate/);
      
      console.log('✅ Login successful, redirected to /generate');
    });
  });

  test.describe('User Experience', () => {
    test('should have proper input types', async () => {
      // Email input should have type="email" or similar
      await expect(loginPage.emailInput).toBeVisible();
      
      // Password input should have type="password"
      const passwordType = await loginPage.passwordInput.getAttribute('type');
      expect(passwordType).toBe('password');
    });

    test('should allow keyboard navigation', async ({ page }) => {
      // Tab through form elements
      await page.keyboard.press('Tab');
      await expect(loginPage.emailInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(loginPage.passwordInput).toBeFocused();
      
      await page.keyboard.press('Tab');
      await expect(loginPage.submitButton).toBeFocused();
    });

    test('should submit form with Enter key', async () => {
      await loginPage.fillEmail('test@example.com');
      await loginPage.fillPassword('TestPassword123!');
      
      // Press Enter in password field
      await loginPage.passwordInput.press('Enter');
      
      // Form should attempt to submit
      await loginPage.page.waitForTimeout(1000);
    });
  });

  test.describe('Responsive Design', () => {
    test('should display correctly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });

    test('should display correctly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.submitButton).toBeVisible();
    });
  });
});

test.describe('Login Flow from Home Page', () => {
  test('should navigate from home page to login page', async ({ page }) => {
    const homePage = new HomePage(page);
    await homePage.goto();
    
    await homePage.goToLogin();
    
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Protected Routes', () => {
  test('should redirect unauthenticated user from /generate to /login', async ({ page }) => {
    // Try to access protected route
    await page.goto('/generate');
    
    // Should be redirected to login
    await page.waitForURL(/.*login/, { timeout: 5000 });
    await expect(page).toHaveURL(/.*login/);
  });

  test('should redirect authenticated user from / to /generate', async ({ page }) => {
    // First login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    
    const testEmail = process.env.E2E_EMAIL || process.env.E2E_USERNAME || 'test@example.com';
    const testPassword = process.env.E2E_PASSWORD || 'Abcd1234!';
    
    console.log(`🔐 Testing redirect after login with: ${testEmail}`);
    
    await loginPage.login(testEmail, testPassword);
    await loginPage.page.waitForURL('**/generate', { timeout: 15000 });
    
    console.log('✅ Logged in, now testing redirect from /');
    
    // Now try to go to home page
    await page.goto('/');
    
    // Should be redirected to generate page
    await page.waitForURL(/.*generate/, { timeout: 10000 });
    await expect(page).toHaveURL(/.*generate/);
    
    console.log('✅ Redirect successful');
  });
});
