const { chromium } = require('playwright');
const path = require('path');

async function takeScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  // Set viewport for consistent screenshots
  await page.setViewportSize({ width: 1280, height: 800 });

  const screenshotsDir = path.join(__dirname, 'screenshots');

  console.log('Taking screenshots of CJS 2026 website...\n');

  // 1. Homepage hero section
  console.log('1. Capturing homepage hero...');
  await page.goto('https://cjs2026.web.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000); // Wait for animations
  await page.screenshot({
    path: path.join(screenshotsDir, '01-homepage-hero.png'),
    clip: { x: 0, y: 0, width: 1280, height: 800 }
  });

  // 2. Homepage timeline section
  console.log('2. Capturing timeline section...');
  await page.evaluate(() => {
    const timeline = document.querySelector('#timeline') || document.querySelector('[class*="timeline"]');
    if (timeline) timeline.scrollIntoView({ behavior: 'instant', block: 'start' });
  });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(screenshotsDir, '02-timeline-section.png'),
  });

  // 3. Homepage stats/info cards
  console.log('3. Capturing stats section...');
  await page.evaluate(() => window.scrollTo(0, 600));
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(screenshotsDir, '03-stats-section.png'),
  });

  // 4. Schedule page
  console.log('4. Capturing schedule page...');
  await page.goto('https://cjs2026.web.app/schedule', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(screenshotsDir, '04-schedule-page.png'),
  });

  // 5. Schedule page - sessions list
  console.log('5. Capturing schedule sessions...');
  await page.evaluate(() => window.scrollTo(0, 400));
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(screenshotsDir, '05-schedule-sessions.png'),
  });

  // 6. Footer
  console.log('6. Capturing footer...');
  await page.goto('https://cjs2026.web.app/', { waitUntil: 'networkidle' });
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(screenshotsDir, '06-footer.png'),
  });

  // 7. Full page homepage
  console.log('7. Capturing full homepage...');
  await page.goto('https://cjs2026.web.app/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  await page.screenshot({
    path: path.join(screenshotsDir, '07-homepage-full.png'),
    fullPage: true
  });

  await browser.close();

  console.log('\n✓ Screenshots saved to docs/screenshots/');
}

takeScreenshots().catch(console.error);
