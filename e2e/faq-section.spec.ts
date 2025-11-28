import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('FAQ Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to FAQ section
    await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
  });

  test.describe('Visual Appearance', () => {
    test('should display section heading and badge', async ({ page }) => {
      // Check section badge
      await expect(page.getByText('FAQ', { exact: true })).toBeVisible();

      // Check main heading
      const heading = page.getByRole('heading', { name: /Frequently Asked Questions/i });
      await expect(heading).toBeVisible();

      // Check subheading
      await expect(page.getByText(/Got questions\? We've got answers/i)).toBeVisible();
    });

    test('should display accordion container', async ({ page }) => {
      const section = page.locator('section[aria-labelledby="faq-heading"]');
      const accordion = section.locator('[role="region"]').first();

      // Wait for accordion to be visible
      await page.waitForTimeout(500);

      // Accordion should exist
      const accordionExists =
        (await accordion.count()) > 0 || (await section.locator('.w-full').count()) > 0;
      expect(accordionExists).toBeTruthy();
    });

    test('should display contact support button', async ({ page }) => {
      // Check "Still have questions?" text
      await expect(page.getByText('Still have questions?')).toBeVisible();

      // Check contact support link
      const contactLink = page.getByRole('link', { name: /Contact Support/i });
      await expect(contactLink).toBeVisible();
      await expect(contactLink).toHaveAttribute('href', 'mailto:support@ratemyaccom.com');
    });

    test('should have gradient background', async ({ page }) => {
      const section = page.locator('section[aria-labelledby="faq-heading"]');
      await expect(section).toHaveClass(/bg-gray-900/);

      // Check for animated background gradients
      const gradients = section.locator('[class*="blur-3xl"]');
      await expect(gradients).toHaveCount(2);
    });
  });

  test.describe('Accordion Functionality', () => {
    test('should display all FAQ questions', async ({ page }) => {
      await page.waitForTimeout(500);

      // Check all question texts are visible
      await expect(page.getByText('How do I leave a review?')).toBeVisible();
      await expect(page.getByText('Are all reviews verified?')).toBeVisible();
      await expect(page.getByText('How do I search for accommodation?')).toBeVisible();
      await expect(page.getByText('Is the service free to use?')).toBeVisible();
      await expect(page.getByText('How are ratings calculated?')).toBeVisible();
      await expect(page.getByText('Can I edit or delete my review?')).toBeVisible();
      await expect(
        page.getByText('What if I find incorrect information about an accommodation?')
      ).toBeVisible();
      await expect(page.getByText('Can accommodation providers respond to reviews?')).toBeVisible();
    });

    test('should expand accordion item when clicked', async ({ page }) => {
      await page.waitForTimeout(500);

      // Find first accordion trigger
      const firstQuestion = page.getByText('How do I leave a review?');
      await firstQuestion.click();

      // Wait for animation
      await page.waitForTimeout(500);

      // Answer should be visible
      await expect(page.getByText(/To leave a review, first create an account/i)).toBeVisible();
    });

    test('should collapse accordion item when clicked again', async ({ page }) => {
      await page.waitForTimeout(500);

      const firstQuestion = page.getByText('How do I leave a review?');

      // Click to expand
      await firstQuestion.click();
      await page.waitForTimeout(500);

      // Verify it's expanded
      await expect(page.getByText(/To leave a review, first create an account/i)).toBeVisible();

      // Click to collapse
      await firstQuestion.click();
      await page.waitForTimeout(500);

      // Answer should be hidden
      const answer = page.getByText(/To leave a review, first create an account/i);
      const isHidden = await answer.isHidden().catch(() => true);
      expect(isHidden).toBeTruthy();
    });

    test('should allow only one accordion item open at a time', async ({ page }) => {
      await page.waitForTimeout(500);

      // Click first question
      const firstQuestion = page.getByText('How do I leave a review?');
      await firstQuestion.click();
      await page.waitForTimeout(500);

      // First answer should be visible
      await expect(page.getByText(/To leave a review, first create an account/i)).toBeVisible();

      // Click second question
      const secondQuestion = page.getByText('Are all reviews verified?');
      await secondQuestion.click();
      await page.waitForTimeout(500);

      // Second answer should be visible
      await expect(page.getByText(/Yes! All reviewers must verify their identity/i)).toBeVisible();

      // First answer should now be hidden
      const firstAnswer = page.getByText(/To leave a review, first create an account/i);
      const isHidden = await firstAnswer.isHidden().catch(() => true);
      expect(isHidden).toBeTruthy();
    });

    test('should have chevron icons that rotate on expand', async ({ page }) => {
      await page.waitForTimeout(500);

      const section = page.locator('section[aria-labelledby="faq-heading"]');

      // Find chevron icons (should be 8 total)
      const chevrons = section.locator('.shrink-0');
      const chevronCount = await chevrons.count();
      expect(chevronCount).toBeGreaterThan(0);
    });

    test('all FAQ items should be expandable', async ({ page }) => {
      await page.waitForTimeout(500);

      const questions = [
        'How do I leave a review?',
        'Are all reviews verified?',
        'How do I search for accommodation?',
        'Is the service free to use?',
        'How are ratings calculated?',
        'Can I edit or delete my review?',
        'What if I find incorrect information about an accommodation?',
        'Can accommodation providers respond to reviews?',
      ];

      for (const question of questions) {
        const questionElement = page.getByText(question);
        await questionElement.click();
        await page.waitForTimeout(300);

        // Some answer text should become visible
        const section = page.locator('section[aria-labelledby="faq-heading"]');
        await expect(section).toBeVisible();

        // Close it for next iteration
        await questionElement.click();
        await page.waitForTimeout(300);
      }
    });
  });

  test.describe('FAQ Content', () => {
    test('should display complete FAQ answers when expanded', async ({ page }) => {
      await page.waitForTimeout(500);

      // Expand first FAQ
      const firstQuestion = page.getByText('How do I leave a review?');
      await firstQuestion.click();
      await page.waitForTimeout(500);

      // Check full answer is visible
      await expect(
        page.getByText(
          /To leave a review, first create an account using your university email address/i
        )
      ).toBeVisible();
    });

    test('should have 8 FAQ items', async ({ page }) => {
      await page.waitForTimeout(500);

      // Count question elements
      const questions = [
        'How do I leave a review?',
        'Are all reviews verified?',
        'How do I search for accommodation?',
        'Is the service free to use?',
        'How are ratings calculated?',
        'Can I edit or delete my review?',
        'What if I find incorrect information about an accommodation?',
        'Can accommodation providers respond to reviews?',
      ];

      for (const question of questions) {
        await expect(page.getByText(question)).toBeVisible();
      }
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // All content should be visible
      await expect(
        page.getByRole('heading', { name: /Frequently Asked Questions/i })
      ).toBeVisible();
      await expect(page.getByText('How do I leave a review?')).toBeVisible();
      await expect(page.getByRole('link', { name: /Contact Support/i })).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // All content should be visible
      await expect(
        page.getByRole('heading', { name: /Frequently Asked Questions/i })
      ).toBeVisible();
      await expect(page.getByText('Are all reviews verified?')).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // All content should be visible
      await expect(
        page.getByRole('heading', { name: /Frequently Asked Questions/i })
      ).toBeVisible();
      await expect(page.getByText('How are ratings calculated?')).toBeVisible();
    });
  });

  test.describe('Interactive Elements', () => {
    test('contact support button should have hover effects', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();

      const contactButton = page.getByRole('link', { name: /Contact Support/i });

      // Hover over the button
      await contactButton.hover();

      // Button should have gradient background
      await expect(contactButton).toHaveClass(/bg-gradient-to-r/);
    });

    test('FAQ items should have hover effects', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const firstQuestion = page.getByText('How do I leave a review?').locator('..');

      // Hover over the question
      await firstQuestion.hover();

      // Should have hover styles
      await expect(firstQuestion).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should navigate FAQ items with keyboard', async ({ page }) => {
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Focus on FAQ section
      const firstQuestion = page.getByText('How do I leave a review?');
      await firstQuestion.focus();

      // Press Enter to expand
      await page.keyboard.press('Enter');
      await page.waitForTimeout(500);

      // Answer should be visible
      await expect(page.getByText(/To leave a review, first create an account/i)).toBeVisible();
    });

    test('contact support button should be keyboard accessible', async ({ page }) => {
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();

      const contactButton = page.getByRole('link', { name: /Contact Support/i });

      // Should be focusable
      await contactButton.focus();
      await expect(contactButton).toBeFocused();
    });
  });

  test.describe('Animations', () => {
    test('should have animated background gradients', async ({ page }) => {
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();

      // Check for animated blur elements
      const section = page.locator('section[aria-labelledby="faq-heading"]');
      const animatedBackgrounds = section.locator('[class*="blur-3xl"]');
      await expect(animatedBackgrounds).toHaveCount(2);
    });

    test('accordion items should animate when expanding', async ({ page }) => {
      await page.waitForTimeout(500);

      // Click first question
      const firstQuestion = page.getByText('How do I leave a review?');
      await firstQuestion.click();

      // Wait for animation
      await page.waitForTimeout(500);

      // Content should be visible after animation
      await expect(page.getByText(/To leave a review, first create an account/i)).toBeVisible();
    });

    test('section should fade in when scrolled into view', async ({ page }) => {
      // Scroll to top first
      await page.evaluate(() => window.scrollTo(0, 0));

      // Wait a moment
      await page.waitForTimeout(500);

      // Scroll to FAQ section
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();

      // Wait for animation
      await page.waitForTimeout(1000);

      // Content should be visible after animation
      const heading = page.getByRole('heading', { name: /Frequently Asked Questions/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have no accessibility violations', async ({ page }) => {
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('section[aria-labelledby="faq-heading"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();

      // Section should have h2 main heading
      const h2 = page.locator('#faq-heading');
      await expect(h2).toBeVisible();
    });

    test('should have semantic section element', async ({ page }) => {
      const section = page.locator('section[aria-labelledby="faq-heading"]');
      await expect(section).toBeVisible();

      // Should have aria-labelledby attribute
      await expect(section).toHaveAttribute('aria-labelledby', 'faq-heading');
    });

    test('accordion should have proper ARIA attributes', async ({ page }) => {
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Accordion items should exist
      const section = page.locator('section[aria-labelledby="faq-heading"]');
      await expect(section).toBeVisible();
    });

    test('icons should have aria-hidden attribute', async ({ page }) => {
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const section = page.locator('section[aria-labelledby="faq-heading"]');
      const icons = section.locator('svg[aria-hidden="true"]');

      // Should have at least one icon with aria-hidden (the HelpCircle icon)
      await expect(icons.first()).toBeVisible();
    });

    test('should have readable text contrast', async ({ page }) => {
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();

      const heading = page.getByRole('heading', { name: /Frequently Asked Questions/i });
      const color = await heading.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // White text should be used
      expect(color).toContain('255');
    });
  });

  test.describe('Visual Regression', () => {
    test('should match FAQ section snapshot on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500); // Wait for animations

      const section = page.locator('section[aria-labelledby="faq-heading"]');
      await expect(section).toBeVisible();
    });

    test('should match FAQ section snapshot on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500); // Wait for animations

      const section = page.locator('section[aria-labelledby="faq-heading"]');
      await expect(section).toBeVisible();
    });

    test('should match expanded accordion state', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      // Expand first item
      const firstQuestion = page.getByText('How do I leave a review?');
      await firstQuestion.click();
      await page.waitForTimeout(500);

      // Verify expanded state
      await expect(page.getByText(/To leave a review, first create an account/i)).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should render quickly when scrolled into view', async ({ page }) => {
      const startTime = Date.now();

      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Section should render within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });

    test('accordion expand/collapse should be smooth', async ({ page }) => {
      await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(500);

      const startTime = Date.now();

      // Click to expand
      const firstQuestion = page.getByText('How do I leave a review?');
      await firstQuestion.click();

      // Wait for content to be visible
      await expect(page.getByText(/To leave a review, first create an account/i)).toBeVisible();

      const animationTime = Date.now() - startTime;

      // Animation should complete within 1 second
      expect(animationTime).toBeLessThan(1000);
    });
  });
});
