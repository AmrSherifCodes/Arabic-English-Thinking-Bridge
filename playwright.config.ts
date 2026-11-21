import { defineConfig } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  testDir: path.resolve(__dirname, 'e2e'),
  testMatch: '**/*.spec.ts',
  timeout: 45000,
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL: 'https://localhost:4173',
    ignoreHTTPSErrors: true,
    viewport: { width: 375, height: 667 },
  },
  webServer: {
    command: 'npx vite preview --port 4173',
    url: 'https://localhost:4173',
    ignoreHTTPSErrors: true,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
