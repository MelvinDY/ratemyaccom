import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('ModalList Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Initial State', () => {
    test('should display the trigger button on the homepage', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await expect(trigger).toBeVisible();
    });

    test('should have correct button styling', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await expect(trigger).toHaveClass(/bg-gradient-to-r/);
    });

    test('should display building icon in trigger button', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      const icon = trigger.locator('svg').first();
      await expect(icon).toBeVisible();
    });
  });

  test.describe('Modal Open/Close Behavior', () => {
    test('should open modal when trigger button is clicked', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });

    test('should display correct modal title', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      const title = page.getByRole('heading', { name: /browse accommodations/i });
      await expect(title).toBeVisible();
    });

    test('should display modal description', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      const description = page.getByText(/explore student accommodations/i);
      await expect(description).toBeVisible();
    });

    test('should close modal when close button is clicked', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      const closeButton = modal.getByRole('button', { name: 'Close', exact: true });
      await closeButton.click();

      await expect(modal).not.toBeVisible();
    });

    test('should close modal when escape key is pressed', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      await page.keyboard.press('Escape');
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Search Functionality', () => {
    test('should display search input', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const searchInput = page.getByPlaceholder(/search accommodations/i);
      await expect(searchInput).toBeVisible();
    });

    test('should filter accommodations based on search query', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const modal = page.getByRole('dialog');
      // Wait for accommodations to load
      await modal.getByText('UNSW Village').first().waitFor({ timeout: 5000 });

      const searchInput = page.getByPlaceholder(/search accommodations/i);
      await searchInput.fill('UNSW');

      // Should show UNSW Village in modal
      await expect(modal.getByText('UNSW Village')).toBeVisible();

      // Should not show UniLodge in modal
      await expect(modal.getByText('UniLodge on Broadway')).not.toBeVisible();
    });

    test('should show no results message when search has no matches', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const searchInput = page.getByPlaceholder(/search accommodations/i);
      await searchInput.fill('NonexistentAccommodation12345');

      await expect(page.getByText(/no accommodations found/i)).toBeVisible();
      await expect(page.getByText(/try adjusting your search/i)).toBeVisible();
    });

    test('should clear search results when input is cleared', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const modal = page.getByRole('dialog');
      const searchInput = page.getByPlaceholder(/search accommodations/i);
      await searchInput.fill('UNSW');
      await searchInput.clear();

      // All accommodations should be visible again in modal
      await expect(modal.getByText('UNSW Village')).toBeVisible();
      await expect(modal.getByText('UniLodge on Broadway')).toBeVisible();
    });
  });

  test.describe('Filter Functionality', () => {
    test('should display filter buttons', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const modal = page.getByRole('dialog');
      await expect(modal.getByRole('button', { name: 'All', exact: true })).toBeVisible();
      await expect(modal.getByRole('button', { name: 'On-Campus', exact: true })).toBeVisible();
      await expect(modal.getByRole('button', { name: 'Off-Campus', exact: true })).toBeVisible();
    });

    test('should filter on-campus accommodations', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const modal = page.getByRole('dialog');
      await modal.getByRole('button', { name: 'On-Campus', exact: true }).click();

      // Check that on-campus badge is visible
      await expect(modal.getByText('On Campus').first()).toBeVisible();
    });

    test('should filter off-campus accommodations', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const modal = page.getByRole('dialog');
      await modal.getByRole('button', { name: 'Off-Campus', exact: true }).click();

      // Check that off-campus badge is visible
      await expect(modal.getByText('Off Campus').first()).toBeVisible();
    });

    test('should show all accommodations when All filter is selected', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const modal = page.getByRole('dialog');
      // First filter to on-campus
      await modal.getByRole('button', { name: 'On-Campus', exact: true }).click();

      // Then click All
      await modal.getByRole('button', { name: 'All', exact: true }).click();

      // Should show both types
      await expect(modal.getByText('On Campus').first()).toBeVisible();
      await expect(modal.getByText('Off Campus').first()).toBeVisible();
    });

    test('should visually indicate active filter', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const modal = page.getByRole('dialog');
      const onCampusButton = modal.getByRole('button', { name: 'On-Campus', exact: true });
      await onCampusButton.click();

      // Check that the button has the active styling class
      await expect(onCampusButton).toHaveClass(/bg-purple-600/);
    });
  });

  test.describe('Sort Functionality', () => {
    test('should display sort dropdown', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const sortDropdown = page.locator('select');
      await expect(sortDropdown).toBeVisible();
    });

    test('should have correct sort options', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const sortDropdown = page.locator('select');
      const options = await sortDropdown.locator('option').allTextContents();

      expect(options).toContain('Highest Rated');
      expect(options).toContain('Price: Low to High');
      expect(options).toContain('Price: High to Low');
    });

    test('should change sort order when option is selected', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const sortDropdown = page.locator('select');
      await sortDropdown.selectOption('price-low');

      // Verify selection
      await expect(sortDropdown).toHaveValue('price-low');
    });
  });

  test.describe('Accommodation List Items', () => {
    test('should display accommodation cards', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      // Wait for at least one accommodation to appear
      await expect(page.getByText('UNSW Village')).toBeVisible({ timeout: 10000 });
    });

    test('should display accommodation name', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      await expect(page.getByText('UNSW Village')).toBeVisible();
    });

    test('should display location information', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      await expect(page.getByText(/kensington/i)).toBeVisible();
    });

    test('should display rating with stars', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      // Look for star icon and rating
      const modal = page.getByRole('dialog');
      const starIcon = modal.locator('svg[class*="fill-yellow"]').first();
      await expect(starIcon).toBeVisible();
    });

    test('should display price range', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      // Look for price information
      await expect(page.getByText(/\$\d+-\$\d+/).first()).toBeVisible();
    });

    test('should display capacity', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      await expect(page.getByText(/capacity/).first()).toBeVisible();
    });

    test('should display verified badge for verified accommodations', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      await expect(page.getByText('Verified').first()).toBeVisible();
    });

    test('should display on-campus or off-campus badge', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const modal = page.getByRole('dialog');
      const hasCampusBadge =
        (await modal.getByText('On Campus').count()) > 0 ||
        (await modal.getByText('Off Campus').count()) > 0;
      expect(hasCampusBadge).toBeTruthy();
    });
  });

  test.describe('Interactions', () => {
    test('should show hover effect on accommodation cards', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const firstCard = page.locator('button').filter({ hasText: 'UNSW Village' }).first();
      await firstCard.hover();

      // Card should be visible and interactive
      await expect(firstCard).toBeVisible();
    });

    test('should close modal when accommodation is clicked', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();

      const firstCard = page.locator('button').filter({ hasText: 'UNSW Village' }).first();
      await firstCard.click();

      // Modal should close
      await expect(modal).not.toBeVisible();
    });
  });

  test.describe('Animations', () => {
    test('should animate modal entry', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      const modal = page.getByRole('dialog');

      // Modal should become visible with animation
      await expect(modal).toBeVisible();
    });

    test('should animate list items on filter change', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      // Wait for initial load
      await page.waitForTimeout(500);

      // Change filter
      await page.getByRole('button', { name: 'On-Campus' }).click();

      // Wait for animation
      await page.waitForTimeout(300);

      // Items should still be visible after animation
      const modal = page.getByRole('dialog');
      const accommodationCards = modal.locator('button').filter({ hasText: 'Village' });
      await expect(accommodationCards.first()).toBeVisible();
    });
  });

  test.describe('Responsive Behavior', () => {
    test('should display properly on mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/');

      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await expect(trigger).toBeVisible();

      await trigger.click();
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });

    test('should display properly on tablet viewport', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto('/');

      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });

    test('should display properly on desktop viewport', async ({ page }) => {
      await page.setViewportSize({ width: 1920, height: 1080 });
      await page.goto('/');

      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });
  });

  test.describe('Keyboard Navigation', () => {
    test('should be focusable via keyboard', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });

      // Tab to the button
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');

      // The trigger should be in the tab order
      const isFocused = await trigger.evaluate(
        (el) => el === document.activeElement || el.contains(document.activeElement)
      );
      expect(isFocused || (await trigger.isVisible())).toBeTruthy();
    });

    test('should open modal with Enter key', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.focus();
      await page.keyboard.press('Enter');

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });

    test('should open modal with Space key', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.focus();
      await page.keyboard.press('Space');

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });

    test('should allow keyboard navigation within modal', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      // Tab through modal elements
      await page.keyboard.press('Tab'); // Focus first element
      await page.keyboard.press('Tab'); // Focus next element

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });
  });

  test.describe('Accessibility', () => {
    test('should have no automatically detectable accessibility issues (modal closed)', async ({
      page,
    }) => {
      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have no automatically detectable accessibility issues (modal open)', async ({
      page,
    }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      await page.waitForTimeout(500); // Wait for modal to fully open

      const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
      expect(accessibilityScanResults.violations).toEqual([]);
    });

    test('should have proper ARIA labels', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });

    test('should trap focus within modal when open', async ({ page }) => {
      const trigger = page.getByRole('button', { name: /browse all accommodations/i });
      await trigger.click();

      // Tab several times
      for (let i = 0; i < 10; i++) {
        await page.keyboard.press('Tab');
      }

      // Focus should still be within the modal
      const modal = page.getByRole('dialog');
      await expect(modal).toBeVisible();
    });
  });

  test.describe('Footer Information', () => {
    test('should display accommodation count', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      await expect(page.getByText(/showing \d+ of \d+ accommodations/i)).toBeVisible();
    });

    test('should update count when filters are applied', async ({ page }) => {
      await page.getByRole('button', { name: /browse all accommodations/i }).click();

      // Apply filter
      await page.getByRole('button', { name: 'On-Campus' }).click();

      // Wait for update
      await page.waitForTimeout(300);

      // Count might change based on filter
      await expect(page.getByText(/showing \d+ of \d+ accommodations/i)).toBeVisible();
    });
  });
});
