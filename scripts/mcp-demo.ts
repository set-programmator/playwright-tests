#!/usr/bin/env node

/**
 * Playwright MCP Demo
 * This example shows how to use the MCP server programmatically
 */

import * as dotenv from 'dotenv';
import {
  analyzeSite,
  saveGeneratedFiles,
  SiteAnalysisResult
} from '../src/mcp/playwright-mcp-server';

dotenv.config();

async function main() {
  console.log('\n🤖 Playwright MCP Demo');
  console.log('======================\n');

  // Use BASE_URL from .env or fallback
  const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

  console.log(`📍 Analyzing: ${baseUrl}\n`);

  try {
    // 1. Analyze the website
    console.log('🔍 Analyzing website structure...');
    const analysis = await analyzeSite(baseUrl);

    // 2. Display analysis results
    console.log('\n✅ Analysis Complete!\n');
    console.log('📊 Detected Elements:');
    console.log(`   • Forms: ${analysis.forms.length}`);
    console.log(`   • Buttons: ${analysis.buttons.length}`);
    console.log(`   • Links: ${analysis.links.length}`);
    console.log(`   • Input fields: ${analysis.inputs.length}`);

    // 3. Show page structure
    console.log('\n🏗️  Page Structure:');
    console.log(`   • Has Header: ${analysis.pageStructure.hasHeader}`);
    console.log(`   • Has Navigation: ${analysis.pageStructure.hasNav}`);
    console.log(`   • Has Main: ${analysis.pageStructure.hasMain}`);
    console.log(`   • Has Footer: ${analysis.pageStructure.hasFooter}`);

    // 4. Show accessibility info
    console.log('\n♿ Accessibility Info:');
    console.log(`   • Page Title: ${analysis.accessibility.hasTitle}`);
    console.log(`   • Meta Description: ${analysis.accessibility.hasMetaDescription}`);
    console.log(`   • Language Attribute: ${analysis.accessibility.hasLang}`);
    console.log(`   • H1 Present: ${analysis.accessibility.headingsPresent}`);

    // 5. Show detected forms (if any)
    if (analysis.forms.length > 0) {
      console.log('\n📋 Detected Forms:');
      analysis.forms.forEach((form, index) => {
        console.log(`   Form ${index + 1}:`);
        console.log(`     • Fields: ${form.fields.join(', ')}`);
        console.log(`     • Submit: ${form.submitButton}`);
      });
    }

    // 6. Show detected buttons (if any)
    if (analysis.buttons.length > 0) {
      console.log('\n🔘 Detected Buttons:');
      analysis.buttons.slice(0, 5).forEach((btn, index) => {
        console.log(`   ${index + 1}. ${btn.text}`);
      });
      if (analysis.buttons.length > 5) {
        console.log(`   ... and ${analysis.buttons.length - 5} more`);
      }
    }

    // 7. Generate and save test files
    console.log('\n💾 Generating test files...');
    const files = await saveGeneratedFiles(analysis);

    console.log('\n✅ Files Generated:');
    console.log(`   📄 Test: ${files.testFile}`);
    console.log(`   📄 Page Object: ${files.pageObjectFile}`);

    // 8. Show next steps
    console.log('\n🚀 Next Steps:');
    console.log('   1. Review the generated test file');
    console.log('   2. Customize selectors and test data');
    console.log('   3. Run tests: npm run test:ui');
    console.log('   4. Add more test cases as needed\n');

    // 9. Show example of how to use page object
    console.log('💡 Example Usage in Your Tests:');
    console.log(`
import { ${analysis.title.split(' ')[0] + 'Page'} } from '../pages/${new URL(baseUrl).hostname}-page';

test('example test', async ({ page }) => {
  const app = new ${analysis.title.split(' ')[0] + 'Page'}(page);
  await app.goto();
  
  // Use generated methods
  // await app.fillForm({ email: 'test@example.com' });
  // await app.submitForm();
});
    `);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

main();
