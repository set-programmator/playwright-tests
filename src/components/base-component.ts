import { Page, Locator } from '@playwright/test';
import { WaitHelpers } from '../utils/wait-helpers';

export abstract class BaseComponent {
  protected page: Page;
  protected waitHelpers: WaitHelpers;
  protected rootLocator: Locator;

  constructor(page: Page, rootSelector: string) {
    this.page = page;
    this.waitHelpers = new WaitHelpers(page);
    this.rootLocator = page.locator(rootSelector);
  }

  async isVisible(): Promise<boolean> {
    try {
      await this.waitHelpers.waitForElementToBeVisible(this.rootLocator);
      return true;
    } catch {
      return false;
    }
  }

  async waitForComponent(): Promise<void> {
    await this.waitHelpers.waitForElementToBeVisible(this.rootLocator);
  }

  async click(): Promise<void> {
    await this.rootLocator.click();
  }

  async getText(): Promise<string> {
    return (await this.rootLocator.textContent()) ?? '';
  }
}
