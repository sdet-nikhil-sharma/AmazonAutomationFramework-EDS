# Architecture & Design Documentation

## High-Level Architecture

```
                        ┌─────────────────────────────┐
                        │   Feature Files (.feature)  │
                        │   - Login Scenario          │
                        │   - Search Scenario         │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   Cucumber Step Definitions │
                        │   (features/support/steps)  │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   Page Object Models (POMs) │
                        │   - LoginPage               │
                        │   - SearchPage              │
                        │   - ProductPage             │
                        │   - BasePage (shared)       │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   Playwright Web Driver     │
                        │   - Chrome                  │
                        │   - Firefox                 │
                        │   - WebKit                  │
                        └──────────────┬──────────────┘
                                       │
                        ┌──────────────▼──────────────┐
                        │   Amazon.in Web Application │
                        └─────────────────────────────┘
```

## Component Architecture

### 1. **Feature Layer** (BDD Scenarios)
**Location**: `features/*.feature`

**Purpose**: Human-readable test descriptions using Gherkin syntax

**Components**:
- `login.feature` - Login scenario with mock credentials
- `product-search.feature` - Product search with price comparison

**Benefits**:
- Non-technical stakeholders can understand tests
- Serves as living documentation
- Easy to maintain and update

---

### 2. **Step Definition Layer** (Cucumber Setup)
**Location**: `features/support/steps.ts`

**Purpose**: Bridge between feature files and page objects

**Responsibilities**:
- Parse Gherkin steps
- Instantiate appropriate page objects
- Pass data between steps via CustomWorld
- Execute test logic

**Pattern**:
```typescript
Given('step description', async function(this: CustomWorld) {
  const page = new PageObject(this.page);
  await page.method();
});
```

---

### 3. **Page Object Layer** (POM Pattern)
**Location**: `src/pages/`

**Purpose**: Encapsulate page interactions and locators

**Hierarchy**:
```
BasePage (abstract)
├── LoginPage
├── SearchPage
└── ProductPage
```

### BasePage (src/pages/BasePage.ts)
**Shared Methods**:
- `goto(url)` - Navigate to URL
- `waitForNavigation()` - Wait for page load
- `waitForElement(locator)` - Wait for element visibility
- `navigateToNewTab(linkLocator)` - Handle new tab navigation
- `takeScreenshot(filename)` - Debug screenshots

**Benefits**:
- DRY principle - shared code in one place
- Easy maintenance - update once, apply everywhere
- Consistent patterns across all pages

### LoginPage (src/pages/LoginPage.ts)
**Locators**:
- Email input
- Password input
- Sign-in button
- Continue button

**Methods**:
- `navigateToAmazon()` - Go to Amazon homepage
- `clickSignInLink()` - Click login link
- `enterEmail(email)` - Enter email
- `enterPassword(password)` - Enter password
- `login(email, password)` - Complete login flow
- `isLoginSuccessful()` - Verify login

### SearchPage (src/pages/SearchPage.ts)
**Locators**:
- Search input box
- Search button
- Search results container

**Methods**:
- `searchProduct(productName)` - Search for product
- `waitForSearchResults()` - Wait for results to load
- `getSearchResultsCount()` - Get number of results
- `isSearchSuccessful()` - Verify search worked

### ProductPage (src/pages/ProductPage.ts)
**Locators**:
- Product items
- Product name
- Product price
- About this item section

**Methods** (Dynamic Element Handling):
- `getAllProductsWithPrices()` - Extract all visible products
- `getLowestPriceProduct()` - Find best deal
- `getHighestPriceProduct()` - Find most expensive
- `clickProductAndNavigateToDetails(index)` - Open product in new tab
- `getAboutThisItemDetails(page)` - Extract product info
- `printProductDetails(details)` - Output to console

**Key Feature**: Uses dynamic filtering without Amazon UI filters
```typescript
// Extracts products from dynamic list
for (let i = 0; i < productCount; i++) {
  const productItem = this.productItems.nth(i);
  const name = await nameLocator.textContent();
  const price = await priceLocator.textContent();
  // Extract and store
}
```

---

### 4. **Utility Layer**
**Location**: `src/utils/`

### DynamicElementHelper.ts
**Purpose**: Handle complex element operations

**Methods**:
- `findElementByText(container, searchText)` - Find by text content
- `extractPriceAsNumber(priceText)` - Parse price string to number
- `findLowestPriceProduct(products)` - Compare prices
- `findHighestPriceProduct(products)` - Compare prices
- `waitForListStability(container)` - Ensure list is ready

**Example**:
```typescript
const price = DynamicElementHelper.extractPriceAsNumber("₹1,234.56");
// Returns: 1234.56
```

### Logger.ts
**Purpose**: Structured logging with colors

**Methods**:
- `info(message)` - Blue info logs
- `success(message)` - Green success logs
- `warn(message)` - Yellow warning logs
- `error(message)` - Red error logs
- `section(title)` - Section header

**Output**:
```
[INFO] Navigating to Amazon...
[SUCCESS] Amazon homepage loaded
[WARN] Accessible search box not found, using fallback...
[ERROR] Search results did not load
```

---

### 5. **Configuration Layer**
**Location**: `src/config/` and root configs

### TestConfig.ts
**Purpose**: Centralized configuration management

**Properties**:
- `baseUrl` - Amazon URL from env or default
- `mockEmail/mockPassword` - Login credentials from env
- `productSearchTerm` - Search term from env
- `timeouts` - Page/element/assertion timeouts
- `selectors` - All Amazon selectors

**Benefits**:
- Single source of truth
- Environment-based (local, CI, staging)
- Easy to update selectors if Amazon UI changes

### Environment Variables (.env)
```env
BASE_URL=https://www.amazon.in/
MOCK_EMAIL=nikhilsharma.sharma48@gmail.com
MOCK_PASSWORD=NikAma@98
PRODUCT_SEARCH_TERM=Mobile
PARALLEL_WORKERS=4
HEADED=false
```

---

### 6. **Test Data Layer**
**Location**: `src/fixtures/`

### users.ts
```typescript
export const testUsers = {
 standard: { email: 'testuser@mock.com', password: 'MockPass123!' }
};
```

### products.ts
```typescript
export const testProducts = {
  mobile: 'Mobile',
  laptop: 'Laptop'
};
```

---

### 7. **Hook Layer** (Cucumber Lifecycle)
**Location**: `src/hooks/hooks.ts`

### CustomWorld Class
**Purpose**: Share state across step definitions

**Properties**:
- `browser` - Playwright browser instance
- `context` - Browser context
- `page` - Current page
- `productDetailsPage` - Product details page

### Before Hook
**Executes Before Each Scenario**:
1. Launch browser (chromium)
2. Create browser context
3. Create new page
4. Set default timeouts
5. Log test start

### After Hook
**Executes After Each Scenario**:
1. Capture screenshot on failure
2. Close product details page
3. Close main page
4. Close context
5. Close browser
6. Log test completion

---

## Data Flow Diagram

```
Feature File: Search Mobile
        ↓
Gherkin Steps
        ↓
Step Definition: "I search for Mobile"
        ↓
SearchPage.searchProduct("Mobile")
        ↓
Playwright: Locate search box + search button
        ↓
Amazon Website: Process search
        ↓
Playwright: Wait for results + extract products
        ↓
ProductPage.getAllProductsWithPrices()
        ↓
DynamicElementHelper.extractPriceAsNumber()
        ↓
ProductPage.getLowestPriceProduct()
ProductPage.getHighestPriceProduct()
        ↓
Console Output: Product details
```

---

## Design Patterns Used

### 1. **Page Object Model (POM)**
- **Benefit**: Separates test logic from UI interactions
- **Implementation**: All pages have `init()` with locators
- **Usage**: Create page instance, call methods

### 2. **Base Class Pattern**
- **Benefit**: DRY - shared functionality in BasePage
- **Implementation**: LoginPage extends BasePage
- **Reuse**: Navigation, waits, tab handling

### 3. **Fluent Interface**
- **Benefit**: Readable, chainable method calls
- **Example**: `await page.goto().search().findProduct()`

### 4. **Factory Pattern**
- **Benefit**: Easy creation of test objects
- **Example**: `UserFactory.createUser({ email: 'new@test.com' })`

### 5. **Singleton Pattern** (TestConfig)
- **Benefit**: Single instance of configuration
- **Access**: `TestConfig.baseUrl`, `TestConfig.timeouts`

### 6. **Handler/Hook Pattern**
- **Benefit**: Setup/teardown for each test
- **Implementation**: Before/After Cucumber hooks

---

## Execution Flow

### Test Execution (Single Scenario)

```
1. Cucumber discovers features/login.feature
2. Parses Gherkin scenario
3. Calls Before hook
   → Launches browser
   → Creates page
4. Matches steps to step definitions
5. Step 1: "Given I navigate to amazon login"
   → new LoginPage(page)
   → await loginPage.navigateToAmazon()
   → Playwright navigates to amazon.in
   → await loginPage.clickSignInLink()
   → Click sign in button
6. Step 2: "When I enter mock credentials"
   → await loginPage.login(email, password)
   → Enters email from TestConfig.mockEmail
   → Enters password from TestConfig.mockPassword
   → Clicks sign in
7. Step 3: "Then I should be successfully logged in"
   → await loginPage.isLoginSuccessful()
   → Looks for account button in header
   → Returns true/false
8. Calls After hook
   → Close browser
   → Generate report
9. Stores result (passed/failed)
10. Repeats for next scenario (parallel workers)
```

---

## Parallel Execution Architecture

```
┌─────────────────────────┐
│  npm test (cucumber-js) │
└────────────┬────────────┘
             │ PARALLEL_WORKERS=4
    ┌────────┼────────┬─────────┐
    │        │        │         │
    ▼        ▼        ▼         ▼
  Worker1  Worker2  Worker3   Worker4
    │        │        │         │
    ├─────┬──┴─────┬──┴─────┬───┼────┐
    │     │        │        │   │    │
   Sre1  Sre2    Sre3     Sre4 Sre5 Sre6
    │     │        │        │   │    │
    └─────┴────┬───┴────────┴───┴────┘
               │
        ┌──────▼───────┐
        │ Isolated      │
        │ Browser       │
        │ Contexts      │
        │ (No Shared    │
        │  State)       │
        └──────┬───────┘
               │
        ┌──────▼────────┐
        │ Amazon.in     │
        │ (4 parallel   │
        │  requests)    │
        └───────────────┘
```

**Key Points**:
- Each worker independent
- Each worker has isolated browser context
- No shared state between workers
- Tests can run in any order
- Total time ≈ Sequential time / Workers

---

## Locator Strategy

### Most Reliable → Least Reliable

1. **Role-Based** (Most Resilient)
   - `getByRole('button', { name: 'Sign in' })`
   - Accessibility-driven

2. **Label-Based**
   - `getByLabel('Email')`
   - User-friendly

3. **Test ID**
   - `getByTestId('product-123')`
   - Explicit (if available)

4. **Placeholder**
   - `getByPlaceholder('Search')`
   - Less stable

5. **CSS Selector** (Last Resort)
   - `locator('div.class-name')`
   - Most fragile

**Our Strategy**:
- Prioritize accessible locators
- Use CSS selectors as fallback
- Store all selectors in `TestConfig.selectors`
- Easy to update if Amazon UI changes

---

## Error Handling Strategy

### 1. **Locator Not Found**
```typescript
try {
  await element.click();
} catch (e) {
  Logger.error(`Failed to click: ${e}`);
  // Try fallback selector
  await page.locator('fallback-selector').click();
}
```

### 2. **Timeout Error**
```typescript
try {
  await element.waitFor({ timeout: 5000 });
} catch (e) {
  Logger.warn('Element not visible, continuing...');
  // Continue or fail gracefully
}
```

### 3. **Navigation Error**
```typescript
try {
  await page.goto(url);
} catch (e) {
  Logger.error(`Navigation failed: ${url}`);
  throw new Error(`Cannot navigate to ${url}`);
}
```

### 4. **Assertion Error**
```typescript
expect(result).toBeTruthy();
// Playwright expect automatically takes screenshot
```

---

## Performance Considerations

### 1. **Parallel Execution**
- 4 workers by default (configurable)
- Each worker = separate browser
- No resource contention

### 2. **Wait Strategies**
- Auto-wait: 5-30s depending on action
- No manual `sleep()`
- Reduce flakiness

### 3. **Network**
- `waitLoadState('load')`
- Ensures all network requests complete
- More reliable than fixed waits

### 4. **Timeouts**
```typescript
timeouts = {
  page: 30000,      // Full page load
  element: 10000,   // Element visibility
  assertion: 5000   // Expect assertion
}
```

---

## Scalability Notes

### Current Setup
- 2 feature files
- 11 steps
- 3 browsers
- 4 workers
- ~5-10 minutes total execution time

### Scaling to 100+ Tests
1. **Sharding**: Distribute tests across multiple machines
2. **Filtering**: Run only modified tests in CI
3. **Headless**: Keep HEADED=false for speed
4. **Parallel**: Increase workers if resources available
5. **Caching**: Reuse auth tokens in production tests

### Optimization Ideas
- Use `.storageState()` to reuse login
- Implement test categorization (smoke, regression, etc.)
- Add retry logic for flaky tests
- Use visual regression testing
- Implement data-driven testing with DataTables

---

## Maintenance & Future Enhancements

### Regular Maintenance
- Update selectors when Amazon UI changes (quarterly check)
- Review and update timeouts based on performance
- Clean up recorded videos/screenshots
- Update dependencies (`npm update`)

### Future Features
1. **Video Recording** - Already enabled on failure
2. **Visual Tests** - Screenshot comparison
3. **API Testing** - Combine with API automation
4. **Mobile Testing** - Add mobile viewport
5. **Accessibility Testing** - Add a11y checks
6. **Performance Testing** - Page load metrics
7. **CI/CD Integration** - GitHub Actions, Jenkins

---

## Technology Stack Rationale

| Technology | Why Chosen | Alternative |
|-----------|-----------|-------------|
| Playwright | Fast, modern, multi-browser | Selenium, Puppeteer |
| Cucumber | BDD, readable, business alignment | Jest, Mocha |
| TypeScript | Type safety, better IDE support | JavaScript |
| ts-node | Run TS directly without build | tsc + node |
| dotenv | Environment config management | process.env only |
| Chromium/Firefox/WebKit | Multi-browser support | Chrome-only |

---

**This architecture ensures maintainability, scalability, and robustness for long-term test automation.**
