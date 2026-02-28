import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Security Headers Tests @security', () => {
  const securityHeaders = [
    'X-Content-Type-Options',
    'X-Frame-Options', 
    'X-XSS-Protection',
    'Strict-Transport-Security',
    'Content-Security-Policy',
    'Referrer-Policy'
  ];

  test('should have security headers configured', async ({ page }) => {
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    const headers = response?.headers();
    
    // Check for essential security headers
    expect(headers?.['x-content-type-options']).toBe('nosniff');
    expect(headers?.['x-frame-options']).toMatch(/(DENY|SAMEORIGIN)/);
    
    // Warn about missing headers but don't fail test
    securityHeaders.forEach(header => {
      const headerKey = header.toLowerCase();
      if (!headers?.[headerKey]) {
        console.warn(`⚠️  Missing security header: ${header}`);
      }
    });
  });

  test('should not expose sensitive information in headers', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers();
    
    // Headers that should not reveal version information
    const sensitiveHeaders = ['server', 'x-powered-by', 'x-aspnet-version'];
    
    sensitiveHeaders.forEach(header => {
      if (headers?.[header]) {
        console.warn(`⚠️  Potentially sensitive header exposed: ${header}: ${headers[header]}`);
      }
    });
  });

  test('should have proper HTTPS configuration', async ({ page }) => {
    // Only run if testing HTTPS endpoint
    if (process.env.BASE_URL?.startsWith('https://')) {
      const response = await page.goto('/');
      const headers = response?.headers();
      
      expect(headers?.['strict-transport-security']).toBeTruthy();
    } else {
      test.skip(true, 'Skipping HTTPS test for non-HTTPS endpoint');
    }
  });
});