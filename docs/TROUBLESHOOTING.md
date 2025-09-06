# Troubleshooting Guide

## Common Issues

### Installation Problems

#### Browser Installation Fails
```bash
# Solution: Install browsers manually
npx playwright install
npx playwright install-deps
```

#### Permission Errors (Windows)
```bash
# Run as administrator or use:
npm config set prefix %APPDATA%\npm
```

### Test Execution Issues

#### Tests Timeout
- Increase timeout in `playwright.config.ts`
- Check network connectivity
- Verify application is running
- Use `--headed` mode to debug

#### Element Not Found
- Verify selectors are correct
- Check if element is in viewport
- Wait for element to be visible
- Use `page.pause()` to debug

#### Flaky Tests
- Add proper waits
- Use `waitForLoadState('networkidle')`
- Implement retry mechanisms
- Check for race conditions

### Reporting Issues

#### Allure Report Not Generated
```bash
# Install Allure CLI
npm install -g allure-commandline
# Generate report
npm run report:generate
```

#### HTML Report Empty
- Check test execution completed
- Verify reporter configuration
- Clear previous reports

### CI/CD Problems

#### GitHub Actions Failing
- Check secrets are configured
- Verify environment variables
- Review workflow permissions
- Check browser compatibility

#### Docker Issues
```bash
# Rebuild container
docker-compose build --no-cache
# Check logs
docker-compose logs playwright-tests
```

### Performance Issues

#### Slow Test Execution
- Reduce parallel workers
- Optimize selectors
- Use `networkidle` sparingly
- Profile test execution

#### Memory Issues
- Limit concurrent tests
- Close unused contexts
- Monitor resource usage
- Use headless mode

## Debug Commands

```bash
# Debug specific test
npx playwright test --debug tests/ui/login.spec.ts

# Run with trace
npx playwright test --trace on

# Show trace viewer
npx playwright show-trace trace.zip

# Generate test code
npx playwright codegen localhost:3000
```

## Getting Help

1. Check this troubleshooting guide
2. Search existing issues
3. Create detailed bug report
4. Include environment details
5. Provide minimal reproduction case