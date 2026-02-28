#!/usr/bin/env node

/**
 * Playwright MCP CLI Tool
 * Generate tests from website analysis
 */

import dotenv = require('dotenv');
import readline = require('readline');
import {
  analyzeSite,
  generateTestFile,
  generatePageObject,
  saveGeneratedFiles,
  SiteAnalysisResult
} from '../src/mcp/playwright-mcp-server';

// Load environment variables
dotenv.config();

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
  console.log('\n🤖 Playwright MCP Test Generator');
  console.log('================================\n');

  let url: string | null = null;

  // 1. Check for command line argument
  if (process.argv[2]) {
    url = process.argv[2];
    console.log(`📍 Using URL from argument: ${url}\n`);
  }

  // 2. Check for BASE_URL in environment
  if (!url && process.env.BASE_URL) {
    const useEnv = await question(
      `📍 Found BASE_URL in .env: ${process.env.BASE_URL}\n   Use this URL? (y/n): `
    );

    if (useEnv.toLowerCase() === 'y') {
      url = process.env.BASE_URL;
    }
  }

  // 3. Ask user for URL
  if (!url) {
    url = await question('\n🌐 Enter the website URL to analyze: ');
  }

  if (!url.startsWith('http')) {
    url = 'http://' + url;
  }

  try {
    console.log('\n🔍 Analyzing website...');
    console.log(`   URL: ${url}\n`);

    const analysis = await analyzeSite(url);

    // Display analysis results
    console.log('✅ Website Analysis Complete!\n');
    console.log('📊 Page Analysis Results:');
    console.log(`   Title: ${analysis.title}`);
    console.log(`   Forms Found: ${analysis.forms.length}`);
    console.log(`   Buttons Found: ${analysis.buttons.length}`);
    console.log(`   Links Found: ${analysis.links.length}`);
    console.log(`   Input Fields: ${analysis.inputs.length}`);
    console.log(`   Images with Alt: ${analysis.accessibility.imagesWithAlt}`);
    console.log(`   Images without Alt: ${analysis.accessibility.imagesWithoutAlt}\n`);

    // Display page structure
    console.log('🏗️  Page Structure:');
    console.log(`   Has Header: ${analysis.pageStructure.hasHeader}`);
    console.log(`   Has Navigation: ${analysis.pageStructure.hasNav}`);
    console.log(`   Has Main Content: ${analysis.pageStructure.hasMain}`);
    console.log(`   Has Footer: ${analysis.pageStructure.hasFooter}\n`);

    // Display heading hierarchy
    if (analysis.pageStructure.headingHierarchy.length > 0) {
      console.log('📑 Heading Hierarchy:');
      analysis.pageStructure.headingHierarchy.forEach((heading, index) => {
        console.log(`   ${index + 1}. ${heading}`);
      });
      console.log('');
    }

    // Display forms
    if (analysis.forms.length > 0) {
      console.log('📋 Forms Found:');
      analysis.forms.forEach((form, index) => {
        console.log(`   Form ${index + 1}:`);
        console.log(`     Fields: ${form.fields.join(', ')}`);
        console.log(`     Submit Button: ${form.submitButton}`);
      });
      console.log('');
    }

    // Ask for confirmation to generate tests
    const generateTests = await question('🚀 Generate test files? (y/n): ');

    if (generateTests.toLowerCase() === 'y') {
      console.log('\n📝 Generating test files...\n');

      const files = await saveGeneratedFiles(analysis);

      console.log('✅ Test files generated successfully!\n');
      console.log(`📄 Test File: ${files.testFile}`);
      console.log(`📄 Page Object: ${files.pageObjectFile}\n`);

      console.log('🎯 Next Steps:');
      console.log('   1. Review the generated files');
      console.log('   2. Customize test cases as needed');
      console.log('   3. Run the tests: npm run test:ui\n');

      console.log('💡 Tips:');
      console.log('   - Fill in selectors that were detected automatically');
      console.log('   - Uncomment navigation tests that require interaction');
      console.log('   - Add more specific assertions based on your requirements\n');
    }
  } catch (error) {
    console.error('❌ Error analyzing website:', error);
    if (error instanceof Error) {
      console.error('   Details:', error.message);
    }
  } finally {
    rl.close();
  }
}

main();
