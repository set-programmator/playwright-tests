#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class AnalyticsReporter {
  constructor() {
    this.analyticsDir = path.join(process.cwd(), 'analytics');
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.flakyTestsDB = path.join(this.analyticsDir, 'flaky-tests.json');
    this.metricsFile = path.join(this.analyticsDir, 'test-metrics.json');
  }

  async generateFlakyTestReport() {
    if (!fs.existsSync(this.flakyTestsDB)) {
      console.log('No flaky test data found. Run some tests first!');
      return;
    }

    const flakyTests = JSON.parse(fs.readFileSync(this.flakyTestsDB, 'utf8'));
    const flakyArray = Object.values(flakyTests)
      .filter(test => test.flakyScore >= 15) // Lower threshold for reporting
      .sort((a, b) => b.flakyScore - a.flakyScore);

    console.log('🔍 Flaky Test Analysis');
    console.log('=====================\n');

    if (flakyArray.length === 0) {
      console.log('✅ No flaky tests detected! All tests are stable.\n');
      return;
    }

    console.log(`⚠️  Found ${flakyArray.length} potentially flaky tests:\n`);

    flakyArray.forEach((test, index) => {
      const recentFailures = test.recentResults.filter(r => r.status === 'failed').length;
      const recentRetries = test.recentResults.filter(r => r.retry > 0).length;
      
      console.log(`${index + 1}. ${test.testName} (${test.browser})`);
      console.log(`   🔥 Flaky Score: ${test.flakyScore}/100`);
      console.log(`   📊 Stats: ${test.totalRuns} runs, ${test.failures} failures, ${test.retries} retries`);
      console.log(`   📈 Recent: ${recentFailures} failures, ${recentRetries} retries in last ${test.recentResults.length} runs`);
      console.log(`   ⏰ Last seen: ${new Date(test.lastSeen).toLocaleDateString()}`);
      console.log('');
    });

    // Generate recommendations
    this.generateFlakyTestRecommendations(flakyArray);
  }

  generateFlakyTestRecommendations(flakyTests) {
    console.log('💡 Recommendations:');
    console.log('==================\n');

    flakyTests.forEach((test, index) => {
      if (test.flakyScore > 50) {
        console.log(`🚨 HIGH PRIORITY: ${test.testName}`);
        console.log('   - Consider disabling temporarily');
        console.log('   - Review test logic for timing issues');
        console.log('   - Add explicit waits or retry logic\n');
      } else if (test.flakyScore > 25) {
        console.log(`⚠️  MEDIUM PRIORITY: ${test.testName}`);
        console.log('   - Monitor closely');
        console.log('   - Consider adding stability improvements\n');
      }
    });
  }

  async generatePerformanceReport() {
    if (!fs.existsSync(this.metricsFile)) {
      console.log('No metrics data found.');
      return;
    }

    const metrics = JSON.parse(fs.readFileSync(this.metricsFile, 'utf8'));
    
    console.log('⚡ Performance Analysis');
    console.log('======================\n');

    console.log(`📊 Overall Stats:`);
    console.log(`   Total Runs: ${metrics.totalRuns}`);
    console.log(`   Success Rate: ${((1 - metrics.totalFailures / metrics.totalRuns) * 100).toFixed(2)}%`);
    console.log(`   Average Duration: ${(metrics.averageDuration / 1000).toFixed(2)}s`);
    console.log('');

    // Browser performance comparison
    console.log('🌐 Browser Performance:');
    Object.entries(metrics.browsers).forEach(([browser, stats]) => {
      const successRate = ((1 - stats.failures / stats.runs) * 100).toFixed(2);
      const avgDuration = (stats.totalDuration / stats.runs / 1000).toFixed(2);
      console.log(`   ${browser}: ${successRate}% success, ${avgDuration}s avg`);
    });
    console.log('');

    // Tag performance
    if (Object.keys(metrics.tags).length > 0) {
      console.log('🏷️  Test Category Performance:');
      Object.entries(metrics.tags)
        .sort(([,a], [,b]) => b.runs - a.runs)
        .slice(0, 5)
        .forEach(([tag, stats]) => {
          const successRate = ((1 - stats.failures / stats.runs) * 100).toFixed(2);
          console.log(`   @${tag}: ${stats.runs} runs, ${successRate}% success`);
        });
    }
  }

  async generateTrendAnalysis() {
    const files = fs.readdirSync(this.analyticsDir)
      .filter(file => file.match(/\d{4}-\d{2}-\d{2}\.json/))
      .sort()
      .slice(-7); // Last 7 days

    if (files.length < 2) {
      console.log('Not enough historical data for trend analysis (need 2+ days)');
      return;
    }

    console.log('📈 7-Day Trend Analysis');
    console.log('=======================\n');

    const dailyStats = [];
    
    files.forEach(file => {
      const data = JSON.parse(fs.readFileSync(path.join(this.analyticsDir, file), 'utf8'));
      const date = file.replace('.json', '');
      const passed = data.filter(test => test.status === 'passed').length;
      const failed = data.filter(test => test.status === 'failed').length;
      const avgDuration = data.reduce((sum, test) => sum + test.duration, 0) / data.length / 1000;
      
      dailyStats.push({
        date,
        total: data.length,
        passed,
        failed,
        successRate: (passed / (passed + failed) * 100).toFixed(2),
        avgDuration: avgDuration.toFixed(2)
      });
    });

    dailyStats.forEach(day => {
      console.log(`📅 ${day.date}: ${day.total} tests, ${day.successRate}% success, ${day.avgDuration}s avg`);
    });

    // Trend indicators
    const firstDay = dailyStats[0];
    const lastDay = dailyStats[dailyStats.length - 1];
    
    const successTrend = parseFloat(lastDay.successRate) - parseFloat(firstDay.successRate);
    const durationTrend = parseFloat(lastDay.avgDuration) - parseFloat(firstDay.avgDuration);
    
    console.log('\n📊 Trends:');
    console.log(`   Success Rate: ${successTrend > 0 ? '📈' : '📉'} ${successTrend.toFixed(2)}% change`);
    console.log(`   Duration: ${durationTrend > 0 ? '📈' : '📉'} ${durationTrend.toFixed(2)}s change`);
  }

  async exportToCSV() {
    if (!fs.existsSync(this.analyticsDir)) {
      console.log('No analytics data to export');
      return;
    }

    const files = fs.readdirSync(this.analyticsDir)
      .filter(file => file.match(/\d{4}-\d{2}-\d{2}\.json/));

    let allData = [];
    files.forEach(file => {
      const data = JSON.parse(fs.readFileSync(path.join(this.analyticsDir, file), 'utf8'));
      allData = allData.concat(data);
    });

    const csvHeader = 'testName,browser,status,duration,retry,timestamp,tags\n';
    const csvData = allData.map(test => 
      `"${test.testName}","${test.browser}","${test.status}",${test.duration},${test.retry},"${test.timestamp}","${test.tags.join(';')}"`
    ).join('\n');

    const csvFile = path.join(this.reportsDir, 'test-analytics-export.csv');
    fs.writeFileSync(csvFile, csvHeader + csvData);
    console.log(`📊 Exported analytics data to: ${csvFile}`);
  }

  async cleanupOldData(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    const files = fs.readdirSync(this.analyticsDir)
      .filter(file => file.match(/\d{4}-\d{2}-\d{2}\.json/));

    let cleanedCount = 0;
    files.forEach(file => {
      const fileDate = new Date(file.replace('.json', ''));
      if (fileDate < cutoffDate) {
        fs.unlinkSync(path.join(this.analyticsDir, file));
        cleanedCount++;
      }
    });

    if (cleanedCount > 0) {
      console.log(`🧹 Cleaned up ${cleanedCount} old analytics files (older than ${daysToKeep} days)`);
    }
  }

  async run(options = {}) {
    console.log('🔬 Test Analytics Dashboard');
    console.log('===========================\n');

    if (!fs.existsSync(this.analyticsDir)) {
      console.log('No analytics data found. Run some tests first to collect data!');
      return;
    }

    if (options.flaky !== false) {
      await this.generateFlakyTestReport();
      console.log('\n');
    }

    if (options.performance !== false) {
      await this.generatePerformanceReport();
      console.log('\n');
    }

    if (options.trends !== false) {
      await this.generateTrendAnalysis();
      console.log('\n');
    }

    if (options.export) {
      await this.exportToCSV();
      console.log('');
    }

    if (options.cleanup) {
      await this.cleanupOldData(options.cleanup);
    }
  }
}

// CLI interface
if (require.main === module) {
  const args = process.argv.slice(2);
  const options = {
    flaky: !args.includes('--no-flaky'),
    performance: !args.includes('--no-performance'),
    trends: !args.includes('--no-trends'),
    export: args.includes('--export'),
    cleanup: args.includes('--cleanup') ? parseInt(args[args.indexOf('--cleanup') + 1]) || 30 : false
  };

  const reporter = new AnalyticsReporter();
  reporter.run(options).catch(console.error);
}

module.exports = AnalyticsReporter;