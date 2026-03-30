const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function analyzeSite() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  const screenshotDir = path.join(__dirname, '.playwright-mcp', 'site-analysis');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const pages = [
    { name: 'homepage', url: 'http://localhost:3000/', description: 'Homepage' },
    { name: 'browse', url: 'http://localhost:3000/browse', description: 'Browse Page' },
    { name: 'about', url: 'http://localhost:3000/about', description: 'About Page' },
    { name: 'login', url: 'http://localhost:3000/login', description: 'Login Page' },
  ];

  const report = {
    timestamp: new Date().toISOString(),
    pages: [],
  };

  for (const pageInfo of pages) {
    console.log(`\n📸 Capturing: ${pageInfo.description}...`);

    try {
      await page.goto(pageInfo.url, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(2000); // Allow animations to settle

      // Take desktop screenshot
      const desktopPath = path.join(screenshotDir, `${pageInfo.name}-desktop.png`);
      await page.screenshot({ path: desktopPath, fullPage: true });
      console.log(`✓ Desktop screenshot saved: ${desktopPath}`);

      // Take mobile screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForTimeout(500);
      const mobilePath = path.join(screenshotDir, `${pageInfo.name}-mobile.png`);
      await page.screenshot({ path: mobilePath, fullPage: true });
      console.log(`✓ Mobile screenshot saved: ${mobilePath}`);

      // Reset viewport
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Collect page metrics
      const metrics = {
        name: pageInfo.name,
        url: pageInfo.url,
        description: pageInfo.description,
        desktopScreenshot: desktopPath,
        mobileScreenshot: mobilePath,
      };

      // Get page title
      metrics.title = await page.title();

      // Check for common elements
      metrics.hasHeader = await page.locator('header').count() > 0;
      metrics.hasFooter = await page.locator('footer').count() > 0;
      metrics.hasNav = await page.locator('nav').count() > 0;

      // Check for loading states
      metrics.hasLoadingSpinner = await page.locator('[role="status"], [aria-busy="true"], .spinner, .loading').count() > 0;

      // Check for buttons and links
      metrics.buttonCount = await page.locator('button').count();
      metrics.linkCount = await page.locator('a').count();

      // Check for images
      metrics.imageCount = await page.locator('img').count();
      const images = await page.locator('img').all();
      const imagesWithAlt = [];
      for (const img of images) {
        const alt = await img.getAttribute('alt');
        if (alt !== null && alt !== '') {
          imagesWithAlt.push(alt);
        }
      }
      metrics.imagesWithAlt = imagesWithAlt.length;
      metrics.missingAlt = metrics.imageCount - metrics.imagesWithAlt;

      // Check for headings
      const headings = {};
      for (let i = 1; i <= 6; i++) {
        headings[`h${i}`] = await page.locator(`h${i}`).count();
      }
      metrics.headings = headings;

      // Check for forms
      metrics.formCount = await page.locator('form').count();
      metrics.inputCount = await page.locator('input').count();

      // Get text content length (as proxy for content richness)
      const bodyText = await page.locator('body').textContent();
      metrics.contentLength = bodyText.trim().length;

      // Check for ARIA labels and roles
      metrics.ariaLabels = await page.locator('[aria-label]').count();
      metrics.ariaRoles = await page.locator('[role]').count();

      report.pages.push(metrics);

    } catch (error) {
      console.error(`✗ Error analyzing ${pageInfo.description}:`, error.message);
      report.pages.push({
        name: pageInfo.name,
        url: pageInfo.url,
        description: pageInfo.description,
        error: error.message,
      });
    }
  }

  // Try to find and capture an accommodation detail page
  try {
    console.log(`\n📸 Capturing: Accommodation Detail Page...`);
    await page.goto('http://localhost:3000/browse', { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(2000);

    // Find first accommodation link
    const firstAccomLink = page.locator('a[href*="/accommodation/"]').first();
    const accomLinkExists = await firstAccomLink.count() > 0;

    if (accomLinkExists) {
      const accomUrl = await firstAccomLink.getAttribute('href');
      console.log(`Found accommodation: ${accomUrl}`);

      await page.goto(`http://localhost:3000${accomUrl}`, { waitUntil: 'networkidle', timeout: 30000 });
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

      const metrics = {
        name: 'accommodation-detail',
        url: `http://localhost:3000${accomUrl}`,
        description: 'Accommodation Detail Page',
        desktopScreenshot: desktopPath,
        mobileScreenshot: mobilePath,
        title: await page.title(),
        hasHeader: await page.locator('header').count() > 0,
        hasFooter: await page.locator('footer').count() > 0,
        imageCount: await page.locator('img').count(),
        buttonCount: await page.locator('button').count(),
      };

      report.pages.push(metrics);
    } else {
      console.log('No accommodation links found on browse page');
    }
  } catch (error) {
    console.error('✗ Error capturing accommodation detail:', error.message);
  }

  // Save report
  const reportPath = path.join(screenshotDir, 'analysis-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\n✓ Analysis complete! Report saved to: ${reportPath}`);

  await browser.close();
}

analyzeSite().catch(console.error);
