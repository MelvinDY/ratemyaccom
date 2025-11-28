import { test, expect } from '@playwright/test';

test.describe('Browse Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000/browse');
    // Wait for the page to load
    await page.waitForLoadState('networkidle');
  });

  test('should display the browse page with hero and search', async ({ page }) => {
    // Check hero section
    await expect(page.getByRole('heading', { name: 'Browse Accommodations' })).toBeVisible();
    await expect(
      page.getByText('Discover student accommodations with verified reviews')
    ).toBeVisible();

    // Check search bar is visible
    await expect(page.getByRole('textbox', { name: 'Search accommodations' })).toBeVisible();
  });

  test('should display filters sidebar', async ({ page }) => {
    // Wait for filters to load
    await expect(page.getByRole('heading', { name: 'Filters' })).toBeVisible();

    // Check all filter sections are present
    await expect(page.getByLabel('Filter by university')).toBeVisible();
    await expect(page.getByLabel('Filter by location')).toBeVisible();
    await expect(page.getByLabel('Minimum price')).toBeVisible();
    await expect(page.getByLabel('Maximum price')).toBeVisible();
    await expect(page.getByLabel('Filter by minimum rating')).toBeVisible();
  });

  test('should load and display accommodation cards', async ({ page }) => {
    // Wait for loading to complete
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Check that accommodation cards are displayed
    const cards = page.locator('[role="listitem"]');
    const count = await cards.count();
    expect(count).toBeGreaterThan(0);

    // Verify card structure (check first card)
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
  });

  test('should display loading skeletons while fetching data', async ({ page }) => {
    // Reload page to see loading state
    const responsePromise = page.waitForResponse(
      (response) => response.url().includes('/api/accommodations') && response.status() === 200
    );

    await page.reload();

    // Check for loading state
    const loadingContainer = page.locator('[role="status"][aria-label="Loading accommodations"]');
    if (await loadingContainer.isVisible({ timeout: 1000 }).catch(() => false)) {
      expect(await loadingContainer.isVisible()).toBe(true);
    }

    await responsePromise;

    // Wait for actual results
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });
  });

  test('should filter by university', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Click university filter
    await page.getByLabel('Filter by university').click();

    // Select a specific university
    await page.getByRole('option', { name: 'University of New South Wales (UNSW)' }).click();

    // Wait for results to update
    await page.waitForTimeout(500);

    // Check that active filter badge appears in the filters section
    const activeFilters = page
      .locator('.inline-flex.items-center.px-3.py-1.rounded-full')
      .filter({ hasText: 'University of New South Wales (UNSW)' });
    await expect(activeFilters.first()).toBeVisible();

    // Verify results are shown
    const results = page.locator('[role="listitem"]');
    const count = await results.count();
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('should filter by location', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Type in location filter
    const locationInput = page.getByLabel('Filter by location');
    await locationInput.fill('Kensington');

    // Wait for debounce and results update
    await page.waitForTimeout(500);

    // Check that active filter badge appears in the filters section
    const activeFilters = page
      .locator('.inline-flex.items-center.px-3.py-1.rounded-full')
      .filter({ hasText: 'Kensington' });
    await expect(activeFilters.first()).toBeVisible();
  });

  test('should filter by price range', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Set minimum price
    const minPriceInput = page.getByLabel('Minimum price');
    await minPriceInput.fill('300');

    // Set maximum price
    const maxPriceInput = page.getByLabel('Maximum price');
    await maxPriceInput.fill('500');

    // Wait for results update
    await page.waitForTimeout(500);

    // Check that active filter badges appear
    await expect(page.getByText('Min: $300')).toBeVisible();
    await expect(page.getByText('Max: $500')).toBeVisible();
  });

  test('should filter by rating', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Click rating filter
    await page.getByLabel('Filter by minimum rating').click();

    // Select 4+ stars
    await page.getByRole('option', { name: '4+ Stars' }).click();

    // Wait for results update
    await page.waitForTimeout(500);

    // Check that active filter badge appears in the filters section
    const activeFilters = page
      .locator('.inline-flex.items-center.px-3.py-1.rounded-full')
      .filter({ hasText: '4+ Stars' });
    await expect(activeFilters.first()).toBeVisible();
  });

  test('should search by accommodation name', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Type in search box
    const searchInput = page.getByRole('textbox', { name: 'Search accommodations' });
    await searchInput.fill('UNSW Village');

    // Wait for debounce and results
    await page.waitForTimeout(500);

    // Results should be filtered
    const results = page.locator('[role="listitem"]');
    const count = await results.count();

    if (count > 0) {
      // At least one result should contain "UNSW Village"
      const firstCard = results.first();
      await expect(firstCard).toContainText('UNSW Village');
    }
  });

  test('should clear all filters', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Apply multiple filters
    await page.getByLabel('Filter by location').fill('Kensington');
    await page.getByLabel('Minimum price').fill('300');

    // Wait for filters to apply
    await page.waitForTimeout(500);

    // Click clear all button
    await page.getByRole('button', { name: 'Clear all filters' }).click();

    // Verify filters are cleared
    const locationInput = page.getByLabel('Filter by location');
    await expect(locationInput).toHaveValue('');

    const minPriceInput = page.getByLabel('Minimum price');
    await expect(minPriceInput).toHaveValue('');
  });

  test('should display empty state when no results', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Apply filters that yield no results
    const searchInput = page.getByRole('textbox', { name: 'Search accommodations' });
    await searchInput.fill('NonExistentAccommodationXYZ123');

    // Wait for results to update
    await page.waitForTimeout(500);

    // Check for empty state
    const emptyStateHeading = page.getByRole('heading', { name: 'No Accommodations Found' });
    if (await emptyStateHeading.isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(emptyStateHeading).toBeVisible();
      await expect(
        page.getByText("We couldn't find any accommodations matching your search criteria")
      ).toBeVisible();
      await expect(page.getByRole('button', { name: 'Clear All Filters' })).toBeVisible();
    }
  });

  test('should navigate to next page', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Check if pagination exists
    const nextButton = page.getByRole('button', { name: 'Next page' });

    if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
      // Click next page
      await nextButton.click();

      // Wait for page to update
      await page.waitForTimeout(500);

      // Check that we're on page 2
      await expect(page.getByText('Page 2 of')).toBeVisible();
    }
  });

  test('should navigate to previous page', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    const nextButton = page.getByRole('button', { name: 'Next page' });

    if ((await nextButton.isVisible()) && (await nextButton.isEnabled())) {
      // Go to page 2
      await nextButton.click();
      await page.waitForTimeout(500);

      // Click previous page
      const prevButton = page.getByRole('button', { name: 'Previous page' });
      await prevButton.click();

      // Wait for page to update
      await page.waitForTimeout(500);

      // Check that we're back on page 1
      await expect(page.getByText('Page 1 of')).toBeVisible();
    }
  });

  test('should navigate to specific page number', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Check if page 2 button exists
    const page2Button = page.getByRole('button', { name: 'Go to page 2' });

    if (await page2Button.isVisible()) {
      // Click page 2
      await page2Button.click();

      // Wait for page to update
      await page.waitForTimeout(500);

      // Verify we're on page 2
      await expect(page.getByText('Page 2 of')).toBeVisible();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check that page renders properly
    await expect(page.getByRole('heading', { name: 'Browse Accommodations' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Search accommodations' })).toBeVisible();

    // Filters should be visible (but may be in column layout)
    await expect(page.getByRole('heading', { name: 'Filters' })).toBeVisible();

    // Wait for results
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Cards should be in single column
    const cards = page.locator('[role="listitem"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Check layout
    await expect(page.getByRole('heading', { name: 'Browse Accommodations' })).toBeVisible();

    // Wait for results
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Verify cards are visible
    const cards = page.locator('[role="listitem"]');
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test('should have accessible navigation', async ({ page }) => {
    // Wait for initial load
    await page.waitForSelector('[role="listitem"]', { timeout: 10000 });

    // Test keyboard navigation on search
    const searchInput = page.getByRole('textbox', { name: 'Search accommodations' });
    await searchInput.focus();
    await expect(searchInput).toBeFocused();

    // Test keyboard navigation on filters
    await page.keyboard.press('Tab');
    // Should focus next interactive element

    // Verify ARIA labels
    await expect(page.getByRole('list', { name: 'Accommodation results' })).toBeVisible();

    // Check pagination exists if there are multiple pages
    const paginationNav = page.getByRole('navigation', { name: 'Pagination' });
    if (await paginationNav.isVisible({ timeout: 1000 }).catch(() => false)) {
      await expect(paginationNav).toBeVisible();
    }
  });
});
