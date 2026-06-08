const { chromium } = require('playwright');
const path = require('path');

async function analyzeAllPages() {
  const browser = await chromium.launch({ headless: true });
  const screenshotDir = path.join(__dirname, '.playwright-mcp', 'site-analysis');

  // Desktop viewport
  let context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  let page = await context.newPage();

  const pages = [
    { name: 'homepage', url: 'http://localhost:3002/', description: 'Homepage' },
    { name: 'browse', url: 'http://localhost:3002/browse', description: 'Browse Page' },
    { name: 'about', url: 'http://localhost:3002/about', description: 'About Page' },
    { name: 'login', url: 'http://localhost:3002/login', description: 'Login Page' },
    {
      name: 'accommodation-detail',
      url: 'http://localhost:3002/accommodation/unsw-kensington-colleges',
      description: 'Accommodation Detail',
    },
  ];

  console.log('📸 Capturing Desktop Screenshots...\n');

  for (const pageInfo of pages) {
    try {
      console.log(`Visiting: ${pageInfo.description}`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      const desktopPath = path.join(screenshotDir, `${pageInfo.name}-desktop.png`);
      await page.screenshot({ path: desktopPath, fullPage: true });
      console.log(`✓ Saved: ${desktopPath}\n`);
    } catch (error) {
      console.error(`✗ Error on ${pageInfo.description}:`, error.message, '\n');
    }
  }

  // Mobile viewport
  console.log('\n📱 Capturing Mobile Screenshots...\n');
  await context.close();
  context = await browser.newContext({
    viewport: { width: 375, height: 667 },
  });
  page = await context.newPage();

  for (const pageInfo of pages) {
    try {
      console.log(`Visiting: ${pageInfo.description}`);
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000);

      const mobilePath = path.join(screenshotDir, `${pageInfo.name}-mobile.png`);
      await page.screenshot({ path: mobilePath, fullPage: true });
      console.log(`✓ Saved: ${mobilePath}\n`);
    } catch (error) {
      console.error(`✗ Error on ${pageInfo.description}:`, error.message, '\n');
    }
  }

  await browser.close();
  console.log('✓ Analysis complete!');
}

analyzeAllPages().catch(console.error);
