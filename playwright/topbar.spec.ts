import { test, expect } from '@playwright/test';

test.describe('Topbar authentication UI', () => {
  test('shows login option when not logged in', async ({ page }) => {
    await page.goto('/');

    // Wait for UI change
    await page.waitForTimeout(500);

    // Click the dropdown button
    const dropdownTrigger = page.getByTestId('user-dropdown-option');
    await dropdownTrigger.click();

    // Wait for UI change
    await page.waitForTimeout(500);

    await expect(page.getByTestId('login-option')).toBeVisible();
    await expect(page.getByTestId('watchlist-option')).toHaveCount(0);
  })
});