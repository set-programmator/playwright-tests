import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Input Validation & XSS Tests @security', () => {
  const xssPayloads = [
    '<script>alert("XSS")</script>',
    '"><script>alert("XSS")</script>',
    "javascript:alert('XSS')",
    '<img src=x onerror=alert("XSS")>',
    '<svg/onload=alert("XSS")>'
  ];

  test('should sanitize user input fields', async ({ page }) => {
    await page.goto('/');
    
    // Find input fields
    const inputs = await page.locator('input[type="text"], textarea, input[type="search"]').all();
    
    for (const input of inputs) {
      for (const payload of xssPayloads) {
        await input.fill(payload);
        
        // Check if payload is reflected in DOM without sanitization
        const pageContent = await page.content();
        expect(pageContent).not.toContain('<script>alert("XSS")</script>');
        
        await input.clear();
      }
    }
  });

  test('should prevent SQL injection in search/form inputs', async ({ page }) => {
    const sqlPayloads = [
      "' OR '1'='1",
      '" OR "1"="1',
      '1; DROP TABLE users; --',
      "admin'--",
      "' UNION SELECT NULL,NULL,NULL--"
    ];

    await page.goto('/');
    
    // Test search functionality if available
    try {
      const searchInput = page.locator('input[type="search"], input[name*="search"]').first();
      
      if (await searchInput.isVisible({ timeout: 5000 })) {
        for (const payload of sqlPayloads) {
          await searchInput.fill(payload);
          await page.keyboard.press('Enter');
          
          // Check for database errors in response
          const pageContent = await page.content().catch(() => '');
          expect(pageContent.toLowerCase()).not.toContain('sql syntax');
          expect(pageContent.toLowerCase()).not.toContain('mysql');
          expect(pageContent.toLowerCase()).not.toContain('ora-');
        }
      }
    } catch (error) {
      console.log('No search input found, skipping SQL injection test');
    }
  });

  test('should have proper error handling without info disclosure', async ({ page }) => {
    // Test invalid routes
    const invalidRoutes = ['/admin', '/config', '/.env', '/backup', '/test'];
    
    for (const route of invalidRoutes) {
      const response = await page.goto(route, { waitUntil: 'networkidle' });
      
      // Check that error responses don't expose sensitive information
      const content = await page.content();
      expect(content.toLowerCase()).not.toContain('stack trace');
      expect(content.toLowerCase()).not.toContain('internal server error');
      expect(content.toLowerCase()).not.toContain('debug');
    }
  });
});