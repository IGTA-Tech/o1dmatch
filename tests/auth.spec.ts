import { test, expect } from '@playwright/test';

/**
 * O1DMatch Authentication E2E Tests
 * Tests signup, login, password reset, and auth callback flows
 */

test.describe('Authentication - Signup Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup');
  });

  test('signup page loads correctly', async ({ page }) => {
    // Check page title/heading
    await expect(page.getByRole('heading', { name: /create your account/i })).toBeVisible();

    // Check all role options are present (use exact match to avoid duplicates)
    await expect(page.getByText('O-1 Talent', { exact: true })).toBeVisible();
    await expect(page.locator('label').filter({ hasText: 'Employer' }).first()).toBeVisible();
    await expect(page.getByText('Staffing Agency')).toBeVisible();
    await expect(page.getByText('Immigration Attorney')).toBeVisible();

    // Check form fields exist
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/^password$/i)).toBeVisible();
    await expect(page.getByLabel(/confirm password/i)).toBeVisible();

    // Check terms checkbox
    await expect(page.getByRole('checkbox')).toBeVisible();

    // Check submit button
    await expect(page.getByRole('button', { name: /create account/i })).toBeVisible();
  });

  test('shows validation errors for empty form submission', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: /create account/i }).click();

    // Should show validation errors (zod validates on submit)
    // Wait for any error message to appear
    await expect(page.locator('text=/required|invalid|must/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email address/i).fill('notanemail');
    await page.getByLabel(/^password$/i).fill('TestPassword123!');
    await page.getByLabel(/confirm password/i).fill('TestPassword123!');
    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /create account/i }).click();

    // Should show email validation error - look for red text or error styling
    await page.waitForTimeout(1000);
    const hasError = await page.locator('.text-red-600, .text-red-500, p.text-sm.text-red-600').first().isVisible();
    expect(hasError).toBeTruthy();
  });

  test('shows validation error for password mismatch', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email address/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('TestPassword123!');
    await page.getByLabel(/confirm password/i).fill('DifferentPassword123!');
    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /create account/i }).click();

    // Should show password mismatch error
    await expect(page.locator('text=/match|same/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows validation error for short password', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email address/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('short');
    await page.getByLabel(/confirm password/i).fill('short');
    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /create account/i }).click();

    // Should show password length error
    await expect(page.locator('text=/characters|length|short/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows error when terms not accepted', async ({ page }) => {
    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email address/i).fill('test@example.com');
    await page.getByLabel(/^password$/i).fill('TestPassword123!');
    await page.getByLabel(/confirm password/i).fill('TestPassword123!');
    // Don't check the terms checkbox

    await page.getByRole('button', { name: /create account/i }).click();

    // Should show terms error
    await expect(page.locator('text=/terms|agree|accept/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('role selection works correctly', async ({ page }) => {
    // Default should be talent
    const talentRadio = page.locator('input[value="talent"]');
    await expect(talentRadio).toBeChecked();

    // Click employer
    await page.getByText('Employer').click();
    const employerRadio = page.locator('input[value="employer"]');
    await expect(employerRadio).toBeChecked();
    await expect(talentRadio).not.toBeChecked();

    // Click agency
    await page.getByText('Staffing Agency').click();
    const agencyRadio = page.locator('input[value="agency"]');
    await expect(agencyRadio).toBeChecked();

    // Click lawyer
    await page.getByText('Immigration Attorney').click();
    const lawyerRadio = page.locator('input[value="lawyer"]');
    await expect(lawyerRadio).toBeChecked();
  });

  test('successful signup shows confirmation message', async ({ page }) => {
    // Generate unique email to avoid conflicts
    const uniqueEmail = `test.${Date.now()}@example.com`;

    await page.getByLabel(/full name/i).fill('Test User');
    await page.getByLabel(/email address/i).fill(uniqueEmail);
    await page.getByLabel(/^password$/i).fill('TestPassword123!');
    await page.getByLabel(/confirm password/i).fill('TestPassword123!');
    await page.getByRole('checkbox').check();

    await page.getByRole('button', { name: /create account/i }).click();

    // Should show success message about checking email
    // Note: This might fail if Supabase is not properly configured
    await expect(page.locator('text=/check your email|confirmation|verify/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('link to login page works', async ({ page }) => {
    await page.getByRole('link', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Authentication - Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('login page loads correctly', async ({ page }) => {
    // Check heading
    await expect(page.getByRole('heading', { name: /sign in|log in|welcome/i })).toBeVisible();

    // Check form fields
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();

    // Check submit button
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('shows error for empty submission', async ({ page }) => {
    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Should show validation errors
    await expect(page.locator('text=/required|invalid|email/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('nonexistent@example.com');
    await page.getByLabel(/password/i).fill('WrongPassword123!');

    await page.getByRole('button', { name: /sign in|log in/i }).click();

    // Should show authentication error
    await expect(page.locator('text=/invalid|incorrect|error|not found/i').first()).toBeVisible({ timeout: 10000 });
  });

  test('forgot password link works', async ({ page }) => {
    const forgotLink = page.getByRole('link', { name: /forgot.*password/i });
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await expect(page).toHaveURL(/\/forgot-password/);
    }
  });

  test('link to signup page works', async ({ page }) => {
    const signupLink = page.getByRole('link', { name: /sign up|create account|register/i });
    if (await signupLink.isVisible()) {
      await signupLink.click();
      await expect(page).toHaveURL(/\/signup/);
    }
  });
});

test.describe('Authentication - Forgot Password Flow', () => {
  test('forgot password page loads', async ({ page }) => {
    await page.goto('/forgot-password');

    // Check the page loaded
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test('shows validation error for invalid email', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel(/email/i).fill('notanemail');
    await page.getByRole('button', { name: /reset|send|submit/i }).click();

    await expect(page.locator('text=/invalid.*email|email.*invalid/i').first()).toBeVisible({ timeout: 5000 });
  });

  test('shows success message for valid email', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /reset|send|submit/i }).click();

    // Should show a success message about checking email
    await expect(page.locator('text=/check.*email|sent|reset link/i').first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('Authentication - Protected Routes', () => {
  test('dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('talent dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/talent');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('employer dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/dashboard/employer');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });

  test('admin page redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/admin');

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});
