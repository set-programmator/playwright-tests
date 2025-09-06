# Playwright Boilerplate

A comprehensive, production-ready Playwright boilerplate for UI and API testing with TypeScript, featuring modular architecture, robust reporting, and CI/CD integration.

## 🚀 Features

- **Full TypeScript Support** - Type-safe testing with IntelliSense
- **Page Object Model** - Maintainable and reusable page objects
- **API Testing Framework** - Complete REST API testing with schema validation
- **Multi-Browser Support** - Chrome, Firefox, Safari, Edge
- **Mobile Testing** - Responsive design and mobile browser simulation
- **Accessibility Testing** - WCAG compliance with axe-core
- **Visual Testing** - Screenshot comparison and regression testing
- **Allure Reporting** - Interactive test reports with history
- **CI/CD Ready** - GitHub Actions and Docker support
- **Code Quality** - ESLint, Prettier, and Husky pre-commit hooks

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🛠️ Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd playwright-tests
npm install
npm run setup:install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your configuration
```

### 3. Run Tests

```bash
# UI Tests
npm run test:ui

# API Tests  
npm run test:api

# All Tests
npm test

# Headed Mode
npm run test:headed

# Debug Mode
npm run test:debug
```

### 4. View Reports

```bash
# HTML Report
npm run report:open

# Allure Report
npm run report:allure
```

## 📁 Project Structure

```
playwright-boilerplate/
├── src/
│   ├── pages/           # Page Object Models
│   ├── components/      # Reusable UI components  
│   ├── api/            # API test utilities
│   ├── fixtures/       # Test fixtures
│   ├── utils/          # Helper functions
│   └── config/         # Configuration files
├── tests/
│   ├── ui/             # UI test suites
│   ├── api/            # API test suites
│   └── e2e/            # End-to-end scenarios
├── data/               # Test data files
├── reports/            # Test reports
└── docs/               # Documentation
```

## 🧪 Writing Tests

### UI Tests with Page Objects

```typescript
import { test, expect } from '../src/fixtures/test-fixtures';

test('login flow', async ({ loginPage, homePage, testData }) => {
  const user = testData.getUser('default');
  
  await loginPage.login(user.username, user.password);
  expect(await homePage.isUserLoggedIn()).toBe(true);
});
```

### API Tests with Schema Validation

```typescript
test('users API', async ({ usersAPI }) => {
  const response = await usersAPI.getUserById(1);
  const schema = usersAPI.getUserSchema();
  
  expect(response.status()).toBe(200);
  expect(await usersAPI.validateSchema(response, schema)).toBe(true);
});
```

## 📊 Available Scripts

| Script | Description |
|--------|-------------|
| `test:ui` | Run UI tests |
| `test:api` | Run API tests |
| `test:mobile` | Run mobile tests |
| `test:smoke` | Run smoke tests (@smoke tag) |
| `test:regression` | Run regression tests (@regression tag) |
| `test:parallel` | Run tests in parallel |
| `test:headed` | Run tests in headed mode |
| `test:debug` | Run tests in debug mode |
| `report:open` | Open HTML report |
| `report:allure` | Open Allure report |
| `lint` | Run ESLint |
| `format` | Format code with Prettier |

## 🏷️ Test Tags

Use tags to organize and run specific test suites:

- `@smoke` - Critical functionality tests
- `@regression` - Full regression suite  
- `@api` - API-specific tests
- `@ui` - UI-specific tests
- `@e2e` - End-to-end scenarios

## 🐳 Docker Usage

### Run Tests in Docker

```bash
# Build and run
docker-compose up playwright-tests

# Run specific tests
docker-compose run playwright-tests npm run test:smoke

# View Allure reports
docker-compose up allure-report
# Open http://localhost:5050
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BASE_URL` | Application base URL | `http://localhost:3000` |
| `API_BASE_URL` | API base URL | `https://jsonplaceholder.typicode.com` |
| `HEADLESS` | Run in headless mode | `true` |
| `WORKERS` | Number of parallel workers | `4` |

### Browser Configuration

Edit `playwright.config.ts` to customize:
- Browser settings
- Viewport sizes  
- Timeouts
- Retry strategies
- Reporter options

## 📈 Reporting

### HTML Report
- Built-in Playwright reporter
- Screenshots and videos on failure
- Test timeline and traces

### Allure Report  
- Interactive test results
- Test history and trends
- Detailed failure analysis
- Test categorization

### CI/CD Integration
- JUnit XML for CI systems
- JSON reports for custom processing
- Artifact storage and retention

## 🔍 Debugging

### Debug Mode
```bash
npm run test:debug
```

### Trace Viewer
```bash
npx playwright show-trace trace.zip
```

### Screenshots and Videos
Automatically captured on failure and stored in `test-results/`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

See [CONTRIBUTING.md](docs/CONTRIBUTING.md) for detailed guidelines.

## 📚 Documentation

- [API Testing Guide](docs/API.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Best Practices](docs/BEST_PRACTICES.md)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🆘 Support

- Create an issue for bugs or feature requests
- Check [troubleshooting guide](docs/TROUBLESHOOTING.md)
- Review [best practices](docs/BEST_PRACTICES.md)