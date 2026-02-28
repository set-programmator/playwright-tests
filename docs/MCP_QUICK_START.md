# 🚀 Playwright MCP Quick Reference

## One-Minute Setup

### 1. **Make sure your .env is configured**
```bash
BASE_URL=http://localhost:3000
API_BASE_URL=https://api.yourapp.com
```

### 2. **Run the MCP test generator**
```bash
npm run mcp:generate
```

### 3. **Press 'y' when asked to use BASE_URL**
```
📍 Found BASE_URL in .env: http://localhost:3000
   Use this URL? (y/n): y
```

### 4. **Wait for analysis**
The system will:
- 🔍 Open your website
- 📊 Analyze all forms, buttons, and elements
- 📝 Generate test files
- 💾 Save to `tests/ui/` and `src/pages/`

### 5. **Review generated tests**
```bash
# Check the generated test file
code tests/ui/localhost-3000-generated.spec.ts

# Check the generated page object
code src/pages/localhost-3000-page.ts
```

### 6. **Run the tests**
```bash
npm run test:ui
```

## All Available MCP Commands

```bash
# Interactive mode (recommended)
npm run mcp:generate

# Provide URL as argument
npm run mcp:generate https://example.com

# Analyze website without generating tests
npm run mcp:analyze

# Run tests with UI mode to see them in action
npx playwright test --ui
```

## What Gets Generated

### **Test File** (`tests/ui/localhost-3000-generated.spec.ts`)
- ✅ Page load test
- ✅ Form filling test (if forms exist)
- ✅ Navigation test (if links exist)
- ✅ Button interaction test (if buttons exist)
- ✅ Accessibility test

### **Page Object** (`src/pages/localhost-3000-page.ts`)
- 📍 Page selectors
- 🎯 Navigation methods
- 📋 Form filling methods
- ♿ Accessibility checks

## Customization Checklist

After generation, customize by:

- [ ] Review selectors match your HTML
- [ ] Update test data (replace 'test-value')
- [ ] Add expected assertions
- [ ] Add error scenario tests
- [ ] Update Page Object with custom methods
- [ ] Run tests to verify they pass
- [ ] Commit to git

## Common Customizations

### Change Selector
```typescript
// Before (auto-generated)
await page.fill('[name="email"]', 'test@example.com');

// After (improved)
await page.fill('[data-testid="email-input"]', 'test@example.com');
```

### Add Data-Driven Tests
```typescript
// Use test data from fixtures
const user = testData.getUser('default');
await page.fill('[name="email"]', user.email);
```

### Add Expected Outcomes
```typescript
// Before (auto-generated)
await page.click('button[type="submit"]');

// After (with assertion)
await page.click('button[type="submit"]');
await expect(page).toHaveURL('**/success');
```

## Integration with Your Test Suite

```typescript
// Use in other test files
import { LocalhostPage } from '../pages/localhost-3000-page';

test('use generated page object', async ({ page }) => {
  const app = new LocalhostPage(page);
  await app.goto();
  // Now use app's methods for interactions
});
```

## Workflow: Adding New Features

1. **New feature added to app**
   ```bash
   npm run mcp:generate http://localhost:3000
   ```

2. **Review generated tests for new feature**

3. **Customize as needed**
   ```bash
   code tests/ui/localhost-3000-generated.spec.ts
   ```

4. **Run tests**
   ```bash
   npm run test:ui
   ```

5. **Commit changes**
   ```bash
   git add tests/ src/pages/
   git commit -m "Add tests for new feature"
   ```

## Troubleshooting

### Website not loading?
- Make sure BASE_URL is running
- Check if port is correct
- Allow extra time: `await page.waitForLoadState()`

### Selectors not found?
- Use data-testid attributes for reliability
- Check browser console for errors
- Run headless: `npx playwright test --headed`

### Tests timing out?
- Increase timeout in playwright.config.ts
- Add `.waitForLoadState('networkidle')`
- Reduce parallelization: `--workers=1`

## Environment Variables Reference

```env
# Required for MCP
BASE_URL=http://localhost:3000

# Optional but recommended
API_BASE_URL=https://api.yourapp.com    # For API tests
TEST_USERNAME=test@example.com            # For login tests
TEST_PASSWORD=SecurePassword123!          # For login tests

# Testing
PARALLEL_WORKERS=4                        # Number of parallel tests
TEST_TIMEOUT=30000                        # Test timeout in ms
```

## Next Steps

- 📖 Read [MCP_GUIDE.md](./MCP_GUIDE.md) for detailed documentation
- 🎮 Run in interactive mode: `npx playwright test --ui`
- 🔧 Customize generated files for your use case
- 📊 Check results with: `npm run test:headed`

---

**That's it!** You now have basic tests for your application. Just customize and add more! 🚀
