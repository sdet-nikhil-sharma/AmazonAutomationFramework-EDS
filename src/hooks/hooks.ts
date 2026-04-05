import { Browser, BrowserContext, Page } from '@playwright/test';
import { chromium, firefox, webkit } from '@playwright/test';
import { Before, After, IWorldOptions, World } from '@cucumber/cucumber';
import { TestConfig } from '../config/testConfig';
import { Logger } from '../utils/logger';

/**
 * Custom world to hold shared state across steps
 */
export class CustomWorld extends World {
  browser: Browser | null = null;
  context: BrowserContext | null = null;
  page: Page | null = null;
  productDetailsPage: Page | null = null;
  lowestProduct: any = null;
  highestProduct: any = null;
  scenario: any;
  result: any;

  constructor(options: IWorldOptions) {
    super(options);
    this.scenario = options.parameters?.scenario;
    this.result = options.parameters?.result;
  }
}

/**
 * Before hook - Initialize browser and page
 */
Before(async function (this: CustomWorld) {
  Logger.section('STARTING TEST');
  Logger.info(`Test: ${this.scenario?.name}`);

  try {
    // Launch browser (default: chromium)
    this.browser = await chromium.launch({
      headless: TestConfig.isHeadless,
      slowMo: TestConfig.slowMo,
    });

    // Create context
    this.context = await this.browser.newContext({
      viewport: { width: 1920, height: 1080 },
      ignoreHTTPSErrors: true,
    });

    // Create page
    this.page = await this.context.newPage();

    // Set timeouts
    this.page.setDefaultTimeout(TestConfig.timeouts.page);
    this.page.setDefaultNavigationTimeout(TestConfig.timeouts.page);

    Logger.success('Browser and page initialized');
  } catch (e) {
    Logger.error(`Failed to initialize browser: ${e}`);
    throw e;
  }
});

/**
 * After hook - Cleanup and take screenshots on failure
 */
After(async function (this: CustomWorld) {
  try {
    if (this.result?.status === 'FAILED') {
      Logger.section('TEST FAILED - CAPTURING ARTIFACTS');

      if (this.page) {
        // Take screenshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const screenshotPath = `test-results/screenshots/${this.scenario?.name}-${timestamp}.png`;
        try {
          await this.page.screenshot({ path: screenshotPath });
          Logger.info(`Screenshot saved: ${screenshotPath}`);
        } catch (e) {
          Logger.warn(`Failed to save screenshot: ${e}`);
        }
      }
    }

    // Close product details page if open
    if (this.productDetailsPage && !this.productDetailsPage.isClosed()) {
      await this.productDetailsPage.close();
      Logger.info('Product details page closed');
    }

    // Close page
    if (this.page && !this.page.isClosed()) {
      await this.page.close();
    }

    // Close context
    if (this.context) {
      await this.context.close();
    }

    // Close browser
    if (this.browser) {
      await this.browser.close();
    }

    Logger.section('TEST COMPLETED');
  } catch (e) {
    Logger.error(`Error during cleanup: ${e}`);
  }
});
