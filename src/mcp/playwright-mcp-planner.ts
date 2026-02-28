/**
 * Playwright MCP Planner
 * Intelligent test planning and strategy generation
 * Creates comprehensive test plans, scenarios, and user journeys
 */

import { SiteAnalysisResult } from './playwright-mcp-server';

export interface TestPlan {
  projectName: string;
  baseUrl: string;
  totalTests: number;
  criticalTests: number;
  estimatedDuration: number; // in minutes
  scenarios: TestScenario[];
  userJourneys: UserJourney[];
  testMatrix: TestMatrix;
  priorities: TestPriority[];
  riskAssessment: RiskAssessment;
}

export interface TestScenario {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  expectedOutcome: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  estimatedTime: number; // seconds
  tags: string[];
}

export interface TestStep {
  action: string;
  target?: string;
  value?: string;
  validation?: string;
}

export interface UserJourney {
  id: string;
  name: string;
  actor: string;
  goal: string;
  steps: JourneyStep[];
  successCriteria: string[];
  priority: 'critical' | 'high' | 'medium' | 'low';
}

export interface JourneyStep {
  order: number;
  action: string;
  description: string;
  expectedResult: string;
}

export interface TestMatrix {
  browsers: string[];
  devices: string[];
  locales: string[];
  networkConditions: NetworkCondition[];
  testCombinations: number;
}

export interface NetworkCondition {
  name: string;
  downloadSpeed: number; // kbps
  uploadSpeed: number; // kbps
  latency: number; // ms
}

export interface TestPriority {
  testId: string;
  priority: number; // 1 (highest) to 100 (lowest)
  businessImpact: string;
  userImpact: number; // 1-10
  frequency: string; // how often users interact with it
}

export interface RiskAssessment {
  overallRisk: 'high' | 'medium' | 'low';
  criticalAreas: string[];
  recommendations: string[];
  estimatedCoveragePercentage: number;
}

/**
 * Generate comprehensive test plan from website analysis
 */
export function generateTestPlan(analysis: SiteAnalysisResult, baseUrl: string): TestPlan {
  const projectName = new URL(baseUrl).hostname.replace(/\./g, '-');
  
  // Generate test scenarios
  const scenarios = generateScenarios(analysis, baseUrl);
  
  // Extract user journeys
  const userJourneys = extractUserJourneys(analysis, baseUrl);
  
  // Create test matrix
  const testMatrix = createTestMatrix(analysis);
  
  // Calculate priorities
  const priorities = calculatePriorities(scenarios, analysis);
  
  // Assess risks
  const riskAssessment = assessRisks(analysis, scenarios);
  
  // Calculate metrics
  const totalTests = scenarios.length + userJourneys.length;
  const criticalTests = scenarios.filter(s => s.priority === 'critical').length;
  const estimatedDuration = Math.ceil(scenarios.reduce((sum, s) => sum + s.estimatedTime, 0) / 60);
  
  return {
    projectName,
    baseUrl,
    totalTests,
    criticalTests,
    estimatedDuration,
    scenarios,
    userJourneys,
    testMatrix,
    priorities,
    riskAssessment
  };
}

/**
 * Generate test scenarios based on page elements
 */
function generateScenarios(analysis: SiteAnalysisResult, baseUrl: string): TestScenario[] {
  const scenarios: TestScenario[] = [];
  
  // 1. Page Load Scenario
  scenarios.push({
    id: 'scenario-page-load',
    name: 'Page Load and Initialization',
    description: 'Verify the page loads correctly with all essential elements',
    steps: [
      { action: 'navigate', target: baseUrl, validation: 'Page title appears' },
      { action: 'wait', target: 'network', value: 'networkidle' },
      { action: 'verify', target: 'main content', validation: 'Main content is visible' }
    ],
    expectedOutcome: 'Page loads within 3 seconds with all critical content visible',
    priority: 'critical',
    estimatedTime: 5,
    tags: ['smoke', 'performance', 'critical']
  });

  // 2. Navigation Scenario
  if (analysis.links.length > 0) {
    scenarios.push({
      id: 'scenario-navigation',
      name: 'Navigation and Links',
      description: 'Verify all major navigation links work correctly',
      steps: [
        { action: 'wait', target: 'page', value: 'load' },
        { action: 'identify', target: 'navigation menu', validation: 'Menu items found' },
        { action: 'click', target: 'first navigation link', validation: 'Link navigates' },
        { action: 'verify', target: 'URL changed', validation: 'URL is updated' }
      ],
      expectedOutcome: 'All navigation links are clickable and navigate to correct pages',
      priority: 'high',
      estimatedTime: 15,
      tags: ['navigation', 'functional']
    });
  }

  // 3. Form Interaction Scenario
  if (analysis.forms.length > 0) {
    scenarios.push({
      id: 'scenario-form-interaction',
      name: 'Form Submission',
      description: 'Verify form fields are functional and submissions work',
      steps: [
        { action: 'locate', target: 'form', validation: 'Form found' },
        { action: 'fill', target: 'form fields', value: 'valid data' },
        { action: 'submit', target: 'form', validation: 'Submit button clicked' },
        { action: 'verify', target: 'success message or navigation', validation: 'Form submitted successfully' }
      ],
      expectedOutcome: 'Forms accept valid input and submit successfully',
      priority: 'critical',
      estimatedTime: 20,
      tags: ['forms', 'functional', 'critical']
    });
  }

  // 4. Button Interaction Scenario
  if (analysis.buttons.length > 0) {
    scenarios.push({
      id: 'scenario-button-interaction',
      name: 'Button Functionality',
      description: 'Test all interactive buttons and their actions',
      steps: [
        { action: 'identify', target: 'all buttons', validation: 'Buttons found' },
        { action: 'click', target: 'primary buttons', validation: 'Button responds' },
        { action: 'verify', target: 'expected action', validation: 'Action executed' }
      ],
      expectedOutcome: 'All buttons are clickable and perform expected actions',
      priority: 'high',
      estimatedTime: 15,
      tags: ['interactive', 'functional']
    });
  }

  // 5. Accessibility Scenario
  scenarios.push({
    id: 'scenario-accessibility',
    name: 'Accessibility Compliance',
    description: 'Verify page meets basic accessibility standards',
    steps: [
      { action: 'check', target: 'page title', validation: 'Title tag exists' },
      { action: 'check', target: 'heading hierarchy', validation: 'Proper heading structure' },
      { action: 'check', target: 'images alt text', validation: `${analysis.accessibility.imagesWithAlt} images have alt text` },
      { action: 'check', target: 'ARIA labels', validation: 'Interactive elements have labels' }
    ],
    expectedOutcome: 'Page is accessible per WCAG 2.1 AA standards',
    priority: 'high',
    estimatedTime: 10,
    tags: ['accessibility', 'compliance']
  });

  // 6. Responsive Design Scenario
  scenarios.push({
    id: 'scenario-responsive',
    name: 'Responsive Design',
    description: 'Verify page works on different screen sizes',
    steps: [
      { action: 'test', target: 'mobile viewport', value: '375x667', validation: 'Layout adapts' },
      { action: 'test', target: 'tablet viewport', value: '768x1024', validation: 'Layout adapts' },
      { action: 'test', target: 'desktop viewport', value: '1920x1080', validation: 'Layout displays correctly' },
      { action: 'verify', target: 'all content visible', validation: 'No overflow or missing content' }
    ],
    expectedOutcome: 'Page is responsive across all device sizes',
    priority: 'high',
    estimatedTime: 20,
    tags: ['responsive', 'mobile', 'design']
  });

  // 7. Performance Scenario
  scenarios.push({
    id: 'scenario-performance',
    name: 'Performance Metrics',
    description: 'Verify page meets performance benchmarks',
    steps: [
      { action: 'measure', target: 'First Contentful Paint (FCP)', validation: '< 1.8s' },
      { action: 'measure', target: 'Largest Contentful Paint (LCP)', validation: '< 2.5s' },
      { action: 'measure', target: 'Cumulative Layout Shift (CLS)', validation: '< 0.1' },
      { action: 'verify', target: 'load time', validation: 'Page loads < 3 seconds' }
    ],
    expectedOutcome: 'Page meets Core Web Vitals and performance targets',
    priority: 'medium',
    estimatedTime: 15,
    tags: ['performance', 'metrics', 'web-vitals']
  });

  // 8. Error Handling Scenario
  scenarios.push({
    id: 'scenario-error-handling',
    name: 'Error Handling and Edge Cases',
    description: 'Verify proper error handling and recovery',
    steps: [
      { action: 'trigger', target: 'network error', validation: 'Error message displayed' },
      { action: 'trigger', target: 'invalid input', validation: 'Form validation works' },
      { action: 'trigger', target: 'timeout', validation: 'Graceful degradation' },
      { action: 'verify', target: 'recovery', validation: 'User can retry or navigate away' }
    ],
    expectedOutcome: 'Application handles errors gracefully with helpful messages',
    priority: 'medium',
    estimatedTime: 20,
    tags: ['error-handling', 'edge-cases']
  });

  return scenarios;
}

/**
 * Extract typical user journeys from site analysis
 */
function extractUserJourneys(analysis: SiteAnalysisResult, baseUrl: string): UserJourney[] {
  const journeys: UserJourney[] = [];

  // Journey 1: First-time visitor discovery
  journeys.push({
    id: 'journey-first-time',
    name: 'First-Time Visitor Discovery',
    actor: 'New User',
    goal: 'Learn about the service/product and understand value proposition',
    steps: [
      { order: 1, action: 'arrive', description: 'Land on homepage', expectedResult: 'Homepage loads with clear message' },
      { order: 2, action: 'explore', description: 'Read headline and key benefits', expectedResult: 'Value proposition is clear' },
      { order: 3, action: 'navigate', description: 'Click on "Learn More" or product pages', expectedResult: 'Navigation works smoothly' },
      { order: 4, action: 'engage', description: 'View detailed information or features', expectedResult: 'Content is comprehensive' },
      { order: 5, action: 'decide', description: 'Determine if interested in next action', expectedResult: 'Clear call-to-action visible' }
    ],
    successCriteria: [
      'Loaded within 3 seconds',
      'Click-through to at least one page',
      'Visible call-to-action',
      'No critical errors'
    ],
    priority: 'critical'
  });

  // Journey 2: User taking action (form submission)
  if (analysis.forms.length > 0) {
    journeys.push({
      id: 'journey-action',
      name: 'User Takes Action',
      actor: 'Engaged User',
      goal: 'Complete a primary action (signup, purchase, inquiry)',
      steps: [
        { order: 1, action: 'find', description: 'Locate form or action button', expectedResult: 'Element is visible and accessible' },
        { order: 2, action: 'fill', description: 'Enter required information', expectedResult: 'Form accepts input' },
        { order: 3, action: 'validate', description: 'Form validates input', expectedResult: 'Clear error messages if needed' },
        { order: 4, action: 'submit', description: 'Submit the form', expectedResult: 'Form processes and confirms' },
        { order: 5, action: 'confirm', description: 'Receive confirmation', expectedResult: 'Success page or email confirmation' }
      ],
      successCriteria: [
        'Form submission succeeds',
        'Confirmation is received',
        'No data loss',
        'Smooth redirect or next step'
      ],
      priority: 'critical'
    });
  }

  // Journey 3: Mobile user experience
  journeys.push({
    id: 'journey-mobile',
    name: 'Mobile User Experience',
    actor: 'Mobile User',
    goal: 'Access and use service on mobile device',
    steps: [
      { order: 1, action: 'load', description: 'Load page on mobile device', expectedResult: 'Fast load time, proper viewport' },
      { order: 2, action: 'navigate', description: 'Navigate using mobile menu', expectedResult: 'Mobile menu is accessible' },
      { order: 3, action: 'interact', description: 'Interact with touch-friendly elements', expectedResult: 'No accidental taps, proper spacing' },
      { order: 4, action: 'complete', description: 'Complete primary task on mobile', expectedResult: 'All functionality works on mobile' }
    ],
    successCriteria: [
      'Responsive layout',
      'Touch-friendly buttons',
      'No horizontal scroll',
      'Fast performance on mobile'
    ],
    priority: 'high'
  });

  // Journey 4: Return visitor
  journeys.push({
    id: 'journey-return',
    name: 'Return Visitor Journey',
    actor: 'Returning Customer',
    goal: 'Complete task efficiently with personalized experience',
    steps: [
      { order: 1, action: 'recognize', description: 'Browser recognizes return visitor', expectedResult: 'Session or cookies maintained' },
      { order: 2, action: 'navigate', description: 'Quick navigation to needed page', expectedResult: 'Shortcuts or favorites available' },
      { order: 3, action: 'complete', description: 'Complete task quickly', expectedResult: 'Form auto-fill or saved preferences work' },
      { order: 4, action: 'engage', description: 'Receive relevant recommendations', expectedResult: 'Personalized content shown' }
    ],
    successCriteria: [
      'Session persists',
      'Quick load times',
      'Personalization works',
      'No redundant steps'
    ],
    priority: 'high'
  });

  return journeys;
}

/**
 * Create comprehensive test matrix for cross-browser/device testing
 */
function createTestMatrix(analysis: SiteAnalysisResult): TestMatrix {
  return {
    browsers: ['chromium', 'firefox', 'webkit'],
    devices: ['Desktop', 'iPhone 12', 'Pixel 5', 'iPad Pro'],
    locales: ['en-US', 'es-ES', 'fr-FR', 'de-DE'],
    networkConditions: [
      { name: 'Fast 4G', downloadSpeed: 16000, uploadSpeed: 9000, latency: 40 },
      { name: 'Slow 4G', downloadSpeed: 1600, uploadSpeed: 750, latency: 150 },
      { name: '3G', downloadSpeed: 400, uploadSpeed: 400, latency: 400 },
      { name: 'Offline', downloadSpeed: 0, uploadSpeed: 0, latency: 0 }
    ],
    testCombinations: 3 * 4 * 4 * 4 // browsers * devices * locales * network
  };
}

/**
 * Calculate priority scores for each test
 */
function calculatePriorities(scenarios: TestScenario[], analysis: SiteAnalysisResult): TestPriority[] {
  return scenarios.map((scenario, index) => {
    const priorityMap = { critical: 1, high: 20, medium: 50, low: 80 };
    const basePriority = priorityMap[scenario.priority];
    
    // Adjust based on business impact
    let businessImpact = '';
    let userImpact = 1;

    if (scenario.tags.includes('critical') || scenario.id.includes('page-load')) {
      businessImpact = 'Page availability and core functionality';
      userImpact = 10;
    } else if (scenario.tags.includes('form')) {
      businessImpact = 'Revenue/conversion impacting feature';
      userImpact = 9;
    } else if (scenario.tags.includes('accessibility')) {
      businessImpact = 'Legal compliance and inclusion';
      userImpact = 7;
    } else if (scenario.tags.includes('performance')) {
      businessImpact = 'User experience and retention';
      userImpact = 8;
    } else {
      businessImpact = 'Enhanced functionality';
      userImpact = 4;
    }

    return {
      testId: scenario.id,
      priority: basePriority,
      businessImpact,
      userImpact,
      frequency: scenario.tags.includes('critical') ? 'Every build' : 'Daily'
    };
  });
}

/**
 * Assess risk areas and provide recommendations
 */
function assessRisks(analysis: SiteAnalysisResult, scenarios: TestScenario[]): RiskAssessment {
  const criticalAreas: string[] = [];
  const recommendations: string[] = [];

  // Check for high-risk areas
  if (analysis.forms.length === 0) {
    criticalAreas.push('No forms detected - revenue-impacting features may not be tested');
    recommendations.push('Manually verify all conversion-critical forms are being tested');
  }

  if (analysis.accessibility.imagesWithoutAlt > 0) {
    criticalAreas.push(`${analysis.accessibility.imagesWithoutAlt} images missing alt text - accessibility risk`);
    recommendations.push('Add alt text to all images for accessibility compliance');
  }

  if (!analysis.pageStructure.hasHeader) {
    criticalAreas.push('No header element detected - navigation may be at risk');
    recommendations.push('Verify header/navigation structure in generated tests');
  }

  if (analysis.links.length < 5) {
    criticalAreas.push('Limited navigation detected - may have incomplete site crawl');
    recommendations.push('Verify site has proper navigation structure');
  }

  if (scenarios.length < 5) {
    recommendations.push('Add additional custom test scenarios for comprehensive coverage');
  }

  // Calculate coverage percentage
  const estimatedCoverage = Math.min(80 + (scenarios.length * 2), 95);

  const overallRisk = criticalAreas.length > 3 ? 'high' : criticalAreas.length > 1 ? 'medium' : 'low';

  return {
    overallRisk,
    criticalAreas,
    recommendations,
    estimatedCoveragePercentage: estimatedCoverage
  };
}

/**
 * Export test plan as formatted report
 */
export function formatTestPlanReport(plan: TestPlan): string {
  let report = `
╔════════════════════════════════════════════════════════════╗
║           INTELLIGENT TEST PLAN REPORT                    ║
╚════════════════════════════════════════════════════════════╝

📋 PROJECT: ${plan.projectName}
🌐 BASE URL: ${plan.baseUrl}

📊 PLAN SUMMARY
═══════════════════════════════════════════════════════════
Total Test Cases: ${plan.totalTests}
Critical Tests: ${plan.criticalTests}
Estimated Duration: ${plan.estimatedDuration} minutes
Test Matrix Combinations: ${plan.testMatrix.testCombinations}

🎯 TEST SCENARIOS (${plan.scenarios.length})
═══════════════════════════════════════════════════════════`;

  plan.scenarios.forEach(scenario => {
    report += `
  ├─ ${scenario.name} [${scenario.priority.toUpperCase()}]
  │  ├─ ID: ${scenario.id}
  │  ├─ Steps: ${scenario.steps.length}
  │  └─ Time: ${scenario.estimatedTime}s
`;
  });

  report += `
👥 USER JOURNEYS (${plan.userJourneys.length})
═══════════════════════════════════════════════════════════`;

  plan.userJourneys.forEach(journey => {
    report += `
  ├─ ${journey.name} [${journey.priority.toUpperCase()}]
  │  ├─ Actor: ${journey.actor}
  │  ├─ Goal: ${journey.goal}
  │  └─ Steps: ${journey.steps.length}
`;
  });

  report += `
📈 TEST MATRIX
═══════════════════════════════════════════════════════════
Browsers: ${plan.testMatrix.browsers.join(', ')}
Devices: ${plan.testMatrix.devices.join(', ')}
Locales: ${plan.testMatrix.locales.join(', ')}
Network Conditions: ${plan.testMatrix.networkConditions.length}

⚠️  RISK ASSESSMENT: ${plan.riskAssessment.overallRisk.toUpperCase()}
═══════════════════════════════════════════════════════════
Coverage: ${plan.riskAssessment.estimatedCoveragePercentage}%
`;

  if (plan.riskAssessment.criticalAreas.length > 0) {
    report += `
Critical Areas:
${plan.riskAssessment.criticalAreas.map(area => `  • ${area}`).join('\n')}
`;
  }

  if (plan.riskAssessment.recommendations.length > 0) {
    report += `
Recommendations:
${plan.riskAssessment.recommendations.map(rec => `  • ${rec}`).join('\n')}
`;
  }

  report += `
═══════════════════════════════════════════════════════════
`;

  return report;
}
