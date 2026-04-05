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
