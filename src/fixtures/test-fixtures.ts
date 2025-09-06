import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { HomePage } from '../pages/home-page';
import { UsersAPI } from '../api/users-api';
import { TestDataManager } from '../utils/test-data';
import { Logger } from '../utils/logger';

type TestFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  usersAPI: UsersAPI;
  testData: TestDataManager;
  logger: Logger;
  authenticatedPage: Page;
};

export const test = base.extend<TestFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  usersAPI: async ({ request }, use) => {
    const usersAPI = new UsersAPI(request, process.env.API_BASE_URL);
    await use(usersAPI);
  },

  testData: async ({}, use) => {
    const testData = TestDataManager.getInstance();
    await use(testData);
  },

  logger: async ({}, use) => {
    const logger = new Logger();
    await use(logger);
  },

  authenticatedPage: async ({ page, loginPage, testData }, use) => {
    const user = testData.getUser('admin');
    await page.goto('/login');
    await loginPage.login(user.username, user.password);
    await use(page);
  }
});

export { expect } from '@playwright/test';