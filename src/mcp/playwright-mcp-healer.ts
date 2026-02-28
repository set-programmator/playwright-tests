/**
 * Playwright MCP Healer
 * Intelligent test repair and maintenance system
 * Fixes flaky tests, repairs broken selectors, and suggests improvements
 */

export interface TestIssue {
  testName: string;
  filePath: string;
  lineNumber: number;
  issueType: 'flaky' | 'broken-selector' | 'timeout' | 'async-issue' | 'deprecated' | 'performance' | 'accessibility';
  severity: 'critical' | 'high' | 'medium' | 'low';
  description: string;
  detectedPattern: string;
  suggestedFix: string;
  autoFixCode?: string;
}

export interface HealerScan {
  totalTests: number;
  issuesFound: number;
  criticalIssues: number;
  issues: TestIssue[];
  summary: IssueSummary;
  recommendations: string[];
}

export interface IssueSummary {
  byType: Record<string, number>;
  bySeverity: Record<string, number>;
  fixableIssues: number;
  manualReviewNeeded: number;
}

export interface SelectorFix {
  broken: string;
  suggested: string[];
  reason: string;
  confidence: number; // 0-100
}

export interface BestPracticeViolation {
  category: string;
  violation: string;
  currentCode: string;
  suggestedCode: string;
  reason: string;
}

/**
 * Analyze test files for common issues and anti-patterns
 */
export function analyzeTestsForIssues(testCode: string): TestIssue[] {
  const issues: TestIssue[] = [];
  const lines = testCode.split('\n');

  // Pattern detectors
  const patterns = [
    // Flaky test patterns
    {
      pattern: /await page\.click\('(.+?)'\);[\s\n]*await page\.click/,
      issueType: 'flaky' as const,
      description: 'Rapid consecutive clicks without wait - may cause race conditions',
      fix: 'Add waitForNavigation() or waitForSelector() between clicks'
    },
    {
      pattern: /setTimeout\(|\.wait\(\d+\)/,
      issueType: 'flaky' as const,
      description: 'Hard-coded wait times create flaky tests',
      fix: 'Use Playwright\'s built-in wait methods: waitForNavigation(), waitForSelector(), etc.'
    },
    // Broken selector patterns
    {
      pattern: /page\.click\('[^']*\$[^']*'\)|page\.fill\('[^']*\$[^']*'\)/,
      issueType: 'broken-selector' as const,
      description: 'CSS selector with unescaped $ character',
      fix: 'Escape special characters or use more stable selectors'
    },
    {
      pattern: /page\.click\('.*(?:style|class)="[^"]*"[^']*'\)/,
      issueType: 'broken-selector' as const,
      description: 'Brittle selector based on style or class attributes',
      fix: 'Use data-testid or aria-label instead'
    },
    // Timeout issues
    {
      pattern: /await page\.goto\('.*'\);[\s\n]*await page\.(fill|click|press)/,
      issueType: 'timeout' as const,
      description: 'Missing waitForLoadState() after navigation',
      fix: 'Add await page.waitForLoadState(\'networkidle\') after goto()'
    },
    // Async/await issues
    {
      pattern: /page\.(click|goto|fill)\(.*\)[\s\n]*(?!await)/,
      issueType: 'async-issue' as const,
      description: 'Missing await on async Playwright action',
      fix: 'Add await keyword before Playwright API calls'
    },
    // Deprecated API usage
    {
      pattern: /page\.waitFor\(|page\.waitForFunction/,
      issueType: 'deprecated' as const,
      description: 'Using deprecated waitFor() API',
      fix: 'Use waitForNavigation(), waitForLoadState(), or waitForSelector()'
    },
    // Performance issues
    {
      pattern: /page\.evaluate\(\)|page\.evaluateHandle\(\)/,
      issueType: 'performance' as const,
      description: 'Expensive evaluate() calls can slow tests',
      fix: 'Use Playwright locators where possible instead of evaluate()'
    },
    // Accessibility issues
    {
      pattern: /page\.locator\('button'\)|page\.locator\('a'\)|page\.click\('[^']*button[^']*'\)/,
      issueType: 'accessibility' as const,
      description: 'Generic selectors that don\'t consider accessibility',
      fix: 'Use role selectors: getByRole(\'button\') or data-testid'
    }
  ];

  // Scan code for patterns
  lines.forEach((line, lineNum) => {
    patterns.forEach(({ pattern, issueType, description, fix }) => {
      if (pattern.test(line)) {
        // Determine severity based on issue type
        let severity: 'critical' | 'high' | 'medium' | 'low' = 'high';
        if (issueType === 'flaky' || issueType === 'async-issue') {
          severity = 'critical';
        } else if (issueType === 'broken-selector' || issueType === 'accessibility') {
          severity = 'high';
        } else if (issueType === 'performance' || issueType === 'deprecated') {
          severity = 'medium';
        } else {
          severity = 'low';
        }

        issues.push({
          testName: 'Auto-detected',
          filePath: 'test-file.spec.ts',
          lineNumber: lineNum + 1,
          issueType,
          severity,
          description,
          detectedPattern: line.trim(),
          suggestedFix: fix,
          autoFixCode: generateAutoFix(issueType, line)
        });
      }
    });
  });

  return issues;
}

/**
 * Generate auto-fix code for detected issues
 */
function generateAutoFix(issueType: string, originalLine: string): string {
  const fixes: Record<string, string> = {
    'flaky': `// Fixed: Added proper wait
await page.waitForLoadState('networkidle');
${originalLine}`,
    'timeout': `await page.goto(url);
await page.waitForLoadState('networkidle');`,
    'async-issue': originalLine.replace(/([^=]\s*)page\./, '$1await page.'),
    'deprecated': originalLine.replace(/page\.waitFor\(/g, 'await page.waitForSelector('),
    'performance': `// Consider using locators instead of evaluate
${originalLine}`
  };

  return fixes[issueType] || originalLine;
}

/**
 * Detect flaky test patterns
 */
export function detectFlakyTests(testCode: string): TestIssue[] {
  const flakyIssues: TestIssue[] = [];
  const lines = testCode.split('\n');

  const flakyPatterns = [
    { regex: /\.only\(/, desc: 'Test with .only() - may skip other tests', fix: 'Remove .only() before committing' },
    { regex: /\.skip\(/, desc: 'Skipped test - may be failing', fix: 'Investigate and fix the test' },
    { regex: /setTimeout|setInterval/, desc: 'Hard-coded delays create flakiness', fix: 'Use Playwright wait methods' },
    { regex: /retry.*=\s*\d+\s*;/, desc: 'Test configured with retries', fix: 'Fix underlying issue instead of retrying' },
    { regex: /waitFor.*1000\)|waitFor.*5000\)/, desc: 'Arbitrary wait times', fix: 'Use dynamic waits' }
  ];

  lines.forEach((line, idx) => {
    flakyPatterns.forEach(({ regex, desc, fix }) => {
      if (regex.test(line)) {
        flakyIssues.push({
          testName: 'Flaky Pattern Detected',
          filePath: 'test-file.spec.ts',
          lineNumber: idx + 1,
          issueType: 'flaky',
          severity: 'high',
          description: desc,
          detectedPattern: line.trim(),
          suggestedFix: fix
        });
      }
    });
  });

  return flakyIssues;
}

/**
 * Suggest selector improvements
 */
export function suggestSelectorImprovements(brokenSelector: string): SelectorFix {
  const improvements: string[] = [];
  let reason = '';

  // If using by text
  if (brokenSelector.includes('has-text')) {
    improvements.push(`getByRole with name`);
    reason = 'More stable and accessible than text-based selection';
  }

  // If using CSS class
  if (brokenSelector.includes('class=')) {
    improvements.push(`[data-testid="..."]`);
    reason = 'data-testid is more stable than class selectors';
  }

  // If using index
  if (brokenSelector.match(/\[:\d+\]/)) {
    improvements.push(`[data-testid="..."]`);
    improvements.push(`getByRole with name`);
    reason = 'Index-based selectors are brittle';
  }

  // If overly specific
  if (brokenSelector.length > 100) {
    improvements.push(`Simplify to nearest stable parent > child`);
    reason = 'Overly specific selectors break easily';
  }

  // If no improvements generated
  if (improvements.length === 0) {
    improvements.push(`getByRole('button', { name: /text/ })`);
    improvements.push(`[data-testid="element-id"]`);
    improvements.push(`getByLabel('label text')`);
    reason = 'Use semantic selectors for better resilience';
  }

  return {
    broken: brokenSelector,
    suggested: improvements,
    reason,
    confidence: improvements.length > 0 ? 85 : 60
  };
}

/**
 * Detect accessibility issues
 */
export function detectAccessibilityIssues(testCode: string): TestIssue[] {
  const a11yIssues: TestIssue[] = [];
  const lines = testCode.split('\n');

  const a11yPatterns = [
    { 
      regex: /click\('button'\)|click\('a'\)|click\('div'\)/, 
      desc: 'Using generic tag selectors instead of roles',
      fix: 'Use getByRole(\'button\') instead'
    },
    { 
      regex: /locator\('[^']*nth=/, 
      desc: 'Using nth-child selectors - ignores semantic meaning',
      fix: 'Find semantic way to identify element'
    },
    { 
      regex: /\.filter\(\{has.*text/, 
      desc: 'Complex text-based locators fail with i18n',
      fix: 'Use aria-label or data-testid'
    },
    { 
      regex: /getAttribute\('aria/, 
      desc: 'Testing aria attributes - test functionality instead',
      fix: 'Test actual behavior, not ARIA attributes'
    }
  ];

  lines.forEach((line, idx) => {
    a11yPatterns.forEach(({ regex, desc, fix }) => {
      if (regex.test(line)) {
        a11yIssues.push({
          testName: 'Accessibility Issue',
          filePath: 'test-file.spec.ts',
          lineNumber: idx + 1,
          issueType: 'accessibility',
          severity: 'medium',
          description: desc,
          detectedPattern: line.trim(),
          suggestedFix: fix
        });
      }
    });
  });

  return a11yIssues;
}

/**
 * Perform comprehensive test health scan
 */
export function performHealthScan(testCode: string, testCount: number = 10): HealerScan {
  const allIssues: TestIssue[] = [
    ...analyzeTestsForIssues(testCode),
    ...detectFlakyTests(testCode),
    ...detectAccessibilityIssues(testCode)
  ];

  // Remove duplicates
  const uniqueIssues = Array.from(
    new Map(allIssues.map(issue => [issue.detectedPattern, issue])).values()
  );

  const summary: IssueSummary = {
    byType: {},
    bySeverity: {},
    fixableIssues: 0,
    manualReviewNeeded: 0
  };

  // Count issues
  uniqueIssues.forEach(issue => {
    summary.byType[issue.issueType] = (summary.byType[issue.issueType] || 0) + 1;
    summary.bySeverity[issue.severity] = (summary.bySeverity[issue.severity] || 0) + 1;
    
    if (issue.autoFixCode) {
      summary.fixableIssues++;
    } else {
      summary.manualReviewNeeded++;
    }
  });

  const recommendations: string[] = [
    uniqueIssues.length === 0 ? '✅ Tests are in good health!' : '⚠️  Several issues detected - review below',
    'Consider using page.getByRole() for more stable selectors',
    'Enable Playwright test retries for transient failures only',
    'Use data-testid attributes for reliable element selection',
    'Run tests in headed mode to debug timing issues',
    'Enable trace recording for failed tests: --trace=on',
    'Use page.waitForLoadState(\'networkidle\') after navigation',
    'Avoid hard-coded delays - use Playwright wait methods'
  ];

  return {
    totalTests: testCount,
    issuesFound: uniqueIssues.length,
    criticalIssues: uniqueIssues.filter(i => i.severity === 'critical').length,
    issues: uniqueIssues,
    summary,
    recommendations
  };
}

/**
 * Generate test best practices violations report
 */
export function analyzeBestPractices(testCode: string): BestPracticeViolation[] {
  const violations: BestPracticeViolation[] = [];

  // Anti-pattern 1: Not using fixtures
  if (!testCode.includes('test.extend') && testCode.includes('await browser.newPage()')) {
    violations.push({
      category: 'Fixtures',
      violation: 'Not using Playwright fixtures',
      currentCode: 'const page = await browser.newPage();',
      suggestedCode: 'Use test.extend({ page }) or use default page fixture',
      reason: 'Fixtures provide automatic cleanup and dependency injection'
    });
  }

  // Anti-pattern 2: Using sleep instead of waits
  if (testCode.includes('page.waitForTimeout') || /setTimeout\s*\(.*\d+\s*\)/.test(testCode)) {
    violations.push({
      category: 'Timing',
      violation: 'Using sleep/setTimeout instead of dynamic waits',
      currentCode: 'await page.waitForTimeout(5000);',
      suggestedCode: 'await page.waitForSelector(selector) or expect(locator).toBeVisible();',
      reason: 'Sleep-based waits cause flakiness and slow tests'
    });
  }

  // Anti-pattern 3: Not using locators
  if (testCode.includes('page.evaluate') && !testCode.includes('page.locator')) {
    violations.push({
      category: 'Selectors',
      violation: 'Over-reliance on evaluate() and querySelector',
      currentCode: 'const el = await page.evaluate(() => document.querySelector(...))',
      suggestedCode: 'const locator = page.locator(...)',
      reason: 'Playwright locators are more maintainable and resilient'
    });
  }

  // Anti-pattern 4: Not using expect API
  if (testCode.includes('assert') || testCode.includes('.toBeTruthy()')) {
    violations.push({
      category: 'Assertions',
      violation: 'Not using Playwright expect API',
      currentCode: 'const value = await page.evaluate(...); assert.equal(value, expected)',
      suggestedCode: 'await expect(locator).toHaveText(expected)',
      reason: 'Playwright expect() has auto-retry capability'
    });
  }

  // Anti-pattern 5: No describe blocks
  if (!testCode.includes('describe(') && !testCode.includes('test.describe(')) {
    violations.push({
      category: 'Organization',
      violation: 'Tests not organized in logical groups',
      currentCode: 'test("test name", ...)',
      suggestedCode: 'test.describe("Feature", () => { test("test name", ...) })',
      reason: 'Organization improves readability and maintenance'
    });
  }

  // Anti-pattern 6: No tags/annotations
  if (!testCode.includes('@') && !testCode.includes('grep')) {
    violations.push({
      category: 'Tagging',
      violation: 'Tests not tagged with @tags for filtering',
      currentCode: 'test("test name", ...)',
      suggestedCode: 'test("test name @smoke @critical", ...)',
      reason: 'Tags enable selective test execution'
    });
  }

  return violations;
}

/**
 * Generate healer report
 */
export function formatHealerReport(scan: HealerScan, violations: BestPracticeViolation[]): string {
  return `
╔════════════════════════════════════════════════════════════╗
║             TEST HEALER HEALTH REPORT                     ║
╚════════════════════════════════════════════════════════════╝

🔍 TEST SCAN SUMMARY
═══════════════════════════════════════════════════════════
Total Tests Scanned: ${scan.totalTests}
Issues Found: ${scan.issuesFound}
Critical Issues: ${scan.criticalIssues}
Fixable Issues: ${scan.summary.fixableIssues}
Manual Review Needed: ${scan.summary.manualReviewNeeded}

📊 ISSUES BY TYPE
═══════════════════════════════════════════════════════════
${Object.entries(scan.summary.byType).map(([type, count]) => `  • ${type}: ${count}`).join('\n')}

🔴 ISSUES BY SEVERITY
═══════════════════════════════════════════════════════════
${Object.entries(scan.summary.bySeverity).map(([severity, count]) => `  • ${severity}: ${count}`).join('\n')}

⚠️  DETAILED ISSUES
═══════════════════════════════════════════════════════════
${scan.issues.length > 0 ? scan.issues.slice(0, 10).map(issue => `
  Issue #${scan.issues.indexOf(issue) + 1}: [${issue.issueType.toUpperCase()}]
    Line ${issue.lineNumber}: ${issue.description}
    Pattern: ${issue.detectedPattern.substring(0, 60)}...
    Fix: ${issue.suggestedFix}
`).join('') : '  ✅ No critical issues found!'}

${scan.issues.length > 10 ? `  ... and ${scan.issues.length - 10} more issues` : ''}

⚙️  BEST PRACTICE VIOLATIONS
═══════════════════════════════════════════════════════════
${violations.length > 0 ? violations.map(v => `
  [${v.category}] ${v.violation}
    Current: ${v.currentCode}
    Better:  ${v.suggestedCode}
    Why: ${v.reason}
`).join('') : '  ✅ Following best practices!'}

💡 RECOMMENDATIONS
═══════════════════════════════════════════════════════════
${scan.recommendations.map(rec => `  • ${rec}`).join('\n')}

📈 HEALTH SCORE: ${Math.max(0, 100 - (scan.issuesFound * 5))}%
═══════════════════════════════════════════════════════════
`;
}
