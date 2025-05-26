// playwright.config.ts
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright', // <— point here
  use: {
    baseURL: 'http://localhost:3000',
  },
});