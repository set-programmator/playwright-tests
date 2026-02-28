import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Playwright MCP Server for AI-Driven Test Generation
 * Analyzes website and generates Playwright test cases
 */

export interface SiteAnalysisResult {
  url: string;
  title: string;
  forms: FormElement[];
  buttons: ButtonElement[];
  links: LinkElement[];
  inputs: InputElement[];
  navigation: NavigationElement[];
  interactiveElements: InteractiveElement[];
  accessibility: AccessibilityInfo;
  pageStructure: PageStructure;
}

export interface FormElement {
  id?: string;
  name?: string;
  fields: string[];
  submitButton?: string;
}

export interface ButtonElement {
  text: string;
  type: string;
  ariaLabel?: string;
}

export interface LinkElement {
  text: string;
  href: string;
  ariaLabel?: string;
}

export interface InputElement {
  type: string;
  name?: string;
  id?: string;
  placeholder?: string;
  ariaLabel?: string;
}

export interface NavigationElement {
  type: 'menu' | 'breadcrumb' | 'tabs';
  items: string[];
}

export interface InteractiveElement {
  type: string;
  selector?: string;
  description?: string;
}

export interface AccessibilityInfo {
  hasTitle: boolean;
  hasMetaDescription: boolean;
  hasLang: boolean;
  headingsPresent: boolean;
  imagesWithAlt: number;
  imagesWithoutAlt: number;
}

export interface PageStructure {
  hasHeader: boolean;
  hasNav: boolean;
  hasMain: boolean;
  hasFooter: boolean;
  headingHierarchy: string[];
}

/**
 * Analyze a website and extract testable elements
 */
export async function analyzeSite(baseUrl: string): Promise<SiteAnalysisResult> {
  let browser: any = null;
  let context: any = null;

  try {
    browser = await chromium.launch();
    context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(baseUrl, { waitUntil: 'networkidle' });

    // Wait for page to stabilize
    await page.waitForLoadState('networkidle');

    const analysis = await page.evaluate(() => {
      // Forms
      const forms = Array.from(document.querySelectorAll('form')).map((form: any) => ({
        id: form.id,
        name: form.name,
        fields: Array.from(form.querySelectorAll('input, textarea, select')).map(
          (field: any) => field.name || field.id || field.type
        ),
        submitButton: form.querySelector('button[type="submit"]')?.textContent || 'Submit'
      }));

      // Buttons
      const buttons = Array.from(document.querySelectorAll('button, input[type="button"]')).map(
        (btn: any) => ({
          text: btn.textContent?.trim() || btn.value || '',
          type: btn.type || 'button',
          ariaLabel: btn.getAttribute('aria-label')
        })
      );

      // Links
      const links = Array.from(document.querySelectorAll('a[href]')).map((link: any) => ({
        text: link.textContent?.trim() || '',
        href: link.href,
        ariaLabel: link.getAttribute('aria-label')
      }));

      // Input fields
      const inputs = Array.from(document.querySelectorAll('input, textarea, select')).map(
        (input: any) => ({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name,
          id: input.id,
          placeholder: input.placeholder,
          ariaLabel: input.getAttribute('aria-label')
        })
      );

      // Navigation elements
      const navigation = [];

      // Check for menu
      const menu = document.querySelector('nav');
      if (menu) {
        navigation.push({
          type: 'menu',
          items: Array.from(menu.querySelectorAll('a')).map((a: any) => a.textContent?.trim() || '')
        });
      }

      // Check for breadcrumb
      const breadcrumb = document.querySelector('[aria-label="breadcrumb"]');
      if (breadcrumb) {
        navigation.push({
          type: 'breadcrumb',
          items: Array.from(breadcrumb.querySelectorAll('a')).map((a: any) => a.textContent?.trim() || '')
        });
      }

      // Interactive elements
      const interactiveElements = Array.from(
        document.querySelectorAll('[role="button"], [onclick], .clickable, [data-testid]')
      )
        .slice(0, 10)
        .map((elem: any) => ({
          type: elem.getAttribute('role') || elem.tagName.toLowerCase(),
          selector: elem.id || elem.className || '',
          description: elem.textContent?.trim()?.substring(0, 50) || ''
        }));

      // Accessibility info
      const images = document.querySelectorAll('img');
      const imagesWithAlt = Array.from(images).filter((img: any) => img.alt).length;
      const imagesWithoutAlt = images.length - imagesWithAlt;

      const accessibilityInfo = {
        hasTitle: !!document.title,
        hasMetaDescription: !!document.querySelector('meta[name="description"]'),
        hasLang: !!document.documentElement.lang,
        headingsPresent: !!document.querySelector('h1'),
        imagesWithAlt,
        imagesWithoutAlt
      };

      // Page structure
      const pageStructure = {
        hasHeader: !!document.querySelector('header'),
        hasNav: !!document.querySelector('nav'),
        hasMain: !!document.querySelector('main'),
        hasFooter: !!document.querySelector('footer'),
        headingHierarchy: Array.from(document.querySelectorAll('h1, h2, h3'))
          .slice(0, 5)
          .map((h: any) => h.textContent?.trim() || '')
      };

      return {
        title: document.title,
        forms,
        buttons: buttons.filter(b => b.text),
        links: links.filter(l => l.text && l.href),
        inputs: inputs.filter(i => i.name || i.id),
        navigation,
        interactiveElements,
        accessibility: accessibilityInfo,
        pageStructure
      };
    });

    await context.close();

    return {
      url: baseUrl,
      ...analysis
    } as SiteAnalysisResult;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}

/**
 * Generate basic test file based on site analysis
 */
export function generateTestFile(analysis: SiteAnalysisResult): string {
  const testName = new URL(analysis.url).hostname.replace(/\./g, '-');
  const imports = `import { test, expect } from '../../src/fixtures/test-fixtures';`;

  let testCases = '';

  // Test 1: Basic navigation
  testCases += `
  test('should load the page and verify title', async ({ page }) => {
    await page.goto('${analysis.url}');
    await expect(page).toHaveTitle('${analysis.title}');
  });
`;

  // Test 2: Form testing (if forms exist)
  if (analysis.forms.length > 0) {
    const form = analysis.forms[0];
    const formFields = form.fields
      .slice(0, 2)
      .map(field => `    await page.fill('[name="${field}"]', 'test-value');`)
      .join('\n');

    testCases += `
  test('should fill and submit form', async ({ page }) => {
    await page.goto('${analysis.url}');
    
${formFields}
    await page.click('button[type="submit"]');
    // Add assertion based on expected behavior
  });
`;
  }

  // Test 3: Navigation/Links
  if (analysis.links.length > 0) {
    const link = analysis.links[0];
    testCases += `
  test('should navigate through links', async ({ page }) => {
    await page.goto('${analysis.url}');
    const link = page.locator('a:has-text("${link.text}")').first();
    await expect(link).toBeVisible();
    // Uncomment to test actual navigation
    // await link.click();
    // await page.waitForNavigation();
  });
`;
  }

  // Test 4: Buttons
  if (analysis.buttons.length > 0) {
    const button = analysis.buttons[0];
    testCases += `
  test('should find and interact with buttons', async ({ page }) => {
    await page.goto('${analysis.url}');
    const button = page.locator('button:has-text("${button.text}")').first();
    await expect(button).toBeVisible();
    // Uncomment to test button click
    // await button.click();
  });
`;
  }

  // Test 5: Accessibility checks
  testCases += `
  test('should meet basic accessibility requirements', async ({ page }) => {
    await page.goto('${analysis.url}');
    
    // Check page title
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
    
    // Check for main content
    const mainContent = page.locator('main, [role="main"]');
    if (await mainContent.count() > 0) {
      await expect(mainContent).toBeVisible();
    }
    
    // Check heading hierarchy
    const h1 = page.locator('h1');
    // At least one h1 should be present for better SEO
    // await expect(h1).toHaveCount(1);
  });
`;

  const testContent = `import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('${testName} - Auto Generated Tests @generated', () => {
${testCases}
});
`;

  return testContent;
}

/**
 * Generate Page Object Model based on site analysis
 */
export function generatePageObject(analysis: SiteAnalysisResult): string {
  const className = analysis.title
    .split(' ')
    .slice(0, 2)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join('') + 'Page';

  const imports = `import { Page } from '@playwright/test';`;

  let selectors = '';
  let methods = '';

  // Generate selectors for forms
  if (analysis.forms.length > 0) {
    const form = analysis.forms[0];
    form.fields.slice(0, 3).forEach(field => {
      const camelCase = field
        .split('-')
        .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
        .join('');
      selectors += `  private ${camelCase}Input = () => this.page.locator('[name="${field}"]');\n`;
    });

    if (form.submitButton) {
      selectors += `  private submitBtn = () => this.page.locator('button[type="submit"]');\n`;
    }
  }

  // Generate methods
  if (analysis.forms.length > 0) {
    const form = analysis.forms[0];
    const fields = form.fields.slice(0, 3);

    methods += `
  async fillForm(data: Record<string, string>) {\n`;
    fields.forEach(field => {
      const camelCase = field
        .split('-')
        .map((word, i) => (i === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1)))
        .join('');
      methods += `    if (data['${field}']) await this.${camelCase}Input().fill(data['${field}']);\n`;
    });
    methods += `  }\n\n  async submitForm() {\n    await this.submitBtn().click();\n  }\n`;
  }

  const pageObject = `import { Page } from '@playwright/test';

export class ${className} {
  constructor(private page: Page) {}

  // Selectors
  private pageTitle = () => this.page.title();

${selectors}

  // Navigation
  async goto() {
    await this.page.goto('${analysis.url}');
  }

  async isLoaded(): Promise<boolean> {
    await this.page.waitForLoadState('networkidle');
    return true;
  }

${methods}

  // Accessibility checks
  async checkAccessibility() {
    const title = await this.pageTitle();
    return {
      hasTitleTag: title.length > 0,
      hasMainContent: await this.page.locator('main').isVisible().catch(() => false)
    };
  }
}
`;

  return pageObject;
}

/**
 * Save generated files
 */
export async function saveGeneratedFiles(
  analysis: SiteAnalysisResult,
  outputDir: string = './tests/ui'
): Promise<{ testFile: string; pageObjectFile: string }> {
  const testContent = generateTestFile(analysis);
  const pageObjectContent = generatePageObject(analysis);

  const hostname = new URL(analysis.url).hostname.replace(/\./g, '-');
  const testFileName = `${hostname}-generated.spec.ts`;
  const pageObjectFileName = `${hostname}-page.ts`;

  const testFilePath = path.join(outputDir, testFileName);
  const pageObjectPath = path.join(outputDir, '..', 'pages', pageObjectFileName);

  // Ensure directories exist
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  if (!fs.existsSync(path.dirname(pageObjectPath))) {
    fs.mkdirSync(path.dirname(pageObjectPath), { recursive: true });
  }

  fs.writeFileSync(testFilePath, testContent);
  fs.writeFileSync(pageObjectPath, pageObjectContent);

  return {
    testFile: testFilePath,
    pageObjectFile: pageObjectPath
  };
}
