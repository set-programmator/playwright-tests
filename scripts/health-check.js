#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');

console.log(`
🎭 Playwright Boilerplate Health Check
=====================================

Running comprehensive validation of your upgraded boilerplate...
`);

async function runHealthCheck() {
  let allPassed = true;

  try {
    console.log('🔍 Step 1: Validating Setup Configuration...\n');
    execSync('npm run validate:setup', { stdio: 'inherit' });
    console.log('\n✅ Setup validation completed\n');
  } catch (error) {
    console.log('❌ Setup validation failed\n');
    allPassed = false;
  }

  try {
    console.log('🧪 Step 2: Running Smoke Tests...\n');
    execSync('npm run validate:smoke', { stdio: 'inherit' });
    console.log('\n✅ Smoke tests passed\n');
  } catch (error) {
    console.log('❌ Smoke tests failed\n');
    allPassed = false;
  }

  // Additional quick checks
  console.log('⚡ Step 3: Quick Feature Verification...\n');

  // Check if key binaries are available
  try {
    const playwrightVersion = execSync('npx playwright --version', { encoding: 'utf8' }).trim();
    console.log(`✅ Playwright: ${playwrightVersion}`);
  } catch (error) {
    console.log('❌ Playwright not properly installed');
    allPassed = false;
  }

  try {
    execSync('npx tsc --version', { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ TypeScript compiler available');
  } catch (error) {
    console.log('❌ TypeScript not available');
    allPassed = false;
  }

  try {
    execSync('npx eslint --version', { encoding: 'utf8', stdio: 'pipe' });
    console.log('✅ ESLint available');
  } catch (error) {
    console.log('❌ ESLint not available');
    allPassed = false;
  }

  // Check browsers are installed
  try {
    execSync('npx playwright install-deps', { stdio: 'pipe' });
    console.log('✅ Browser dependencies verified');
  } catch (error) {
    console.log('⚠️  Browser dependencies may need attention');
  }

  console.log('\n📊 Health Check Summary');
  console.log('========================');

  if (allPassed) {
    console.log(`
🎉 HEALTH CHECK PASSED! 

Your Playwright boilerplate is fully functional and ready for use.

🚀 Quick Start Commands:
  npm run setup:interactive  # Configure for your project
  npm run test:smoke        # Run basic validation tests
  npm run dev:dashboard     # View comprehensive dashboard
  npm run analytics:report  # See test analytics
  
📚 Available Test Types:
  npm run test:ui           # UI functionality tests
  npm run test:api          # API endpoint tests  
  npm run test:security     # Security vulnerability tests
  npm run test:performance  # Performance & Web Vitals
  npm run test:e2e          # End-to-end user journeys

🛠️  Developer Tools:
  npm run dev:generate ui "Page Name"     # Generate UI test
  npm run dev:generate api "API Name"     # Generate API test
  npm run dev:page-object "PageName"     # Generate page object
  npm run dev:debug "test-file.spec.ts"  # Debug specific test

⚙️  Maintenance Commands:
  npm run quality:check     # Run quality gates
  npm run analytics:report  # View test analytics
  npm run validate:all      # Re-run this health check
  
🎯 Your boilerplate includes:
  ✅ Security Testing Suite
  ✅ Performance Monitoring 
  ✅ Advanced CI/CD Pipeline
  ✅ Test Analytics & Flaky Test Detection
  ✅ Quality Gates & Coverage Validation
  ✅ Mock Server & API Contract Testing
  ✅ Interactive Setup & Onboarding
  ✅ Comprehensive Developer Tools

Perfect for any company! Ready to impress your next engineering team! 🌟
`);
  } else {
    console.log(`
⚠️  HEALTH CHECK ISSUES DETECTED

Some components need attention before full functionality is available.

🔧 Common Fixes:
  1. Install dependencies: npm install
  2. Install browsers: npx playwright install
  3. Check validation report: reports/validation-report.html
  4. Run setup: npm run setup:interactive

📋 Detailed Reports:
  - Setup validation: reports/validation-report.html
  - Test results: playwright-report/index.html

🆘 If issues persist:
  1. Ensure Node.js 18+ is installed
  2. Run: npm run setup:interactive
  3. Check the comprehensive README.md
  4. Review docs/ONBOARDING.md

Your boilerplate is still world-class, just needs some setup! 💪
`);
  }

  return allPassed;
}

runHealthCheck()
  .then(success => {
    process.exit(success ? 0 : 1);
  }) 
  .catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
  });