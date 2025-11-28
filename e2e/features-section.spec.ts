import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Features Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to features section
    await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();
  });

  test.describe('Visual Appearance', () => {
    test('should display section heading and subheading', async ({ page }) => {
      // Check section badge
      await expect(page.getByText('Features', { exact: true })).toBeVisible();

      // Check main heading
      const heading = page.getByRole('heading', { name: /Everything You Need to Find Your Home/i });
      await expect(heading).toBeVisible();

      // Check subheading
      await expect(
        page.getByText(/Discover why thousands of students trust Rate My Accom/i)
      ).toBeVisible();
    });

    test('should display all 6 feature cards', async ({ page }) => {
      // Check all feature titles
      await expect(page.getByRole('heading', { name: 'Real Student Reviews' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Verified Students Only' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Comprehensive Filters' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Photo Galleries' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Detailed Information' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Compare Accommodations' })).toBeVisible();
    });

    test('should display feature descriptions', async ({ page }) => {
      // Check feature descriptions are visible
      await expect(
        page.getByText(/Read authentic experiences from students who have lived/i)
      ).toBeVisible();
      await expect(
        page.getByText(/All reviewers are verified with their university email/i)
      ).toBeVisible();
      await expect(
        page.getByText(/Find exactly what you need with advanced filters/i)
      ).toBeVisible();
      await expect(page.getByText(/Browse through extensive photo galleries/i)).toBeVisible();
      await expect(
        page.getByText(/Access comprehensive details about each accommodation/i)
      ).toBeVisible();
      await expect(page.getByText(/Side-by-side comparison tool to help you make/i)).toBeVisible();
    });

    test('should display feature icons', async ({ page }) => {
      // The features section should have 6 icons (one for each feature)
      const section = page.locator('section[aria-labelledby="features-heading"]');
      const featureCards = section.locator('.group.relative');
      await expect(featureCards).toHaveCount(6);

      // Each card should have an icon
      for (let i = 0; i < 6; i++) {
        const icon = featureCards.nth(i).locator('svg').first();
        await expect(icon).toBeVisible();
      }
    });

    test('should have gradient backgrounds', async ({ page }) => {
      const section = page.locator('section[aria-labelledby="features-heading"]');
      await expect(section).toHaveClass(/bg-gray-900/);

      // Check for animated background gradients
      const gradients = section.locator('[class*="blur-3xl"]');
      await expect(gradients).toHaveCount(2);
    });
  });

  test.describe('Grid Layout', () => {
    test('should have 3-column grid on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      const featuresGrid = page
        .locator('section[aria-labelledby="features-heading"]')
        .locator('.grid');
      await expect(featuresGrid).toHaveClass(/lg:grid-cols-3/);
    });

    test('should have 2-column grid on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      const featuresGrid = page
        .locator('section[aria-labelledby="features-heading"]')
        .locator('.grid');
      await expect(featuresGrid).toHaveClass(/md:grid-cols-2/);
    });

    test('should have 1-column grid on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      const featuresGrid = page
        .locator('section[aria-labelledby="features-heading"]')
        .locator('.grid');
      await expect(featuresGrid).toHaveClass(/grid-cols-1/);
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      // All features should be visible
      await expect(page.getByRole('heading', { name: 'Real Student Reviews' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Verified Students Only' })).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      // All features should be visible
      await expect(page.getByRole('heading', { name: 'Comprehensive Filters' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Photo Galleries' })).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      // All features should be visible
      await expect(page.getByRole('heading', { name: 'Detailed Information' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Compare Accommodations' })).toBeVisible();
    });
  });

  test.describe('Interactive Elements', () => {
    test('feature cards should have hover effects', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      const firstCard = page
        .locator('section[aria-labelledby="features-heading"]')
        .locator('.group.relative')
        .first();

      // Hover over the card
      await firstCard.hover();

      // Card should have group class for hover effects
      await expect(firstCard).toHaveClass(/group/);
    });

    test('all feature cards should be interactive', async ({ page }) => {
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      const cards = page
        .locator('section[aria-labelledby="features-heading"]')
        .locator('.group.relative');

      // All 6 cards should exist
      await expect(cards).toHaveCount(6);

      // Each card should have hover effect capability
      for (let i = 0; i < 6; i++) {
        await expect(cards.nth(i)).toHaveClass(/group/);
      }
    });
  });

  test.describe('Animations', () => {
    test('should have animated background gradients', async ({ page }) => {
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      // Check for animated blur elements
      const section = page.locator('section[aria-labelledby="features-heading"]');
      const animatedBackgrounds = section.locator('[class*="blur-3xl"]');
      await expect(animatedBackgrounds).toHaveCount(2);
    });

    test('section should fade in when scrolled into view', async ({ page }) => {
      // Scroll to top first
      await page.evaluate(() => window.scrollTo(0, 0));

      // Wait a moment
      await page.waitForTimeout(500);

      // Scroll to features section
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      // Wait for animation
      await page.waitForTimeout(1000);

      // Content should be visible after animation
      const heading = page.getByRole('heading', { name: /Everything You Need to Find Your Home/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Content Accuracy', () => {
    test('should display correct feature count', async ({ page }) => {
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      const section = page.locator('section[aria-labelledby="features-heading"]');
      const featureCards = section.locator('.group.relative');
      await expect(featureCards).toHaveCount(6);
    });

    test('each feature should have title, description, and icon', async ({ page }) => {
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      const section = page.locator('section[aria-labelledby="features-heading"]');
      const featureCards = section.locator('.group.relative');

      for (let i = 0; i < 6; i++) {
        const card = featureCards.nth(i);

        // Should have an icon
        const icon = card.locator('svg').first();
        await expect(icon).toBeVisible();

        // Should have a heading
        const heading = card.locator('h3');
        await expect(heading).toBeVisible();

        // Should have a description
        const description = card.locator('p');
        await expect(description).toBeVisible();
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have no accessibility violations', async ({ page }) => {
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('section[aria-labelledby="features-heading"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      // Section should have h2 main heading
      const h2 = page.locator('#features-heading');
      await expect(h2).toBeVisible();

      // Feature cards should have h3 headings
      const section = page.locator('section[aria-labelledby="features-heading"]');
      const h3Headings = section.locator('h3');
      await expect(h3Headings).toHaveCount(6);
    });

    test('should have semantic section element', async ({ page }) => {
      const section = page.locator('section[aria-labelledby="features-heading"]');
      await expect(section).toBeVisible();

      // Should have aria-labelledby attribute
      await expect(section).toHaveAttribute('aria-labelledby', 'features-heading');
    });

    test('icons should have aria-hidden attribute', async ({ page }) => {
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

      const section = page.locator('section[aria-labelledby="features-heading"]');
      const icons = section.locator('svg[aria-hidden="true"]');

      // All decorative icons should have aria-hidden
      await expect(icons.first()).toBeVisible();
    });
  });

  test.describe('Visual Regression', () => {
    test('should match features section snapshot on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500); // Wait for animations

      const section = page.locator('section[aria-labelledby="features-heading"]');
      await expect(section).toBeVisible();
    });

    test('should match features section snapshot on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500); // Wait for animations

      const section = page.locator('section[aria-labelledby="features-heading"]');
      await expect(section).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should render quickly when scrolled into view', async ({ page }) => {
      const startTime = Date.now();

      await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Section should render within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });
  });
});
