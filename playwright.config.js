import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '.env.test') });

export default defineConfig({
  testDir: './tests/specs',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
    navigationTimeout: 30_000,
  },
  projects: [
    {
      name: 'setup',
      testDir: './tests',
      testMatch: /auth\.setup\.js/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/admin.json',
      },
      dependencies: ['setup'],
      // Exclude public-only specs (they require no auth / test the login page itself)
      testIgnore: /auth\.spec|landing|public-views|responsive/,
    },
    {
      name: 'terapeuta',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/terapeuta.json',
      },
      dependencies: ['setup'],
      testMatch: /sesion-terapeutica|cronograma-terapeutico|asistencia-terapeutica|dashboard/,
    },
    {
      name: 'pedagogo',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'tests/.auth/pedagogo.json',
      },
      dependencies: ['setup'],
      testMatch: /sesion-pedagogica|cronograma-pedagogico|asistencia-pedagogica/,
    },
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /auth\.spec|landing|public-views|responsive/,
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
