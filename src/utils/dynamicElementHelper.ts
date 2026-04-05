import { Locator } from '@playwright/test';

/**
 * Utility class for handling dynamic elements and complex locator operations
 */
export class DynamicElementHelper {
  /**
   * Find element with specific text within a container
   * Uses Playwright's filter with regex for flexible matching
   */
  static async findElementByText(
    containerLocator: Locator,
    searchText: string,
    elementSelector: string = ''
  ): Promise<Locator> {
    const regex = new RegExp(searchText, 'i'); // Case-insensitive
    
    if (elementSelector) {
      return containerLocator
        .locator(elementSelector)
        .filter({ hasText: regex });
    }
    
    return containerLocator.filter({ hasText: regex });
  }

  /**
   * Extract text values from multiple elements (e.g., prices, product names)
   */
  static async extractTextFromElements(locators: Locator): Promise<string[]> {
    const allTexts = await locators.allTextContents();
    return allTexts.map((text) => text.trim()).filter((text) => text.length > 0);
  }

  /**
   * Extract price from text (handles various formats like ₹1,234.56)
   * Returns price as number
   */
  static extractPriceAsNumber(priceText: string): number {
    // Remove currency symbol, commas, and spaces
    const cleanPrice = priceText
      .replace(/[₹$€]/g, '')
      .replace(/,/g, '')
      .trim();
    
    const price = parseFloat(cleanPrice);
    return isNaN(price) ? 0 : price;
  }

  /**
   * Get the nth element from a list with bounds checking
   */
  static getNthElement(locators: Locator, index: number): Locator {
    if (index < 0) {
      throw new Error('Index cannot be negative');
    }
    return locators.nth(index);
  }

  /**
   * Wait for list to stabilize (all items visible and prices loaded)
   */
  static async waitForListStability(
    containerLocator: Locator,
    timeout: number = 15000
  ) {
    await containerLocator.waitFor({ state: 'visible', timeout });
    // Additional wait to ensure dynamic content is loaded
    await containerLocator.page().waitForTimeout(500);
  }

  /**
   * Compare and find lowest price product
   * Returns object with product name and price
   */
  static async findLowestPriceProduct(
    products: Array<{ name: string; priceText: string }>
  ): Promise<{ name: string; price: number } | null> {
    if (products.length === 0) return null;

    let lowest = {
      name: products[0].name,
      price: this.extractPriceAsNumber(products[0].priceText),
    };

    for (const product of products) {
      const price = this.extractPriceAsNumber(product.priceText);
      if (price > 0 && price < lowest.price) {
        lowest = { name: product.name, price };
      }
    }

    return lowest;
  }

  /**
   * Compare and find highest price product
   * Returns object with product name and price
   */
  static async findHighestPriceProduct(
    products: Array<{ name: string; priceText: string }>
  ): Promise<{ name: string; price: number } | null> {
    if (products.length === 0) return null;

    let highest = {
      name: products[0].name,
      price: this.extractPriceAsNumber(products[0].priceText),
    };

    for (const product of products) {
      const price = this.extractPriceAsNumber(product.priceText);
      if (price > highest.price) {
        highest = { name: product.name, price };
      }
    }

    return highest;
  }
}
