import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  private readonly welcomeMessage: Locator;
  private readonly navigationMenu: Locator;
  private readonly userProfile: Locator;
  private readonly logoutButton: Locator;
  private readonly searchInput: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator('[data-testid="welcome-message"]');
    this.navigationMenu = page.locator('[data-testid="nav-menu"]');
    this.userProfile = page.locator('[data-testid="user-profile"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.searchInput = page.locator('[data-testid="search-input"]');
  }

  async getWelcomeMessage(): Promise<string> {
    return await this.getText(this.welcomeMessage);
  }

  async navigateToSection(section: string): Promise<void> {
    const menuItem = this.page.locator(`[data-testid="nav-${section}"]`);
    await this.clickElement(menuItem);
  }

  async logout(): Promise<void> {
    this.logger.info('Logging out user');
    await this.clickElement(this.userProfile);
    await this.clickElement(this.logoutButton);
  }

  async search(query: string): Promise<void> {
    await this.fillInput(this.searchInput, query);
    await this.page.keyboard.press('Enter');
  }

  async isUserLoggedIn(): Promise<boolean> {
    return await this.isElementVisible(this.userProfile);
  }
}