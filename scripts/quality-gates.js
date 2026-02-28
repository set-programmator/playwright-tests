#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

class QualityGateRunner {
  constructor() {
    this.coverageDir = path.join(process.cwd(), 'coverage');
    this.analyticsDir = path.join(process.cwd(), 'analytics');
    this.thresholds = {
      coverage: 80,
      testSuccessRate: 95,
      performanceBudget: {
        fcp: 1800,
        lcp: 2500,
        cls: 0.1
      }
    };
  }

  async runQualityGates(options = {}) {
    console.log('🎯 Quality Gates Validation');
    console.log('===========================\n');

    let allPassed = true;
    const results = {};

    // 1. Run tests with coverage
    if (options.runTests !== false) {
      console.log('🧪 Running tests with coverage...');
      try {
        execSync('npm run test:quality', { stdio: 'inherit' });
        results.tests = { passed: true, message: 'Tests completed successfully' };
      } catch (error) {
        results.tests = { passed: false, message: 'Tests failed or had errors' };
        allPassed = false;
      }
      console.log('');
    }

    // 2. Validate code coverage
    console.log('📊 Validating Code Coverage...');
    const coverageResult = await this.validateCoverage();
    results.coverage = coverageResult;
    if (!coverageResult.passed) allPassed = false;
    console.log('');

    // 3. Validate test reliability
    console.log('🔍 Validating Test Reliability...');
    const reliabilityResult = await this.validateTestReliability();
    results.reliability = reliabilityResult;
    if (!reliabilityResult.passed) allPassed = false;
    console.log('');

    // 4. Security and performance checks
    if (options.security !== false) {
      console.log('🔒 Running Security Checks...');
      const securityResult = await this.validateSecurity();
      results.security = securityResult;
      if (!securityResult.passed) allPassed = false;
      console.log('');
    }

    // 5. Generate quality report
    await this.generateQualityReport(results);

    // 6. Final verdict
    console.log('🏁 Quality Gates Summary');
    console.log('========================\n');
    
    Object.entries(results).forEach(([gate, result]) => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      console.log(`${status} ${gate.toUpperCase()}: ${result.message}`);
    });

    console.log('\n' + (allPassed ? 
      '🎉 ALL QUALITY GATES PASSED! Ready for deployment.' : 
      '⚠️  QUALITY GATES FAILED! Address issues before deployment.'
    ));

    return allPassed;
  }

  async validateCoverage() {
    const coverageReportPath = path.join(this.coverageDir, 'coverage-report.json');
    
    if (!fs.existsSync(coverageReportPath)) {
      return {
        passed: false,
        message: 'Coverage report not found. Run tests with coverage first.',
        value: 0,
        threshold: this.thresholds.coverage
      };
    }

    try {
      const report = JSON.parse(fs.readFileSync(coverageReportPath, 'utf8'));
      const passed = report.overallCoverage >= this.thresholds.coverage;
      
      return {
        passed,
        message: `Coverage: ${report.overallCoverage.toFixed(2)}% (threshold: ${this.thresholds.coverage}%)`,
        value: report.overallCoverage,
        threshold: this.thresholds.coverage
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error reading coverage report: ${error.message}`,
        value: 0,
        threshold: this.thresholds.coverage
      };
    }
  }

  async validateTestReliability() {
    const metricsPath = path.join(this.analyticsDir, 'test-metrics.json');
    
    if (!fs.existsSync(metricsPath)) {
      return {
        passed: false,
        message: 'Test metrics not found. Run tests to generate metrics.',
        value: 0,
        threshold: this.thresholds.testSuccessRate
      };
    }

    try {
      const metrics = JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
      const successRate = ((1 - metrics.totalFailures / metrics.totalRuns) * 100);
      const passed = successRate >= this.thresholds.testSuccessRate;
      
      return {
        passed,
        message: `Test Success Rate: ${successRate.toFixed(2)}% (threshold: ${this.thresholds.testSuccessRate}%)`,
        value: successRate,
        threshold: this.thresholds.testSuccessRate
      };
    } catch (error) {
      return {
        passed: false,
        message: `Error reading test metrics: ${error.message}`,
        value: 0,
        threshold: this.thresholds.testSuccessRate
      };
    }
  }

  async validateSecurity() {
    try {
      // Check for known vulnerabilities
      execSync('npm audit --audit-level=moderate', { stdio: 'pipe' });
      
      return {
        passed: true,
        message: 'No security vulnerabilities found',
        value: 0,
        threshold: 0
      };
    } catch (error) {
      const output = error.stdout?.toString() || error.message;
      const vulnerabilityCount = (output.match(/found (\d+)/i) || [])[1];
      
      return {
        passed: false,
        message: `Security vulnerabilities found: ${vulnerabilityCount || 'unknown'}`,
        value: parseInt(vulnerabilityCount) || 1,
        threshold: 0
      };
    }
  }

  async generateQualityReport(results) {
    const report = {
      timestamp: new Date().toISOString(),
      overallPassed: Object.values(results).every(r => r.passed),
      gates: results,
      recommendations: this.generateRecommendations(results),
      nextSteps: this.generateNextSteps(results)
    };

    // Save JSON report
    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }
    
    fs.writeFileSync('reports/quality-gates-report.json', JSON.stringify(report, null, 2));

    // Generate HTML report
    const htmlReport = this.generateHTMLReport(report);
    fs.writeFileSync('reports/quality-gates-report.html', htmlReport);

    console.log('📋 Quality gates report generated: reports/quality-gates-report.html');
  }

  generateRecommendations(results) {
    const recommendations = [];

    if (!results.coverage?.passed) {
      recommendations.push({
        category: 'Coverage',
        priority: 'High',
        action: 'Increase test coverage by adding more comprehensive tests',
        details: 'Focus on uncovered code paths and edge cases'
      });
    }

    if (!results.reliability?.passed) {
      recommendations.push({
        category: 'Reliability', 
        priority: 'High',
        action: 'Fix failing tests and improve test stability',
        details: 'Review flaky tests and timing issues'
      });
    }

    if (!results.security?.passed) {
      recommendations.push({
        category: 'Security',
        priority: 'Critical',
        action: 'Update dependencies with security vulnerabilities',
        details: 'Run npm audit fix and review manual updates'
      });
    }

    return recommendations;
  }

  generateNextSteps(results) {
    const steps = [];

    if (Object.values(results).every(r => r.passed)) {
      steps.push('🚀 All quality gates passed! Safe to deploy to production.');
      steps.push('📊 Monitor production metrics and user feedback.');
      steps.push('🔄 Continue regular quality gate checks in CI/CD.');
    } else {
      steps.push('🔧 Address failing quality gates before deployment.');
      steps.push('📈 Review recommendations and create action items.');
      steps.push('🧪 Re-run quality gates after fixes are implemented.');
    }

    return steps;
  }

  generateHTMLReport(report) {
    const statusColor = report.overallPassed ? '#28a745' : '#dc3545';
    const statusText = report.overallPassed ? 'PASSED' : 'FAILED';

    return `
<!DOCTYPE html>
<html>
<head>
  <title>Quality Gates Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .header { background: ${statusColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .gate { margin: 20px 0; padding: 15px; border-radius: 5px; border-left: 5px solid; }
    .gate.passed { border-color: #28a745; background: #f1f8e9; }
    .gate.failed { border-color: #dc3545; background: #fff5f5; }
    .recommendations { background: #fff3cd; padding: 20px; border-radius: 5px; margin: 20px 0; }
    .recommendation { margin: 10px 0; padding: 10px; background: white; border-radius: 3px; }
    .next-steps { background: #d1ecf1; padding: 20px; border-radius: 5px; }
    .metric { display: inline-block; margin: 10px; padding: 10px; background: rgba(255,255,255,0.2); border-radius: 3px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Quality Gates Report</h1>
    <h2>Status: ${statusText}</h2>
    <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
  </div>

  <h2>Quality Gate Results</h2>
  ${Object.entries(report.gates).map(([name, gate]) => `
    <div class="gate ${gate.passed ? 'passed' : 'failed'}">
      <h3>${gate.passed ? '✅' : '❌'} ${name.toUpperCase()}</h3>
      <p><strong>Message:</strong> ${gate.message}</p>
      ${gate.value !== undefined ? `<p><strong>Value:</strong> ${gate.value} (Threshold: ${gate.threshold})</p>` : ''}
    </div>
  `).join('')}

  ${report.recommendations.length > 0 ? `
    <div class="recommendations">
      <h2>🎯 Recommendations</h2>
      ${report.recommendations.map(rec => `
        <div class="recommendation">
          <strong>${rec.category} (${rec.priority} Priority):</strong><br>
          ${rec.action}<br>
          <em>${rec.details}</em>
        </div>
      `).join('')}
    </div>
  ` : ''}

  <div class="next-steps">
    <h2>🚀 Next Steps</h2>
    <ul>
      ${report.nextSteps.map(step => `<li>${step}</li>`).join('')}
    </ul>
  </div>
</body>
</html>`;
  }
}

// CLI execution
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    runTests: !args.includes('--no-tests'),
    security: !args.includes('--no-security'),
    coverage: !args.includes('--no-coverage')
  };

  const runner = new QualityGateRunner();
  runner.runQualityGates(options)
    .then(passed => {
      process.exit(passed ? 0 : 1);
    })
    .catch(error => {
      console.error('Quality gates execution failed:', error);
      process.exit(1);
    });
}

module.exports = QualityGateRunner;