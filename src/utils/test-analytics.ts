import { test as base, TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

type TestResult = {
  retry: number;
  parallelIndex: number;
  workerIndex: number;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  errors: Array<{ message?: string; toString(): string }>;
  stdout: string[];
  stderr: string[];
  attachments: any[];
  startTime: Date;
  steps: any[];
};

type AnalyticsData = {
  testName: string;
  startTime: number;
  endTime: number;
  duration: number;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  retry: number;
  browser: string;
  project: string;
  errors: string[];
  tags: string[];
  timestamp: string;
};

class TestAnalytics {
  private analyticsDir: string;
  private flakyTestsDB: string;
  private metricsFile: string;

  constructor() {
    this.analyticsDir = path.join(process.cwd(), 'analytics');
    this.flakyTestsDB = path.join(this.analyticsDir, 'flaky-tests.json');
    this.metricsFile = path.join(this.analyticsDir, 'test-metrics.json');
    this.ensureAnalyticsDir();
  }

  private ensureAnalyticsDir() {
    if (!fs.existsSync(this.analyticsDir)) {
      fs.mkdirSync(this.analyticsDir, { recursive: true });
    }
  }

  async recordTestResult(testInfo: TestInfo, result: TestResult) {
    const analyticsData: AnalyticsData = {
      testName: testInfo.title,
      startTime: result.startTime.getTime(),
      endTime: result.startTime.getTime() + result.duration,
      duration: result.duration,
      status: result.status,
      retry: result.retry,
      browser: testInfo.project.name,
      project: testInfo.project.name,
      errors: result.errors.map((error: any) => error.message || error.toString()),
      tags: this.extractTags(testInfo.title),
      timestamp: new Date().toISOString()
    };

    await this.saveTestResult(analyticsData);
    await this.updateFlakyTestDatabase(analyticsData);
    await this.updateMetrics(analyticsData);
  }

  private extractTags(testTitle: string): string[] {
    const tagRegex = /@(\w+)/g;
    const tags: string[] = [];
    let match;
    while ((match = tagRegex.exec(testTitle)) !== null) {
      tags.push(match[1]);
    }
    return tags;
  }

  private async saveTestResult(data: AnalyticsData) {
    const dailyFile = path.join(this.analyticsDir, `${new Date().toISOString().split('T')[0]}.json`);
    let existingData: AnalyticsData[] = [];
    
    if (fs.existsSync(dailyFile)) {
      try {
        existingData = JSON.parse(fs.readFileSync(dailyFile, 'utf8'));
      } catch (error) {
        console.warn('Could not parse existing analytics data:', error);
      }
    }
    
    existingData.push(data);
    fs.writeFileSync(dailyFile, JSON.stringify(existingData, null, 2));
  }

  private async updateFlakyTestDatabase(data: AnalyticsData) {
    let flakyTests: Record<string, any> = {};
    
    if (fs.existsSync(this.flakyTestsDB)) {
      try {
        flakyTests = JSON.parse(fs.readFileSync(this.flakyTestsDB, 'utf8'));
      } catch (error) {
        console.warn('Could not parse flaky tests database:', error);
      }
    }

    const testKey = `${data.testName}_${data.browser}`;
    
    if (!flakyTests[testKey]) {
      flakyTests[testKey] = {
        testName: data.testName,
        browser: data.browser,
        totalRuns: 0,
        failures: 0,
        retries: 0,
        firstSeen: data.timestamp,
        lastSeen: data.timestamp,
        flakyScore: 0,
        recentResults: []
      };
    }

    const testEntry = flakyTests[testKey];
    testEntry.totalRuns++;
    testEntry.lastSeen = data.timestamp;
    
    if (data.status === 'failed') {
      testEntry.failures++;
    }
    
    if (data.retry > 0) {
      testEntry.retries++;
    }

    // Keep last 50 results for trend analysis
    testEntry.recentResults.push({
      status: data.status,
      duration: data.duration,
      retry: data.retry,
      timestamp: data.timestamp
    });
    
    if (testEntry.recentResults.length > 50) {
      testEntry.recentResults = testEntry.recentResults.slice(-50);
    }

    // Calculate flaky score (0-100, higher = more flaky)
    const recentFailureRate = testEntry.recentResults.filter((r: any) => r.status === 'failed').length / testEntry.recentResults.length;
    const recentRetryRate = testEntry.recentResults.filter((r: any) => r.retry > 0).length / testEntry.recentResults.length;
    testEntry.flakyScore = Math.round((recentFailureRate * 50 + recentRetryRate * 50) * 100);

    fs.writeFileSync(this.flakyTestsDB, JSON.stringify(flakyTests, null, 2));
  }

  private async updateMetrics(data: AnalyticsData) {
    let metrics: any = {
      totalRuns: 0,
      totalFailures: 0,
      totalDuration: 0,
      averageDuration: 0,
      browsers: {},
      tags: {},
      lastUpdated: data.timestamp
    };

    if (fs.existsSync(this.metricsFile)) {
      try {
        metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
      } catch (error) {
        console.warn('Could not parse metrics file:', error);
      }
    }

    metrics.totalRuns++;
    metrics.totalDuration += data.duration;
    metrics.averageDuration = metrics.totalDuration / metrics.totalRuns;
    
    if (data.status === 'failed') {
      metrics.totalFailures++;
    }

    // Browser stats
    if (!metrics.browsers[data.browser]) {
      metrics.browsers[data.browser] = { runs: 0, failures: 0, totalDuration: 0 };
    }
    metrics.browsers[data.browser].runs++;
    metrics.browsers[data.browser].totalDuration += data.duration;
    if (data.status === 'failed') {
      metrics.browsers[data.browser].failures++;
    }

    // Tag stats  
    data.tags.forEach(tag => {
      if (!metrics.tags[tag]) {
        metrics.tags[tag] = { runs: 0, failures: 0 };
      }
      metrics.tags[tag].runs++;
      if (data.status === 'failed') {
        metrics.tags[tag].failures++;
      }
    });

    metrics.lastUpdated = data.timestamp;
    fs.writeFileSync(this.metricsFile, JSON.stringify(metrics, null, 2));
  }

  async getFlakyTests(threshold: number = 20): Promise<any[]> {
    if (!fs.existsSync(this.flakyTestsDB)) {
      return [];
    }

    try {
      const flakyTests = JSON.parse(fs.readFileSync(this.flakyTestsDB, 'utf8'));
      return Object.values(flakyTests)
        .filter((test: any) => test.flakyScore >= threshold)
        .sort((a: any, b: any) => b.flakyScore - a.flakyScore);
    } catch (error) {
      console.warn('Could not read flaky tests database:', error);
      return [];
    }
  }

  async generateReport(): Promise<string> {
    const flakyTests = await this.getFlakyTests();
    let report = '# Test Analytics Report\n\n';
    
    if (flakyTests.length > 0) {
      report += '## 🔥 Flaky Tests (Score >= 20)\n\n';
      flakyTests.slice(0, 10).forEach((test: any, index: number) => {
        report += `${index + 1}. **${test.testName}** (${test.browser})\n`;
        report += `   - Flaky Score: ${test.flakyScore}/100\n`;
        report += `   - Total Runs: ${test.totalRuns}, Failures: ${test.failures}\n`;
        report += `   - Last Seen: ${new Date(test.lastSeen).toLocaleDateString()}\n\n`;
      });
    } else {
      report += '## ✅ No Flaky Tests Detected\n\nAll tests are running reliably!\n\n';
    }

    // Add metrics
    if (fs.existsSync(this.metricsFile)) {
      try {
        const metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
        report += '## 📊 Overall Metrics\n\n';
        report += `- Total Runs: ${metrics.totalRuns}\n`;
        report += `- Total Failures: ${metrics.totalFailures}\n`;
        report += `- Success Rate: ${((1 - metrics.totalFailures / metrics.totalRuns) * 100).toFixed(2)}%\n`;
        report += `- Average Duration: ${(metrics.averageDuration / 1000).toFixed(2)}s\n\n`;
      } catch (error) {
        console.warn('Could not read metrics for report:', error);
      }
    }

    return report;
  }
}

export const testAnalytics = new TestAnalytics();

// Enhanced test with analytics - simplified version
export const test = base;