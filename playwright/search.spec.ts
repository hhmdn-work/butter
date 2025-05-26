import { test, expect } from '@playwright/test';

test('Search page shows results for query "Red"', async ({ page }) => {
  await page.goto('/search?query=Red');

  const movieCards = page.locator('[data-testid="movie-card"]');

  // Wait for at least one result to appear
  await expect(movieCards.first()).toBeVisible();

  // Check there are multiple results
  const count = await movieCards.count();
  expect(count).toBeGreaterThan(0);
});

test('Search page shows no results for query "abcdefghij"', async ({ page }) => {
  await page.goto('/search?query=abcdefghij');

  const movieCards = page.locator('[data-testid="movie-card"]');

  // Expect zero movie cards
  await expect(movieCards).toHaveCount(0);

  // Optional: check for fallback message
  await expect(page.locator('text=No results found')).toBeVisible();
});
