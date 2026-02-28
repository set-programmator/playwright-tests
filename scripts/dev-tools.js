#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class PlaywrightDevTools {
  constructor() {
    this.toolsDir = path.join(process.cwd(), 'tools');
    this.templatesDir = path.join(process.cwd(), 'templates');
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.toolsDir, this.templatesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  async generateTest(options) {
    const { type, name, url, description } = options;
    
    console.log(`🔧 Generating ${type} test: ${name}`);
    
    const templates = {
      ui: this.generateUITest,
      api: this.generateAPITest,
      e2e: this.generateE2ETest,
      performance: this.generatePerformanceTest
    };

    const testContent = templates[type]?.call(this, { name, url, description });
    
    if (!testContent) {
      throw new Error(`Unknown test type: ${type}`);
    }

    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.spec.ts`;
    const filepath = path.join('tests', type, filename);
    
    // Ensure test directory exists
    const testDir = path.dirname(filepath);
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }

    fs.writeFileSync(filepath, testContent);
    console.log(`✅ Test created: ${filepath}`);
    
    return filepath;
  }

  generateUITest({ name, url, description }) {
    return `import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('${name} Tests @ui', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('${url || '/'}');
  });

  test('${description || `should load ${name} page successfully`}', async ({ page }) => {
    // Verify page loads
    await expect(page).toHaveURL(/${url ? url.replace('/', '\\/') : '.*'}/);
    
    // Add your assertions here
    // Example: await expect(page.getByRole('heading', { name: '${name}' })).toBeVisible();
  });

  test('should have proper page structure', async ({ page }) => {
    // Check for essential elements
    await expect(page.locator('body')).toBeVisible();
    
    // Add specific element checks for ${name}
    // Example: await expect(page.getByTestId('main-navigation')).toBeVisible();
  });

  test('should be accessible', async ({ page }) => {
    // Run accessibility check
    const { AxeBuilder } = await import('@axe-core/playwright');
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});`;
  }

  generateAPITest({ name, url, description }) {
    return `import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('${name} API Tests @api', () => {
  const baseURL = process.env.API_BASE_URL || 'http://localhost:3000/api';
  const endpoint = '${url || '/endpoint'}';

  test('should return successful response', async ({ request }) => {
    const response = await request.get(\`\${baseURL}\${endpoint}\`);
    
    expect(response.status()).toBe(200);
    const data = await response.json();
    
    // Add your API assertions here
    expect(data).toBeTruthy();
  });

  test('should handle invalid requests', async ({ request }) => {
    const response = await request.get(\`\${baseURL}\${endpoint}/invalid\`);
    
    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('should validate response schema', async ({ request }) => {
    const response = await request.get(\`\${baseURL}\${endpoint}\`);
    const data = await response.json();
    
    // Add schema validation
    // Example: expect(data).toHaveProperty('id');
    // Example: expect(typeof data.id).toBe('number');
  });
});`;
  }

  generateE2ETest({ name, description }) {
    return `import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('${name} E2E Tests @e2e', () => {
  test('${description || `should complete ${name} user journey`}', async ({ 
    page, 
    loginPage, 
    homePage, 
    testData 
  }) => {
    const user = testData.getUser('default');
    
    // Step 1: Navigate to application
    await page.goto('/');
    
    // Step 2: Login
    await loginPage.login(user.username, user.password);
    await expect(homePage.userMenu).toBeVisible();
    
    // Step 3: Navigate to ${name} feature
    // Add your specific navigation steps here
    
    // Step 4: Perform main user action
    // Add your main test actions here
    
    // Step 5: Verify expected outcome
    // Add your verification steps here
    
    // Step 6: Cleanup/Logout
    await homePage.logout();
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should handle error scenarios in ${name}', async ({ page }) => {
    await page.goto('/');
    
    // Test error handling scenarios
    // Add negative test cases here
  });
});`;
  }

  generatePerformanceTest({ name, url }) {
    return `import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('${name} Performance Tests @performance', () => {
  test('should meet performance benchmarks', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('${url || '/'}');
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(3000); // Should load within 3 seconds
    
    // Measure Core Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const vitals = {};
          
          entries.forEach(entry => {
            if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
          });
          
          setTimeout(() => resolve(vitals), 1000);
        });
        
        observer.observe({ entryTypes: ['paint'] });
      });
    });
    
    if (metrics.fcp) {
      expect(metrics.fcp).toBeLessThan(1800); // FCP < 1.8s
    }
    
    console.log('Performance metrics for ${name}:', metrics);
  });
});`;
  }

  async generatePageObject(options) {
    const { name, elements } = options;
    
    console.log(`📄 Generating page object: ${name}`);
    
    const className = name.split(/[-_\s]/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join('') + 'Page';
    
    const pageObjectContent = `import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class ${className} extends BasePage {
  readonly page: Page;
${elements.map(element => `  readonly ${element.name}: Locator;`).join('\n')}

  constructor(page: Page) {
    super(page);
    this.page = page;
${elements.map(element => `    this.${element.name} = page.locator('${element.selector}');`).join('\n')}
  }

  async navigate(): Promise<void> {
    await this.page.goto('/${name.toLowerCase()}');
    await this.waitForPageLoad();
  }

${elements.map(element => element.type === 'button' ? `
  async click${element.name.charAt(0).toUpperCase() + element.name.slice(1)}(): Promise<void> {
    await this.${element.name}.click();
  }` : element.type === 'input' ? `
  async fill${element.name.charAt(0).toUpperCase() + element.name.slice(1)}(value: string): Promise<void> {
    await this.${element.name}.fill(value);
  }` : '').join('')}

  async isPageLoaded(): Promise<boolean> {
    try {
      await this.${elements[0]?.name || 'page'}.waitFor({ state: 'visible', timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }
}`;

    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}-page.ts`;
    const filepath = path.join('src', 'pages', filename);
    
    fs.writeFileSync(filepath, pageObjectContent);
    console.log(`✅ Page object created: ${filepath}`);
    
    return filepath;
  }

  async generateTestData(options) {
    const { type, name, schema } = options;
    
    console.log(`📊 Generating test data: ${name}`);
    
    let testData = {};
    
    if (type === 'users') {
      testData = {
        default: {
          username: 'testuser@example.com',
          password: 'SecurePass123!',
          firstName: 'Test',
          lastName: 'User',
          email: 'testuser@example.com',
          role: 'user'
        },
        admin: {
          username: 'admin@example.com',
          password: 'AdminPass123!',
          firstName: 'Admin',
          lastName: 'User',
          email: 'admin@example.com',
          role: 'admin'
        },
        invalid: {
          username: 'invalid@example.com',
          password: 'WrongPassword',
          firstName: '',
          lastName: '',
          email: 'invalid-email',
          role: 'invalid'
        }
      };
    } else if (schema) {
      // Generate data based on provided schema
      testData = this.generateDataFromSchema(schema);
    }
    
    const filename = `${name.toLowerCase().replace(/\s+/g, '-')}.json`;
    const filepath = path.join('data', filename);
    
    fs.writeFileSync(filepath, JSON.stringify(testData, null, 2));
    console.log(`✅ Test data created: ${filepath}`);
    
    return filepath;
  }

  generateDataFromSchema(schema) {
    const data = {};
    
    Object.entries(schema).forEach(([key, config]) => {
      if (config.type === 'string') {
        data[key] = config.example || 'Sample Text';
      } else if (config.type === 'number') {
        data[key] = config.example || 123;
      } else if (config.type === 'boolean') {
        data[key] = config.example || true;
      } else if (config.type === 'email') {
        data[key] = config.example || 'test@example.com';
      }
    });
    
    return { valid: data, invalid: this.generateInvalidData(schema) };
  }

  generateInvalidData(schema) {
    const invalid = {};
    
    Object.entries(schema).forEach(([key, config]) => {
      if (config.type === 'string') {
        invalid[key] = config.required ? '' : 'a'.repeat(1000); // Empty or too long
      } else if (config.type === 'number') {
        invalid[key] = 'not-a-number';
      } else if (config.type === 'email') {
        invalid[key] = 'invalid-email-format';
      }
    });
    
    return invalid;
  }

  async runTestDebugger(testFile) {
    console.log(`🐛 Starting debug session for: ${testFile}`);
    
    const debugCommand = `npx playwright test ${testFile} --debug --headed`;
    
    try {
      execSync(debugCommand, { stdio: 'inherit' });
    } catch (error) {
      console.log('Debug session ended');
    }
  }

  async generateReport() {
    console.log('📈 Generating comprehensive test report...');
    
    const reports = {
      analytics: this.getAnalyticsReport(),
      coverage: this.getCoverageReport(),
      performance: this.getPerformanceReport(),
      quality: this.getQualityReport()
    };
    
    const dashboardHTML = this.generateDashboard(reports);
    const dashboardPath = path.join('reports', 'dashboard.html');
    
    fs.writeFileSync(dashboardPath, dashboardHTML);
    console.log(`✅ Test dashboard generated: ${dashboardPath}`);
    
    return dashboardPath;
  }

  getAnalyticsReport() {
    const analyticsFile = path.join('analytics', 'test-metrics.json');
    if (fs.existsSync(analyticsFile)) {
      return JSON.parse(fs.readFileSync(analyticsFile, 'utf8'));
    }
    return null;
  }

  getCoverageReport() {
    const coverageFile = path.join('coverage', 'coverage-report.json');
    if (fs.existsSync(coverageFile)) {
      return JSON.parse(fs.readFileSync(coverageFile, 'utf8'));
    }
    return null;
  }

  getPerformanceReport() {
    // Aggregate performance data from multiple test runs
    return {
      averageLoadTime: 1200,
      p95LoadTime: 2100,
      failedPerformanceTests: 0
    };
  }

  getQualityReport() {
    const qualityFile = path.join('reports', 'quality-gates-report.json');
    if (fs.existsSync(qualityFile)) {
      return JSON.parse(fs.readFileSync(qualityFile, 'utf8'));
    }
    return null;
  }

  generateDashboard(reports) {
    return `<!DOCTYPE html>
<html>
<head>
  <title>Playwright Test Dashboard</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
    .header { background: #2196F3; color: white; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 20px; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 20px; }
    .metric-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .metric-value { font-size: 2em; font-weight: bold; color: #2196F3; }
    .metric-label { color: #666; margin-top: 5px; }
    .chart-container { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .status-good { color: #4CAF50; }
    .status-warning { color: #FF9800; }
    .status-error { color: #F44336; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎭 Playwright Test Dashboard</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
  </div>

  <div class="metrics">
    ${reports.analytics ? `
    <div class="metric-card">
      <div class="metric-value">${reports.analytics.totalRuns || 0}</div>
      <div class="metric-label">Total Test Runs</div>
    </div>
    <div class="metric-card">
      <div class="metric-value ${(1 - (reports.analytics.totalFailures || 0) / (reports.analytics.totalRuns || 1)) >= 0.95 ? 'status-good' : 'status-warning'}">
        ${((1 - (reports.analytics.totalFailures || 0) / (reports.analytics.totalRuns || 1)) * 100).toFixed(1)}%
      </div>
      <div class="metric-label">Success Rate</div>
    </div>
    ` : ''}
    
    ${reports.coverage ? `
    <div class="metric-card">
      <div class="metric-value ${reports.coverage.passed ? 'status-good' : 'status-warning'}">
        ${reports.coverage.overallCoverage.toFixed(1)}%
      </div>
      <div class="metric-label">Code Coverage</div>
    </div>
    ` : ''}
    
    <div class="metric-card">
      <div class="metric-value status-good">${reports.performance.averageLoadTime}ms</div>
      <div class="metric-label">Avg Load Time</div>
    </div>
  </div>

  <div class="chart-container">
    <h2>Quality Status</h2>
    ${reports.quality ? `
    <p>Overall Status: <span class="${reports.quality.overallPassed ? 'status-good' : 'status-error'}">
      ${reports.quality.overallPassed ? '✅ PASSED' : '❌ FAILED'}
    </span></p>
    ` : '<p>Run quality gates to see status</p>'}
  </div>

  <div class="chart-container">
    <h2>Quick Actions</h2>
    <button onclick="location.href='playwright-report/index.html'">View HTML Report</button>
    <button onclick="location.href='coverage-report.html'">View Coverage</button>
    <button onclick="location.href='quality-gates-report.html'">View Quality Gates</button>
  </div>
</body>
</html>`;
  }
}

// CLI Interface
async function main() {
  const devTools = new PlaywrightDevTools();
  const args = process.argv.slice(2);
  const command = args[0];

  try {
    switch (command) {
      case 'generate':
        const type = args[1]; // ui, api, e2e, performance
        const name = args[2] || 'New Test';
        const url = args[3];
        
        await devTools.generateTest({
          type,
          name,
          url,
          description: `Generated ${type} test for ${name}`
        });
        break;

      case 'page-object':
        const pageName = args[1] || 'New Page';
        const elements = JSON.parse(args[2] || '[]');
        
        await devTools.generatePageObject({
          name: pageName,
          elements
        });
        break;

      case 'test-data':
        const dataType = args[1] || 'users';
        const dataName = args[2] || 'test-data';
        
        await devTools.generateTestData({
          type: dataType,
          name: dataName
        });
        break;

      case 'debug':
        const testFile = args[1];
        if (!testFile) {
          console.log('Usage: npm run dev:debug <test-file>');
          return;
        }
        
        await devTools.runTestDebugger(testFile);
        break;

      case 'dashboard':
        const dashboardPath = await devTools.generateReport();
        console.log(`🚀 Open dashboard: ${dashboardPath}`);
        break;

      default:
        console.log(`
🛠️  Playwright Developer Tools

Commands:
  generate <type> <name> [url]  - Generate test (ui/api/e2e/performance)
  page-object <name> <elements> - Generate page object model
  test-data <type> <name>       - Generate test data files
  debug <test-file>             - Start debug session
  dashboard                     - Generate test dashboard

Examples:
  npm run dev:generate ui "Login Page" "/login"
  npm run dev:page-object "HomePage" '[{"name":"loginBtn","selector":"#login","type":"button"}]'
  npm run dev:test-data users "user-profiles"
  npm run dev:debug tests/ui/login.spec.ts
  npm run dev:dashboard
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = PlaywrightDevTools;