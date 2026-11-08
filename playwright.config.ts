import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'https://localhost:4173',
    ignoreHTTPSErrors: true,
    viewport: { width: 375, height: 667 },
  },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort',
    url: 'https://localhost:4173',
    ignoreHTTPSErrors: true,
    reuseExistingServer: false,
    timeout: 30000,
  },
});
