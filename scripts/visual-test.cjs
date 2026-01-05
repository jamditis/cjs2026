/**
 * Visual Testing Script
 *
 * Uses Playwright to:
 * 1. Start a local dev server
 * 2. Screenshot all pages
 * 3. Extract and verify content
 * 4. Generate a verification report
 *
 * Usage: node scripts/visual-test.cjs
 */

const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const SCREENSHOT_DIR = path.join(__dirname, '..', 'test-screenshots');
// Test against live site for faster, more reliable testing
const BASE_URL = process.env.TEST_URL || 'https://cjs2026.web.app';

// Pages to test
const PAGES = [
  { path: '/', name: 'home', fullPage: true },
  { path: '/schedule', name: 'schedule', fullPage: true },
  { path: '/sponsors', name: 'sponsors', fullPage: true },
  { path: '/contact', name: 'contact', fullPage: true },
  { path: '/code-of-conduct', name: 'code-of-conduct', fullPage: true },
  { path: '/login', name: 'login', fullPage: false },
];

// Content to verify on each page
const CONTENT_CHECKS = {
  home: [
    { selector: 'body', contains: 'Pittsburgh', description: 'Pittsburgh location' },
    { selector: 'body', contains: '2026', description: 'Year 2026' },
    { selector: 'body', contains: 'Collaborative Journalism Summit', description: 'Summit name' },
    { selector: 'body', contains: 'June 8', description: 'Event date' },
    { selector: 'body', notContains: 'Chapel Hill', description: 'No Chapel Hill' },
    { selector: 'body', notContains: 'North Carolina', description: 'No North Carolina' },
  ],
  schedule: [
    { selector: 'body', contains: 'Schedule', description: 'Schedule heading' },
    { selector: 'body', contains: 'Monday', description: 'Monday sessions' },
    { selector: 'body', contains: 'Tuesday', description: 'Tuesday sessions' },
  ],
  sponsors: [
    { selector: 'body', contains: 'Sponsor', description: 'Sponsors section' },
    // Knight Foundation logo is displayed via img with alt text, not visible text
    // Visual confirmation: Logo appears under "Thank you to our sponsors"
    { selector: 'img[alt="Knight Foundation"]', exists: true, description: 'Knight Foundation logo' },
  ],
  login: [
    { selector: 'body', contains: 'Sign in', description: 'Sign in heading' },
  ],
};

let devServer = null;
let browser = null;

async function startDevServer() {
  return new Promise((resolve, reject) => {
    console.log('   Starting dev server...');

    devServer = spawn('npm', ['run', 'dev'], {
      cwd: path.join(__dirname, '..'),
      shell: true,
      stdio: 'pipe'
    });

    let output = '';

    devServer.stdout.on('data', (data) => {
      output += data.toString();
      if (output.includes('localhost:3000') || output.includes('Local:')) {
        console.log('   ✓ Dev server started on localhost:3000');
        setTimeout(resolve, 2000); // Give it a moment to stabilize
      }
    });

    devServer.stderr.on('data', (data) => {
      output += data.toString();
    });

    devServer.on('error', reject);

    // Timeout after 30 seconds
    setTimeout(() => {
      if (!output.includes('localhost')) {
        reject(new Error('Dev server failed to start'));
      }
    }, 30000);
  });
}

async function stopDevServer() {
  if (devServer) {
    console.log('   Stopping dev server...');
    devServer.kill('SIGTERM');
    // On Windows, we need to kill the process tree
    try {
      process.kill(devServer.pid);
    } catch (e) {}
  }
}

async function takeScreenshots(page) {
  const results = [];

  // Ensure screenshot directory exists
  if (!fs.existsSync(SCREENSHOT_DIR)) {
    fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
  }

  for (const pageConfig of PAGES) {
    const url = BASE_URL + pageConfig.path;
    console.log(`\n   📸 ${pageConfig.name} (${pageConfig.path})`);

    try {
      // Use 'load' instead of 'networkidle' for faster loading, with longer timeout
      await page.goto(url, { waitUntil: 'load', timeout: 60000 });
      await page.waitForTimeout(3000); // Wait for animations and lazy-loaded content

      // Take screenshot
      const screenshotPath = path.join(SCREENSHOT_DIR, `${pageConfig.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: pageConfig.fullPage
      });
      console.log(`      ✓ Screenshot saved: ${pageConfig.name}.png`);

      // Run content checks
      const checks = CONTENT_CHECKS[pageConfig.name] || [];
      const pageContent = await page.content();
      const bodyText = await page.textContent('body');

      const checkResults = [];
      for (const check of checks) {
        let passed = false;
        if (check.contains) {
          passed = bodyText.includes(check.contains);
        } else if (check.notContains) {
          passed = !bodyText.includes(check.notContains);
        } else if (check.exists) {
          // Check if element exists by selector
          const element = await page.$(check.selector);
          passed = element !== null;
        }

        checkResults.push({
          description: check.description,
          passed,
          expected: check.contains || (check.notContains ? `NOT: ${check.notContains}` : `EXISTS: ${check.selector}`)
        });

        if (passed) {
          console.log(`      ✓ ${check.description}`);
        } else {
          console.log(`      ✗ ${check.description}`);
        }
      }

      results.push({
        page: pageConfig.name,
        path: pageConfig.path,
        screenshot: screenshotPath,
        checks: checkResults,
        passed: checkResults.every(c => c.passed)
      });

    } catch (e) {
      console.log(`      ✗ Error: ${e.message}`);
      results.push({
        page: pageConfig.name,
        path: pageConfig.path,
        error: e.message,
        passed: false
      });
    }
  }

  return results;
}

async function extractTimelineData(page) {
  await page.goto(BASE_URL + '/', { waitUntil: 'load', timeout: 60000 });

  // Scroll to timeline section
  await page.evaluate(() => {
    const historySection = document.getElementById('history');
    if (historySection) historySection.scrollIntoView();
  });
  await page.waitForTimeout(1000);

  // Extract timeline years
  const timelineData = await page.evaluate(() => {
    const cards = document.querySelectorAll('[class*="card-sketch"]');
    const data = [];
    cards.forEach(card => {
      const yearEl = card.querySelector('[class*="font-accent"]');
      const locationEl = card.querySelector('[class*="font-heading"]');
      if (yearEl && locationEl) {
        const year = yearEl.textContent.trim();
        const location = locationEl.textContent.trim();
        if (year.match(/^\d{4}$/)) {
          data.push({ year, location });
        }
      }
    });
    return data;
  });

  return timelineData;
}

async function extractFooterData(page) {
  await page.goto(BASE_URL + '/', { waitUntil: 'load', timeout: 60000 });

  // Scroll to footer
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);

  const footerText = await page.evaluate(() => {
    const footer = document.querySelector('footer');
    return footer ? footer.textContent : '';
  });

  return footerText;
}

async function generateReport(results, timelineData, footerText) {
  const timestamp = new Date().toISOString();
  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.filter(r => !r.passed).length;

  let report = `# Visual Test Report

**Generated:** ${timestamp}
**Base URL:** ${BASE_URL}

## Summary

- ✅ Passed: ${passedCount}
- ❌ Failed: ${failedCount}

## Page Screenshots

| Page | Status | Screenshot |
|------|--------|------------|
`;

  for (const result of results) {
    const status = result.passed ? '✅' : '❌';
    const screenshot = result.screenshot ? path.basename(result.screenshot) : 'N/A';
    report += `| ${result.page} | ${status} | ${screenshot} |\n`;
  }

  report += `\n## Content Verification\n\n`;

  for (const result of results) {
    report += `### ${result.page} (${result.path})\n\n`;
    if (result.error) {
      report += `❌ Error: ${result.error}\n\n`;
    } else if (result.checks) {
      for (const check of result.checks) {
        const icon = check.passed ? '✅' : '❌';
        report += `- ${icon} ${check.description}\n`;
      }
      report += '\n';
    }
  }

  report += `## Timeline Data Extracted\n\n`;
  report += `| Year | Location |\n|------|----------|\n`;
  for (const item of timelineData) {
    report += `| ${item.year} | ${item.location} |\n`;
  }

  report += `\n## Footer Content\n\n`;
  report += `\`\`\`\n${footerText.substring(0, 500)}...\n\`\`\`\n`;

  // Write report
  const reportPath = path.join(SCREENSHOT_DIR, 'REPORT.md');
  fs.writeFileSync(reportPath, report);
  console.log(`\n   📄 Report saved: ${reportPath}`);

  return { passedCount, failedCount };
}

async function main() {
  console.log('='.repeat(60));
  console.log('  VISUAL TESTING');
  console.log('='.repeat(60));

  try {
    // Skip dev server when testing live site
    const isLiveSite = BASE_URL.includes('web.app') || BASE_URL.includes('firebaseapp.com');

    if (!isLiveSite) {
      console.log('\n🚀 STARTING DEV SERVER\n');
      await startDevServer();
    } else {
      console.log(`\n🌐 TESTING LIVE SITE: ${BASE_URL}\n`);
    }

    // Launch browser
    console.log('\n🌐 LAUNCHING BROWSER\n');
    browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 }
    });
    const page = await context.newPage();
    console.log('   ✓ Browser launched (1920x1080)');

    // Take screenshots and verify content
    console.log('\n📸 TAKING SCREENSHOTS & VERIFYING CONTENT');
    const results = await takeScreenshots(page);

    // Extract specific data
    console.log('\n📊 EXTRACTING DATA');
    console.log('   Extracting timeline data...');
    const timelineData = await extractTimelineData(page);
    console.log(`   ✓ Found ${timelineData.length} timeline entries`);

    console.log('   Extracting footer data...');
    const footerText = await extractFooterData(page);
    console.log('   ✓ Footer extracted');

    // Generate report
    console.log('\n📝 GENERATING REPORT');
    const { passedCount, failedCount } = await generateReport(results, timelineData, footerText);

    // Cleanup
    await browser.close();
    if (!isLiveSite) {
      await stopDevServer();
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('  VISUAL TEST RESULTS');
    console.log('='.repeat(60));
    console.log(`\n   ✅ Passed: ${passedCount}`);
    console.log(`   ❌ Failed: ${failedCount}`);
    console.log(`\n   Screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('\n' + '='.repeat(60));

    process.exit(failedCount > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    if (browser) await browser.close();
    await stopDevServer();
    process.exit(1);
  }
}

main();
