import { Page, test as base } from '@playwright/test';
import { PerformanceHelpers } from '../utils/performance-helpers';

// Visual regression testing utilities
export class VisualTestHelpers {
  constructor(private page: Page) {}

  async compareScreenshot(
    name: string,
    options?: {
      fullPage?: boolean;
      mask?: string[];
      threshold?: number;
      animations?: 'disabled' | 'allow';
    }
  ) {
    const maskLocators = options?.mask?.map(selector => this.page.locator(selector)) || [];
    
    return await this.page.screenshot({
      fullPage: options?.fullPage ?? false,
      mask: maskLocators,
      animations: options?.animations ?? 'disabled',
      // Modern Playwright visual comparison
      path: `test-results/screenshots/${name}-actual.png`,
    });
  }

  async waitForStableDOM(timeout: number = 5000): Promise<void> {
    // Simplified DOM stability check  
    await this.page.waitForTimeout(timeout < 1000 ? timeout : 1000);
    await this.page.waitForLoadState('networkidle');
  }

  async disableAnimations(): Promise<void> {
    await this.page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  }
}

// Enhanced fixture with modern testing utilities
type ModernTestFixtures = {
  performanceHelpers: PerformanceHelpers;
  visualHelpers: VisualTestHelpers;
  mockAPI: (responses: Record<string, unknown>) => Promise<void>;
};

export const modernTest = base.extend<ModernTestFixtures>({
  performanceHelpers: async ({ page }, use) => {
    await use(new PerformanceHelpers(page));
  },

  visualHelpers: async ({ page }, use) => {
    const helpers = new VisualTestHelpers(page);
    await helpers.disableAnimations();
    await use(helpers);
  },

  mockAPI: async ({ page }, use) => {
    const mockAPI = async (responses: Record<string, unknown>) => {
      for (const [url, response] of Object.entries(responses)) {
        await page.route(url, route => route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(response)
        }));
      }
    };
    await use(mockAPI);
  },
});

export { expect } from '@playwright/test';