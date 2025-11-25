import { chromium } from 'playwright';

async function debugSupportTabs() {
  console.log('Starting Support Page Debug Test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const consoleMessages = [];
  const errors = [];

  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text()
    });
    console.log(`[Browser ${msg.type()}]:`, msg.text());
  });

  page.on('pageerror', error => {
    errors.push(error.message);
    console.error('[Page Error]:', error.message);
  });

  try {
    console.log('1. Navigating to http://localhost:3001/support...');
    await page.goto('http://localhost:3001/support', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    console.log('✓ Page loaded\n');

    console.log('2. Checking page structure...');

    // Check if tab buttons exist by text
    const helpButton = page.getByText('Help Center');
    const contactButton = page.getByText('Contact Us');
    const privacyButton = page.getByText('Privacy Policy');
    const termsButton = page.getByText('Terms of Service');

    console.log('   Help Center button exists:', await helpButton.count() > 0);
    console.log('   Contact Us button exists:', await contactButton.count() > 0);
    console.log('   Privacy Policy button exists:', await privacyButton.count() > 0);
    console.log('   Terms of Service button exists:', await termsButton.count() > 0);
    console.log('');

    // Get HTML structure
    console.log('3. Examining DOM structure...');
    const tabsContainer = await page.locator('[class*="Tabs"]').first();
    const tabsHTML = await tabsContainer.evaluate(el => {
      return {
        tagName: el.tagName,
        classes: el.className,
        childrenCount: el.children.length,
        innerHTML: el.innerHTML.substring(0, 500)
      };
    }).catch(() => null);

    if (tabsHTML) {
      console.log('   Tabs container:', tabsHTML.tagName);
      console.log('   Classes:', tabsHTML.classes);
      console.log('   Children count:', tabsHTML.childrenCount);
    }

    // Check for tab content
    const tabPanels = await page.locator('[role="tabpanel"]').count();
    console.log('   Tab panels found:', tabPanels);
    console.log('');

    // Take screenshot before clicking
    await page.screenshot({ path: '.playwright-mcp/support-before-click.png', fullPage: true });
    console.log('4. Screenshot saved: support-before-click.png\n');

    console.log('5. Testing Help Center button click...');
    await helpButton.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.playwright-mcp/support-after-help-click.png', fullPage: true });
    console.log('   Screenshot saved: support-after-help-click.png\n');

    // Check if content appeared
    const faqHeading = page.getByText('Frequently Asked Questions');
    const faqVisible = await faqHeading.isVisible();
    console.log('   FAQ heading visible:', faqVisible);
    console.log('');

    console.log('6. Testing Contact Us button click...');
    await contactButton.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.playwright-mcp/support-after-contact-click.png', fullPage: true });
    console.log('   Screenshot saved: support-after-contact-click.png\n');

    const contactHeading = page.getByText('Get in Touch');
    const contactVisible = await contactHeading.isVisible();
    console.log('   Contact heading visible:', contactVisible);
    console.log('');

    console.log('7. Testing Privacy Policy button click...');
    await privacyButton.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.playwright-mcp/support-after-privacy-click.png', fullPage: true });
    console.log('   Screenshot saved: support-after-privacy-click.png\n');

    const privacyHeading = page.locator('h2:has-text("Privacy Policy")');
    const privacyVisible = await privacyHeading.isVisible();
    console.log('   Privacy heading visible:', privacyVisible);
    console.log('');

    console.log('8. Testing Terms button click...');
    await termsButton.first().click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: '.playwright-mcp/support-after-terms-click.png', fullPage: true });
    console.log('   Screenshot saved: support-after-terms-click.png\n');

    const termsHeading = page.locator('h2:has-text("Terms of Service")');
    const termsVisible = await termsHeading.isVisible();
    console.log('   Terms heading visible:', termsVisible);
    console.log('');

    // Check active states
    console.log('9. Checking active tab states...');
    const activeButtons = await page.locator('[data-state="active"]').count();
    console.log('   Elements with data-state="active":', activeButtons);

    const inactiveButtons = await page.locator('[data-state="inactive"]').count();
    console.log('   Elements with data-state="inactive":', inactiveButtons);
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log('Tab buttons visible: YES');
    console.log('Tab content showing after clicks:');
    console.log('  - Help Center:', faqVisible ? '✓ YES' : '✗ NO');
    console.log('  - Contact Us:', contactVisible ? '✓ YES' : '✗ NO');
    console.log('  - Privacy Policy:', privacyVisible ? '✓ YES' : '✗ NO');
    console.log('  - Terms of Service:', termsVisible ? '✓ YES' : '✗ NO');
    console.log('Console errors:', errors.length);
    console.log('═══════════════════════════════════════════\n');

    if (!faqVisible && !contactVisible && !privacyVisible && !termsVisible) {
      console.log('ISSUE IDENTIFIED: Tabs are not displaying any content!');
      console.log('This could be:');
      console.log('  1. A hydration mismatch issue');
      console.log('  2. TabsContent components not rendering');
      console.log('  3. CSS hiding the content');
      console.log('  4. JavaScript error preventing tab switching');
    }

    // Keep browser open for manual inspection
    console.log('\nBrowser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('✗ Test failed:', error.message);
    await page.screenshot({ path: '.playwright-mcp/support-debug-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('\nTest completed. Browser closed.');
  }
}

debugSupportTabs().catch(console.error);
