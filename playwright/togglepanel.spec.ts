import { test, expect } from '@playwright/test';

test('ContentPageClient displays movie cards', async ({ page }) => {
  await page.goto('/');

  const movieCards = page.locator('[data-testid="movie-card"]');
  await expect(movieCards.first()).toBeVisible();
});

test('ContentPageClient displays toggle panel and switches modes', async ({ page }) => {
  await page.goto('/');

  const togglePanel = page.locator('[data-testid="toggle-panel"]');
  await expect(togglePanel.first()).toBeVisible();

  const paginationButton = page.locator('[data-testid="paginate-button"]');
  const infiniteButton = page.locator('[data-testid="infinite-button"]');

  // Click pagination
  await paginationButton.click();

  // Wait for UI change
  await page.waitForTimeout(500);
  
  // Expect a smaller number of movies in pagination mode
  const movieCards = page.locator('[data-testid="movie-card"]');
  const paginatedCount = await movieCards.count();
  expect(paginatedCount).toBeLessThanOrEqual(6);

  // Click infinite
  await infiniteButton.click();

  // Wait for UI change
  await page.waitForTimeout(500);

  const infiniteCount = await movieCards.count();
  expect(infiniteCount).toBeGreaterThan(paginatedCount);
});
