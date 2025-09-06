import { Page, Locator, expect } from '@playwright/test';

export class WaitHelpers {
  constructor(private page: Page) {}

  async waitForElementToBeVisible(locator: Locator, timeout: number = 30000): Promise<void> {
    await expect(locator).toBeVisible({ timeout });
  }

  async waitForElementToBeHidden(locator: Locator, timeout: number = 30000): Promise<void> {
    await expect(locator).toBeHidden({ timeout });
  }

  async waitForTextToContain(
    locator: Locator,
    text: string,
    timeout: number = 30000
  ): Promise<void> {
    await expect(locator).toContainText(text, { timeout });
  }

  async waitForPageLoad(timeout: number = 30000): Promise<void> {
    await this.page.waitForLoadState('networkidle', { timeout });
  }

  async waitForApiResponse(urlPattern: string | RegExp, timeout: number = 30000): Promise<any> {
    const response = await this.page.waitForResponse(urlPattern, { timeout });
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  async waitForElementCount(
    locator: Locator,
    count: number,
    timeout: number = 30000
  ): Promise<void> {
    await expect(locator).toHaveCount(count, { timeout });
  }

  async waitForUrl(url: string | RegExp, timeout: number = 30000): Promise<void> {
    await this.page.waitForURL(url, { timeout });
  }
}
