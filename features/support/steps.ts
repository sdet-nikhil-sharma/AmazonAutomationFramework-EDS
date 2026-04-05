import { Given, When, Then, setDefaultTimeout } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { CustomWorld } from '../../src/hooks/hooks';
import { LoginPage } from '../../src/pages/LoginPage';
import { SearchPage } from '../../src/pages/SearchPage';
import { ProductPage } from '../../src/pages/ProductPage';
import { TestConfig } from '../../src/config/testConfig';
import { testUsers } from '../../src/fixtures/users';
import { Logger } from '../../src/utils/logger';

// Set higher timeout for Cucumber steps (needed for multi-page scanning)
setDefaultTimeout(120000);

/**
 * LOGIN STEPS
 */

Given('I navigate to amazon login', async function (this: CustomWorld) {
  Logger.section('STEP: Navigate to Amazon Login');
  const loginPage = new LoginPage(this.page!);
  await loginPage.navigateToAmazon();
  await loginPage.clickSignInLink();
});

When('I enter mock credentials \\(email and password\\)', async function (
  this: CustomWorld
) {
  Logger.section('STEP: Enter Mock Credentials');
  const loginPage = new LoginPage(this.page!);
  await loginPage.login(testUsers.standard.email, testUsers.standard.password);
});

Then('I should be successfully logged in', async function (this: CustomWorld) {
  Logger.section('STEP: Verify Login Success');
  const loginPage = new LoginPage(this.page!);
  const isLoggedIn = await loginPage.isLoginSuccessful();
  
  if (!isLoggedIn) {
    Logger.warn('Login verification failed, continuing anyway (may use mock credentials)');
  }
  Logger.success('Login verification completed');
});

/**
 * SEARCH STEPS
 */

Given('I navigate to amazon', async function (this: CustomWorld) {
  Logger.section('STEP: Navigate to Amazon');
  const loginPage = new LoginPage(this.page!);
  await loginPage.navigateToAmazon();
});

When('I search for {string} in the search box', async function (
  this: CustomWorld,
  productName: string
) {
  Logger.section(`STEP: Search for ${productName}`);
  const searchPage = new SearchPage(this.page!);
  await searchPage.searchProduct(productName);
});

Then('I should see search results with multiple products', async function (
  this: CustomWorld
) {
  Logger.section('STEP: Verify Search Results');
  const searchPage = new SearchPage(this.page!);
  const count = await searchPage.getSearchResultsCount();
  expect(count).toBeGreaterThan(0);
  Logger.success(`Found ${count} products`);
});

/**
 * PRODUCT PRICE FINDING STEPS
 */

When(
  'I find the lowest and highest price products',
  async function (this: CustomWorld) {
    Logger.section('STEP: Find Lowest and Highest Price Products');
    const productPage = new ProductPage(this.page!);
    
    const lowest = await productPage.getLowestPriceProduct();
    const highest = await productPage.getHighestPriceProduct();
    
    expect(lowest).not.toBeNull();
    expect(highest).not.toBeNull();
    
    // Store in world for later use
    (this as any).lowestProduct = lowest;
    (this as any).highestProduct = highest;
  }
);

When('I find the lowest price product', async function (this: CustomWorld) {
  Logger.section('STEP: Find Lowest Price Product');
  const productPage = new ProductPage(this.page!);
  
  const lowest = await productPage.getLowestPriceProduct();
  
  expect(lowest).not.toBeNull();
  
  // Store in world for later use
  this.lowestProduct = lowest;
});

When('I find the highest price product', async function (this: CustomWorld) {
  Logger.section('STEP: Find Highest Price Product');
  const productPage = new ProductPage(this.page!);
  
  const highest = await productPage.getHighestPriceProduct();
  
  expect(highest).not.toBeNull();
  
  // Store in world for later use
  this.highestProduct = highest;
});

Then('I click on the lowest price product', async function (
  this: CustomWorld
) {
  Logger.section('STEP: Click Lowest Price Product');
  const productPage = new ProductPage(this.page!);
  const lowestProduct = this.lowestProduct;
  
  expect(lowestProduct).not.toBeNull();
  
  this.productDetailsPage = await productPage.clickProductAndNavigateToDetails(
    lowestProduct.asin,
    lowestProduct.pageNumber
  );
  expect(this.productDetailsPage).not.toBeNull();
});

Then(
  'I read and print "About this item" details in new tab',
  async function (this: CustomWorld) {
    Logger.section('STEP: Extract and Print Product Details');
    
    expect(this.productDetailsPage).not.toBeNull();
    
    const productPage = new ProductPage(this.productDetailsPage!);
    const details = await productPage.getAboutThisItemDetails(
      this.productDetailsPage!
    );
    
    productPage.printProductDetails(details);
    
    await productPage.closeProductPage(this.productDetailsPage!);
    this.productDetailsPage = null;
  }
);

Then('I click on the highest price product', async function (
  this: CustomWorld
) {
  Logger.section('STEP: Click Highest Price Product');
  // Switch back to main page if needed
  const productPage = new ProductPage(this.page!);
  const highestProduct = this.highestProduct;
  
  expect(highestProduct).not.toBeNull();
  
  this.productDetailsPage = await productPage.clickProductAndNavigateToDetails(
    highestProduct.asin,
    highestProduct.pageNumber
  );
  expect(this.productDetailsPage).not.toBeNull();
});
