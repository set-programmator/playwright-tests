# Playwright MCP Suite: Planner, Generator & Healer

## Overview

The Playwright MCP Suite extends your boilerplate with **three powerful intelligent modules** that automate test planning, generation, and maintenance:

### 🎯 **Planner** - Intelligent Test Planning
Creates comprehensive test plans and strategies by analyzing your website and organizing tests by priority, business impact, and user journeys.

### ⚙️ **Generator** - Advanced Test Generation
Generates parameterized tests, test data variations, fixtures, and reusable components from website analysis.

### 🔧 **Healer** - Automated Test Repair
Scans tests for anti-patterns, flakiness issues, broken selectors, and suggests improvements with auto-fixes.

---

## Quick Start

### Install & Configure
```bash
npm install
npm run mcp:suite
```

### Run Individual Tools

#### 1. Planner - Create Test Plans
```bash
npm run mcp:planner
```

Creates intelligent test plans with:
- Test scenarios (page load, navigation, forms, performance, accessibility)
- User journeys (first-time visitor, form submission, mobile, return visitor)
- Test matrix (cross-browser, cross-device, locales, network conditions)
- Risk assessment with recommendations

**Output:**
```
plans/test-plan-{timestamp}.json
```

#### 2. Generator - Generate Test Artifacts
```bash
npm run mcp:generator
```

Generates:
- **Test Data** - Multiple variations (valid, boundary, invalid, edge cases)
- **Fixtures** - Page, API, User, Auth fixtures
- **Parameterized Tests** - Cross-browser, responsive, navigation tests

**Output:**
```
generated-data/
├── test-data.ts              # Test data sets
├── test-fixtures.ts           # Reusable fixtures
└── parameterized-tests.spec.ts # Parameterized tests
```

#### 3. Healer - Scan & Fix Tests
```bash
npm run mcp:healer
```

Detects and suggests fixes for:
- **Flaky Tests** - Hard-coded delays, race conditions
- **Broken Selectors** - Brittle CSS, index-based selection
- **Timing Issues** - Missing waits, async problems
- **Anti-patterns** - Deprecated APIs, missing fixtures
- **Accessibility Issues** - Non-semantic selectors
- **Best Practices** - Missing tags, poor organization

**Output:**
```
Health Report with:
- Issues by type and severity
- Suggested fixes (auto and manual)
- Best practice violations
- Health score (0-100)
```

#### 4. Full Workflow - All-in-One
```bash
npm run mcp:full
```

Runs Planner → Generator → Healer sequentially and saves all artifacts to a single output directory.

---

## Features in Detail

### 🎯 Planner Features

#### Test Scenarios Generated
1. **Page Load** - Verify fast load, all content visible
2. **Navigation** - Test links and menu navigation
3. **Form Interaction** - Form fields and submission
4. **Button Functionality** - Interactive elements
5. **Accessibility** - WCAG 2.1 AA compliance
6. **Responsive Design** - Mobile, tablet, desktop
7. **Performance** - Core Web Vitals (FCP, LCP, CLS)
8. **Error Handling** - Network errors, validation

#### User Journeys
- **First-Time Visitor Discovery** - Learn value proposition
- **User Takes Action** - Form completion, conversion
- **Mobile Experience** - Touch-friendly navigation
- **Return Visitor** - Personalized experience

#### Test Matrix
- **Browsers**: Chromium, Firefox, WebKit
- **Devices**: Desktop, iPhone 12, Pixel 5, iPad Pro
- **Locales**: en-US, es-ES, fr-FR, de-DE
- **Network**: Fast 4G, Slow 4G, 3G, Offline

#### Risk Assessment
- Identifies critical areas at risk
- Provides remediation recommendations
- Estimates test coverage percentage
- Rates overall risk level

### ⚙️ Generator Features

#### Test Data Variations
Generates 4 variants for each form:
- **Valid Data** - Passes all validations
- **Boundary Data** - Edge values (empty, max length)
- **Invalid Data** - Fails validation
- **Edge Case Data** - Special characters, extreme values

#### Additional Test Data
- Search/filter combinations
- Navigation path combinations
- Button action combinations
- Keyboard navigation (Tab, Enter)
- Performance scenarios (load, cached, large dataset)
- Error scenarios (invalid input, timeouts, 404s)

#### Generated Fixtures
```typescript
// Page fixture - Load page with retry
authenticatedPage

// API fixture - Configured API context
apiContext

// User fixture - Test user with credentials
testUser

// Auth fixture - Logged-in user session
authenticatedUser
```

#### Parameterized Tests
- Cross-browser compatibility tests
- Responsive design tests (mobile, tablet, desktop)
- Link navigation tests
- Button interaction tests
- Each with multiple test cases

### 🔧 Healer Features

#### Issue Detection

| Issue Type | Severity | Example | Fix |
|-----------|----------|---------|-----|
| **Flaky** | Critical | `setTimeout(5000)` | Use `waitForNavigation()` |
| **Broken Selector** | High | Style-based selector | Use `data-testid` |
| **Timeout** | Critical | Missing `waitForLoadState()` | Add proper wait |
| **Async** | Critical | Missing `await` | Add `await` keyword |
| **Performance** | Medium | Excessive `evaluate()` | Use locators |
| **Accessibility** | Medium | Generic tag selectors | Use `getByRole()` |
| **Deprecated** | Medium | `waitFor()` API | Use `waitForSelector()` |

#### Best Practice Violations
- Missing fixtures usage
- Hard-coded delays
- Over-reliance on `evaluate()`
- Not using Playwright expect API
- Tests not organized in describe blocks
- Tests not tagged with @tags

#### Auto-Fixes
- Add missing `await` keywords
- Replace deprecated APIs
- Suggest better selectors
- Add wait methods
- Improve test organization

#### Health Score Calculation
```
Health Score = 100 - (Issues Found × 5)
  100     = Perfect
  80-99   = Good
  60-79   = Fair
  0-59    = Poor - Needs work
```

---

## Tips & Best Practices

### Using Generated Test Data
```typescript
import { testDataSets, getTestDataByTag } from './generated-data/test-data';

// Use all test data
testDataSets.forEach(data => {
  // test with data
});

// Filter by tag
const formTests = getTestDataByTag('form');
const a11yTests = getTestDataByTag('accessibility');
```

### Using Generated Fixtures
```typescript
import { test, expect } from './generated-data/test-fixtures';

test('should work with fixtures', async ({ authenticatedPage }) => {
  await authenticatedPage.goto('/');
  await expect(authenticatedPage.locator('h1')).toBeVisible();
});
```

### Running Parameterized Tests
```bash
# Run all tests
npm run test:ui

# Filter by tag
npm run test:ui -- --grep '@smoke'
npm run test:ui -- --grep '@responsive'
```

### Interpreting Healer Reports

**Critical Issues** (Fix immediately):
- Flaky patterns
- Async/await issues
- Missing waits

**High Issues** (Fix soon):
- Broken selectors
- Accessibility issues

**Medium Issues** (Refactor):
- Performance problems
- Deprecated APIs

**Low Issues** (Nice to have):
- Code organization
- Tagging strategy

---

## Advanced Usage

### Environment Variables
```bash
# Set website URL for analysis
export BASE_URL="https://your-website.com"

# Use with Planner
npm run mcp:planner

# Use with Healer
npm run mcp:healer
```

### Custom Test Directory
```bash
# Scan specific directory
npm run mcp:healer -- --dir=tests/custom
```

### Full Workflow with Custom URL
```bash
# Run all tools with specific website
BASE_URL="https://your-site.com" npm run mcp:full
```

### Analyzing Output Files

**Test Plan JSON Structure:**
```typescript
TestPlan = {
  projectName: string
  baseUrl: string
  totalTests: number
  criticalTests: number
  estimatedDuration: number  // minutes
  scenarios: TestScenario[]
  userJourneys: UserJourney[]
  testMatrix: TestMatrix
  priorities: TestPriority[]
  riskAssessment: RiskAssessment
}
```

**Test Data Structure:**
```typescript
TestData = {
  scenario: string
  inputs: Record<string, any>
  expectedOutput: any
  tags: string[]
}
```

---

## Examples

### Example: Using Planner Output
```typescript
// Import generated plan
import plan from './plans/test-plan-*.json';

test.describe(`Test Suite for ${plan.projectName}`, () => {
  plan.scenarios.forEach(scenario => {
    test(scenario.name, async ({ page }) => {
      // Implement test based on scenario
    });
  });
});
```

### Example: Using Generator Data
```typescript
import { testDataSets } from './generated-data/test-data';

test.describe.each(testDataSets)('Form Testing', (data) => {
  test(`should handle ${data.scenario}`, async ({ page }) => {
    // Fill form with data.inputs
    // Verify data.expectedOutput
  });
});
```

### Example: Fixing From Healer Report
```typescript
// Before (Healer detected issue)
await page.click('button');
await page.fill('input', 'value');

// After (Healer suggested fix)
await page.click('button');
await page.waitForSelector('input'); // Added wait
await page.fill('input', 'value');
```

---

## Troubleshooting

### "Module not found" errors
```bash
# Ensure ts-node is installed
npm install -D ts-node

# Clear compiled outputs
rm -rf /tmp/*.js
```

### Selector suggestions not working
- Ensure Playwright is installed: `npm run setup:install`
- Install browsers: `npx playwright install`
- Run with a real website URL

### Permission denied errors
```bash
# Make scripts executable
chmod +x scripts/mcp-master.ts
```

---

## Next Steps

1. **Review Generated Plans** - Understand test strategy and priorities
2. **Customize Test Data** - Add domain-specific test cases
3. **Fix Critical Issues** - Address Healer's critical findings
4. **Implement Tests** - Use generated tests as templates
5. **Monitor Health** - Run Healer regularly to maintain quality

---

## Integration with CI/CD

### GitHub Actions
```yaml
- name: Generate Test Plan
  run: npm run mcp:planner

- name: Generate Test Artifacts
  run: npm run mcp:generator

- name: Scan Test Health
  run: npm run mcp:healer

- name: Run Tests
  run: npm run test:ui
```

---

## Performance

- **Planner**: ~30 seconds (depends on site complexity)
- **Generator**: ~5 seconds (data generation)
- **Healer**: ~2 seconds (code scanning)
- **Full Suite**: ~45 seconds total

---

## See Also

- [MCP Generator Guide](./MCP_GUIDE.md) - Original AI-powered test generation
- [Quick Start Guide](./MCP_QUICK_START.md) - 1-minute setup
- [Playwright Documentation](https://playwright.dev)
- [Best Practices](./docs/BEST_PRACTICES.md)

---

Happy testing! 🎭
