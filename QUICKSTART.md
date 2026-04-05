# Quick Start Guide

## What Was Built

### Core Framework
- ✅ **Page Object Model (POM)** - 4 page classes with reusable methods
- ✅ **Cucumber BDD** - 2 feature files with 11 step definitions
- ✅ **Dynamic Element Handling** - Price extraction, product filtering without Amazon UI filters
- ✅ **Parallel Execution** - 4 workers, 3 browsers (Chrome, Firefox, WebKit)
- ✅ **Environment Configuration** - Centralized config with .env support

### Quality Assurance
- ✅ **TypeScript** - Fully typed code
- ✅ **Logging** - Color-coded console output for debugging
- ✅ **Error Handling** - Try-catch with meaningful messages
- ✅ **Reporting** - HTML + JSON reports with screenshots

## Running Tests

### Option 1: Run All Tests (Parallel)
```bash
npm test
```
- 4 parallel workers
- Chrome, Firefox, WebKit browsers
- HTML report: `test-results/html-report/index.html`

### Option 2: Run in Headed Mode (See Browser)
```bash
npm run test:headed
```
- Single browser window visible
- Useful for debugging

### Option 3: Run Specific Feature
```bash
npx cucumber-js features/login.feature
```

### Option 4: Dry Run (Verify Steps)
```bash
npm test -- --dry-run
```
- Checks feature files and step matching
- No browser launched

### Option 5: View Test Report
```bash
npm run test:report
```
- Opens HTML report in browser

---

## Test Scenarios

### 1. Login Scenario
**File**: `features/login.feature`
1. Navigate to Amazon
2. Click Sign In
3. Enter mock credentials (testuser@mock.com / MockPass123!)
4. Verify login success

**Steps**:
- `Given I navigate to amazon login`
- `When I enter mock credentials (email and password)`
- `Then I should be successfully logged in`

### 2. Product Search Scenario
**File**: `features/product-search.feature`
1. Navigate to Amazon
2. Search for "Mobile"
3. Find highest price products
4. Click highest price product, read details

**Steps**:
- `Given I navigate to amazon`
- `When I search for "Mobile" in the search box`
- `Then I should see search results with multiple products`
- `When I find the highest price products`
- `Then I click on the highest price product`
- `Then I read and print "About this item" details in new tab`

### 3. Product Search Scenario
**File**: `features/product-search.feature`
1. Navigate to Amazon
2. Search for "Mobile"
3. Find lowest price products
4. Click lowest price product, read details

**Steps**:
- `Given I navigate to amazon`
- `When I search for "Mobile" in the search box`
- `Then I should see search results with multiple products`
- `When I find the lowest price products`
- `Then I click on the lowest price product`
- `Then I read and print "About this item" details in new tab`

---

## Key Features Implemented

### 1. Page Object Model (POM)
Each page is a separate class inheriting from `BasePage`:

```typescript
// Usage in step definitions
const loginPage = new LoginPage(this.page);
await loginPage.login(email, password);
```

**Pages**:
- `BasePage` - Common navigation, waits, tab handling
- `LoginPage` - Email/password inputs, login flow
- `SearchPage` - Product search, results validation
- `ProductPage` - Product listing, price extraction, details

### 2. Dynamic Element Handling
Robust strategies for extracting products without using Amazon filters:

```typescript
// Filter products by text
const products = await productPage.getAllProductsWithPrices();

// Extract price as number
const price = DynamicElementHelper.extractPriceAsNumber("₹1,234.56");

// Find lowest/highest price
const lowest = await productPage.getLowestPriceProduct();
const highest = await productPage.getHighestPriceProduct();
```


### 3. Parallel Execution
- 4 workers by default
- Each test in isolated browser context
- No shared state between tests
- Configure in `.env` (PARALLEL_WORKERS)

### 4. Cucumber BDD
Human-readable feature files with Gherkin syntax:

```gherkin
Feature: Find Lowest and Highest Price Products
  
  Scenario: Search mobile and find price extremes without filters
    Given I navigate to amazon
    When I search for "Mobile" in the search box
    ...
```

---

## Customization

### Modify Search Term
Edit `.env`:
```env
PRODUCT_SEARCH_TERM=Laptop
```

Or hardcode in `features/product-search.feature`:
```gherkin
When I search for "Laptop" in the search box
```

### Add More Products to Search
Create new scenarios in `features/product-search.feature`:
```gherkin
Scenario: Search for laptops
  Given I navigate to amazon
  When I search for "Laptop" in the search box
  ...
```

### Extend Page Objects
Add new pages extending `BasePage`:
```typescript
export class CartPage extends BasePage {
  // Add locators and methods
}
```

### Adjust Timeouts
Edit `src/config/testConfig.ts`:
```typescript
static readonly timeouts = {
  page: 30000,    // 30 seconds
  element: 10000, // 10 seconds
  assertion: 5000 // 5 seconds
};
```


## Support

For issues or questions:
1. Check selectors in `TestConfig.selectors`
2. Run in headed mode: `npm run test:headed`
3. Check logs in console output
4. Review browser DevTools (when headed)
5. Update locators if Amazon UI changed

