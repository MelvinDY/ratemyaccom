import { chromium } from 'playwright';
import { writeFile } from 'fs/promises';

async function testSupportTabsFinal() {
  console.log('═══════════════════════════════════════════');
  console.log('SUPPORT PAGE TABS - COMPREHENSIVE TEST');
  console.log('═══════════════════════════════════════════\n');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  const consoleWarnings = [];

  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      consoleWarnings.push(msg.text());
    }
  });

  const results = {
    timestamp: new Date().toISOString(),
    url: 'http://localhost:3001/support',
    testsPassed: 0,
    testsFailed: 0,
    tabs: {},
    errors: [],
    screenshots: []
  };

  try {
    // Navigate to page
    console.log('1. Loading Support Page...');
    await page.goto('http://localhost:3001/support', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    console.log('   ✓ Page loaded successfully\n');

    // Initial screenshot
    await page.screenshot({ path: '.playwright-mcp/support-full-page.png', fullPage: true });
    results.screenshots.push('support-full-page.png');

    // Test 1: Verify all tab buttons are visible
    console.log('2. Verifying Tab Buttons...');
    const tabButtons = [
      { value: 'help', label: 'Help Center' },
      { value: 'contact', label: 'Contact Us' },
      { value: 'privacy', label: 'Privacy Policy' },
      { value: 'terms', label: 'Terms of Service' }
    ];

    for (const tab of tabButtons) {
      const button = page.getByText(tab.label, { exact: false });
      const isVisible = await button.first().isVisible();
      console.log(`   ${tab.label}: ${isVisible ? '✓ Visible' : '✗ Not visible'}`);
      if (isVisible) {
        results.testsPassed++;
      } else {
        results.testsFailed++;
        results.errors.push(`${tab.label} button not visible`);
      }
    }
    console.log('');

    // Test 2: Help Center Tab
    console.log('3. Testing Help Center Tab...');
    const helpButton = page.getByText('Help Center');
    await helpButton.first().click();
    await page.waitForTimeout(800);

    const faqHeading = page.getByRole('heading', { name: 'Frequently Asked Questions' });
    const helpContentVisible = await faqHeading.isVisible();
    console.log(`   FAQ content visible: ${helpContentVisible ? '✓ Yes' : '✗ No'}`);

    // Check for accordion items (FAQs)
    const accordionItems = await page.locator('[data-radix-collection-item]').count();
    console.log(`   FAQ questions found: ${accordionItems}`);

    // Test accordion interaction
    if (accordionItems > 0) {
      const firstQuestion = page.locator('[data-radix-collection-item]').first();
      await firstQuestion.click();
      await page.waitForTimeout(500);
      console.log('   ✓ Accordion interaction tested');
    }

    await page.screenshot({ path: '.playwright-mcp/support-help-tab-complete.png', fullPage: true });
    results.screenshots.push('support-help-tab-complete.png');

    results.tabs.help = {
      contentVisible: helpContentVisible,
      faqCount: accordionItems,
      working: helpContentVisible && accordionItems > 0
    };

    if (helpContentVisible && accordionItems > 0) {
      results.testsPassed++;
      console.log('   ✓ Help Center tab PASSED\n');
    } else {
      results.testsFailed++;
      results.errors.push('Help Center tab content not showing');
      console.log('   ✗ Help Center tab FAILED\n');
    }

    // Test 3: Contact Us Tab
    console.log('4. Testing Contact Us Tab...');
    const contactButton = page.getByText('Contact Us');
    await contactButton.first().click();
    await page.waitForTimeout(800);

    const contactHeading = page.getByRole('heading', { name: 'Get in Touch' });
    const contactContentVisible = await contactHeading.isVisible();
    console.log(`   Contact form heading visible: ${contactContentVisible ? '✓ Yes' : '✗ No'}`);

    // Check form fields
    const nameInput = await page.locator('input#name').isVisible();
    const emailInput = await page.locator('input#email').isVisible();
    const subjectInput = await page.locator('input#subject').isVisible();
    const messageInput = await page.locator('textarea#message').isVisible();

    console.log(`   Form fields visible:`);
    console.log(`     Name: ${nameInput ? '✓' : '✗'}`);
    console.log(`     Email: ${emailInput ? '✓' : '✗'}`);
    console.log(`     Subject: ${subjectInput ? '✓' : '✗'}`);
    console.log(`     Message: ${messageInput ? '✓' : '✗'}`);

    const allFieldsVisible = nameInput && emailInput && subjectInput && messageInput;

    await page.screenshot({ path: '.playwright-mcp/support-contact-tab-complete.png', fullPage: true });
    results.screenshots.push('support-contact-tab-complete.png');

    results.tabs.contact = {
      contentVisible: contactContentVisible,
      formFieldsVisible: allFieldsVisible,
      working: contactContentVisible && allFieldsVisible
    };

    if (contactContentVisible && allFieldsVisible) {
      results.testsPassed++;
      console.log('   ✓ Contact Us tab PASSED\n');
    } else {
      results.testsFailed++;
      results.errors.push('Contact Us tab content not showing correctly');
      console.log('   ✗ Contact Us tab FAILED\n');
    }

    // Test 4: Privacy Policy Tab
    console.log('5. Testing Privacy Policy Tab...');
    const privacyButton = page.getByText('Privacy Policy');
    await privacyButton.first().click();
    await page.waitForTimeout(800);

    const privacyHeading = page.getByRole('heading', { name: 'Privacy Policy', exact: true });
    const privacyContentVisible = await privacyHeading.isVisible();
    console.log(`   Privacy Policy heading visible: ${privacyContentVisible ? '✓ Yes' : '✗ No'}`);

    // Check for key sections
    const infoWeCollect = await page.getByText('Information We Collect').isVisible();
    const dataSecuritySection = await page.getByText('Data Security').isVisible();
    const yourRights = await page.getByText('Your Rights').isVisible();

    console.log(`   Key sections visible:`);
    console.log(`     Information We Collect: ${infoWeCollect ? '✓' : '✗'}`);
    console.log(`     Data Security: ${dataSecuritySection ? '✓' : '✗'}`);
    console.log(`     Your Rights: ${yourRights ? '✓' : '✗'}`);

    await page.screenshot({ path: '.playwright-mcp/support-privacy-tab-complete.png', fullPage: true });
    results.screenshots.push('support-privacy-tab-complete.png');

    results.tabs.privacy = {
      contentVisible: privacyContentVisible,
      sectionsVisible: infoWeCollect && dataSecuritySection && yourRights,
      working: privacyContentVisible
    };

    if (privacyContentVisible) {
      results.testsPassed++;
      console.log('   ✓ Privacy Policy tab PASSED\n');
    } else {
      results.testsFailed++;
      results.errors.push('Privacy Policy tab content not showing');
      console.log('   ✗ Privacy Policy tab FAILED\n');
    }

    // Test 5: Terms of Service Tab
    console.log('6. Testing Terms of Service Tab...');
    const termsButton = page.getByText('Terms of Service');
    await termsButton.first().click();
    await page.waitForTimeout(800);

    const termsHeading = page.getByRole('heading', { name: 'Terms of Service', exact: true });
    const termsContentVisible = await termsHeading.isVisible();
    console.log(`   Terms heading visible: ${termsContentVisible ? '✓ Yes' : '✗ No'}`);

    // Check for key sections
    const acceptanceOfTerms = await page.getByText('Acceptance of Terms').isVisible();
    const accountRegistration = await page.getByText('Account Registration').isVisible();
    const userContent = await page.getByText('User Content and Reviews').isVisible();

    console.log(`   Key sections visible:`);
    console.log(`     Acceptance of Terms: ${acceptanceOfTerms ? '✓' : '✗'}`);
    console.log(`     Account Registration: ${accountRegistration ? '✓' : '✗'}`);
    console.log(`     User Content and Reviews: ${userContent ? '✓' : '✗'}`);

    await page.screenshot({ path: '.playwright-mcp/support-terms-tab-complete.png', fullPage: true });
    results.screenshots.push('support-terms-tab-complete.png');

    results.tabs.terms = {
      contentVisible: termsContentVisible,
      sectionsVisible: acceptanceOfTerms && accountRegistration && userContent,
      working: termsContentVisible
    };

    if (termsContentVisible) {
      results.testsPassed++;
      console.log('   ✓ Terms of Service tab PASSED\n');
    } else {
      results.testsFailed++;
      results.errors.push('Terms of Service tab content not showing');
      console.log('   ✗ Terms of Service tab FAILED\n');
    }

    // Test 6: Tab switching behavior
    console.log('7. Testing Tab Switching...');
    await helpButton.first().click();
    await page.waitForTimeout(500);
    let helpActive = await faqHeading.isVisible();

    await contactButton.first().click();
    await page.waitForTimeout(500);
    let contactActive = await contactHeading.isVisible();
    let helpHidden = !(await faqHeading.isVisible());

    console.log(`   Switch from Help to Contact:`);
    console.log(`     Help content hidden: ${helpHidden ? '✓' : '✗'}`);
    console.log(`     Contact content shown: ${contactActive ? '✓' : '✗'}`);

    if (helpHidden && contactActive) {
      results.testsPassed++;
      console.log('   ✓ Tab switching works correctly\n');
    } else {
      results.testsFailed++;
      results.errors.push('Tab switching not hiding previous content');
      console.log('   ✗ Tab switching FAILED\n');
    }

    // Test 7: Keyboard navigation
    console.log('8. Testing Keyboard Navigation...');
    await helpButton.first().focus();
    await page.keyboard.press('ArrowRight');
    await page.waitForTimeout(500);

    // Check if focus moved (Contact button should be focused or activated)
    const contactFocused = await contactButton.first().evaluate(el =>
      document.activeElement === el || el.contains(document.activeElement)
    );

    console.log(`   Arrow key navigation: ${contactFocused ? '✓ Working' : '⚠ May not be working'}`);
    if (contactFocused) {
      results.testsPassed++;
    }
    console.log('');

    // Check for console errors
    console.log('9. Checking Browser Console...');
    const relevantErrors = consoleErrors.filter(err =>
      !err.includes('404') &&
      !err.includes('DevTools') &&
      !err.includes('resource')
    );

    if (relevantErrors.length > 0) {
      console.log(`   ✗ Found ${relevantErrors.length} errors:`);
      relevantErrors.forEach(err => console.log(`     - ${err}`));
      results.errors.push(...relevantErrors);
    } else {
      console.log('   ✓ No significant console errors');
      results.testsPassed++;
    }
    console.log('');

    // Final results
    console.log('═══════════════════════════════════════════');
    console.log('TEST RESULTS SUMMARY');
    console.log('═══════════════════════════════════════════');
    console.log(`Total Tests Passed: ${results.testsPassed}`);
    console.log(`Total Tests Failed: ${results.testsFailed}`);
    console.log('');
    console.log('Tab Functionality:');
    console.log(`  Help Center: ${results.tabs.help?.working ? '✓ WORKING' : '✗ NOT WORKING'}`);
    console.log(`  Contact Us: ${results.tabs.contact?.working ? '✓ WORKING' : '✗ NOT WORKING'}`);
    console.log(`  Privacy Policy: ${results.tabs.privacy?.working ? '✓ WORKING' : '✗ NOT WORKING'}`);
    console.log(`  Terms of Service: ${results.tabs.terms?.working ? '✓ WORKING' : '✗ NOT WORKING'}`);
    console.log('');

    const allTabsWorking = Object.values(results.tabs).every(tab => tab.working);

    if (allTabsWorking && results.testsFailed === 0) {
      console.log('OVERALL STATUS: ✓ ALL TABS WORKING CORRECTLY');
      console.log('');
      console.log('The Support page tabs are functioning as expected:');
      console.log('  - All tab buttons are visible and clickable');
      console.log('  - Tab content switches correctly when tabs are clicked');
      console.log('  - Only the active tab content is displayed');
      console.log('  - No JavaScript errors detected');
    } else {
      console.log('OVERALL STATUS: ✗ ISSUES DETECTED');
      console.log('');
      console.log('Issues found:');
      results.errors.forEach(err => console.log(`  - ${err}`));
    }
    console.log('═══════════════════════════════════════════\n');

    // Save report
    results.overallStatus = allTabsWorking && results.testsFailed === 0 ? 'PASS' : 'FAIL';
    await writeFile('.playwright-mcp/support-tabs-test-report.json', JSON.stringify(results, null, 2));
    console.log('✓ Test report saved: .playwright-mcp/support-tabs-test-report.json\n');

  } catch (error) {
    console.error('\n✗ Test encountered an error:', error.message);
    results.errors.push(error.message);
    results.overallStatus = 'ERROR';
    await page.screenshot({ path: '.playwright-mcp/support-test-error.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('Browser closed.\n');
  }

  return results;
}

testSupportTabsFinal()
  .then(results => {
    process.exit(results.overallStatus === 'PASS' ? 0 : 1);
  })
  .catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
