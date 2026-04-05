import { Page, Locator } from '@playwright/test';

/**
 * BasePage - Shared functionality for all page objects
 * Provides common methods for navigation, waits, and interactions
 */
export class BasePage {
  constructor(protected page: Page) {}

  /**
   * Navigate to a specific URL
   */
  async goto(url: string) {
    await this.page.goto(url, { waitUntil: 'domcontentloaded' });
  }

  /**
   * Wait for navigation to complete
   */
  async waitForNavigation() {
    await this.page.waitForLoadState('load');
  }

  /**
   * Wait for a locator to be visible
   */
  async waitForElement(locator: Locator) {
    await locator.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Get page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Close current page
   */
  async closePage() {
    await this.page.close();
  }

  /**
   * Get current URL
   */
  async getCurrentURL(): Promise<string> {
    return this.page.url();
  }

  /**
   * Handle navigation to new tab and return the new page
   */
  async navigateToNewTab(linkLocator: Locator): Promise<Page> {
    const [newPage] = await Promise.all([
      this.page.context().waitForEvent('page'),
      linkLocator.click(),
    ]);
    await newPage.waitForLoadState('load');
    return newPage;
  }

  /**
   * Wait for element to be ready for interaction
   */
  async waitForActionable(locator: Locator) {
    await locator.waitFor({ state: 'visible', timeout: 15000 });
    await locator.scrollIntoViewIfNeeded();
  }

  /**
   * Take screenshot for debugging
   */
  async takeScreenshot(filename: string) {
    await this.page.screenshot({ path: filename });
  }
}
