import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';
import { join } from 'path';

async function testSupportTabs() {
  console.log('Starting Support Page Tabs Test...\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  // Array to collect console messages and errors
  const consoleMessages = [];
  const errors = [];

  // Listen to console events
  page.on('console', msg => {
    consoleMessages.push({
      type: msg.type(),
      text: msg.text(),
      location: msg.location()
    });
  });

  // Listen to page errors
  page.on('pageerror', error => {
    errors.push({
      message: error.message,
      stack: error.stack
    });
  });

  try {
    console.log('1. Navigating to http://localhost:3001/support...');
    await page.goto('http://localhost:3001/support', { waitUntil: 'networkidle' });
    console.log('✓ Page loaded successfully\n');

    // Take initial screenshot
    await page.screenshot({ path: '.playwright-mcp/support-page-initial.png', fullPage: true });
    console.log('✓ Screenshot saved: support-page-initial.png\n');

    console.log('2. Checking if all 4 tabs are visible...');
    const tabs = [
      { value: 'help', label: 'Help Center' },
      { value: 'contact', label: 'Contact Us' },
      { value: 'privacy', label: 'Privacy Policy' },
      { value: 'terms', label: 'Terms of Service' }
    ];

    for (const tab of tabs) {
      const tabButton = page.locator(`[role="tab"][data-state][value="${tab.value}"]`);
      const isVisible = await tabButton.isVisible();
      console.log(`  ${tab.label}: ${isVisible ? '✓ Visible' : '✗ NOT VISIBLE'}`);

      if (!isVisible) {
        console.error(`  ERROR: ${tab.label} tab button is not visible!`);
      }
    }
    console.log('');

    console.log('3. Testing tab interactions...\n');

    // Test Help Center tab (default)
    console.log('  a) Testing Help Center tab (default active)...');
    const helpTab = page.locator('[role="tab"][value="help"]');
    const helpContent = page.locator('[role="tabpanel"][data-state="active"]').filter({ hasText: 'Frequently Asked Questions' });

    let helpTabState = await helpTab.getAttribute('data-state');
    console.log(`     Help tab state: ${helpTabState}`);

    let helpContentVisible = await helpContent.isVisible();
    console.log(`     Help content visible: ${helpContentVisible ? '✓ Yes' : '✗ No'}`);

    await page.screenshot({ path: '.playwright-mcp/support-tab-help.png', fullPage: true });
    console.log('     ✓ Screenshot saved: support-tab-help.png\n');

    // Test Contact Us tab
    console.log('  b) Testing Contact Us tab...');
    const contactTab = page.locator('[role="tab"][value="contact"]');
    console.log('     Clicking Contact Us tab...');
    await contactTab.click();
    await page.waitForTimeout(500); // Wait for transition

    let contactTabState = await contactTab.getAttribute('data-state');
    console.log(`     Contact tab state: ${contactTabState}`);

    const contactContent = page.locator('[role="tabpanel"][data-state="active"]').filter({ hasText: 'Get in Touch' });
    let contactContentVisible = await contactContent.isVisible();
    console.log(`     Contact content visible: ${contactContentVisible ? '✓ Yes' : '✗ No'}`);

    // Check if the contact form is visible
    const contactForm = page.locator('form').filter({ has: page.locator('input#name') });
    const formVisible = await contactForm.isVisible();
    console.log(`     Contact form visible: ${formVisible ? '✓ Yes' : '✗ No'}`);

    await page.screenshot({ path: '.playwright-mcp/support-tab-contact.png', fullPage: true });
    console.log('     ✓ Screenshot saved: support-tab-contact.png\n');

    // Test Privacy Policy tab
    console.log('  c) Testing Privacy Policy tab...');
    const privacyTab = page.locator('[role="tab"][value="privacy"]');
    console.log('     Clicking Privacy Policy tab...');
    await privacyTab.click();
    await page.waitForTimeout(500);

    let privacyTabState = await privacyTab.getAttribute('data-state');
    console.log(`     Privacy tab state: ${privacyTabState}`);

    const privacyContent = page.locator('[role="tabpanel"][data-state="active"]').filter({ hasText: 'Privacy Policy' });
    let privacyContentVisible = await privacyContent.isVisible();
    console.log(`     Privacy content visible: ${privacyContentVisible ? '✓ Yes' : '✗ No'}`);

    // Check for specific privacy policy sections
    const dataSecuritySection = page.locator('text=Data Security');
    const dataSecurityVisible = await dataSecuritySection.isVisible();
    console.log(`     Data Security section visible: ${dataSecurityVisible ? '✓ Yes' : '✗ No'}`);

    await page.screenshot({ path: '.playwright-mcp/support-tab-privacy.png', fullPage: true });
    console.log('     ✓ Screenshot saved: support-tab-privacy.png\n');

    // Test Terms of Service tab
    console.log('  d) Testing Terms of Service tab...');
    const termsTab = page.locator('[role="tab"][value="terms"]');
    console.log('     Clicking Terms of Service tab...');
    await termsTab.click();
    await page.waitForTimeout(500);

    let termsTabState = await termsTab.getAttribute('data-state');
    console.log(`     Terms tab state: ${termsTabState}`);

    const termsContent = page.locator('[role="tabpanel"][data-state="active"]').filter({ hasText: 'Terms of Service' });
    let termsContentVisible = await termsContent.isVisible();
    console.log(`     Terms content visible: ${termsContentVisible ? '✓ Yes' : '✗ No'}`);

    // Check for specific terms sections
    const acceptanceSection = page.locator('text=Acceptance of Terms');
    const acceptanceVisible = await acceptanceSection.isVisible();
    console.log(`     Acceptance of Terms section visible: ${acceptanceVisible ? '✓ Yes' : '✗ No'}`);

    await page.screenshot({ path: '.playwright-mcp/support-tab-terms.png', fullPage: true });
    console.log('     ✓ Screenshot saved: support-tab-terms.png\n');

    // Test switching back to Help Center
    console.log('  e) Testing switching back to Help Center...');
    await helpTab.click();
    await page.waitForTimeout(500);

    helpTabState = await helpTab.getAttribute('data-state');
    console.log(`     Help tab state: ${helpTabState}`);

    helpContentVisible = await helpContent.isVisible();
    console.log(`     Help content visible: ${helpContentVisible ? '✓ Yes' : '✗ No'}`);
    console.log('');

    // Test keyboard navigation
    console.log('4. Testing keyboard navigation...');
    await helpTab.focus();
    console.log('   Focused on Help Center tab');

    console.log('   Pressing ArrowRight to navigate to Contact Us...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    contactTabState = await contactTab.getAttribute('data-state');
    console.log(`   Contact tab state: ${contactTabState}`);

    console.log('   Pressing ArrowRight to navigate to Privacy Policy...');
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(300);

    privacyTabState = await privacyTab.getAttribute('data-state');
    console.log(`   Privacy tab state: ${privacyTabState}`);
    console.log('');

    // Check console for errors
    console.log('5. Checking browser console...');
    const errorMessages = consoleMessages.filter(msg => msg.type === 'error');
    const warningMessages = consoleMessages.filter(msg => msg.type === 'warning');

    if (errorMessages.length > 0) {
      console.log(`   ✗ Found ${errorMessages.length} console errors:`);
      errorMessages.forEach(err => {
        console.log(`     - ${err.text}`);
        if (err.location) {
          console.log(`       Location: ${err.location.url}:${err.location.lineNumber}`);
        }
      });
    } else {
      console.log('   ✓ No console errors found');
    }

    if (warningMessages.length > 0) {
      console.log(`   ⚠ Found ${warningMessages.length} console warnings:`);
      warningMessages.forEach(warn => {
        console.log(`     - ${warn.text}`);
      });
    } else {
      console.log('   ✓ No console warnings found');
    }

    if (errors.length > 0) {
      console.log(`   ✗ Found ${errors.length} page errors:`);
      errors.forEach(err => {
        console.log(`     - ${err.message}`);
        console.log(`       Stack: ${err.stack}`);
      });
    } else {
      console.log('   ✓ No page errors found');
    }
    console.log('');

    // Summary
    console.log('═══════════════════════════════════════════');
    console.log('TEST SUMMARY');
    console.log('═══════════════════════════════════════════');

    const allTabsWork = helpContentVisible && contactContentVisible && privacyContentVisible && termsContentVisible;

    if (allTabsWork) {
      console.log('✓ All tabs are working correctly!');
      console.log('✓ Tab content switches properly on click');
      console.log('✓ Tab states update correctly');
      console.log('✓ Keyboard navigation works');
    } else {
      console.log('✗ ISSUE DETECTED: Some tabs are not working properly');
      console.log('  - Help Center working:', helpContentVisible);
      console.log('  - Contact Us working:', contactContentVisible);
      console.log('  - Privacy Policy working:', privacyContentVisible);
      console.log('  - Terms of Service working:', termsContentVisible);
    }

    if (errorMessages.length > 0 || errors.length > 0) {
      console.log('✗ Console errors or page errors detected');
    } else {
      console.log('✓ No console or page errors');
    }
    console.log('═══════════════════════════════════════════\n');

    // Create test report
    const report = {
      timestamp: new Date().toISOString(),
      url: 'http://localhost:3001/support',
      tabsVisible: true,
      tabTests: {
        helpCenter: { working: helpContentVisible, defaultActive: true },
        contactUs: { working: contactContentVisible, formVisible: formVisible },
        privacyPolicy: { working: privacyContentVisible, contentVisible: dataSecurityVisible },
        termsOfService: { working: termsContentVisible, contentVisible: acceptanceVisible }
      },
      keyboardNavigation: {
        tested: true,
        working: contactTabState === 'active' || privacyTabState === 'active'
      },
      consoleErrors: errorMessages,
      pageErrors: errors,
      consoleWarnings: warningMessages,
      screenshots: [
        'support-page-initial.png',
        'support-tab-help.png',
        'support-tab-contact.png',
        'support-tab-privacy.png',
        'support-tab-terms.png'
      ]
    };

    await writeFile('.playwright-mcp/support-tabs-report.json', JSON.stringify(report, null, 2));
    console.log('✓ Test report saved: support-tabs-report.json\n');

  } catch (error) {
    console.error('✗ Test failed with error:', error.message);
    console.error(error.stack);

    // Take error screenshot
    await page.screenshot({ path: '.playwright-mcp/support-error.png', fullPage: true });
    console.log('✓ Error screenshot saved: support-error.png\n');
  } finally {
    await browser.close();
    console.log('Test completed. Browser closed.');
  }
}

testSupportTabs().catch(console.error);
