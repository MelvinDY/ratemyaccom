const { chromium } = require('playwright');
const path = require('path');

async function captureDetail() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const screenshotDir = path.join(__dirname, '.playwright-mcp', 'site-analysis');

  try {
    const url = 'http://localhost:3000/accommodation/unsw-kensington-colleges';
    console.log(`Navigating to: ${url}`);

    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Desktop screenshot
    const desktopPath = path.join(screenshotDir, 'accommodation-detail-desktop.png');
    await page.screenshot({ path: desktopPath, fullPage: true });
    console.log(`✓ Desktop screenshot saved: ${desktopPath}`);

    // Mobile screenshot
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(500);
    const mobilePath = path.join(screenshotDir, 'accommodation-detail-mobile.png');
    await page.screenshot({ path: mobilePath, fullPage: true });
    console.log(`✓ Mobile screenshot saved: ${mobilePath}`);
  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
}

captureDetail().catch(console.error);
