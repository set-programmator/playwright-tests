#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

class PlaywrightBoilerplateSetup {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    this.config = {
      projectName: '',
      baseUrl: '',
      apiBaseUrl: '',
      testEnv: '',
      browserPreference: '',
      ciEnvironment: '',
      notificationWebhook: '',
      teamSize: '',
      testingStrategy: ''
    };
  }

  async question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }

  async welcome() {
    console.log('\n🎭 Welcome to Playwright Boilerplate Setup!');
    console.log('=====================================\n');
    console.log('This interactive setup will configure your testing framework\n');
    console.log('for your specific project and team needs.\n');
  }

  async gatherProjectInfo() {
    console.log('📋 Project Configuration\n');
    
    this.config.projectName = await this.question('Project name (e.g., "my-awesome-app"): ');
    this.config.baseUrl = await this.question('Base URL for testing (e.g., "http://localhost:3000"): ');
    this.config.apiBaseUrl = await this.question('API Base URL (e.g., "https://api.myapp.com"): ');
    
    console.log('\n🌍 Environment Configuration\n');
    this.config.testEnv = await this.question('Primary test environment [staging/production/local]: ');
  }

  async gatherTestingPreferences() {
    console.log('\n🧪 Testing Strategy\n');
    
    console.log('Browser preference:');
    console.log('1. Chromium only (fastest)');
    console.log('2. Chrome + Firefox (recommended)');  
    console.log('3. All browsers (most comprehensive)');
    const browserChoice = await this.question('Choose (1-3): ');
    
    const browserMap = {
      '1': 'chromium',
      '2': 'chrome-firefox', 
      '3': 'all-browsers'
    };
    this.config.browserPreference = browserMap[browserChoice] || 'chrome-firefox';
    
    console.log('\nTeam size:');
    console.log('1. Solo developer (1 person)');
    console.log('2. Small team (2-5 people)');
    console.log('3. Medium team (6-15 people)');
    console.log('4. Large team (15+ people)');
    const teamChoice = await this.question('Choose (1-4): ');
    
    const teamMap = {
      '1': 'solo',
      '2': 'small',
      '3': 'medium',
      '4': 'large'
    };
    this.config.teamSize = teamMap[teamChoice] || 'small';
    
    console.log('\nTesting focus:');
    console.log('1. UI-focused (mostly frontend testing)');
    console.log('2. API-focused (mostly backend testing)');
    console.log('3. Full-stack (balanced UI + API)');
    console.log('4. E2E-focused (complete user journeys)');
    const strategyChoice = await this.question('Choose (1-4): ');
    
    const strategyMap = {
      '1': 'ui-focused',
      '2': 'api-focused',
      '3': 'full-stack',
      '4': 'e2e-focused'
    };
    this.config.testingStrategy = strategyMap[strategyChoice] || 'full-stack';
  }

  async gatherCIPreferences() {
    console.log('\n🚀 CI/CD Configuration\n');
    
    console.log('CI Environment:');
    console.log('1. GitHub Actions (recommended)');
    console.log('2. GitLab CI');
    console.log('3. Azure DevOps');
    console.log('4. Jenkins');
    console.log('5. Other/None');
    const ciChoice = await this.question('Choose (1-5): ');
    
    const ciMap = {
      '1': 'github-actions',
      '2': 'gitlab-ci',
      '3': 'azure-devops', 
      '4': 'jenkins',
      '5': 'none'
    };
    this.config.ciEnvironment = ciMap[ciChoice] || 'github-actions';
    
    if (this.config.ciEnvironment !== 'none') {
      this.config.notificationWebhook = await this.question('Slack webhook URL (optional, press Enter to skip): ');
    }
  }

  async createEnvironmentFile() {
    const envContent = `# Application URLs
BASE_URL=${this.config.baseUrl}
API_BASE_URL=${this.config.apiBaseUrl}

# Test Configuration  
HEADLESS=true
WORKERS=${this.getWorkerCount()}
DEBUG=false
TEST_ENV=${this.config.testEnv}

# Test Credentials (Update with actual values)
TEST_USER=testuser
TEST_PASSWORD=change_me_secure_password
ADMIN_USER=admin  
ADMIN_PASSWORD=change_me_admin_password
INVALID_PASSWORD=wrong_password

# Performance Settings
PERFORMANCE_BUDGET_FCP=1800
PERFORMANCE_BUDGET_LCP=2500
PERFORMANCE_BUDGET_CLS=0.1

# Security Settings
SECURITY_SCAN_ENABLED=true
ACCESSIBILITY_SCAN_ENABLED=true

# CI/CD Configuration
CI=${this.config.ciEnvironment !== 'none'}
GITHUB_TOKEN=your_github_token_here
SLACK_WEBHOOK=${this.config.notificationWebhook || ''}

# Project Specific
PROJECT_NAME=${this.config.projectName}
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Created .env file with your configuration');
  }

  getWorkerCount() {
    const workerMap = {
      'solo': 2,
      'small': 3,
      'medium': 4, 
      'large': 6
    };
    return workerMap[this.config.teamSize] || 3;
  }

  async updatePlaywrightConfig() {
    const browsers = this.getBrowserProjects();
    
    const configUpdate = `
// Auto-generated browser configuration
const browserProjects = ${JSON.stringify(browsers, null, 2)};

// Export for use in playwright.config.ts
module.exports = { browserProjects };`;

    fs.writeFileSync('playwright.browsers.js', configUpdate);
    console.log('✅ Updated browser configuration');
  }

  getBrowserProjects() {
    const allBrowsers = [
      { name: 'chromium', use: { ...{} } },
      { name: 'firefox', use: { ...{} } },
      { name: 'webkit', use: { ...{} } }
    ];
    
    switch (this.config.browserPreference) {
      case 'chromium':
        return [allBrowsers[0]];
      case 'chrome-firefox': 
        return [allBrowsers[0], allBrowsers[1]];
      case 'all-browsers':
      default:
        return allBrowsers;
    }
  }

  async installDependencies() {
    console.log('\n📦 Installing dependencies...');
    
    try {
      console.log('Installing npm packages...');
      execSync('npm install', { stdio: 'inherit' });
      
      console.log('Installing Playwright browsers...');
      execSync('npx playwright install', { stdio: 'inherit' });
      
      console.log('✅ Dependencies installed successfully');
    } catch (error) {
      console.log('❌ Error installing dependencies:', error.message);
    }
  }

  async createProjectStructure() {
    const directories = [
      'src/pages/examples',
      'src/components/examples', 
      'tests/examples',
      'data/test-users',
      'docs/guides',
      'scripts'
    ];

    directories.forEach(dir => {
      const fullPath = path.join(process.cwd(), dir);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
    });

    // Create example test file
    const exampleTest = `import { test, expect } from '../../../src/fixtures/test-fixtures';

test.describe('${this.config.projectName} Example Tests', () => {
  test('homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Add your specific assertions here
    expect(page).toHaveTitle(/.*${this.config.projectName}.*/i);
  });
});`;

    fs.writeFileSync('tests/examples/homepage.spec.ts', exampleTest);
    console.log('✅ Created project structure with examples');
  }

  async generateDocumentation() {
    const readme = `# ${this.config.projectName} - Test Suite

## 🚀 Quick Start

\`\`\`bash
# Run all tests
npm test

# Run specific test types
npm run test:${this.config.testingStrategy.replace('-focused', '')}

# Run in headed mode for debugging
npm run test:headed
\`\`\`

## 🧪 Test Strategy

This project is configured for **${this.config.testingStrategy}** testing with:
- **Browsers:** ${this.config.browserPreference.replace('-', ' + ')}
- **Team Size:** ${this.config.teamSize}
- **Environment:** ${this.config.testEnv}

## 📊 Reports

- **HTML Report:** \`npm run report:open\`
- **Allure Report:** \`npm run report:allure\`

---
*Generated by Playwright Boilerplate Setup*`;

    fs.writeFileSync('docs/project-readme.md', readme);
    console.log('✅ Generated project documentation');
  }

  async runInitialTests() {
    const runTests = await this.question('\n🧪 Run initial test suite to verify setup? [y/N]: ');
    
    if (runTests.toLowerCase() === 'y') {
      console.log('Running smoke tests...');
      try {
        execSync('npm run test:smoke', { stdio: 'inherit' });
        console.log('✅ Initial tests passed! Setup is working correctly.');
      } catch (error) {
        console.log('⚠️  Some tests failed. This is normal for a new setup.');
        console.log('Update your test files with project-specific logic.');
      }
    }
  }

  async showNext() {
    console.log('\n🎉 Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. 🔧 Update .env file with your actual credentials');
    console.log('2. 📝 Customize tests in tests/examples/');
    console.log('3. 🌍 Update page objects in src/pages/');
    console.log('4. 🚀 Run tests: npm test');
    console.log('5. 📊 View reports: npm run report:open\n');
    
    if (this.config.ciEnvironment !== 'none') {
      console.log('CI/CD Configuration:');
      console.log(`- Configured for: ${this.config.ciEnvironment}`);
      console.log('- Update repository secrets for authentication');
      console.log('- Enable GitHub Pages for report hosting\n');
    }
    
    console.log('📚 Documentation created in docs/');
    console.log('🆘 Need help? Check the comprehensive README.md\n');
    console.log('Happy Testing! 🎭✨');
  }

  async run() {
    try {
      await this.welcome();
      await this.gatherProjectInfo();
      await this.gatherTestingPreferences();
      await this.gatherCIPreferences();
      
      await this.createEnvironmentFile();
      await this.updatePlaywrightConfig();
      await this.createProjectStructure(); 
      await this.generateDocumentation();
      
      await this.installDependencies();
      await this.runInitialTests();
      await this.showNext();
      
    } catch (error) {
      console.log('\n❌ Setup failed:', error.message);
    } finally {
      this.rl.close();
    }
  }
}

// Run setup if called directly
if (require.main === module) {
  const setup = new PlaywrightBoilerplateSetup();
  setup.run().catch(console.error);
}

module.exports = PlaywrightBoilerplateSetup;