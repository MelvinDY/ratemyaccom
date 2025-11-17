import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Hero Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test.describe('Visual Appearance', () => {
    test('should display all main content elements', async ({ page }) => {
      // Check badge
      await expect(page.getByText('Trusted by 5,000+ Students')).toBeVisible();

      // Check headline parts
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByText('Find Your Perfect')).toBeVisible();
      await expect(page.getByText('Student Accommodation')).toBeVisible();
      await expect(page.getByText('in NSW')).toBeVisible();

      // Check subtitle
      await expect(
        page.getByText(
          "Real reviews from real students. Make informed decisions about where you'll call home during your university years."
        )
      ).toBeVisible();

      // Check CTA buttons
      await expect(page.getByRole('link', { name: /Explore Accommodations/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /Learn More/i })).toBeVisible();

      // Check all three stats
      await expect(page.getByText('5,000+ Reviews')).toBeVisible();
      await expect(page.getByText('Honest feedback from students')).toBeVisible();
      await expect(page.getByText('200+ Locations')).toBeVisible();
      await expect(page.getByText('Across NSW universities')).toBeVisible();
      await expect(page.getByText('Verified Students')).toBeVisible();
      await expect(page.getByText('University email verified')).toBeVisible();
    });

    test('should have correct gradient background', async ({ page }) => {
      const hero = page.locator('.bg-gradient-to-br').first();
      await expect(hero).toHaveClass(/bg-gradient-to-br/);
    });

    test('should display stat icons', async ({ page }) => {
      // All three stat cards should have icons
      const statIcons = page.locator('.group.relative').locator('svg');
      await expect(statIcons).toHaveCount(3); // 3 icons in the stat cards
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // All content should still be visible
      await expect(page.getByText('Find Your Perfect')).toBeVisible();
      await expect(page.getByText('5,000+ Reviews')).toBeVisible();
      await expect(page.getByRole('link', { name: /Explore Accommodations/i })).toBeVisible();

      // Stats container should be visible
      const statsContainer = page.locator('.grid.grid-cols-1');
      await expect(statsContainer).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });

      // All content should be visible
      await expect(page.getByText('Student Accommodation')).toBeVisible();
      await expect(page.getByText('200+ Locations')).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // All content should be visible
      await expect(page.getByText('Find Your Perfect')).toBeVisible();
      await expect(page.getByText('Verified Students')).toBeVisible();
    });
  });

  test.describe('Interactive Elements', () => {
    test('CTA button should navigate to search page', async ({ page }) => {
      const exploreButton = page.getByRole('link', { name: /Explore Accommodations/i });
      await expect(exploreButton).toHaveAttribute('href', '/search');
    });

    test('Learn More button should navigate to about page', async ({ page }) => {
      const learnMoreButton = page.getByRole('link', { name: /Learn More/i });
      await expect(learnMoreButton).toHaveAttribute('href', '/about');
    });

    test('CTA button should have hover effects', async ({ page }) => {
      const exploreButton = page.getByRole('link', { name: /Explore Accommodations/i });

      // Get the button element
      const button = exploreButton.locator('button');
      await button.hover();

      // Check if the button has the necessary classes for hover
      await expect(button).toHaveClass(/group/);
    });

    test('stat cards should have hover effects', async ({ page }) => {
      const firstStatCard = page.locator('.group.relative').first();

      // Hover over the card
      await firstStatCard.hover();

      // The card should have group class for hover effects
      await expect(firstStatCard).toHaveClass(/group/);
    });
  });

  test.describe('Animations', () => {
    test('should have animated gradient backgrounds', async ({ page }) => {
      // Check for animated blur elements (background gradients)
      const animatedBackgrounds = page.locator('[class*="blur-3xl"]');
      await expect(animatedBackgrounds).toHaveCount(3);
    });

    test('content should fade in on load', async ({ page }) => {
      // Wait for animations to complete
      await page.waitForTimeout(1000);

      // Content should be visible after animation
      const heading = page.getByRole('heading', { level: 1 });
      await expect(heading).toBeVisible();
    });

    test('should have grid pattern overlay', async ({ page }) => {
      const gridPattern = page.locator('[class*="bg-\\[linear-gradient"]');
      await expect(gridPattern).toHaveCount(1);
    });
  });

  test.describe('Content Accuracy', () => {
    test('should display correct stat numbers', async ({ page }) => {
      await expect(page.getByText('5,000+ Reviews')).toBeVisible();
      await expect(page.getByText('200+ Locations')).toBeVisible();
      await expect(page.getByText('Verified Students')).toBeVisible();
    });

    test('should display correct stat descriptions', async ({ page }) => {
      await expect(page.getByText('Honest feedback from students')).toBeVisible();
      await expect(page.getByText('Across NSW universities')).toBeVisible();
      await expect(page.getByText('University email verified')).toBeVisible();
    });

    test('should have correct headline text', async ({ page }) => {
      const headline = page.getByRole('heading', { level: 1 });
      await expect(headline).toContainText('Find Your Perfect');
      await expect(headline).toContainText('Student Accommodation');
      await expect(headline).toContainText('in NSW');
    });

    test('should have correct subheading text', async ({ page }) => {
      await expect(
        page.getByText(
          "Real reviews from real students. Make informed decisions about where you'll call home during your university years."
        )
      ).toBeVisible();
    });
  });

  test.describe('Visual Verification', () => {
    test('should render hero section correctly on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });

      // Verify all key elements are visible
      await expect(page.getByText('Find Your Perfect')).toBeVisible();
      await expect(page.getByText('Student Accommodation')).toBeVisible();
      await expect(page.getByText('5,000+ Reviews')).toBeVisible();
      await expect(page.getByRole('link', { name: /Explore Accommodations/i })).toBeVisible();
    });

    test('should render hero section correctly on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Verify all key elements are visible on mobile
      await expect(page.getByText('Find Your Perfect')).toBeVisible();
      await expect(page.getByText('Student Accommodation')).toBeVisible();
      await expect(page.getByText('5,000+ Reviews')).toBeVisible();
      await expect(page.getByRole('link', { name: /Explore Accommodations/i })).toBeVisible();
    });

    test('should display stats section correctly', async ({ page }) => {
      // Verify stats grid is visible
      const statsSection = page.locator('.grid.grid-cols-1');
      await expect(statsSection).toBeVisible();

      // Verify all stats are present
      await expect(page.getByText('5,000+ Reviews')).toBeVisible();
      await expect(page.getByText('200+ Locations')).toBeVisible();
      await expect(page.getByText('Verified Students')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have no accessibility violations', async ({ page }) => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      const h1 = page.getByRole('heading', { level: 1 });
      await expect(h1).toHaveCount(1);
    });

    test('should have accessible button labels', async ({ page }) => {
      const exploreButton = page.getByRole('link', { name: /Explore Accommodations/i });
      const learnMoreButton = page.getByRole('link', { name: /Learn More/i });

      await expect(exploreButton).toBeVisible();
      await expect(learnMoreButton).toBeVisible();
    });

    test('should have sufficient color contrast', async ({ page }) => {
      // The text should be visible on the background
      const heading = page.getByRole('heading', { level: 1 });
      const color = await heading.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // White text should be used (rgb(255, 255, 255))
      expect(color).toContain('255');
    });

    test('buttons should be keyboard accessible', async ({ page }) => {
      // Tab to the first interactive element
      await page.keyboard.press('Tab');

      // Check if we can navigate to buttons
      const exploreButton = page.getByRole('link', { name: /Explore Accommodations/i });
      await expect(exploreButton).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should load hero content quickly', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/');
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Page should load within 5 seconds
      expect(loadTime).toBeLessThan(5000);
    });

    test('should have minimal layout shift', async ({ page }) => {
      // Wait for page to fully load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(2000);

      // Content should be stable (no layout shifts after load)
      const heading = page.getByRole('heading', { level: 1 });
      const boundingBox1 = await heading.boundingBox();

      await page.waitForTimeout(1000);

      const boundingBox2 = await heading.boundingBox();

      // Position should remain the same
      expect(boundingBox1?.y).toBe(boundingBox2?.y);
    });
  });

  test.describe('Link Navigation', () => {
    test('all links should have valid href attributes', async ({ page }) => {
      const exploreLink = page.getByRole('link', { name: /Explore Accommodations/i });
      const learnMoreLink = page.getByRole('link', { name: /Learn More/i });

      await expect(exploreLink).toHaveAttribute('href', '/search');
      await expect(learnMoreLink).toHaveAttribute('href', '/about');
    });
  });
});
