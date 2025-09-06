import { test, expect } from '../../src/fixtures/test-fixtures';
import { injectAxe, checkA11y } from '@axe-core/playwright';

test.describe('User Journey E2E Tests @e2e', () => {
  test('complete user workflow with accessibility check', async ({ 
    page, 
    loginPage, 
    homePage, 
    testData 
  }) => {
    const user = testData.getUser('default');
    
    // Navigate to login
    await page.goto('/login');
    
    // Inject axe for accessibility testing
    await injectAxe(page);
    
    // Check accessibility on login page
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    });
    
    // Login
    await loginPage.login(user.username, user.password);
    
    // Verify successful login
    expect(await homePage.isUserLoggedIn()).toBe(true);
    
    // Navigate through different sections
    await homePage.navigateToSection('profile');
    await page.waitForURL('**/profile');
    
    await homePage.navigateToSection('settings');
    await page.waitForURL('**/settings');
    
    // Perform search
    await homePage.search('test query');
    
    // Check accessibility on main page
    await checkA11y(page);
    
    // Logout
    await homePage.logout();
    
    // Verify logout
    expect(page.url()).toContain('/login');
  });

  test('mobile responsive test', async ({ page, loginPage, testData }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    const user = testData.getUser('default');
    
    await page.goto('/login');
    await loginPage.login(user.username, user.password);
    
    // Take mobile screenshot
    await page.screenshot({ path: 'reports/screenshots/mobile-login.png' });
    
    // Verify mobile-specific elements
    const mobileMenu = page.locator('[data-testid="mobile-menu"]');
    expect(await mobileMenu.isVisible()).toBe(true);
  });
});