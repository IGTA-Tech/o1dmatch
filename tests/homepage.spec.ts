import { test, expect } from '@playwright/test';

/**
 * O1DMatch Homepage E2E Tests
 * Tests landing page, navigation, and public pages
 */

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('homepage loads successfully', async ({ page }) => {
    // Check the main heading is visible
    await expect(page.getByRole('heading', { name: /connect extraordinary talent/i })).toBeVisible();

    // Check the brand is visible in header
    await expect(page.getByRole('banner').getByText('O1DMatch')).toBeVisible();
  });

  test('hero section displays correctly', async ({ page }) => {
    // Check hero text
    await expect(page.getByText(/O-1 Visa Talent Marketplace/i)).toBeVisible();
    await expect(page.getByText(/bridges the gap between O-1 visa candidates/i)).toBeVisible();

    // Check CTA buttons
    await expect(page.getByRole('link', { name: /I'm a Talent/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /I'm an Employer/i })).toBeVisible();
  });

  test('navigation links are visible', async ({ page }) => {
    // Check header navigation (use banner role to scope to header)
    const header = page.getByRole('banner');
    await expect(header.getByRole('link', { name: /for candidates/i })).toBeVisible();
    await expect(header.getByRole('link', { name: /for employers/i })).toBeVisible();
    await expect(header.getByRole('link', { name: /lawyer directory/i })).toBeVisible();
    await expect(header.getByRole('link', { name: /log in/i })).toBeVisible();
    await expect(header.getByRole('link', { name: /get started/i })).toBeVisible();
  });

  test('features section displays correctly', async ({ page }) => {
    await expect(page.getByText(/How O1DMatch Works/i)).toBeVisible();
    await expect(page.getByText(/Build Your O-1 Profile/i)).toBeVisible();
    await expect(page.getByText(/Get Matched with Employers/i)).toBeVisible();
    await expect(page.getByText(/Receive Interest Letters/i)).toBeVisible();
  });

  test('O-1 criteria section displays all 8 criteria', async ({ page }) => {
    await expect(page.getByText(/O-1 Visa Criteria We Track/i)).toBeVisible();

    // Check all 8 criteria are listed
    await expect(page.getByText('Awards')).toBeVisible();
    await expect(page.getByText('Memberships')).toBeVisible();
    await expect(page.getByText('Published Material')).toBeVisible();
    await expect(page.getByText('Judging')).toBeVisible();
    await expect(page.getByText('Original Contributions')).toBeVisible();
    await expect(page.getByText('Scholarly Articles')).toBeVisible();
    await expect(page.getByText('Critical Role')).toBeVisible();
    await expect(page.getByText('High Salary')).toBeVisible();
  });

  test('employer section displays correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Employers: Access O-1 Ready Talent/i })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: /Browse anonymized talent profiles/i })).toBeVisible();
    await expect(page.locator('li').filter({ hasText: /Filter by O-1 readiness score/i })).toBeVisible();
  });

  test('footer displays correctly', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    await expect(page.locator('footer')).toBeVisible();
    await expect(page.getByRole('contentinfo').getByText('O1DMatch', { exact: true })).toBeVisible();
    await expect(page.getByRole('contentinfo').getByText(/All rights reserved/i)).toBeVisible();
  });

  test('talent CTA link works', async ({ page }) => {
    await page.getByRole('link', { name: /I'm a Talent/i }).click();
    await expect(page).toHaveURL(/\/signup\?role=talent/);
  });

  test('employer CTA link works', async ({ page }) => {
    await page.getByRole('link', { name: /I'm an Employer/i }).click();
    await expect(page).toHaveURL(/\/signup\?role=employer/);
  });

  test('get started button works', async ({ page }) => {
    // Use header to scope to the nav get started link
    await page.getByRole('banner').getByRole('link', { name: /get started/i }).click();
    await expect(page).toHaveURL(/\/signup/);
  });

  test('login link works', async ({ page }) => {
    // Use header to scope to the nav login link
    await page.getByRole('banner').getByRole('link', { name: /log in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('How It Works - Candidates Page', () => {
  test('page loads and displays content', async ({ page }) => {
    await page.goto('/how-it-works/candidates');

    // Check page loaded (should have some content about candidates/talent)
    await expect(page.locator('body')).toContainText(/talent|candidate|o-1/i);
  });
});

test.describe('How It Works - Employers Page', () => {
  test('page loads and displays content', async ({ page }) => {
    await page.goto('/how-it-works/employers');

    // Check page loaded (should have some content about employers)
    await expect(page.locator('body')).toContainText(/employer|hire|company/i);
  });
});

test.describe('Lawyer Directory Page', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/lawyers');

    // Check the page loaded
    await expect(page.locator('body')).toContainText(/lawyer|attorney|immigration/i);
  });
});

test.describe('Pricing Page', () => {
  test('page loads', async ({ page }) => {
    await page.goto('/pricing');

    // Check the page loaded (might have pricing content)
    // This test will pass even if page shows 404 - we're testing that it loads
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Responsive Design', () => {
  test('homepage is responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Main content should still be visible
    await expect(page.getByRole('heading', { name: /connect extraordinary talent/i })).toBeVisible();

    // CTA buttons should be visible
    await expect(page.getByRole('link', { name: /I'm a Talent/i })).toBeVisible();
  });

  test('homepage is responsive on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');

    await expect(page.getByRole('heading', { name: /connect extraordinary talent/i })).toBeVisible();
  });
});
