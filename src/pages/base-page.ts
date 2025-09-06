import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';
import { Logger } from '../utils/logger';

export abstract class BasePage {
  protected page: Page;
  protected waitHelpers: WaitHelpers;
  protected logger: Logger;

  constructor(page: Page) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);
    this.logger = new Logger();
  }

  async navigate(url: string): Promise<void> {
    this.logger.info(`Navigating to: ${url}`);
    try {
      await this.page.goto(url);
      await this.waitForPageLoad();
    } catch (error) {
      this.logger.error(`Navigation failed to: ${url}`);
      throw error;
    }
  }

  async waitForPageLoad(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }

  async getCurrentUrl(): Promise<string> {
    return this.page.url();
  }

  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `reports/screenshots/${name}.png`, fullPage: true });
  }

  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
  }

  async clickElement(locator: Locator): Promise<void> {
    await this.waitHelpers.waitForElementToBeVisible(locator);
    await locator.click();
  }

  async fillInput(locator: Locator, text: string): Promise<void> {
    await this.waitHelpers.waitForElementToBeVisible(locator);
    await locator.fill(text);
  }

  async selectOption(locator: Locator, option: string): Promise<void> {
    await this.waitHelpers.waitForElementToBeVisible(locator);
    await locator.selectOption(option);
  }

  async getText(locator: Locator): Promise<string> {
    await this.waitHelpers.waitForElementToBeVisible(locator);
    return (await locator.textContent()) ?? '';
  }

  async isElementVisible(locator: Locator): Promise<boolean> {
    try {
      await this.waitHelpers.waitForElementToBeVisible(locator, 5000);
      return true;
    } catch {
      return false;
    }
  }
}
