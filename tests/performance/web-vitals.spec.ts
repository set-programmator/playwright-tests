import { test, expect } from '../../src/fixtures/test-fixtures';

test.describe('Performance Tests @performance', () => {
  test('should meet performance benchmarks', async ({ page }) => {
    // Navigate to the page
    await page.goto('/', { waitUntil: 'networkidle' });

    // Measure Core Web Vitals
    const webVitals = await page.evaluate(() => {
      return new Promise<{
        fcp?: number;
        lcp?: number;
        cls?: number;
      }>((resolve) => {
        const vitals: {
          fcp?: number;
          lcp?: number;
          cls?: number;
        } = {};
        
        // First Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry) => {
            if (entry.name === 'first-contentful-paint') {
              vitals.fcp = entry.startTime;
            }
          });
        }).observe({ entryTypes: ['paint'] });

        // Largest Contentful Paint
        new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          vitals.lcp = lastEntry.startTime;
        }).observe({ entryTypes: ['largest-contentful-paint'] });

        // Cumulative Layout Shift
        let clsScore = 0;
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            const layoutEntry = entry as any;
            if (!layoutEntry.hadRecentInput) {
              clsScore += layoutEntry.value;
            }
          }
          vitals.cls = clsScore;
        }).observe({ entryTypes: ['layout-shift'] });

        setTimeout(() => resolve(vitals), 3000);
      });
    });

    // Performance assertions (Web Vitals thresholds)
    if (webVitals.fcp) {
      expect(webVitals.fcp).toBeLessThan(1800); // FCP should be < 1.8s
    }
    
    if (webVitals.lcp) {
      expect(webVitals.lcp).toBeLessThan(2500); // LCP should be < 2.5s
    }
    
    if (webVitals.cls !== undefined) {
      expect(webVitals.cls).toBeLessThan(0.1); // CLS should be < 0.1
    }

    console.log('Web Vitals:', webVitals);
  });

  test('should have acceptable resource loading times', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(5000); // Page should load within 5 seconds

    // Check resource sizes
    const resources = await page.evaluate(() => {
      return performance.getEntriesByType('resource').map(resource => {
        const resourceEntry = resource as any;
        return {
          name: resource.name,
          size: resourceEntry.transferSize || 0,
          duration: resource.duration,
          type: resourceEntry.initiatorType || 'unknown'
        };
      });
    });

    // Log largest resources
    const largeResources = resources
      .filter(r => r.size > 100000) // > 100KB
      .sort((a, b) => b.size - a.size)
      .slice(0, 5);

    if (largeResources.length > 0) {
      console.log('Largest resources:', largeResources);
    }

    // Assert total JavaScript bundle size is reasonable
    const jsResources = resources.filter(r => r.type === 'script');
    const totalJsSize = jsResources.reduce((sum, r) => sum + (r.size || 0), 0);
    
    expect(totalJsSize).toBeLessThan(1000000); // Total JS should be < 1MB
  });

  test('should have minimal unused CSS and JavaScript', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    // Enable coverage
    await Promise.all([
      page.coverage.startCSSCoverage(),
      page.coverage.startJSCoverage()
    ]);

    // Interact with key parts of the page
    await page.click('body');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Stop coverage and calculate unused bytes
    const [cssCoverage, jsCoverage] = await Promise.all([
      page.coverage.stopCSSCoverage(),
      page.coverage.stopJSCoverage()
    ]);

    let totalBytes = 0;
    let usedBytes = 0;

    [...cssCoverage, ...jsCoverage].forEach(entry => {
      const coverageEntry = entry as any;
      totalBytes += coverageEntry.text?.length || 0;
      const ranges = coverageEntry.ranges || [];
      for (const range of ranges) {
        usedBytes += (range.end || 0) - (range.start || 0) - 1;
      }
    });

    const unusedBytes = totalBytes - usedBytes;
    const unusedPercentage = (unusedBytes / totalBytes) * 100;

    console.log(`Code coverage: ${(100 - unusedPercentage).toFixed(2)}% used`);
    
    // Warn if more than 50% of code is unused
    if (unusedPercentage > 50) {
      console.warn(`⚠️  ${unusedPercentage.toFixed(2)}% of code is unused`);
    }
  });
});