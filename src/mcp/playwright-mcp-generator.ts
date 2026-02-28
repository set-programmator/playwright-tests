/**
 * Playwright MCP Generator
 * Advanced test code, data, and fixture generation
 * Creates parameterized tests, test data combinations, and fixture variations
 */

import { SiteAnalysisResult } from './playwright-mcp-server';

export interface GeneratorConfig {
  testFramework: 'playwright' | 'jest' | 'mocha';
  dataFormat: 'csv' | 'json' | 'sql';
  includeFixtures: boolean;
  includeParameterized: boolean;
  dataVariations: number;
}

export interface TestData {
  scenario: string;
  inputs: Record<string, any>;
  expectedOutput: any;
  tags: string[];
}

export interface FixtureSet {
  name: string;
  fixtureType: 'page' | 'api' | 'user' | 'auth' | 'data';
  setup: string;
  teardown: string;
  variables: Record<string, any>;
}

export interface ParameterizedTest {
  testName: string;
  testCases: TestCase[];
  baseTest: string;
}

export interface TestCase {
  id: string;
  inputs: Record<string, any>;
  expected: Record<string, any>;
  tags: string[];
}

/**
 * Generate comprehensive test data combinations
 */
export function generateTestData(analysis: SiteAnalysisResult): TestData[] {
  const testDataSets: TestData[] = [];

  // 1. Form Input Combinations
  if (analysis.forms.length > 0) {
    const forms = analysis.forms;
    const inputCombinations = generateInputCombinations(forms, analysis.inputs);
    
    inputCombinations.forEach((combo, index) => {
      testDataSets.push({
        scenario: `Form Input Variation ${index + 1}`,
        inputs: combo,
        expectedOutput: { formSubmitted: true, dataReceived: true },
        tags: ['form', 'data-driven', 'input']
      });
    });
  }

  // 2. Search/Filter Combinations
  if (analysis.inputs.filter(i => i.type === 'search' || i.type === 'text').length > 0) {
    const searchTerms = ['test', 'demo', 'example', '', 'special!@#', '12345'];
    
    searchTerms.forEach(term => {
      testDataSets.push({
        scenario: `Search Query: "${term}"`,
        inputs: { searchQuery: term },
        expectedOutput: { resultsReturned: true, noErrors: true },
        tags: ['search', 'data-driven']
      });
    });
  }

  // 3. Navigation Path Combinations
  if (analysis.links.length > 0) {
    const uniqueHosts = new Set(analysis.links.map(l => {
      try { return new URL(l.href).hostname; } catch { return ''; }
    }));

    Array.from(uniqueHosts).forEach(host => {
      testDataSets.push({
        scenario: `Navigate to ${host}`,
        inputs: { target: host },
        expectedOutput: { navigationSuccess: true },
        tags: ['navigation', 'links']
      });
    });
  }

  // 4. Button Action Combinations
  if (analysis.buttons.length > 0) {
    analysis.buttons.forEach((btn, index) => {
      testDataSets.push({
        scenario: `Button Click: ${btn.text || `Button ${index + 1}`}`,
        inputs: { buttonText: btn.text, buttonType: btn.type },
        expectedOutput: { clicked: true, actionExecuted: true },
        tags: ['button', 'interaction']
      });
    });
  }

  // 5. Accessibility Combinations
  const a11yTests = [
    { scenario: 'Tab Navigation', inputs: { keyPress: 'Tab' }, expectedOutput: { focusVisible: true }, tags: ['accessibility', 'keyboard'] },
    { scenario: 'Enter Key Activation', inputs: { keyPress: 'Enter' }, expectedOutput: { elementActivated: true }, tags: ['accessibility', 'keyboard'] },
    { scenario: 'Screen Reader Test', inputs: { ariaLabel: true }, expectedOutput: { labelFound: true }, tags: ['accessibility', 'aria'] },
    { scenario: 'Color Contrast', inputs: { contrastRatio: true }, expectedOutput: { contrastValid: true }, tags: ['accessibility', 'wcag'] }
  ];

  testDataSets.push(...a11yTests);

  // 6. Performance Test Data
  const perfTests = [
    { scenario: 'Initial Load', inputs: { firstVisit: true }, expectedOutput: { loadTime: { max: 3000 } }, tags: ['performance', 'load'] },
    { scenario: 'Subsequent Load', inputs: { cached: true }, expectedOutput: { loadTime: { max: 1000 } }, tags: ['performance', 'cached'] },
    { scenario: 'Large Dataset', inputs: { records: 1000 }, expectedOutput: { noTimeout: true }, tags: ['performance', 'load'] },
    { scenario: 'Concurrent Requests', inputs: { parallelRequests: 5 }, expectedOutput: { allSucceeded: true }, tags: ['performance', 'concurrent'] }
  ];

  testDataSets.push(...perfTests);

  // 7. Error Handling Data
  const errorTests = [
    { scenario: 'Invalid Email', inputs: { email: 'invalid-email' }, expectedOutput: { validationError: true }, tags: ['validation', 'error'] },
    { scenario: 'Empty Required Field', inputs: { requiredField: '' }, expectedOutput: { validationError: true }, tags: ['validation', 'error'] },
    { scenario: 'Network Timeout', inputs: { simulateTimeout: true }, expectedOutput: { retryAvailable: true }, tags: ['error', 'network'] },
    { scenario: '404 Not Found', inputs: { invalidUrl: true }, expectedOutput: { errorPage: true }, tags: ['error', 'http'] },
    { scenario: '500 Server Error', inputs: { serverError: true }, expectedOutput: { errorMessage: true }, tags: ['error', 'http'] }
  ];

  testDataSets.push(...errorTests);

  return testDataSets;
}

/**
 * Generate input combinations for form fields
 */
function generateInputCombinations(forms: any[], inputs: any[]): Record<string, any>[] {
  const combinations: Record<string, any>[] = [];

  if (forms.length === 0 || inputs.length === 0) return combinations;

  // Create valid data set
  const validData = inputs.reduce((acc, inp) => {
    acc[inp.name || inp.id || 'field'] = generateValidValue(inp.type);
    return acc;
  }, {} as Record<string, any>);

  combinations.push(validData);

  // Create boundary test data
  const boundaryData = inputs.reduce((acc, inp) => {
    acc[inp.name || inp.id || 'field'] = generateBoundaryValue(inp.type);
    return acc;
  }, {} as Record<string, any>);

  combinations.push(boundaryData);

  // Create invalid data set
  const invalidData = inputs.reduce((acc, inp) => {
    acc[inp.name || inp.id || 'field'] = generateInvalidValue(inp.type);
    return acc;
  }, {} as Record<string, any>);

  combinations.push(invalidData);

  // Create edge case data
  const edgeCaseData = inputs.reduce((acc, inp) => {
    acc[inp.name || inp.id || 'field'] = generateEdgeCaseValue(inp.type);
    return acc;
  }, {} as Record<string, any>);

  combinations.push(edgeCaseData);

  return combinations;
}

/**
 * Generate valid test value for input type
 */
function generateValidValue(inputType: string): any {
  const typeMap: Record<string, any> = {
    'email': 'test@example.com',
    'password': 'SecureP@ss123',
    'number': 42,
    'date': '2026-03-01',
    'tel': '+1234567890',
    'url': 'https://example.com',
    'text': 'Sample text input',
    'textarea': 'Multi-line text content\nLine 2',
    'checkbox': true,
    'radio': 'option1',
    'select': 'value1',
    'search': 'search term',
    'color': '#FF5733',
    'range': 50,
    'file': 'test.pdf'
  };

  return typeMap[inputType] || 'test value';
}

/**
 * Generate boundary test value
 */
function generateBoundaryValue(inputType: string): any {
  const typeMap: Record<string, any> = {
    'email': 'a@b.co',
    'password': 'A1',
    'number': 0,
    'date': '1900-01-01',
    'text': 'a',
    'textarea': 'A',
    'checkbox': false,
    'range': 0,
    'file': ''
  };

  return typeMap[inputType] || 'boundary';
}

/**
 * Generate invalid test value
 */
function generateInvalidValue(inputType: string): any {
  const typeMap: Record<string, any> = {
    'email': 'not-an-email',
    'password': '',
    'number': 'abc',
    'date': 'invalid-date',
    'url': 'not a url',
    'tel': 'abc',
    'file': '/etc/passwd',
    'range': 150
  };

  return typeMap[inputType] || '<script>alert("xss")</script>';
}

/**
 * Generate edge case test value
 */
function generateEdgeCaseValue(inputType: string): any {
  const typeMap: Record<string, any> = {
    'text': '                                                                      ', // max spaces
    'textarea': 'A'.repeat(10000), // very long text
    'number': Number.MAX_SAFE_INTEGER,
    'email': 'test+tag@example.co.uk',
    'password': '!@#$%^&*()_+-=[]{}|;:,.<>?',
    'date': '2099-12-31',
    'url': 'https://example.com/path?param1=value1&param2=value2#section'
  };

  return typeMap[inputType] || null;
}

/**
 * Generate fixture sets for test setup
 */
export function generateFixtures(analysis: SiteAnalysisResult): FixtureSet[] {
  const fixtures: FixtureSet[] = [];

  // Page fixture
  fixtures.push({
    name: 'authenticatedPage',
    fixtureType: 'page',
    setup: `
    const page = await browser.newPage();
    await page.goto('${analysis.url}');
    await page.waitForLoadState('networkidle');
    `,
    teardown: `
    await page.close();
    `,
    variables: { url: analysis.url, timeout: 30000 }
  });

  // API fixture
  fixtures.push({
    name: 'apiContext',
    fixtureType: 'api',
    setup: `
    const context = await request.newContext({
      baseURL: '${analysis.url}',
      extraHTTPHeaders: { 'Authorization': 'Bearer token' }
    });
    `,
    teardown: `
    await context.dispose();
    `,
    variables: { baseUrl: analysis.url, timeout: 30000 }
  });

  // User data fixture
  fixtures.push({
    name: 'testUser',
    fixtureType: 'user',
    setup: `
    const testUser = {
      email: 'test@example.com',
      password: 'SecurePassword123',
      name: 'Test User'
    };
    `,
    teardown: `
    // Cleanup test user if needed
    `,
    variables: {
      email: 'test@example.com',
      password: 'SecurePassword123',
      name: 'Test User'
    }
  });

  // Auth fixture
  fixtures.push({
    name: 'authenticatedUser',
    fixtureType: 'auth',
    setup: `
    const auth = await page.goto('${analysis.url}/login');
    await page.fill('[data-testid="email"]', 'test@example.com');
    await page.fill('[data-testid="password"]', 'password');
    await page.click('[data-testid="login-button"]');
    await page.waitForNavigation();
    `,
    teardown: `
    await page.goto('${analysis.url}/logout');
    `,
    variables: { authenticated: true }
  });

  return fixtures;
}

/**
 * Generate parameterized tests
 */
export function generateParameterizedTests(analysis: SiteAnalysisResult): ParameterizedTest[] {
  const paramTests: ParameterizedTest[] = [];

  // Multi-browser test
  paramTests.push({
    testName: 'Cross-Browser Compatibility',
    testCases: [
      {
        id: 'chromium',
        inputs: { browser: 'chromium' },
        expected: { rendered: true, functional: true },
        tags: ['cross-browser', 'chromium']
      },
      {
        id: 'firefox',
        inputs: { browser: 'firefox' },
        expected: { rendered: true, functional: true },
        tags: ['cross-browser', 'firefox']
      },
      {
        id: 'webkit',
        inputs: { browser: 'webkit' },
        expected: { rendered: true, functional: true },
        tags: ['cross-browser', 'webkit']
      }
    ],
    baseTest: `
    test('should work in @browser browser', async ({ browser }) => {
      const page = await browser.newPage();
      await page.goto('${analysis.url}');
      expect(page).toBeDefined();
      await page.close();
    });
    `
  });

  // Multi-device test
  if (analysis.links.length > 0) {
    paramTests.push({
      testName: 'Responsive Design Testing',
      testCases: [
        {
          id: 'mobile',
          inputs: { viewport: { width: 375, height: 667 } },
          expected: { responsiveLayout: true },
          tags: ['responsive', 'mobile']
        },
        {
          id: 'tablet',
          inputs: { viewport: { width: 768, height: 1024 } },
          expected: { responsiveLayout: true },
          tags: ['responsive', 'tablet']
        },
        {
          id: 'desktop',
          inputs: { viewport: { width: 1920, height: 1080 } },
          expected: { responsiveLayout: true },
          tags: ['responsive', 'desktop']
        }
      ],
      baseTest: `
      test('should be responsive on @device device', async ({ page, viewport }) => {
        await page.setViewportSize(viewport.width, viewport.height);
        await page.goto('${analysis.url}');
        expect(await page.locator('main').isVisible()).toBeTruthy();
      });
      `
    });
  }

  // Navigation test combinations
  if (analysis.links.length >= 3) {
    const linkTestCases = analysis.links.slice(0, 5).map((link, idx) => ({
      id: `link-${idx}`,
      inputs: { linkText: link.text, linkHref: link.href },
      expected: { navigated: true, pageLoaded: true },
      tags: ['navigation', 'links']
    }));

    paramTests.push({
      testName: 'Link Navigation Tests',
      testCases: linkTestCases,
      baseTest: `
      test('should navigate via @linkText link', async ({ page, linkUrl }) => {
        await page.goto('${analysis.url}');
        await page.click(\`a[href="\${linkUrl}"]\`);
        await page.waitForNavigation();
        expect(page.url()).toContain(new URL(linkUrl).pathname);
      });
      `
    });
  }

  // Button action combinations
  if (analysis.buttons.length >= 2) {
    const buttonTestCases = analysis.buttons.slice(0, 4).map((btn, idx) => ({
      id: `button-${idx}`,
      inputs: { buttonText: btn.text, buttonType: btn.type },
      expected: { clicked: true },
      tags: ['interaction', 'buttons']
    }));

    paramTests.push({
      testName: 'Button Interaction Tests',
      testCases: buttonTestCases,
      baseTest: `
      test('should interact with @buttonText button', async ({ page, buttonText }) => {
        await page.goto('${analysis.url}');
        const button = page.locator(\`button:has-text("\${buttonText}")\`);
        await expect(button).toBeVisible();
        await button.click();
      });
      `
    });
  }

  return paramTests;
}

/**
 * Generate test data file content
 */
export function generateTestDataFile(testData: TestData[]): string {
  let content = `/**
 * Auto-Generated Test Data
 * ${new Date().toISOString()}
 */

export const testDataSets = [`;

  testData.forEach((data, index) => {
    content += `
  {
    id: 'test-data-${index}',
    scenario: '${data.scenario}',
    inputs: ${JSON.stringify(data.inputs, null, 6)},
    expected: ${JSON.stringify(data.expectedOutput, null, 6)},
    tags: [${data.tags.map(t => `'${t}'`).join(', ')}]
  }${index < testData.length - 1 ? ',' : ''}`;
  });

  content += `
];

export const getTestDataByTag = (tag: string) => {
  return testDataSets.filter(data => data.tags.includes(tag));
};

export const getRandomTestData = () => {
  return testDataSets[Math.floor(Math.random() * testDataSets.length)];
};

export const getTestDataByScenario = (scenario: string) => {
  return testDataSets.find(data => data.scenario === scenario);
};
`;

  return content;
}

/**
 * Generate fixtures file content
 */
export function generateFixturesFile(fixtures: FixtureSet[]): string {
  let content = `/**
 * Auto-Generated Test Fixtures
 * ${new Date().toISOString()}
 */

import { test as base } from '@playwright/test';

export const test = base.extend({`;

  fixtures.forEach((fixture, index) => {
    content += `
  ${fixture.name}: async ({ page }, use) => {
    // Setup
    ${fixture.setup}
    
    // Use fixture
    await use(page);
    
    // Teardown
    ${fixture.teardown}
  }${index < fixtures.length - 1 ? ',' : ''}`;
  });

  content += `
});

export { expect } from '@playwright/test';
`;

  return content;
}

/**
 * Generate parameterized tests file
 */
export function generateParameterizedTestsFile(paramTests: ParameterizedTest[]): string {
  let content = `/**
 * Auto-Generated Parameterized Tests
 * ${new Date().toISOString()}
 */

import { test, expect } from './fixtures';

`;

  paramTests.forEach(paramTest => {
    content += `// ${paramTest.testName}
test.describe('${paramTest.testName}', () => {
  const testCases = [`;

    paramTest.testCases.forEach((tc, idx) => {
      content += `
    {
      id: '${tc.id}',
      inputs: ${JSON.stringify(tc.inputs)},
      expected: ${JSON.stringify(tc.expected)}
    }${idx < paramTest.testCases.length - 1 ? ',' : ''}`;
    });

    content += `
  ];

  testCases.forEach(testCase => {
    test(\`should handle \${testCase.id}\`, async (config) => {
      // Apply inputs and expectations
      // This is a template - customize based on your test needs
    });
  });
});

`;
  });

  return content;
}

/**
 * Format data generation report
 */
export function formatGeneratorReport(data: TestData[], fixtures: FixtureSet[], paramTests: ParameterizedTest[]): string {
  return `
╔════════════════════════════════════════════════════════════╗
║         TEST GENERATOR REPORT                             ║
╚════════════════════════════════════════════════════════════╝

📊 TEST DATA GENERATION
═══════════════════════════════════════════════════════════
Total Test Data Sets: ${data.length}
Data Variants:
${Array.from(new Set(data.flatMap(d => d.tags))).map(tag => `  • ${tag}: ${data.filter(d => d.tags.includes(tag)).length} sets`).join('\n')}

🔧 FIXTURES GENERATED
═══════════════════════════════════════════════════════════
Total Fixtures: ${fixtures.length}
${fixtures.map(f => `  • ${f.name} (${f.fixtureType})`).join('\n')}

⚙️  PARAMETERIZED TESTS
═══════════════════════════════════════════════════════════
Total Test Groups: ${paramTests.length}
Total Test Cases: ${paramTests.reduce((sum, pt) => sum + pt.testCases.length, 0)}
${paramTests.map(pt => `  • ${pt.testName}: ${pt.testCases.length} cases`).join('\n')}

📈 COVERAGE METRICS
═══════════════════════════════════════════════════════════
Scenarios Covered: ${new Set(data.map(d => d.scenario)).size}
Input Types: ${new Set(data.flatMap(d => Object.keys(d.inputs))).size}
Edge Cases: ${data.filter(d => d.tags.includes('boundary') || d.tags.includes('edge')).length}
Error Cases: ${data.filter(d => d.tags.includes('error')).length}

✨ GENERATED FILES
═══════════════════════════════════════════════════════════
• test-data.ts - Test data sets and utilities
• test-fixtures.ts - Reusable test fixtures
• parameterized-tests.spec.ts - Parameterized test templates

═══════════════════════════════════════════════════════════
`;
}
