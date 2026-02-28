import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

export class QualityGateValidator {
  private coverageDir: string;
  private thresholds: QualityThresholds;

  constructor(thresholds?: Partial<QualityThresholds>) {
    this.coverageDir = path.join(process.cwd(), 'coverage');
    this.thresholds = {
      lineCoverage: 80,
      branchCoverage: 70,
      functionCoverage: 85,
      statementCoverage: 80,
      maxTestDuration: 10000, // 10 seconds
      maxFailureRate: 5, // 5%
      minPassRate: 95, // 95%
      ...thresholds
    };
  }

  async validateCoverage(page: any): Promise<ValidationResult> {
    // Start coverage collection
    await Promise.all([
      page.coverage.startCSSCoverage(),
      page.coverage.startJSCoverage()
    ]);

    // Navigation and interaction goes here (handled by test)
    
    // Stop coverage and get results
    const [cssCoverage, jsCoverage] = await Promise.all([
      page.coverage.stopCSSCoverage(),
      page.coverage.stopJSCoverage()
    ]);

    return this.analyzeCoverage([...cssCoverage, ...jsCoverage]);
  }

  private analyzeCoverage(coverage: any[]): ValidationResult {
    let totalBytes = 0;
    let usedBytes = 0;
    const fileResults: FileCovrageResult[] = [];

    coverage.forEach(entry => {
      const fileTotal = entry.text.length;
      let fileUsed = 0;

      for (const range of entry.ranges) {
        fileUsed += range.end - range.start - 1;
      }

      totalBytes += fileTotal;
      usedBytes += fileUsed;

      const fileCoverage = (fileUsed / fileTotal) * 100;
      fileResults.push({
        url: entry.url,
        totalBytes: fileTotal,
        usedBytes: fileUsed,
        coveragePercent: fileCoverage
      });
    });

    const overallCoverage = (usedBytes / totalBytes) * 100;

    return {
      passed: overallCoverage >= this.thresholds.lineCoverage,
      overallCoverage,
      fileResults,
      threshold: this.thresholds.lineCoverage,
      message: overallCoverage >= this.thresholds.lineCoverage 
        ? `✅ Coverage passed: ${overallCoverage.toFixed(2)}%` 
        : `❌ Coverage failed: ${overallCoverage.toFixed(2)}% (need ${this.thresholds.lineCoverage}%)`
    };
  }

  async generateCoverageReport(result: ValidationResult): Promise<void> {
    if (!fs.existsSync(this.coverageDir)) {
      fs.mkdirSync(this.coverageDir, { recursive: true });
    }

    const report = {
      timestamp: new Date().toISOString(),
      overallCoverage: result.overallCoverage,
      threshold: result.threshold,
      passed: result.passed,
      files: result.fileResults.map(file => ({
        url: file.url.replace(process.env.BASE_URL || 'http://localhost', ''),
        coverage: file.coveragePercent.toFixed(2),
        totalBytes: file.totalBytes,
        usedBytes: file.usedBytes
      })).filter(file => !file.url.includes('node_modules'))
    };

    // JSON report for programmatic access
    fs.writeFileSync(
      path.join(this.coverageDir, 'coverage-report.json'),
      JSON.stringify(report, null, 2)
    );

    // Human-readable report
    let htmlReport = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Code Coverage Report</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .header { background: ${result.passed ? '#d4edda' : '#f8d7da'}; padding: 20px; border-radius: 5px; }
        .metric { display: inline-block; margin: 10px 20px 10px 0; padding: 10px; background: #f8f9fa; border-radius: 3px; }
        .file { margin: 10px 0; padding: 10px; border-left: 3px solid #007bff; background: #f8f9fa; }
        .low-coverage { border-left-color: #dc3545; background: #fff5f5; }
        .medium-coverage { border-left-color: #ffc107; background: #fffadb; }
        .high-coverage { border-left-color: #28a745; background: #f1f8e9; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>Code Coverage Report</h1>
        <p><strong>Status:</strong> ${result.passed ? '✅ PASSED' : '❌ FAILED'}</p>
        <p><strong>Overall Coverage:</strong> ${result.overallCoverage.toFixed(2)}%</p>
        <p><strong>Threshold:</strong> ${result.threshold}%</p>
        <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
      </div>

      <h2>File Coverage Details</h2>
    `;

    report.files
      .sort((a, b) => parseFloat(a.coverage) - parseFloat(b.coverage))
      .forEach(file => {
        const coverage = parseFloat(file.coverage);
        const cssClass = coverage < 50 ? 'low-coverage' : coverage < 80 ? 'medium-coverage' : 'high-coverage';
        
        htmlReport += `
          <div class="file ${cssClass}">
            <strong>${file.url}</strong><br>
            Coverage: ${file.coverage}% (${file.usedBytes}/${file.totalBytes} bytes)
          </div>
        `;
      });

    htmlReport += `
      </body>
      </html>
    `;

    fs.writeFileSync(path.join(this.coverageDir, 'coverage-report.html'), htmlReport);
  }

  async validatePerformanceBudgets(metrics: PerformanceMetrics): Promise<QualityGateResult> {
    const results: QualityGateResult = {
      coverage: { passed: true, message: '', value: 0, threshold: 0 },
      performance: { passed: true, message: '', value: 0, threshold: 0 },
      reliability: { passed: true, message: '', value: 0, threshold: 0 }
    };

    // Performance validations
    if (metrics.firstContentfulPaint > 1800) {
      results.performance.passed = false;
      results.performance.message = `FCP too slow: ${metrics.firstContentfulPaint}ms (max: 1800ms)`;
      results.performance.value = metrics.firstContentfulPaint;
      results.performance.threshold = 1800;
    }

    if (metrics.largestContentfulPaint > 2500) {
      results.performance.passed = false;
      results.performance.message = `LCP too slow: ${metrics.largestContentfulPaint}ms (max: 2500ms)`;
      results.performance.value = metrics.largestContentfulPaint;
      results.performance.threshold = 2500;
    }

    if (metrics.cumulativeLayoutShift > 0.1) {
      results.performance.passed = false;
      results.performance.message = `CLS too high: ${metrics.cumulativeLayoutShift} (max: 0.1)`;
      results.performance.value = metrics.cumulativeLayoutShift;
      results.performance.threshold = 0.1;
    }

    return results;
  }

  async enforceQualityGates(): Promise<boolean> {
    const reports = [
      path.join(this.coverageDir, 'coverage-report.json'),
      path.join('analytics', 'test-metrics.json')
    ];

    let gatesPassed = true;

    for (const reportPath of reports) {
      if (!fs.existsSync(reportPath)) {
        console.log(`⚠️  Quality gate report missing: ${reportPath}`);
        continue;
      }

      try {
        const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
        
        if (reportPath.includes('coverage')) {
          if (!report.passed) {
            console.log(`❌ Coverage quality gate failed: ${report.overallCoverage.toFixed(2)}% < ${report.threshold}%`);
            gatesPassed = false;
          } else {
            console.log(`✅ Coverage quality gate passed: ${report.overallCoverage.toFixed(2)}%`);
          }
        }

        if (reportPath.includes('test-metrics')) {
          const successRate = ((1 - report.totalFailures / report.totalRuns) * 100);
          if (successRate < this.thresholds.minPassRate) {
            console.log(`❌ Test reliability quality gate failed: ${successRate.toFixed(2)}% < ${this.thresholds.minPassRate}%`);
            gatesPassed = false;
          } else {
            console.log(`✅ Test reliability quality gate passed: ${successRate.toFixed(2)}%`);
          }
        }
      } catch (error) {
        console.log(`❌ Error reading quality gate report: ${error instanceof Error ? error.message : String(error)}`);
        gatesPassed = false;
      }
    }

    return gatesPassed;
  }
}

// Types
interface QualityThresholds {
  lineCoverage: number;
  branchCoverage: number;
  functionCoverage: number;
  statementCoverage: number;
  maxTestDuration: number;
  maxFailureRate: number;
  minPassRate: number;
}

interface ValidationResult {
  passed: boolean;
  overallCoverage: number;
  fileResults: FileCovrageResult[];
  threshold: number;
  message: string;
}

interface FileCovrageResult {
  url: string;
  totalBytes: number;
  usedBytes: number;
  coveragePercent: number;
}

interface PerformanceMetrics {
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
}

interface QualityGateResult {
  coverage: {
    passed: boolean;
    message: string;
    value: number;
    threshold: number;
  };
  performance: {
    passed: boolean;
    message: string;
    value: number;
    threshold: number;
  };
  reliability: {
    passed: boolean;
    message: string;
    value: number;
    threshold: number;
  };
}

export const qualityGates = new QualityGateValidator();