# Amazon Automation Framework

A comprehensive test automation framework built with **Playwright**, **Cucumber**, and **TypeScript**, implementing the **Page Object Model (POM)** pattern for testing Amazon.in.

## Features

✅ **Page Object Model (POM)** - Clean, maintainable code structure
✅ **Dynamic Element Handling** - Robust locators for dynamic products without Amazon filters
✅ **Parallel Execution** - 4 workers across Chrome, Firefox, and WebKit
✅ **BDD with Cucumber** - Human-readable feature files
✅ **Environment-Based Configuration** - Flexible test data management
✅ **Comprehensive Reporting** - HTML + JSON reports with screenshots on failure
✅ **Mock Credentials** - No real account needed

## Project Structure

```
amazon-automation-framework/
├── features/                          # Gherkin feature files
│   ├── login.feature                 # Login scenario
│   ├── product-search.feature        # Product search scenario
│   └── support/
│       └── steps.ts                  # Cucumber step definitions
├── src/
│   ├── pages/                        # Page Object Models
│   │   ├── BasePage.ts              # Base class with shared methods
│   │   ├── LoginPage.ts             # Login page interactions
│   │   ├── SearchPage.ts            # Search functionality
│   │   └── ProductPage.ts           # Product listing & details
│   ├── fixtures/                    # Test data
│   │   ├── users.ts                 # Mock user credentials
│   │   └── products.ts              # Product fixtures
│   ├── config/
│   │   └── testConfig.ts            # Configuration management
│   ├── hooks/
│   │   └── hooks.ts                 # Cucumber hooks (Before/After)
│   └── utils/
│       ├── dynamicElementHelper.ts  # Dynamic element utilities
│       └── logger.ts                # Logging utilities
├── test-results/                     # Test artifacts
│   ├── html-report/                 # HTML report
│   ├── screenshots/                 # Failure screenshots
│   └── cucumber-report.json         # JSON report
├── playwright.config.ts              # Playwright configuration
├── cucumber.js                       # Cucumber configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
├── .env                              # Environment variables (local copy)
└── .env.example                      # Environment template
```

## Installation

1. **Clone or download the project**
   ```bash
   cd Amazon-EDS
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Verify TypeScript**
   ```bash
   npm run build
   ```

## Configuration

1. **Copy environment template**
   ```bash
   cp .env.example .env
   ```

2. **Update .env file** (optional)
   ```env
   BASE_URL=https://www.amazon.in/
   MOCK_EMAIL=testuser@mock.com
   MOCK_PASSWORD=MockPass123!
   PRODUCT_SEARCH_TERM=Mobile
   PARALLEL_WORKERS=4
   HEADED=false
   CI=false
   ```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run in Headed Mode (Visible Browser)
```bash
npm run test:headed
```

### Run with Debugging
```bash
npm run test:debug
```

### Run Specific Feature
```bash
npx cucumber-js features/login.feature
```

### Generate Report
```bash
npm run test:report
```

## Test Scenarios

### 1. Login Scenario (`features/login.feature`)
- Navigate to Amazon
- Click Sign In
- Enter mock credentials
- Verify login success

### 2. Product Search Scenario (`features/product-search.feature`)
- Navigate to Amazon
- Search for "Mobile"
- Extract all products and prices
- Find lowest price product
- Find highest price product
- Click each product and extract "About this item" details in new tab

## Dynamic Element Handling

The framework uses **Playwright's native dynamic element handling**:

- **Text-based filtering**: `locator.filter({ hasText: /pattern/ })`
- **Role-based selectors**: `getByRole()`, `getByLabel()`
- **Auto-waiting**: Built-in retry logic (no manual sleeps)
- **Price extraction**: Regex-based currency symbol handling (₹)
- **Locator chaining**: Combining multiple conditions with `and()` / `or()`

## Page Object Model Implementation

### BasePage
- Common navigation and waiting methods
- Shared locator strategies
- Screenshot capture utilities

### LoginPage (extends BasePage)
- Email/password input handling
- Login button interactions
- Login success verification

### SearchPage (extends BasePage)
- Product search functionality
- Result validation
- Search summary extraction

### ProductPage (extends BasePage)
- Dynamic product listing extraction
- Lowest/highest price product identification
- Product detail page navigation
- "About this item" details extraction
- New tab handling

## Parallel Execution

- **4 workers** by default (configurable)
- **3 browsers**: Chrome, Firefox, WebKit
- **Automatic test sharding**: Each worker runs independent tests
- **No shared state**: Each test runs in isolated context

## Logging

Color-coded console logging for better debugging:
- `[INFO]` - Blue
- `[SUCCESS]` - Green
- `[WARN]` - Yellow
- `[ERROR]` - Red

Example:
```
[INFO] Navigating to Amazon...
[SUCCESS] Amazon homepage loaded
[INFO] Searching for product: Mobile
[SUCCESS] Product list ready
```

## Reporting

After test execution, reports are available in:

- **HTML Report**: `test-results/html-report/index.html`
- **JSON Report**: `test-results/cucumber-report.json`
- **Screenshots**: `test-results/screenshots/` (on failure)
- **Videos**: Captured on failure (Playwright)

## Troubleshooting

### Issue: Tests fail with "Locator not found"
- **Solution**: Update selectors in `TestConfig.selectors` for Amazon UI changes

### Issue: Parallel tests interfere with each other
- **Solution**: Each test runs in isolated browser context (no shared state)

### Issue: Amazon blocks automated access
- **Solution**: Use mock credentials, add delays in `TestConfig.slowMo`, or throttle parallel workers

### Issue: New tab not opening
- **Solution**: Verify product link opens new tab; fallback selectors available in ProductPage

## Best Practices Implemented

✅ **DRY Code** - Shared functionality in BasePage and utils
✅ **Type Safety** - Full TypeScript typing
✅ **Error Handling** - Try-catch with meaningful logging
✅ **Wait Strategies** - Playwright auto-wait with explicit waits
✅ **Readable Tests** - BDD-style feature files
✅ **Maintainability** - Centralized selectors and config
✅ **Scalability** - Easy to add new pages and tests

## Environment Variables Reference

| Variable | Default | Purpose |
|----------|---------|---------|
| `BASE_URL` | `https://www.amazon.in/` | Target website URL |
| `MOCK_EMAIL` | `testuser@mock.com` | Test user email |
| `MOCK_PASSWORD` | `MockPass123!` | Test user password |
| `PRODUCT_SEARCH_TERM` | `Mobile` | Default search term |
| `PARALLEL_WORKERS` | `4` | Number of parallel test workers |
| `HEADED` | `false` | Run in headed mode (visible browser) |
| `SLOW_MO` | `0` | Slow down actions (ms) |
| `CI` | `false` | CI environment flag |

## Next Steps

1. **Run tests**: `npm test`
2. **View HTML report**: `npm run test:report`
3. **Add new features**: Create `.feature` files and step definitions
4. **Extend page objects**: Add new pages extending `BasePage`
5. **Configure CI/CD**: Integrate with GitHub Actions, Jenkins, etc.

## License

ISC

## Author

Automation Framework Team
