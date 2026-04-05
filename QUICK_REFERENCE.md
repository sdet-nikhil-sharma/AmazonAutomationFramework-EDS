# 🎬 Quick Reference Card

## Most Used Commands

```bash
# Run all tests
npm test

# Run in headless mode (default)
npm test

# Run with visible browser
npm run test:headed

# Verify feature parsing
npm test -- --dry-run

# View HTML report
npm run test:report

# TypeScript check
npm run build
```

---

## File Locations Reference

```
Adding New Tests:
  → features/newtest.feature
  
Adding New Page:
  → src/pages/NewPage.ts
  
Updating Selectors:
  → src/config/testConfig.ts → TestConfig.selectors
  
Adding Test Data:
  → src/fixtures/newdata.ts
  
Changing Login Credentials:
  → .env → MOCK_EMAIL, MOCK_PASSWORD
  
Changing Search Term:
  → .env → PRODUCT_SEARCH_TERM
  
Enable Headed Mode:
  → .env → HEADED=true
```

---

## Folder Purpose Quick Guide

```
features/          → Gherkin scenarios (human-readable)
src/pages/         → Page interactions (LoginPage, SearchPage, etc.)
src/fixtures/      → Test data (mock users, products)
src/config/        → Configuration (timeouts, selectors, env vars)
src/hooks/         → Cucumber lifecycle (setup/teardown)
src/utils/         → Helper functions (logging, price extraction)
test-results/      → Generated reports and screenshots
```

---

## Common Tasks

### Add a New Test Scenario
1. Create `features/mycars.feature`
2. Add steps to `features/support/steps.ts`
3. Create `src/pages/CarPage.ts`
4. Run: `npm test`

### Update Amazon Selectors
1. Open `src/config/testConfig.ts`
2. Find `TestConfig.selectors`
3. Update selector string
4. Tests automatically use new selector

### Change Test Data
1. Edit `.env` file
2. Or create new fixture in `src/fixtures/`
3. Import in step definitions
4. Use in steps

### Debug a Failing Test
1. Run: `npm run test:headed`
2. Watch browser execute
3. Check console logs (colored output)
4. View screenshot: `test-results/screenshots/`

### Run Single Feature
```bash
npx cucumber-js features/login.feature
```

---

## Code Templates

### New Page Object
```typescript
import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export class MyPage extends BasePage {
  readonly element: Locator;

  constructor(page: Page) {
    super(page);
    this.element = page.locator('[selector]');
  }

  async myMethod() {
    await this.element.click();
  }
}
```

### New Step
```typescript
When('I do something', async function(this: CustomWorld) {
  const page = new MyPage(this.page!);
  await page.myMethod();
});
```

### New Feature File
```gherkin
Feature: My Feature
  
  Scenario: My scenario
    Given I start
    When I do something
    Then I verify result
```

---

## Debugging Tips

| Issue | Solution |
|-------|----------|
| Test slow | Set `SLOW_MO=500` in .env to see actions |
| Not finding element | Use headed mode to see browser |
| Firefox only | Run: `npx cucumber-js --profiles firefox` |
| See more logs | Already color-coded, check console |
| Parallel interference | Each test isolated, shouldn't interfere |
| Need help | Check QUICKSTART.md or ARCHITECTURE.md |

---

## Environment Variables Cheatsheet

```env
BASE_URL=https://www.amazon.in/          # Target website
MOCK_EMAIL=testuser@mock.com             # Login email
MOCK_PASSWORD=MockPass123!               # Login password
PRODUCT_SEARCH_TERM=Mobile               # Search term
PARALLEL_WORKERS=4                       # Number of workers (1-8)
HEADED=false                             # Show browser (true/false)
SLOW_MO=0                                # Delay between actions (ms)
CI=false                                 # CI environment (true/false)
```

---

## Performance Expectations

```
Single Scenario:
  - Headed mode: ~2-3 minutes
  - Headless mode: ~1-2 minutes
  
Both Scenarios:
  - Sequential: ~5-10 minutes
  - Parallel (4 workers): ~2-3 minutes
  
Full Suite (4 workers × 3 browsers):
  - Total: ~5-10 minutes
  - Per browser: ~2-3 minutes
```

---

## Success Indicators

```
✓ TypeScript: npm run build → No errors
✓ Features: npm test -- --dry-run → 2 scenarios, 11 steps
✓ Tests run: npm test → Execution starts normally
✓ Reports: test-results/cucumber-report.html → Exists
✓ Logs: Console output → Color-coded [SUCCESS], [ERROR], etc.
```

---

## Troubleshooting Flowchart

```
Tests failing?
  ├─ npm test -- --dry-run
  │  └─ Steps matching? → Yes: Go to "Run with headed"
  │                     → No: Check steps.ts imports
  │
  ├─ Run with headed mode
  │  └─ npm run test:headed
  │     └─ See what's happening? → Check selectors if wrong
  │
  ├─ Check logs
  │  └─ Colors? Green [SUCCESS], Red [ERROR]
  │     → Use for debugging
  │
  └─ View screenshot
     └─ test-results/screenshots/
        → See exactly what failed
```

---

## Performance Tuning

```
To speed up tests:
  - Reduce PARALLEL_WORKERS if flaky
  - Set SLOW_MO=0 (already default)
  - Use headless mode (already default)
  - Run only needed browsers

To debug tests:
  - Set HEADED=true
  - Set SLOW_MO=1000
  - Use npm run test:debug
  - Check color-coded logs

To scale to 100 tests:
  - Sharding: Run on multiple machines
  - Parallel: Increase workers to 8-10
  - Filters: Run only modified tests
  - Caching: Reuse authentication tokens
```

---

## File Structure at a Glance

```
amazon-automation-framework/
├── 📄 START_HERE.md ← You are here
├── 📄 README.md ← Full documentation
├── 📄 QUICKSTART.md ← 5-minute setup
├── 📄 ARCHITECTURE.md ← Design patterns
│
├── 📁 features/ ← Test scenarios
│   ├── login.feature
│   ├── product-search.feature
│   └── support/steps.ts
│
├── 📁 src/
│   ├── pages/ ← Page objects
│   ├── config/ ← Configuration
│   ├── fixtures/ ← Test data
│   ├── hooks/ ← Setup/teardown
│   └── utils/ ← Helpers
│
├── playwright.config.ts ← Playwright config
├── cucumber.js ← Cucumber config
├── .env ← Your settings (git-ignored)
└── package.json ← Dependencies
```

---

## 🎯 30-Second Quick Start

```bash
# 1. Verify (10 seconds)
npm test -- --dry-run

# 2. Run (5-10 minutes)
npm test

# 3. View Results (5 seconds)
npm run test:report
```

---

## Key Contacts

- **Error Handling**: Check `src/pages/*.ts` for try-catch blocks
- **Logging**: See `src/utils/logger.ts` for color codes
- **Selectors**: Update `src/config/testConfig.ts` if Amazon UI changes
- **Test Data**: Modify `.env` file for local testing
- **Documentation**: Start with `README.md`, then `ARCHITECTURE.md`

---

**Status**: ✅ Ready to test
**Command**: `npm test`
**Time**: ~5-10 minutes

---
