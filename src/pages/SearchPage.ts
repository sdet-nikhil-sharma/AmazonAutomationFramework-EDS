import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestConfig } from '../config/testConfig';
import { Logger } from '../utils/logger';

/**
 * SearchPage - Handles Amazon search functionality
 */
export class SearchPage extends BasePage {
  // Locators
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly searchBox: Locator;
  readonly searchResultsContainer: Locator;
  readonly searchSuggestions: Locator;

  constructor(page: Page) {
    super(page);
    this.searchBox = page.locator('input[aria-label="Search Amazon.in"]');
    this.searchInput = page.locator(TestConfig.selectors.searchInput);
    this.searchButton = page.locator(TestConfig.selectors.searchButton);
    this.searchResultsContainer = page.locator('div[data-component-type="s-search-result"]');
    this.searchSuggestions = page.locator('div.s-result-item');
  }

  /**
   * Perform search for a product
   */
  async searchProduct(productName: string) {
    Logger.info(`Searching for product: ${productName}`);
    
    // Try using accessible search box first
    try {
      await this.searchBox.waitFor({ state: 'visible', timeout: 5000 });
      await this.searchBox.fill(productName);
      Logger.success('Product name entered in search box');
    } catch (e) {
      // Fallback to standard search input
      Logger.warn('Accessible search box not found, using fallback...');
      await this.waitForActionable(this.searchInput);
      await this.searchInput.fill(productName);
    }

    // Click search button
    await this.searchButton.click();
    await this.waitForSearchResults();
    Logger.success(`Search completed for: ${productName}`);
  }

  /**
   * Wait for search results to load
   */
  async waitForSearchResults() {
    Logger.info('Waiting for search results to load...');
    await this.page.waitForLoadState('load');
    
    // Wait for at least one search result to appear
    try {
      await this.searchSuggestions.first().waitFor({ 
        state: 'visible', 
        timeout: TestConfig.timeouts.element 
      });
      Logger.success('Search results loaded');
    } catch (e) {
      Logger.error('Search results did not load');
      throw e;
    }
  }

  /**
   * Get search results count
   */
  async getSearchResultsCount(): Promise<number> {
    const count = await this.searchSuggestions.count();
    Logger.info(`Found ${count} search results`);
    return count;
  }

  /**
   * Verify search completed successfully
   */
  async isSearchSuccessful(): Promise<boolean> {
    try {
      const resultsCount = await this.getSearchResultsCount();
      return resultsCount > 0;
    } catch (e) {
      Logger.error('Search verification failed');
      return false;
    }
  }

  /**
   * Get search results summary
   */
  async getSearchSummary(): Promise<string> {
    try {
      const summary = await this.page.locator(
        'div.s-result-info h2'
      ).textContent();
      return summary || 'Search completed';
    } catch (e) {
      return 'Search completed';
    }
  }
}
