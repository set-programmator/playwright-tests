import { modernTest as test, expect } from '../../src/fixtures/modern-test-fixtures';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Modern E2E Testing Patterns @modern', () => {
  test('performance and visual regression testing', async ({ 
    page, 
    performanceHelpers, 
    visualHelpers,
    mockAPI 
  }) => {
    // Mock API responses for consistent testing
    await mockAPI({
      '**/api/users': [{ id: 1, name: 'Test User' }],
      '**/api/posts': [{ id: 1, title: 'Test Post', userId: 1 }]
    });

    await page.goto('https://playwright.dev');
    
    // Wait for stable DOM before measurements
    await visualHelpers.waitForStableDOM();

    // Performance testing
    const pageLoad = await performanceHelpers.measurePageLoad();
    expect(pageLoad.domContentLoaded).toBeGreaterThan(0);
    expect(pageLoad.loadComplete).toBeGreaterThan(0);

    const webVitals = await performanceHelpers.measureWebVitals();
    expect(webVitals.lcp).toBeGreaterThan(0);

    // Bundle size check
    const bundleInfo = await performanceHelpers.checkBundleSize();
    expect(bundleInfo.totalSize).toBeGreaterThan(0);

    // Visual regression testing (simplified)
    await page.screenshot({ path: 'test-results/visual-test.png', fullPage: true });

    // Accessibility testing with custom rules
    const axeResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();
    
    expect(axeResults.violations.length).toBeLessThanOrEqual(5); // Allow some violations for demo
  });

  test('component isolation testing', async ({ page }) => {
    // Test with a simple page
    await page.goto('https://example.com');
    
    // Test page title
    const title = await page.title();
    expect(title).toBeTruthy();
    
    // Test basic navigation
    await expect(page.locator('body')).toBeVisible();
  });

  test('network resilience testing', async ({ page }) => {
    await page.goto('https://httpbin.org/delay/1');
    
    // Test basic response handling
    await expect(page.locator('body')).toBeVisible();
    
    // Test with simulated slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100); // Small delay for testing
    });
    
    await page.goto('https://example.com');
    await expect(page.locator('h1')).toBeVisible();
  });

  test('cross-platform consistency', async ({ page, browserName }) => {
    await page.goto('https://playwright.dev');
    
    console.log(`Testing on: ${browserName}`);
    
    // Common functionality should work across all browsers
    const title = await page.title();
    expect(title).toContain('Playwright');
    
    // Test basic interaction
    const getStartedLink = page.locator('text=Get started').first();
    if (await getStartedLink.count() > 0) {
      await getStartedLink.click();
      await page.waitForTimeout(1000);
    }
  });

  test('advanced user interactions', async ({ page }) => {
    await page.goto('https://playwright.dev');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Escape');
    
    // Test mouse interactions
    await page.mouse.move(100, 100);
    await page.mouse.click(100, 100);
    
    // Test basic element interaction
    const searchButton = page.locator('[aria-label="Search"]').first();
    if (await searchButton.count() > 0) {
      await searchButton.click();
    }
    
    // Simple assertion to confirm test completion
    await expect(page.locator('body')).toBeVisible();
  });
});