#!/usr/bin/env node

/**
 * Playwright MCP Master CLI
 * Integrated tool combining Planner, Generator, and Healer
 */

import * as fs from 'fs';
import * as path from 'path';
import * as readline from 'readline';
import { analyzeSite } from '../src/mcp/playwright-mcp-server';
import {
  generateTestPlan,
  formatTestPlanReport,
  TestPlan
} from '../src/mcp/playwright-mcp-planner';
import {
  generateTestData,
  generateFixtures,
  generateParameterizedTests,
  generateTestDataFile,
  generateFixturesFile,
  generateParameterizedTestsFile,
  formatGeneratorReport
} from '../src/mcp/playwright-mcp-generator';
import {
  performHealthScan,
  analyzeBestPractices,
  formatHealerReport
} from '../src/mcp/playwright-mcp-healer';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt: string): Promise<string> {
  return new Promise(resolve => {
    rl.question(prompt, answer => {
      resolve(answer);
    });
  });
}

async function main() {
  console.log(`
╔════════════════════════════════════════════════════════════╗
║     🎭 Playwright MCP Master Suite                        ║
║     Planner • Generator • Healer                          ║
╚════════════════════════════════════════════════════════════╝
  `);

  const mode = process.argv[2];

  if (mode === 'planner') {
    await runPlanner();
  } else if (mode === 'generator') {
    await runGenerator();
  } else if (mode === 'healer') {
    await runHealer();
  } else if (mode === 'full' || mode === 'all') {
    await runFullWorkflow();
  } else {
    showMenu();
  }

  rl.close();
}

async function showMenu() {
  console.log(`
📋 SELECT MODE:
  1. 🎯 Planner    - Create intelligent test plans
  2. ⚙️  Generator  - Generate test data & fixtures
  3. 🔧 Healer     - Scan and fix test issues
  4. 🚀 Full Mode  - Run all three in sequence
  `);

  const choice = await question('Choose (1-4 or q to quit): ');

  if (choice === '1') {
    await runPlanner();
  } else if (choice === '2') {
    await runGenerator();
  } else if (choice === '3') {
    await runHealer();
  } else if (choice === '4') {
    await runFullWorkflow();
  }
}

async function runPlanner() {
  console.log('\n🎯 TEST PLANNER\n===============\n');

  const url = await question('Enter website URL (or press Enter for .env): ');
  const baseUrl = url || process.env.BASE_URL || 'https://example.com';

  console.log(`\n🔍 Analyzing website: ${baseUrl}\n`);

  try {
    const analysis = await analyzeSite(baseUrl);
    const plan = generateTestPlan(analysis, baseUrl);

    console.log(formatTestPlanReport(plan));

    // Save plan to file
    const planFile = `plans/test-plan-${Date.now()}.json`;
    const planDir = path.dirname(planFile);
    if (!fs.existsSync(planDir)) {
      fs.mkdirSync(planDir, { recursive: true });
    }

    fs.writeFileSync(planFile, JSON.stringify(plan, null, 2));
    console.log(`\n✅ Test plan saved to: ${planFile}\n`);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }
}

async function runGenerator() {
  console.log('\n⚙️  TEST GENERATOR\n==================\n');

  const url = await question('Enter website URL (or press Enter for .env): ');
  const baseUrl = url || process.env.BASE_URL || 'https://example.com';

  console.log(`\n🔍 Analyzing website: ${baseUrl}\n`);

  try {
    const analysis = await analyzeSite(baseUrl);

    // Generate all resources
    const testData = generateTestData(analysis);
    const fixtures = generateFixtures(analysis);
    const paramTests = generateParameterizedTests(analysis);

    console.log(formatGeneratorReport(testData, fixtures, paramTests));

    // Create output directory
    const dataDir = 'generated-data';
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Save test data
    fs.writeFileSync(
      path.join(dataDir, 'test-data.ts'),
      generateTestDataFile(testData)
    );

    // Save fixtures
    fs.writeFileSync(
      path.join(dataDir, 'test-fixtures.ts'),
      generateFixturesFile(fixtures)
    );

    // Save parameterized tests
    fs.writeFileSync(
      path.join(dataDir, 'parameterized-tests.spec.ts'),
      generateParameterizedTestsFile(paramTests)
    );

    console.log(`\n✅ Generated files saved to: ${dataDir}/\n`);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }
}

async function runHealer() {
  console.log('\n🔧 TEST HEALER\n===============\n');

  const testDir = await question('Enter test directory (default: tests): ') || 'tests';

  console.log(`\n🔍 Scanning tests in: ${testDir}\n`);

  try {
    // Find all test files
    const testFiles = findTestFiles(testDir);
    console.log(`Found ${testFiles.length} test files\n`);

    let totalIssues = 0;

    for (const file of testFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const scan = performHealthScan(content, 1);
      const violations = analyzeBestPractices(content);

      if (scan.issuesFound > 0 || violations.length > 0) {
        console.log(formatHealerReport(scan, violations));
        totalIssues += scan.issuesFound;
      }
    }

    if (totalIssues === 0) {
      console.log(`✅ All tests are healthy! No issues found.\n`);
    } else {
      console.log(`\n⚠️  Found ${totalIssues} total issues. Please review above.\n`);
    }
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }
}

async function runFullWorkflow() {
  console.log('\n🚀 FULL WORKFLOW MODE\n=====================\n');

  const url = await question('Enter website URL (or press Enter for .env): ');
  const baseUrl = url || process.env.BASE_URL || 'https://example.com';

  console.log(`\n🔍 Starting full analysis of: ${baseUrl}\n`);

  try {
    // Step 1: Planner
    console.log('\n📋 STEP 1: CREATING TEST PLAN...\n');
    const analysis = await analyzeSite(baseUrl);
    const plan = generateTestPlan(analysis, baseUrl);
    console.log(formatTestPlanReport(plan));

    // Step 2: Generator
    console.log('\n⚙️  STEP 2: GENERATING TEST ARTIFACTS...\n');
    const testData = generateTestData(analysis);
    const fixtures = generateFixtures(analysis);
    const paramTests = generateParameterizedTests(analysis);
    console.log(formatGeneratorReport(testData, fixtures, paramTests));

    // Step 3: Healer
    console.log('\n🔧 STEP 3: HEALTH SCAN...\n');
    const scan = performHealthScan(JSON.stringify(plan));
    const violations = analyzeBestPractices(JSON.stringify(plan));
    console.log(formatHealerReport(scan, violations));

    // Save all artifacts
    const outputDir = `.mcp-output-${Date.now()}`;
    fs.mkdirSync(outputDir, { recursive: true });

    // Save plan
    fs.writeFileSync(
      path.join(outputDir, '1-test-plan.json'),
      JSON.stringify(plan, null, 2)
    );

    // Save generated resources
    fs.writeFileSync(
      path.join(outputDir, '2-test-data.ts'),
      generateTestDataFile(testData)
    );
    fs.writeFileSync(
      path.join(outputDir, '2-test-fixtures.ts'),
      generateFixturesFile(fixtures)
    );
    fs.writeFileSync(
      path.join(outputDir, '2-parameterized-tests.spec.ts'),
      generateParameterizedTestsFile(paramTests)
    );

    // Save health report
    fs.writeFileSync(
      path.join(outputDir, '3-healer-report.txt'),
      formatHealerReport(scan, violations)
    );

    console.log(`\n✅ All artifacts saved to: ${outputDir}/\n`);
    console.log(`📁 Generated files:
  • 1-test-plan.json
  • 2-test-data.ts
  • 2-test-fixtures.ts
  • 2-parameterized-tests.spec.ts
  • 3-healer-report.txt\n`);
  } catch (error) {
    console.error('❌ Error:', (error as Error).message);
  }
}

function findTestFiles(dir: string, pattern = '.spec.ts'): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      files.push(...findTestFiles(fullPath, pattern));
    } else if (entry.name.endsWith(pattern)) {
      files.push(fullPath);
    }
  }

  return files;
}

main().catch(console.error);
