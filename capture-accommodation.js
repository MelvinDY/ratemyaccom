const { chromium } = require('playwright');
const path = require('path');

async function captureAccommodation() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
  });
  const page = await context.newPage();

  const screenshotDir = path.join(__dirname, '.playwright-mcp', 'site-analysis');

  try {
    // Go to homepage and look for accommodation links
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Try to find any accommodation link on the homepage
    const accomLinks = await page.locator('a[href*="/accommodation/"]').all();

    if (accomLinks.length > 0) {
      const href = await accomLinks[0].getAttribute('href');
      console.log(`Found accommodation link: ${href}`);

      // Visit the accommodation detail page
      await page.goto(`http://localhost:3000${href}`, { waitUntil: 'networkidle', timeout: 30000 });
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

      console.log('✓ Successfully captured accommodation detail page');
    } else {
      console.log('No accommodation links found on homepage');
    }
  } catch (error) {
    console.error('Error:', error.message);
  }

  await browser.close();
}

captureAccommodation().catch(console.error);
