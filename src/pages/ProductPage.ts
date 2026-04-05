import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestConfig } from '../config/testConfig';
import { DynamicElementHelper } from '../utils/dynamicElementHelper';
import { Logger } from '../utils/logger';

/**
 * ProductPage - Handles product listing and details
 * Core functionality: find lowest/highest price products dynamically
 */
export class ProductPage extends BasePage {
  // Locators
  readonly productList: Locator;
  readonly productItems: Locator;
  readonly productName: Locator;
  readonly productPrice: Locator;
  readonly aboutThisItem: Locator;

  constructor(page: Page) {
    super(page);
    this.productItems = page.locator('div[data-component-type="s-search-result"]');
    this.productList = page.locator('div[class*="s-result-container"]').first();
    this.productName = page.locator('h2 a span');
    this.productPrice = page.locator('span.a-price-whole');
    this.aboutThisItem = page.locator('h1, h2').filter({ hasText: /About this/i });
  }

  /**
   * Wait for product list to stabilize
   */
  async waitForProductListStability() {
    Logger.info('Waiting for product list to stabilize...');
    await DynamicElementHelper.waitForListStability(this.productItems.first());
    Logger.success('Product list ready');
  }

  /**
   * Scan current results page with batch extraction
   * Efficiently extracts all products using $$eval
   */
  private async scanCurrentPage(): Promise<
    Array<{ name: string; price: number; priceText: string; asin: string }>
  > {
    try {
      Logger.info('Scanning current page for products...');
      
      // Wait for products to load on current page
      await this.page.waitForSelector('[data-component-type="s-search-result"]', {
        timeout: 10000,
      });

      // Log page structure for debugging
      const elementCount = await this.page.locator('[data-component-type="s-search-result"]').count();
      Logger.info(`Found ${elementCount} product containers on page`);

      // Batch extract using $$eval - fast and efficient
      const pageProducts = await this.page.$$eval(
        '[data-component-type="s-search-result"]',
        nodes => {
          return nodes
            .map(node => {
              try {
                // Try primary selectors
                let nameNode = node.querySelector('h2 a span');
                let priceNode = node.querySelector('span.a-price-whole');
                const asin = node.getAttribute('data-asin') || '';

                let name = nameNode?.textContent?.trim() || '';
                let priceText = priceNode?.textContent?.trim() || '';

                // Fallback selectors in $$eval context
                if (!name) {
                  nameNode = node.querySelector('h2 span');
                  name = nameNode?.textContent?.trim() || '';
                }

                if (!priceText) {
                  priceNode = node.querySelector('[data-a-color="base"] span');
                  priceText = priceNode?.textContent?.trim() || '';
                }

                const priceNum = parseInt((priceText || '').replace(/[^0-9]/g, ''), 10);

                return {
                  name: name || 'Unknown',
                  priceText: priceText || '0',
                  priceNum: priceNum || 0,
                  asin: asin,
                  hasPrice: priceNum > 0,
                };
              } catch (e) {
                return {
                  name: 'Error',
                  priceText: '0',
                  priceNum: 0,
                  hasPrice: false,
                };
              }
            })
            .filter(p => p.name !== 'Unknown' && p.name !== 'Error' && p.hasPrice && p.asin)
            .slice(0, 50);
        }
      );

      Logger.info(`Extracted ${pageProducts.length} valid products from ${elementCount} containers`);

      if (pageProducts.length === 0) {
        Logger.warn('No products extracted from current page');
        return [];
      }

      return pageProducts.map(p => ({
        name: p.name,
        price: p.priceNum,
        priceText: p.priceText,
        asin: p.asin,
      }));
    } catch (e) {
      Logger.error(`Failed to scan current page: ${e}`);
      return [];
    }
  }

  /**
   * Scan multiple pages using pagination
   * Navigates through pages and collects all products with page info
   */
  private async scanMultiplePages(
    maxPages: number = 5
  ): Promise<Array<{ name: string; price: number; priceText: string; asin: string; pageNumber: number }>> {
    Logger.info(`Starting multi-page scan (up to ${maxPages} pages)...`);
    
    const allProducts: Array<{ name: string; price: number; priceText: string; asin: string; pageNumber: number }> = [];
    const visitedKeys = new Set<string>();
    const baseUrl = this.page.url().replace(/[?&]page=\d+/, ''); // Remove existing page param

    for (let pageNum = 1; pageNum <= maxPages; pageNum++) {
      try {
        Logger.info(`Scanning page ${pageNum}...`);
        
        // Navigate to the specific page via URL
        const pageUrl = `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}page=${pageNum}`;
        await this.page.goto(pageUrl, { timeout: 30000 });
        await this.page.waitForTimeout(2000); // Allow results to load
        
        // Extract products from current page
        const pageProducts = await this.scanCurrentPage();

        if (pageProducts.length === 0) {
          Logger.warn(`No products found on page ${pageNum}`);
          if (pageNum === 1) {
            // If first page has no products, try once more before failing
            Logger.info('Retrying first page...');
            await this.page.waitForTimeout(2000);
            const retryProducts = await this.scanCurrentPage();
            if (retryProducts.length === 0) {
              Logger.error('First page still has no products after retry');
              throw new Error('Cannot find products on first page');
            }
            pageProducts.push(...retryProducts);
          } else {
            // Last page or no more products
            break;
          }
        }

        // Add unique products with page number
        for (const product of pageProducts) {
          const key = `${product.name}:${product.price}`;
          if (!visitedKeys.has(key)) {
            visitedKeys.add(key);
            allProducts.push({
              ...product,
              pageNumber: pageNum
            });
          }
        }

        Logger.info(`Page ${pageNum}: Added ${pageProducts.length} products. Total: ${allProducts.length}`);
      } catch (e) {
        Logger.warn(`Failed to scan page ${pageNum}: ${e}`);
        if (pageNum === 1) {
          // First page must succeed
          throw new Error(`Cannot scan first page: ${e}`);
        }
        // Continue with remaining pages
      }
    }

    if (allProducts.length === 0) {
      Logger.error('No products found after scanning all pages');
      throw new Error('No products found after scanning');
    }

    const minPrice = Math.min(...allProducts.map(p => p.price));
    const maxPrice = Math.max(...allProducts.map(p => p.price));
    Logger.success(
      `Scan complete: ${allProducts.length} products. Min: ₹${minPrice}, Max: ₹${maxPrice}`
    );
    return allProducts;
  }

  /**
   * Get all products with prices (multi-page optimized version)
   */
  async getAllProductsWithPrices(): Promise<
    Array<{ name: string; price: string; nameElement: Locator; priceElement: Locator }>
  > {
    Logger.info('Fetching all products with prices (multi-page scan)...');
    
    // Scan multiple pages
    const scannedProducts = await this.scanMultiplePages(3);
    
    // Convert to compatible format
    const products: Array<{
      name: string;
      price: string;
      nameElement: Locator;
      priceElement: Locator;
    }> = scannedProducts.map((p, index) => ({
      name: p.name,
      price: p.priceText,
      nameElement: this.page.locator(`text="${p.name}"`),
      priceElement: this.page.locator(`text="${p.priceText}"`),
    }));

    Logger.success(`Extracted ${products.length} products total`);
    return products;
  }

  /**
   * Find the product with the lowest price (optimized multi-page)
   */
  async getLowestPriceProduct(): Promise<{
    name: string;
    price: number;
    priceText: string;
    index: number;
    pageNumber: number;
    asin: string;
  } | null> {
    Logger.section('FINDING LOWEST PRICE PRODUCT');
    const products = await this.scanMultiplePages(3);

    if (products.length === 0) {
      Logger.error('No products found');
      return null;
    }

    let lowestProduct = { ...products[0], index: 0 };

    for (let i = 1; i < products.length; i++) {
      if (products[i].price > 0 && products[i].price < lowestProduct.price) {
        lowestProduct = { ...products[i], index: i };
      }
    }

    Logger.success(
      `Lowest price product: ${lowestProduct.name} - ${lowestProduct.priceText} (Page ${lowestProduct.pageNumber})`
    );
    return lowestProduct;
  }

  /**
   * Find the product with the highest price (optimized multi-page)
   */
  async getHighestPriceProduct(): Promise<{
    name: string;
    price: number;
    priceText: string;
    index: number;
    pageNumber: number;
    asin: string;
  } | null> {
    Logger.section('FINDING HIGHEST PRICE PRODUCT');
    const products = await this.scanMultiplePages(3);

    if (products.length === 0) {
      Logger.error('No products found');
      return null;
    }

    let highestProduct = { ...products[0], index: 0 };

    for (let i = 1; i < products.length; i++) {
      if (products[i].price > highestProduct.price) {
        highestProduct = { ...products[i], index: i };
      }
    }

    Logger.success(
      `Highest price product: ${highestProduct.name} - ${highestProduct.priceText} (Page ${highestProduct.pageNumber})`
    );
    return highestProduct;
  }

  /**
   * Click on a product by ASIN and handle new tab
   * Uses ASIN (product ID) for reliable matching instead of product names
   */
  async clickProductAndNavigateToDetails(
    asin: string,
    pageNumber: number = 1
  ): Promise<Page | null> {
    Logger.info(`Clicking product with ASIN: ${asin} on page ${pageNumber}...`);

    try {
      // Navigate to the specific page if not on page 1
      if (pageNumber > 1) {
        Logger.info(`Navigating to page ${pageNumber}...`);
        
        let currentUrl = this.page.url();
        currentUrl = currentUrl.replace(/[?&]page=\d+/, '');
        const separator = currentUrl.includes('?') ? '&' : '?';
        const pageUrl = `${currentUrl}${separator}page=${pageNumber}`;
        
        await this.page.goto(pageUrl, { timeout: 30000 });
        Logger.info(`Navigated to page ${pageNumber}`);
      }

      // Wait for products to load
      await this.page.waitForSelector('[data-component-type="s-search-result"]', {
        timeout: 10000,
      });
      await this.page.waitForTimeout(3000); // Additional wait for dynamic content

      // Retry finding the ASIN
      let productContainer;
      for (let attempt = 0; attempt < 3; attempt++) {
        productContainer = this.page.locator(`[data-asin="${asin}"]`).first();
        if (await productContainer.isVisible()) break;
        await this.page.waitForTimeout(1000);
      }
      if (!productContainer) {
  throw new Error('productContainer not found');
      }
      if (!await productContainer.isVisible()) {
        // Log all ASINs on the page for debugging
        const allAsins = await this.page.$$eval('[data-component-type="s-search-result"]', nodes => nodes.map(n => n.getAttribute('data-asin')));
        Logger.error(`ASIN ${asin} not found after retries. Available ASINs: ${allAsins.join(', ')}`);
        return null;
      }

      // Try multiple link selectors
      let productLink = productContainer.locator('h2 a').first();
      if (!await productLink.isVisible()) {
        productLink = productContainer.locator('a[href]').first(); // Fallback to any link with href
      }

      if (!await productLink.isVisible()) {
        Logger.error(`No clickable link found for ASIN ${asin}`);
        return null;
      }

      // Click and handle new tab
      const [newPage] = await Promise.all([
        this.page.context().waitForEvent('page'),
        productLink.click(),
      ]);

      await newPage.waitForLoadState('load');
      Logger.success('Product details page opened in new tab');
      return newPage;
    } catch (e) {
      Logger.error(`Failed to navigate to product details: ${e}`);
      return null;
    }
  }

  /**
   * Extract "About this item" details from product page
   */
  async getAboutThisItemDetails(page: Page): Promise<string> {
    Logger.info('Extracting "About this item" details...');

    try {
      // Wait for product details to load
      await page.waitForLoadState('load');

      // Try to find product title/heading
      const title = await page.locator('h1').first().textContent();
      Logger.info(`Product: ${title}`);

      // Try to find "About this item" section
      const aboutSection = page.locator('h2').filter(
        { hasText: /About this item/i }
      );
      await aboutSection.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {
        Logger.warn('About this item section not visible');
      });

      // Get all text from the visible area
      const allText = await page.content();
      const aboutIndex = allText.indexOf('About this item');

      let details = 'Product details:\n';
      details += `- Title: ${title}\n`;

      // Extract some key details
      const bullet = page.locator('li').first();
      const bulletCount = await page.locator('li').count();
      details += `- Details count: ${bulletCount} key points\n`;

      if (bulletCount > 0) {
        const firstDetail = await page.locator('li').first().textContent();
        details += `- First detail: ${firstDetail}\n`;
      }

      Logger.success('Product details extracted');
      return details;
    } catch (e) {
      Logger.error(`Failed to extract product details: ${e}`);
      return 'Failed to extract product details';
    }
  }

  /**
   * Print product details to console
   */
  printProductDetails(details: string) {
    Logger.section('PRODUCT DETAILS');
    console.log(details);
    Logger.section('END PRODUCT DETAILS');
  }

  /**
   * Close product details page
   */
  async closeProductPage(productPage: Page) {
    Logger.info('Closing product details page...');
    await productPage.close();
    Logger.success('Product page closed');
  }
}
