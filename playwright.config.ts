import { defineConfig, devices } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  timeout: 60000, // Global test timeout
  expect: {
    timeout: 10000, // Assertion timeout
    toHaveScreenshot: { threshold: 0.2 }, // Visual comparison threshold
  },
  reporter: [
    ['html'],
    ['allure-playwright'],
    ['junit', { outputFile: 'reports/junit-results.xml' }],
    ['json', { outputFile: 'reports/test-results.json' }]
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 30000,
    navigationTimeout: 30000
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    {
      name: 'mobile',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] }
    },
    {
      name: 'api',
      testDir: './tests/api',
      use: {
        baseURL: process.env.API_BASE_URL || 'https://jsonplaceholder.typicode.com'
      }
    }
  ],
  outputDir: 'test-results/',
  globalSetup: require.resolve('./src/config/global-setup.ts'),
  globalTeardown: require.resolve('./src/config/global-teardown.ts')
});