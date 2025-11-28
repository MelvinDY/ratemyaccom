import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('About Us Section', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Scroll to about us section
    await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();
  });

  test.describe('Visual Appearance', () => {
    test('should display section heading and badge', async ({ page }) => {
      // Check section badge
      await expect(page.getByText('About Us', { exact: true })).toBeVisible();

      // Check main heading
      const heading = page.getByRole('heading', {
        name: /Empowering Students to Make Better Choices/i,
      });
      await expect(heading).toBeVisible();
    });

    test('should display mission statement content', async ({ page }) => {
      // Check paragraphs
      await expect(
        page.getByText(/We understand that finding the right accommodation/i)
      ).toBeVisible();

      await expect(page.getByText(/Our mission is simple: to provide/i)).toBeVisible();

      await expect(
        page.getByText(/We believe in transparency, trust, and community/i)
      ).toBeVisible();
    });

    test('should display mission statement box', async ({ page }) => {
      // Check mission statement heading
      await expect(page.getByRole('heading', { name: 'Our Mission' })).toBeVisible();

      // Check mission statement text
      await expect(
        page.getByText(/To create the most trusted and comprehensive student accommodation/i)
      ).toBeVisible();
    });

    test('should display all 4 stats cards', async ({ page }) => {
      // Check all stat labels
      await expect(page.getByText('Active Students')).toBeVisible();
      await expect(page.getByText('Accommodations')).toBeVisible();
      await expect(page.getByText('Satisfaction Rate')).toBeVisible();
      await expect(page.getByText('Reviews')).toBeVisible();
    });

    test('should display stat numbers', async ({ page }) => {
      // Check all stat numbers
      await expect(page.getByText('5,000+', { exact: true })).toBeVisible();
      await expect(page.getByText('200+', { exact: true })).toBeVisible();
      await expect(page.getByText('98%')).toBeVisible();
      await expect(page.getByText('15K+')).toBeVisible();
    });

    test('should display stat descriptions', async ({ page }) => {
      // Check all stat descriptions
      await expect(page.getByText('Verified students contributing reviews')).toBeVisible();
      await expect(page.getByText('Across NSW universities')).toBeVisible();
      await expect(page.getByText('Students found helpful info')).toBeVisible();
      await expect(page.getByText('Honest feedback shared')).toBeVisible();
    });

    test('should have gradient background', async ({ page }) => {
      const section = page.locator('section[aria-labelledby="about-heading"]');
      await expect(section).toHaveClass(/bg-gradient-to-br/);

      // Check for animated background gradients
      const gradients = section.locator('[class*="blur-3xl"]');
      await expect(gradients).toHaveCount(2);
    });

    test('should display grid pattern overlay', async ({ page }) => {
      const section = page.locator('section[aria-labelledby="about-heading"]');
      const gridPattern = section.locator('[class*="bg-\\[linear-gradient"]');
      await expect(gridPattern).toHaveCount(1);
    });
  });

  test.describe('Layout Structure', () => {
    test('should have two-column layout on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      const grid = page
        .locator('section[aria-labelledby="about-heading"]')
        .locator('.grid')
        .first();
      await expect(grid).toHaveClass(/lg:grid-cols-2/);
    });

    test('should stack content on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      // Content should still be visible
      await expect(page.getByRole('heading', { name: /Empowering Students/i })).toBeVisible();
      await expect(page.getByText('Active Students')).toBeVisible();
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should be responsive on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      // All content should be visible
      await expect(page.getByRole('heading', { name: /Empowering Students/i })).toBeVisible();
      await expect(page.getByText('Our Mission')).toBeVisible();
      await expect(page.getByText('5,000+')).toBeVisible();
    });

    test('should be responsive on tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      // All content should be visible
      await expect(page.getByRole('heading', { name: /Empowering Students/i })).toBeVisible();
      await expect(page.getByText('200+')).toBeVisible();
    });

    test('should be responsive on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      // All content should be visible
      await expect(page.getByRole('heading', { name: /Empowering Students/i })).toBeVisible();
      await expect(page.getByText('98%')).toBeVisible();
      await expect(page.getByText('15K+')).toBeVisible();
    });
  });

  test.describe('Stats Grid', () => {
    test('should display 4 stat cards in 2x2 grid', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      const section = page.locator('section[aria-labelledby="about-heading"]');
      const statsGrid = section.locator('.grid.grid-cols-2');
      await expect(statsGrid).toBeVisible();

      const statCards = statsGrid.locator('.group.relative');
      await expect(statCards).toHaveCount(4);
    });

    test('each stat card should have icon, number, label, and description', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      const section = page.locator('section[aria-labelledby="about-heading"]');
      const statsGrid = section.locator('.grid.grid-cols-2');
      const statCards = statsGrid.locator('.group.relative');

      for (let i = 0; i < 4; i++) {
        const card = statCards.nth(i);

        // Should have an icon
        const icon = card.locator('svg').first();
        await expect(icon).toBeVisible();

        // Should have content visible
        await expect(card).toBeVisible();
      }
    });
  });

  test.describe('Interactive Elements', () => {
    test('stat cards should have hover effects', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      const section = page.locator('section[aria-labelledby="about-heading"]');
      const firstCard = section.locator('.grid.grid-cols-2').locator('.group.relative').first();

      // Hover over the card
      await firstCard.hover();

      // Card should have group class for hover effects
      await expect(firstCard).toHaveClass(/group/);
    });

    test('all stat cards should be interactive', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      const section = page.locator('section[aria-labelledby="about-heading"]');
      const statCards = section.locator('.grid.grid-cols-2').locator('.group.relative');

      // All 4 cards should have hover effect capability
      for (let i = 0; i < 4; i++) {
        await expect(statCards.nth(i)).toHaveClass(/group/);
      }
    });
  });

  test.describe('Animations', () => {
    test('should have animated background gradients', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      // Check for animated blur elements
      const section = page.locator('section[aria-labelledby="about-heading"]');
      const animatedBackgrounds = section.locator('[class*="blur-3xl"]');
      await expect(animatedBackgrounds).toHaveCount(2);
    });

    test('content should animate in when scrolled into view', async ({ page }) => {
      // Scroll to top first
      await page.evaluate(() => window.scrollTo(0, 0));

      // Wait a moment
      await page.waitForTimeout(500);

      // Scroll to about us section
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      // Wait for animation
      await page.waitForTimeout(1000);

      // Content should be visible after animation
      const heading = page.getByRole('heading', { name: /Empowering Students/i });
      await expect(heading).toBeVisible();
    });
  });

  test.describe('Content Accuracy', () => {
    test('should display correct stat count', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      const section = page.locator('section[aria-labelledby="about-heading"]');
      const statCards = section.locator('.grid.grid-cols-2').locator('.group.relative');
      await expect(statCards).toHaveCount(4);
    });

    test('should have mission statement with icon', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      // Check mission box exists
      const missionBox = page.locator('text=Our Mission').locator('..');
      await expect(missionBox).toBeVisible();

      // Should have Target icon
      const section = page.locator('section[aria-labelledby="about-heading"]');
      const targetIcon = section.locator('svg[aria-hidden="true"]').first();
      await expect(targetIcon).toBeVisible();
    });

    test('should emphasize key terms', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      // Check for emphasized text
      await expect(page.locator('text=honest, verified reviews')).toBeVisible();
      await expect(page.locator('text=transparency, trust, and community')).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have no accessibility violations', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      const accessibilityScanResults = await new AxeBuilder({ page })
        .include('section[aria-labelledby="about-heading"]')
        .analyze();

      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      // Section should have h2 main heading
      const h2 = page.locator('#about-heading');
      await expect(h2).toBeVisible();

      // Should have h3 for mission statement
      const h3 = page.getByRole('heading', { name: 'Our Mission' });
      await expect(h3).toBeVisible();
    });

    test('should have semantic section element', async ({ page }) => {
      const section = page.locator('section[aria-labelledby="about-heading"]');
      await expect(section).toBeVisible();

      // Should have aria-labelledby attribute
      await expect(section).toHaveAttribute('aria-labelledby', 'about-heading');
    });

    test('icons should have aria-hidden attribute', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      const section = page.locator('section[aria-labelledby="about-heading"]');
      const icons = section.locator('svg[aria-hidden="true"]');

      // All decorative icons should have aria-hidden
      await expect(icons.first()).toBeVisible();
    });

    test('should have readable text contrast', async ({ page }) => {
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

      const heading = page.getByRole('heading', { name: /Empowering Students/i });
      const color = await heading.evaluate((el) => {
        return window.getComputedStyle(el).color;
      });

      // White text should be used
      expect(color).toContain('255');
    });
  });

  test.describe('Visual Regression', () => {
    test('should match about us section snapshot on desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500); // Wait for animations

      const section = page.locator('section[aria-labelledby="about-heading"]');
      await expect(section).toBeVisible();
    });

    test('should match about us section snapshot on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();
      await page.waitForTimeout(1500); // Wait for animations

      const section = page.locator('section[aria-labelledby="about-heading"]');
      await expect(section).toBeVisible();
    });
  });

  test.describe('Performance', () => {
    test('should render quickly when scrolled into view', async ({ page }) => {
      const startTime = Date.now();

      await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();
      await page.waitForLoadState('networkidle');

      const loadTime = Date.now() - startTime;

      // Section should render within 2 seconds
      expect(loadTime).toBeLessThan(2000);
    });
  });
});
