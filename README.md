# 🎭 Enterprise Playwright Testing Boilerplate

> **World-Class Testing Framework** - Production-ready Playwright boilerplate with enterprise-grade features for modern web applications.
[![Playwright Tests](https://github.com/set-programmator/playwright-tests/actions/workflows/playwright.yml/badge.svg)](https://github.com/set-programmator/playwright-tests/actions/workflows/playwright.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=your-project&metric=alert_status)](https://sonarcloud.io/dashboard?id=your-project)
[![Security Rating](https://sonarcloud.io/api/project_badges/measure?project=your-project&metric=security_rating)](https://sonarcloud.io/dashboard?id=your-project)

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/set-programmator/playwright-tests.git
cd playwright-tests

# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run interactive setup
npm run setup:interactive

# Validate installation
npm run health-check

# Run your first test
npm run test:smoke
```

## ✨ Features Overview

### 🛡️ **Security First**
- **XSS Protection Testing** - Automated vulnerability scanning
- **Security Headers Validation** - HTTPS, CSP, HSTS verification
- **Input Sanitization Tests** - SQL injection and XSS prevention
- **Dependency Security Auditing** - Automated vulnerability detection

### ⚡ **Performance Excellence**
- **Core Web Vitals Monitoring** - FCP, LCP, CLS measurement
- **Lighthouse Integration** - Automated performance auditing  
- **Performance Budget Enforcement** - Fail builds on regression
- **Resource Loading Analysis** - Bundle size and load time tracking

### 🤖 **Advanced CI/CD**
- **Matrix Testing Strategy** - Cross-browser, cross-platform
- **Quality Gates** - Automated deployment validation
- **Sharding Support** - Parallel test execution
- **Flaky Test Detection** - Automatic retry and analytics
- **GitHub Pages Integration** - Live test reports

### 📊 **Comprehensive Analytics**
- **Test Analytics Dashboard** - Performance trends and insights
- **Failure Analysis** - Root cause identification
- **Coverage Tracking** - Code and test coverage metrics
- **Historical Reporting** - Trend analysis and alerting

### 🔌 **API & Contract Testing**
- **Mock Server Integration** - Isolated API testing
- **Contract Validation** - Schema-based API testing
- **Response Time Monitoring** - API performance tracking
- **Multi-environment Support** - Dev, staging, production

### 🎯 **Developer Experience**
- **Interactive Test Generation** - AI-powered test creation
- **Page Object Generator** - Automated page object creation
- **Visual Debugging Tools** - Screenshots, traces, videos
- **Live Test Dashboard** - Real-time test monitoring

## 📁 Project Structure

```
playwright-tests/
├── 📁 .github/workflows/     # CI/CD pipeline configuration
├── 📁 src/                   # Source code and utilities
│   ├── 📁 fixtures/         # Test fixtures and setup
│   ├── 📁 pages/            # Page Object Models
│   ├── 📁 api/              # API helpers and services
│   └── 📁 utils/            # Testing utilities
├── 📁 tests/                # Test suites
│   ├── 📁 ui/               # UI/E2E tests
│   ├── 📁 api/              # API tests
│   ├── 📁 security/         # Security tests
│   ├── 📁 performance/      # Performance tests
│   ├── 📁 accessibility/    # A11y tests
│   ├── 📁 quality/          # Quality gate tests
│   └── 📁 smoke/            # Smoke tests
├── 📁 scripts/              # Automation and utility scripts
├── 📁 data/                 # Test data and contracts
├── 📁 docs/                 # Documentation
├── 📁 reports/              # Generated reports
└── 📁 allure-results/       # Allure test results
```

## 🧪 Test Categories

### UI Tests (`npm run test:ui`)
- **Login & Authentication** - User session management
- **Navigation & Routing** - Page transitions and deep links
- **Form Interactions** - Input validation and submission
- **Responsive Design** - Multi-device compatibility
- **Visual Regression** - Screenshot comparison testing

### API Tests (`npm run test:api`) 
- **CRUD Operations** - Create, read, update, delete
- **Authentication & Authorization** - Token-based security
- **Data Validation** - Schema and response validation
- **Error Handling** - HTTP status code verification
- **Rate Limiting** - API throttling and limits

### Security Tests (`npm run test:security`)
- **XSS Prevention** - Cross-site scripting protection
- **SQL Injection** - Database security validation  
- **CSRF Protection** - Cross-site request forgery
- **Authentication Bypass** - Security loophole detection
- **Header Security** - HTTP security header validation

### Performance Tests (`npm run test:performance`)
- **Core Web Vitals** - Google performance metrics
- **Lighthouse Audits** - Comprehensive performance analysis
- **Load Time Analysis** - Page and resource loading
- **Bundle Size Validation** - JavaScript and CSS optimization
- **Memory Usage** - Browser memory consumption

### Accessibility Tests (`npm run test:accessibility`)
- **WCAG Compliance** - Web accessibility guidelines
- **Keyboard Navigation** - Tab order and shortcuts
- **Screen Reader** - Assistive technology support
- **Color Contrast** - Visual accessibility validation
- **Focus Management** - Interactive element focus

## 📋 Available Commands

### 🔍 **Testing Commands**
```bash
# Run all tests
npm test

# Test by category
npm run test:ui              # UI/E2E tests
npm run test:api             # API endpoint tests
npm run test:security        # Security vulnerability tests
npm run test:performance     # Performance & Web Vitals
npm run test:accessibility   # Accessibility compliance
npm run test:mobile          # Mobile device testing
npm run test:e2e             # End-to-end user journeys

# Test by environment
npm run test:dev             # Development environment
npm run test:staging         # Staging environment
npm run test:prod            # Production environment

# Test execution modes
npm run test:smoke           # Quick validation tests
npm run test:regression      # Full regression suite
npm run test:parallel        # Maximum parallelization
npm run test:debug           # Debug mode with UI
npm run test:headed          # Visual test execution
```

### 🛠️ **Development Tools**
```bash
# Setup and configuration
npm run setup:interactive    # Guided setup wizard
npm run setup:ci            # CI environment setup
npm run setup:env           # Environment configuration

# Code generation
npm run dev:generate ui "Page Name"        # Generate UI test
npm run dev:generate api "API Name"        # Generate API test  
npm run dev:page-object "PageName"        # Generate page object
npm run dev:fixture "FixtureName"         # Generate test fixture

# Development utilities
npm run dev:dashboard        # Live test dashboard
npm run dev:debug "test-file.spec.ts"     # Debug specific test
npm run dev:record           # Record test actions
npm run dev:trace            # Generate execution trace
npm run dev:codegen          # Playwright codegen tool
```

### 📊 **Analytics & Reporting**
```bash
# Generate reports
npm run report:allure        # Generate Allure report
npm run report:html          # Generate HTML report
npm run report:json          # Generate JSON report
npm run analytics:report     # Test analytics dashboard
npm run analytics:trends     # Performance trends
npm run analytics:flaky      # Flaky test analysis

# Quality gates
npm run quality:check        # Run quality validation
npm run quality:coverage     # Coverage analysis
npm run quality:performance  # Performance budget check
npm run quality:security     # Security gate validation
```

### ⚙️ **Maintenance Commands**
```bash
# Validation and health
npm run validate:setup       # Validate boilerplate setup
npm run validate:all         # Comprehensive validation
npm run health-check         # System health verification

# Cleanup and maintenance
npm run clean:reports        # Clean generated reports
npm run clean:screenshots    # Clean test screenshots
npm run clean:cache          # Clear Playwright cache
npm run clean:all            # Full cleanup

# Updates and upgrades  
npm run update:browsers      # Update Playwright browsers
npm run update:deps          # Update dependencies
npm run security:audit       # Security vulnerability audit
```

## ⚙️ Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# Application URLs
BASE_URL=http://localhost:3000
API_BASE_URL=https://api.yourapp.com
STAGING_URL=https://staging.yourapp.com
PROD_URL=https://yourapp.com

# Authentication
TEST_USERNAME=test@example.com
TEST_PASSWORD=SecurePassword123!
AUTH_TOKEN=your-auth-token

# API Configuration
API_TIMEOUT=30000
API_RETRIES=3

# Performance Budgets
PERFORMANCE_BUDGET_FCP=1800      # First Contentful Paint (ms)
PERFORMANCE_BUDGET_LCP=2500      # Largest Contentful Paint (ms)
PERFORMANCE_BUDGET_CLS=0.1       # Cumulative Layout Shift
PERFORMANCE_BUDGET_JS_SIZE=1000000  # JavaScript bundle size (bytes)

# Test Configuration
PARALLEL_WORKERS=4
TEST_TIMEOUT=30000
EXPECT_TIMEOUT=10000
RETRY_COUNT=2

# Reporting
ALLURE_RESULTS_DIR=allure-results
REPORT_PORTAL_TOKEN=your-rp-token
SLACK_WEBHOOK=your-slack-webhook

# CI/CD
SKIP_BROWSER_INSTALL=false
PWDEBUG=0
```

### Playwright Configuration

The `playwright.config.ts` includes:

```typescript
// Multi-project setup
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  { name: 'mobile', use: { ...devices['Pixel 5'] } },
  { name: 'tablet', use: { ...devices['iPad Pro'] } }
]

// Global configuration
timeout: 60000,
expect: { timeout: 10000 },
retries: process.env.CI ? 2 : 1,
workers: process.env.CI ? 1 : 4

// Enhanced reporting
reporter: [
  ['html'],
  ['allure-playwright'],
  ['json', { outputFile: 'results.json' }],
  ['junit', { outputFile: 'results.xml' }]
]
```

## 🚀 CI/CD Integration

### GitHub Actions

The included `.github/workflows/playwright.yml` provides:

- **Matrix Testing** - Cross-browser and cross-platform
- **Sharded Execution** - Parallel test distribution
- **Quality Gates** - Automated validation checkpoints
- **Security Scanning** - Dependency and code analysis
- **Performance Monitoring** - Budget enforcement
- **Artifact Management** - Test results and reports
- **Notification Integration** - Slack, Teams, email alerts

### Pipeline Stages

1. **🔍 Audit Stage**
   - Dependency security scan
   - Code linting and formatting
   - TypeScript compilation check

2. **🧪 Test Stage**  
   - Cross-browser matrix execution
   - Parallel test sharding
   - Mobile and tablet testing

3. **⚡ Quality Gates**
   - Performance budget validation
   - Security vulnerability check
   - Accessibility compliance

4. **📊 Reporting**
   - Consolidated test results
   - Allure report generation
   - GitHub Pages deployment

## 🔧 Advanced Features

### Test Analytics & Insights

```bash
# Generate comprehensive analytics
npm run analytics:report

# View flaky test analysis
npm run analytics:flaky

# Performance trend analysis
npm run analytics:trends

# Coverage analysis
npm run analytics:coverage
```

### Mock Server & Contract Testing

```bash
# Start mock server
npm run mock:start

# Validate API contracts
npm run test:contracts

# Generate contract from OpenAPI
npm run contract:generate
```

### Visual Testing & Debugging

```bash
# Record test execution
npm run test:record

# Generate trace files
npm run test:trace

# Debug with browser UI
npm run test:debug

# Update visual baselines
npm run test:update-screenshots
```

### Quality Gates

```bash
# Run all quality gates
npm run quality:check

# Performance budget check
npm run quality:performance

# Coverage validation
npm run quality:coverage

# Security gate validation
npm run quality:security
```

## 🎯 Best Practices

### Test Organization

1. **Page Object Model** - Encapsulate page interactions
2. **Data-Driven Testing** - Separate test data from logic
3. **Fixture Management** - Reusable test setup and teardown
4. **Tag-Based Execution** - Organize tests with descriptive tags

### Performance Optimization

1. **Parallel Execution** - Maximize test throughput
2. **Smart Waiting** - Use proper wait strategies
3. **Resource Management** - Efficient browser lifecycle
4. **Selective Testing** - Run relevant tests based on changes

### Code Quality

1. **TypeScript Integration** - Type-safe test development
2. **Linting & Formatting** - Consistent code style
3. **Code Review** - Peer validation process
4. **Documentation** - Comprehensive test documentation

## 🛡️ Security Considerations

### Test Data Security

- Use environment variables for sensitive data
- Implement test data encryption
- Rotate test credentials regularly
- Avoid committing secrets to version control

### CI/CD Security

- Secure secret management
- Branch protection rules
- Dependency vulnerability scanning  
- Container security scanning

## 📈 Monitoring & Alerting

### Performance Monitoring

- Core Web Vitals tracking
- Performance budget alerts
- Regression detection
- Trend analysis and reporting

### Test Health Monitoring

- Flaky test detection and analysis
- Test execution time tracking
- Failure rate monitoring
- Coverage trend analysis

## 🔍 Troubleshooting

### Common Issues

#### Browser Installation
```bash
# Install specific browser
npx playwright install chromium

# Install all browsers with system dependencies
npx playwright install --with-deps
```

#### Test Failures
```bash
# Run with debug output
DEBUG=pw:* npm test

# Generate trace for failed tests
npm run test:trace

# Run in headed mode for visual debugging
npm run test:headed
```

#### Performance Issues
```bash
# Check system resources
npm run dev:system-info

# Run with reduced parallelization
npm run test -- --workers=1

# Clear cache and reinstall
npm run clean:all && npm install
```

#### Configuration Issues
```bash
# Validate configuration
npm run validate:setup

# Reset to default configuration
npm run setup:reset

# Run interactive setup
npm run setup:interactive
```

## 📚 Documentation

- [📖 **Getting Started Guide**](docs/GETTING_STARTED.md)  
- [🎯 **Test Writing Guidelines**](docs/TEST_GUIDELINES.md)
- [🔧 **Configuration Reference**](docs/CONFIGURATION.md)
- [🚀 **CI/CD Setup Guide**](docs/CICD_SETUP.md)
- [🛡️ **Security Best Practices**](docs/SECURITY.md)
- [⚡ **Performance Testing**](docs/PERFORMANCE.md)
- [♿ **Accessibility Testing**](docs/ACCESSIBILITY.md)
- [🔍 **Troubleshooting Guide**](docs/TROUBLESHOOTING.md)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Run tests (`npm test`)
4. Run quality checks (`npm run quality:check`)
5. Commit changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Playwright Team](https://playwright.dev) - Amazing testing framework
- [Allure Framework](https://allure.qatools.ru) - Beautiful test reporting
- [GitHub Actions](https://github.com/features/actions) - Powerful CI/CD platform

## 🌟 Support

- **Documentation**: [Wiki](https://github.com/set-programmator/playwright-tests/wiki)
- **Issues**: [GitHub Issues](https://github.com/set-programmator/playwright-tests/issues)
- **Discussions**: [GitHub Discussions](https://github.com/set-programmator/playwright-tests/discussions)
- **Slack**: [#playwright-tests](https://set-programmator.slack.com/channels/playwright-tests)

---

**Ready to build world-class web applications with confidence!** 🚀

*This boilerplate includes everything you need for enterprise-grade testing. Perfect for startups to Fortune 500 companies.*

[![Built with ❤️](https://img.shields.io/badge/Built%20with-❤️-red.svg)](https://github.com/set-programmator/playwright-tests)
[![Powered by Playwright](https://img.shields.io/badge/Powered%20by-Playwright-green.svg)](https://playwright.dev)