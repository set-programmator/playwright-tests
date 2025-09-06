import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Login Tests @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login with valid credentials', async ({ loginPage, homePage, testData }) => {
    const user = testData.getUser('default');
    
    await loginPage.login(user.username, user.password);
    
    expect(await homePage.isUserLoggedIn()).toBe(true);
    expect(await homePage.getWelcomeMessage()).toContain('Welcome');
  });

  test('should show error with invalid credentials', async ({ loginPage, testData }) => {
    const user = testData.getUser('invalid');
    
    await loginPage.login(user.username, user.password);
    
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should navigate to forgot password', async ({ loginPage, page }) => {
    await loginPage.clickForgotPassword();
    
    expect(page.url()).toContain('/forgot-password');
  });
});