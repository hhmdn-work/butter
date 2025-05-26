import { test, expect } from '@playwright/test';

test('infinite scroll loads more movie cards', async ({ page }) => {
  await page.goto('/');

  const movieCards = page.locator('[data-testid="movie-card"]');
  let previousCount = 0;

  for (let i = 0; i < 10; i++) {
    // Scroll near the bottom of the page
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Wait for new content to load
    await page.waitForTimeout(1500); // adjust if your API is slow

    const currentCount = await movieCards.count();
    console.log(`Iteration ${i + 1}: found ${currentCount} cards`);

    // Break if no new cards loaded
    if (currentCount === previousCount) {
      console.log('No more cards loaded — stopping.');
      break;
    }

    expect(currentCount).toBeGreaterThan(previousCount);
    previousCount = currentCount;
  }

  // Final assertion: ensure at least more than initial page
  expect(previousCount).toBeGreaterThan(6);
});
