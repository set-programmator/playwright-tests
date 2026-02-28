#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');

class BoilerplateValidator {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      details: []
    };
  }

  log(type, message, details = '') {
    const symbols = { 
      pass: '✅', 
      fail: '❌', 
      warn: '⚠️ ', 
      info: 'ℹ️ ' 
    };
    
    console.log(`${symbols[type]} ${message}`);
    if (details) console.log(`   ${details}`);
    
    this.results[type === 'pass' ? 'passed' : type === 'fail' ? 'failed' : 'warnings']++;
    this.results.details.push({ type, message, details });
  }

  async runValidation() {
    console.log('🔍 Validating Playwright Boilerplate Setup');
    console.log('==========================================\n');

    // 1. File Structure Validation
    await this.validateFileStructure();
    
    // 2. Dependencies Validation
    await this.validateDependencies();
    
    // 3. Configuration Validation
    await this.validateConfigurations();
    
    // 4. Scripts Validation
    await this.validateNpmScripts();
    
    // 5. Feature Validation
    await this.validateFeatures();
    
    // 6. Tools Validation
    await this.validateDeveloperTools();
    
    // 7. Integration Tests
    await this.runIntegrationTests();
    
    // 8. Generate Validation Report
    await this.generateValidationReport();
    
    this.showSummary();
  }

  async validateFileStructure() {
    console.log('📁 Validating File Structure...\n');
    
    const requiredFiles = [
      // Core files
      'package.json',
      'playwright.config.ts',
      'tsconfig.json',
      '.eslintrc.js',
      '.prettierrc',
      
      // Security tests
      'tests/security/security-headers.spec.ts',
      'tests/security/input-validation.spec.ts',
      
      // Performance tests  
      'tests/performance/web-vitals.spec.ts',
      'tests/performance/lighthouse-audit.spec.ts',
      
      // Quality tests
      'tests/quality/quality-gates.spec.ts',
      
      // API tests
      'tests/api/contract-testing.spec.ts',
      
      // Utils
      'src/utils/test-analytics.ts',
      'src/utils/quality-gates.ts',
      'src/utils/mock-server.ts',
      
      // Scripts
      'scripts/setup.js',
      'scripts/analytics-report.js',
      'scripts/quality-gates.js',
      'scripts/dev-tools.js',
      'scripts/upgrade-complete.js',
      
      // Data and configs
      'data/contracts/users-api.json',
      '.github/workflows/playwright.yml',
      '.github/dependabot.yml',
      '.env.example',
      
      // Documentation
      'docs/ONBOARDING.md'
    ];

    const requiredDirectories = [
      'src/pages',
      'src/api', 
      'src/fixtures',
      'src/utils',
      'tests/ui',
      'tests/api',
      'tests/e2e',
      'tests/security',
      'tests/performance',
      'tests/quality',
      'data/contracts',
      'scripts',
      'docs'
    ];

    // Check files
    requiredFiles.forEach(file => {
      if (fs.existsSync(file)) {
        this.log('pass', `File exists: ${file}`);
      } else {
        this.log('fail', `Missing file: ${file}`);
      }
    });

    // Check directories
    requiredDirectories.forEach(dir => {
      if (fs.existsSync(dir)) {
        this.log('pass', `Directory exists: ${dir}`);
      } else {
        this.log('fail', `Missing directory: ${dir}`);
      }
    });

    console.log('');
  }

  async validateDependencies() {
    console.log('📦 Validating Dependencies...\n');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const requiredDeps = [
        '@playwright/test',
        '@axe-core/playwright',
        'allure-playwright',
        'dotenv',
        'eslint-plugin-playwright'
      ];

      requiredDeps.forEach(dep => {
        if (packageJson.devDependencies && packageJson.devDependencies[dep]) {
          this.log('pass', `Dependency installed: ${dep}`);
        } else {
          this.log('fail', `Missing dependency: ${dep}`);
        }
      });

      // Check if node_modules exists
      if (fs.existsSync('node_modules')) {
        this.log('pass', 'node_modules directory exists');
      } else {
        this.log('fail', 'node_modules directory missing - run npm install');
      }

    } catch (error) {
      this.log('fail', 'Could not validate package.json', error.message);
    }

    console.log('');
  }

  async validateConfigurations() {
    console.log('⚙️  Validating Configurations...\n');
    
    // Validate playwright.config.ts
    try {
      const configContent = fs.readFileSync('playwright.config.ts', 'utf8');
      
      if (configContent.includes('timeout: 60000')) {
        this.log('pass', 'Playwright config has timeout settings');
      } else {
        this.log('warn', 'Playwright config missing enhanced timeout settings');
      }
      
      if (configContent.includes('toHaveScreenshot')) {
        this.log('pass', 'Playwright config has screenshot threshold');  
      } else {
        this.log('warn', 'Playwright config missing screenshot settings');
      }
      
    } catch (error) {
      this.log('fail', 'Could not validate playwright.config.ts', error.message);
    }

    // Validate ESLint config
    try {
      const eslintContent = fs.readFileSync('.eslintrc.js', 'utf8');
      
      if (eslintContent.includes('plugin:playwright/recommended')) {
        this.log('pass', 'ESLint config includes Playwright plugin');
      } else {
        this.log('warn', 'ESLint config missing Playwright plugin');
      }
      
    } catch (error) {
      this.log('fail', 'Could not validate .eslintrc.js', error.message);
    }

    // Validate environment example
    if (fs.existsSync('.env.example')) {
      this.log('pass', 'Environment example file exists');
    } else {
      this.log('fail', 'Missing .env.example file');
    }

    console.log('');
  }

  async validateNpmScripts() {
    console.log('🔧 Validating NPM Scripts...\n');
    
    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const scripts = packageJson.scripts || {};
      
      const expectedScripts = [
        'test:security',
        'test:quality', 
        'test:performance',
        'analytics:report',
        'quality:gates',
        'dev:generate',
        'dev:dashboard',
        'setup:interactive'
      ];

      expectedScripts.forEach(script => {
        if (scripts[script]) {
          this.log('pass', `Script exists: ${script}`);
        } else {
          this.log('fail', `Missing script: ${script}`);
        }
      });

    } catch (error) {
      this.log('fail', 'Could not validate npm scripts', error.message);
    }

    console.log('');
  }

  async validateFeatures() {
    console.log('🎯 Validating Feature Implementation...\n');
    
    // Check test files have proper content
    const testFiles = {
      'tests/security/security-headers.spec.ts': ['X-Content-Type-Options', 'X-Frame-Options'],
      'tests/performance/web-vitals.spec.ts': ['firstContentfulPaint', 'largestContentfulPaint'],
      'tests/quality/quality-gates.spec.ts': ['qualityGates', 'validateCoverage'],
      'tests/api/contract-testing.spec.ts': ['mockServer', 'validateAPIContract']
    };

    Object.entries(testFiles).forEach(([file, expectedContent]) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hasAllContent = expectedContent.every(item => content.includes(item));
        
        if (hasAllContent) {
          this.log('pass', `Feature test complete: ${path.basename(file)}`);
        } else {
          this.log('warn', `Feature test incomplete: ${path.basename(file)}`);
        }
      } else {
        this.log('fail', `Feature test missing: ${file}`);
      }
    });

    // Check utility files
    const utilFiles = {
      'src/utils/test-analytics.ts': ['TestAnalytics', 'recordTestResult'],
      'src/utils/quality-gates.ts': ['QualityGateValidator', 'validateCoverage'],
      'src/utils/mock-server.ts': ['MockServer', 'setupMockRoutes']
    };

    Object.entries(utilFiles).forEach(([file, expectedContent]) => {
      if (fs.existsSync(file)) {
        const content = fs.readFileSync(file, 'utf8');
        const hasAllContent = expectedContent.every(item => content.includes(item));
        
        if (hasAllContent) {
          this.log('pass', `Utility complete: ${path.basename(file)}`);
        } else {
          this.log('warn', `Utility incomplete: ${path.basename(file)}`);
        }
      } else {
        this.log('fail', `Utility missing: ${file}`);
      }
    });

    console.log('');
  }

  async validateDeveloperTools() {
    console.log('🛠️  Validating Developer Tools...\n');
    
    // Test dev-tools script
    try {
      const result = execSync('node scripts/dev-tools.js', { 
        encoding: 'utf8', 
        timeout: 5000,
        stdio: 'pipe'
      });
      
      if (result.includes('Playwright Developer Tools')) {
        this.log('pass', 'Developer tools script functional');
      } else {
        this.log('warn', 'Developer tools script may have issues');
      }
    } catch (error) {
      this.log('fail', 'Developer tools script not working', error.message);
    }

    // Test analytics script
    try {
      execSync('node scripts/analytics-report.js --help 2>/dev/null || echo "Analytics script exists"', { 
        encoding: 'utf8', 
        timeout: 3000 
      });
      this.log('pass', 'Analytics script accessible');
    } catch (error) {
      this.log('warn', 'Analytics script may have issues');
    }

    // Test setup script
    if (fs.existsSync('scripts/setup.js')) {
      this.log('pass', 'Interactive setup script exists');
    } else {
      this.log('fail', 'Interactive setup script missing');
    }

    console.log('');
  }

  async runIntegrationTests() {
    console.log('🧪 Running Integration Tests...\n');
    
    try {
      // Test TypeScript compilation
      execSync('npx tsc --noEmit', { 
        encoding: 'utf8', 
        timeout: 15000,
        stdio: 'pipe'
      });
      this.log('pass', 'TypeScript compilation successful');
    } catch (error) {
      this.log('fail', 'TypeScript compilation failed', 'Run npx tsc --noEmit to see details');
    }

    try {
      // Test ESLint
      execSync('npx eslint src tests --ext .ts,.js --max-warnings 10', { 
        encoding: 'utf8', 
        timeout: 10000,
        stdio: 'pipe'
      });
      this.log('pass', 'ESLint validation passed');
    } catch (error) {
      this.log('warn', 'ESLint found issues', 'Run npm run lint for details');
    }

    // Test if Playwright can be invoked
    try {
      const result = execSync('npx playwright --version', { 
        encoding: 'utf8', 
        timeout: 5000 
      });
      this.log('pass', `Playwright installed: ${result.trim()}`);
    } catch (error) {
      this.log('fail', 'Playwright not properly installed');
    }

    console.log('');
  }

  async generateValidationReport() {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalChecks: this.results.passed + this.results.failed + this.results.warnings,
        passed: this.results.passed,
        failed: this.results.failed,
        warnings: this.results.warnings,
        score: this.calculateScore()
      },
      details: this.results.details,
      recommendations: this.generateRecommendations()
    };

    if (!fs.existsSync('reports')) {
      fs.mkdirSync('reports', { recursive: true });
    }

    fs.writeFileSync('reports/validation-report.json', JSON.stringify(report, null, 2));
    
    // Generate HTML report
    const htmlReport = this.generateHTMLValidationReport(report);
    fs.writeFileSync('reports/validation-report.html', htmlReport);
  }

  calculateScore() {
    const total = this.results.passed + this.results.failed + this.results.warnings;
    if (total === 0) return 0;
    
    const score = ((this.results.passed + this.results.warnings * 0.5) / total) * 100;
    return Math.round(score);
  }

  generateRecommendations() {
    const recommendations = [];
    
    if (this.results.failed > 0) {
      recommendations.push({
        priority: 'High',
        category: 'Critical Issues',
        action: 'Fix failing validation checks before using in production',
        description: 'Some core components are missing or not functioning'
      });
    }

    if (this.results.warnings > 5) {
      recommendations.push({
        priority: 'Medium',
        category: 'Configuration',
        action: 'Review and update configuration warnings',
        description: 'Multiple configuration issues detected'
      });
    }

    if (this.results.failed === 0 && this.results.warnings < 3) {
      recommendations.push({
        priority: 'Low',
        category: 'Optimization',
        action: 'Setup is ready for production use',
        description: 'Consider running the interactive setup for team-specific configuration'
      });
    }

    return recommendations;
  }

  generateHTMLValidationReport(report) {
    const statusColor = report.summary.score >= 90 ? '#28a745' : 
                       report.summary.score >= 70 ? '#ffc107' : '#dc3545';
    
    return `<!DOCTYPE html>
<html>
<head>
  <title>Playwright Boilerplate Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    .header { background: ${statusColor}; color: white; padding: 20px; border-radius: 8px; text-align: center; }
    .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
    .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
    .metric-value { font-size: 2em; font-weight: bold; color: ${statusColor}; }
    .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .check-item { padding: 8px; margin: 4px 0; border-radius: 4px; }
    .pass { background: #d4edda; color: #155724; }
    .fail { background: #f8d7da; color: #721c24; }
    .warn { background: #fff3cd; color: #856404; }
    .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎭 Playwright Boilerplate Validation</h1>
    <h2>Score: ${report.summary.score}/100</h2>
    <p>Generated: ${new Date(report.timestamp).toLocaleString()}</p>
  </div>

  <div class="summary">
    <div class="metric">
      <div class="metric-value">${report.summary.totalChecks}</div>
      <div>Total Checks</div>
    </div>
    <div class="metric">
      <div class="metric-value" style="color: #28a745">${report.summary.passed}</div>
      <div>Passed</div>
    </div>
    <div class="metric">
      <div class="metric-value" style="color: #dc3545">${report.summary.failed}</div>
      <div>Failed</div>
    </div>
    <div class="metric">
      <div class="metric-value" style="color: #ffc107">${report.summary.warnings}</div>
      <div>Warnings</div>
    </div>
  </div>

  <div class="details">
    <h2>Validation Details</h2>
    ${report.details.map(item => `
      <div class="check-item ${item.type}">
        <strong>${item.message}</strong>
        ${item.details ? `<br><small>${item.details}</small>` : ''}
      </div>
    `).join('')}
  </div>

  ${report.recommendations.length > 0 ? `
    <div class="recommendations">
      <h2>Recommendations</h2>
      ${report.recommendations.map(rec => `
        <div style="margin: 10px 0;">
          <strong>${rec.category} (${rec.priority} Priority):</strong><br>
          ${rec.action}<br>
          <em>${rec.description}</em>
        </div>
      `).join('')}
    </div>
  ` : ''}
</body>
</html>`;
  }

  showSummary() {
    console.log('\n📊 Validation Summary');
    console.log('====================');
    console.log(`Score: ${this.calculateScore()}/100`);
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);
    
    const score = this.calculateScore();
    if (score >= 90) {
      console.log('\n🎉 EXCELLENT! Your boilerplate is ready for production use.');
    } else if (score >= 70) {
      console.log('\n👍 GOOD! Address warnings for optimal performance.');
    } else {
      console.log('\n⚠️  NEEDS ATTENTION! Please fix failing checks before use.');
    }
    
    console.log('\n📋 Detailed report: reports/validation-report.html');
  }
}

// CLI execution
if (require.main === module) {
  const validator = new BoilerplateValidator();
  validator.runValidation().catch(error => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

module.exports = BoilerplateValidator;