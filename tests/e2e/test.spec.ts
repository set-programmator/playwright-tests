import { test, expect } from '../../src/fixtures/test-fixtures';
import { AxeBuilder } from '@axe-core/playwright';

test.describe('Sauce Labs Homepage @e2e', () => {
  test('page loads and has correct title', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Sauce Labs/i);
  });

  test('main navigation is visible', async ({ page }) => {
    await page.goto('/');

    const nav = page.getByRole('navigation').first();
    await expect(nav).toBeVisible();
  });

  test('hero section has a call-to-action link', async ({ page }) => {
    await page.goto('/');

    // At least one prominent CTA link should be present in the hero area
    const ctaLink = page.getByRole('link', { name: /get started|free trial|sign up|start free/i }).first();
    await expect(ctaLink).toBeVisible();
  });

  test('page has no critical accessibility violations', async ({ page }) => {
    await page.goto('/');

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const criticalViolations = results.violations.filter((v) => v.impact === 'critical');
    expect(criticalViolations).toHaveLength(0);
  });

  test('page responds within acceptable time', async ({ page }) => {
    const start = Date.now();
    await page.goto('/');
    await page.waitForLoadState('load');
    const elapsed = Date.now() - start;

    expect(elapsed).toBeLessThan(10_000);
  });
});
