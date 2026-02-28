# 🤖 Playwright MCP (Model Context Protocol) - AI-Powered Test Generation

This feature allows you to leverage AI to automatically generate Playwright tests from your website. Simply provide the base URL and the system will analyze the website, extract testable elements, and generate starter test cases.

## 📋 Overview

The Playwright MCP system includes:

1. **Website Analyzer** - Scans your website for forms, buttons, links, and elements
2. **Test Generator** - Creates test cases for detected interactions
3. **Page Object Generator** - Generates page object models automatically
4. **Interactive CLI** - Simple interface for generating tests

## 🚀 Quick Start

### Option 1: Using Your BASE_URL from .env (Recommended)

```bash
# The CLI will automatically detect your BASE_URL from .env
npm run mcp:generate

# When prompted, press 'y' to use the BASE_URL from .env
```

### Option 2: Provide URL as Argument

```bash
# Generate tests for a specific URL
npm run mcp:generate https://example.com

# Or for localhost with port
npm run mcp:generate http://localhost:3000
```

### Option 3: Interactive Mode

```bash
npm run mcp:generate
# Then enter the URL when prompted
```

## 📊 What Gets Analyzed

The MCP scanner detects and analyzes:

### **Forms**
- Form IDs and names
- All input fields (text, email, password, etc.)
- Select dropdowns
- Textareas
- Submit buttons

### **Interactive Elements**
- Buttons and their labels
- Links and navigation
- Clickable elements
- Elements with roles

### **Navigation**
- Menu items
- Breadcrumbs
- Tab navigation
- Links with expected destinations

### **Accessibility**
- Page title and meta description
- Language attributes
- Heading hierarchy
- Images with/without alt text

### **Page Structure**
- Header, nav, main, footer presence
- Semantic HTML structure
- Heading hierarchy

## 🎯 Generated Test Cases

For each analyzed website, the MCP generates:

### **1. Basic Load Test**
```typescript
test('should load the page and verify title', async ({ page }) => {
  await page.goto('http://example.com');
  await expect(page).toHaveTitle('...');
});
```

### **2. Form Tests**
```typescript
test('should fill and submit form', async ({ page }) => {
  await page.goto('http://example.com');
  await page.fill('[name="fieldName"]', 'test-value');
  await page.click('button[type="submit"]');
  // Add custom assertions
});
```

### **3. Navigation Tests**
```typescript
test('should navigate through links', async ({ page }) => {
  await page.goto('http://example.com');
  const link = page.locator('a:has-text("Link Text")');
  await expect(link).toBeVisible();
});
```

### **4. Button Interaction Tests**
```typescript
test('should find and interact with buttons', async ({ page }) => {
  await page.goto('http://example.com');
  const button = page.locator('button:has-text("Button Text")');
  await expect(button).toBeVisible();
});
```

### **5. Accessibility Tests**
```typescript
test('should meet basic accessibility requirements', async ({ page }) => {
  await page.goto('http://example.com');
  // Checks title, main content, heading hierarchy
});
```

## 📁 Generated Files

Generated files are placed in your project:

```
tests/
├── ui/
│   └── example-com-generated.spec.ts   # Auto-generated tests
│
src/
└── pages/
    └── example-com-page.ts              # Page Object Model
```

## 🎨 Customizing Generated Tests

After generation, you should:

1. **Review the Generated Tests**
   ```bash
   cat tests/ui/example-com-generated.spec.ts
   ```

2. **Update Selectors**
   - The generated selectors use element names and text
   - Update with data attributes if available
   - Use role-based selectors for better accessibility

3. **Add Data**
   - Replace `'test-value'` with actual test data
   - Add multiple test scenarios
   - Include edge cases

4. **Enhance Assertions**
   - Add expected URLs after navigation
   - Add element visibility checks
   - Add success/error message verification

### Example of Customization

**Before (Auto-generated):**
```typescript
test('should fill and submit form', async ({ page }) => {
  await page.goto('http://example.com');
  
  await page.fill('[name="email"]', 'test-value');
  // ...
  await page.click('button[type="submit"]');
});
```

**After (Customized):**
```typescript
test('should submit login form with valid credentials', async ({ page, testData }) => {
  await page.goto('http://example.com');
  const user = testData.getUser('valid');
  
  await page.fill('[data-testid="email-input"]', user.email);
  await page.fill('[data-testid="password-input"]', user.password);
  
  await page.click('button[type="submit"]');
  
  // Wait for navigation or success indicator
  await expect(page).toHaveURL('**/dashboard');
  await expect(page.locator('text=Welcome')).toBeVisible();
});
```

## 🔄 Workflow Example

### Step 1: Configure Your Environment
```bash
# .env file
BASE_URL=http://localhost:3000
API_BASE_URL=https://api.example.com
```

### Step 2: Generate Initial Tests
```bash
npm run mcp:generate

# Output:
# 🤖 Playwright MCP Test Generator
# ================================
# 
# 📍 Found BASE_URL in .env: http://localhost:3000
#    Use this URL? (y/n): y
# 
# 🔍 Analyzing website...
# ✅ Website Analysis Complete!
# 
# 📊 Page Analysis Results:
#    Title: My Application
#    Forms Found: 2
#    Buttons Found: 5
#    ...
```

### Step 3: Review & Customize
```bash
# Review the generated tests
code tests/ui/localhost-generated.spec.ts

# Edit the page object
code src/pages/localhost-page.ts
```

### Step 4: Run Tests
```bash
# Run the newly generated tests
npm run test:ui

# Or run with UI
npx playwright test --ui
```

## 🛠️ Advanced Usage

### Analyze Website Without Generating Tests

```bash
npm run mcp:analyze
# Returns JSON output of website analysis
```

### Generate Tests from URL Programmatically

```typescript
import {
  analyzeSite,
  saveGeneratedFiles
} from './src/mcp/playwright-mcp-server';

const analysis = await analyzeSite('http://example.com');
const files = await saveGeneratedFiles(analysis);

console.log('Generated files:', files);
```

### Use with Your Test Data

```typescript
import { test } from '../src/fixtures/test-fixtures';

test('should submit form with test data', async ({ page, testData }) => {
  await page.goto(process.env.BASE_URL || '');
  
  const user = testData.getUser('default');
  await page.fill('[name="email"]', user.email);
  await page.fill('[name="password"]', user.password);
  
  await page.click('button[type="submit"]');
});
```

## 📈 Best Practices

### 1. **Always Review Generated Code**
- AI-generated code should be reviewed for correctness
- Verify selectors match your actual HTML
- Add missing assertions

### 2. **Use Data-TestId Attributes**
- Encourage your developers to add `data-testid` attributes
- Makes generated tests more reliable
- Easier to maintain over time

### 3. **Enhance with Custom Fixtures**
```typescript
test('advanced form test', async ({ page, loginPage, testData }) => {
  // Use generated page object with custom fixtures
  await loginPage.goto();
  await loginPage.login(testData.getUser('default'));
});
```

### 4. **Generate Tests Incrementally**
- Generate tests for one page at a time
- Customize and verify before moving to next page
- Build comprehensive test suite gradually

## 🔧 Troubleshooting

### Issue: "Cannot find module 'dotenv'"
```bash
npm install dotenv --save-dev
```

### Issue: "Module not found: ts-node"
```bash
npm install ts-node --save-dev
```

### Issue: Website takes too long to load
```typescript
// Edit src/mcp/playwright-mcp-server.ts
// Increase timeout
await page.goto(baseUrl, { waitUntil: 'domcontentloaded' }); // Change from 'networkidle'
```

### Issue: Generated tests failing on specific page
```bash
# Run with debug output
DEBUG=pw:* npm run test:ui

# Or use headed mode to see what's happening
npx playwright test tests/ui/example-com-generated.spec.ts --headed
```

## 💡 Tips & Tricks

### 1. **Generate Tests for Multiple Pages**
```bash
# Create tests for multiple URLs
npm run mcp:generate http://localhost:3000/login
npm run mcp:generate http://localhost:3000/dashboard
npm run mcp:generate http://localhost:3000/settings
```

### 2. **Use Generated Page Objects in Other Tests**
```typescript
import { ExampleComPage } from '../pages/example-com-page';

test('use generated page object', async ({ page }) => {
  const examplePage = new ExampleComPage(page);
  await examplePage.goto();
  
  expect(await examplePage.isLoaded()).toBe(true);
});
```

### 3. **Extend Generated Page Objects**
```typescript
export class ExampleComPageExtended extends ExampleComPage {
  async loginAs(username: string, password: string) {
    await this.fillForm({ email: username, password });
    await this.submitForm();
  }
}
```

### 4. **Batch Generate with Script**
```bash
#!/bin/bash
# generate-all-tests.sh
npm run mcp:generate http://localhost:3000/home
npm run mcp:generate http://localhost:3000/about
npm run mcp:generate http://localhost:3000/contact
```

## 📚 Related Commands

```bash
# After generating tests
npm run test:ui          # Run UI tests
npm run test:debug       # Debug tests interactively
npx playwright test --ui # Use Playwright UI mode
npm run lint             # Ensure code quality
npm run format           # Format generated code
```

## 🤝 Integration with CI/CD

Add generated test validation to your CI pipeline:

```yaml
# .github/workflows/playwright.yml
- name: Generate and validate tests
  run: npm run mcp:generate && npm run test:ui

- name: Run quality checks on generated tests
  run: npm run lint -- tests/ui/*-generated.spec.ts
```

## 🚀 Next Steps

1. **Configure your BASE_URL** in `.env`
2. **Run** `npm run mcp:generate`
3. **Review** the generated test files
4. **Customize** as needed for your use case
5. **Integrate** into your test suite
6. **Run** your tests with `npm run test:ui`

---

**Pro Tip:** Use this as a starting point for your test suite. Generated tests provide 80% of the value with minimal effort, allowing you to focus on edge cases and business logic testing! 🎯
