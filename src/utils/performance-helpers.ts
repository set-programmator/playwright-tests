import { Page } from '@playwright/test';

interface WebVitals {
  cls: number;
  fid: number;
  lcp: number;
}

interface NavigationTiming {
  domContentLoaded: number;
  loadComplete: number;
  firstContentfulPaint: number;
}

interface BundleInfo {
  totalSize: number;
  resources: Array<{ name: string; size: number }>;
}

export class PerformanceHelpers {
  constructor(private page: Page) {}

  async measurePageLoad(): Promise<NavigationTiming> {
    const navigationTiming = await this.page.evaluate(() => {
      const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paint = performance.getEntriesByType('paint');
      const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
      
      return {
        domContentLoaded: nav.domContentLoadedEventEnd - nav.fetchStart,
        loadComplete: nav.loadEventEnd - nav.fetchStart,
        firstContentfulPaint: fcp?.startTime || 0
      };
    });
    
    return navigationTiming;
  }

  async measureWebVitals(): Promise<WebVitals> {
    return await this.page.evaluate((): Promise<WebVitals> => {
      return new Promise<WebVitals>((resolve) => {
        const vitals = { cls: 0, fid: 0, lcp: 0 };
        
        new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'layout-shift' && 'value' in entry) {
              vitals.cls += (entry as any).value;
            } else if (entry.entryType === 'first-input' && 'processingStart' in entry) {
              vitals.fid = (entry as any).processingStart - entry.startTime;
            } else if (entry.entryType === 'largest-contentful-paint') {
              vitals.lcp = entry.startTime;
            }
          });
        }).observe({ entryTypes: ['layout-shift', 'first-input', 'largest-contentful-paint'] });
        
        setTimeout(() => resolve(vitals), 3000);
      });
    });
  }

  async checkBundleSize(): Promise<BundleInfo> {
    const resources = await this.page.evaluate((): Array<{ name: string; size: number }> => {
      return performance.getEntriesByType('resource').map((entry) => {
        const resourceEntry = entry as PerformanceResourceTiming;
        return {
          name: resourceEntry.name,
          size: resourceEntry.encodedBodySize || resourceEntry.transferSize || 0,
        };
      });
    });

    const totalSize = resources.reduce((sum, resource) => sum + resource.size, 0);
    return { totalSize, resources };
  }
}