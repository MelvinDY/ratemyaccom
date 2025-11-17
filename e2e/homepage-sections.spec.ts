import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Homepage Sections - Quick Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display all three new sections', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check Features section
    const featuresSection = page.locator('section[aria-labelledby="features-heading"]');
    await featuresSection.scrollIntoViewIfNeeded();
    await expect(featuresSection).toBeVisible();
    await expect(page.getByRole('heading', { name: /Everything You Need to Find Your Home/i })).toBeVisible();

    // Check About Us section
    const aboutSection = page.locator('section[aria-labelledby="about-heading"]');
    await aboutSection.scrollIntoViewIfNeeded();
    await expect(aboutSection).toBeVisible();
    await expect(page.getByRole('heading', { name: /Empowering Students to Make Better Choices/i })).toBeVisible();

    // Check FAQ section
    const faqSection = page.locator('section[aria-labelledby="faq-heading"]');
    await faqSection.scrollIntoViewIfNeeded();
    await expect(faqSection).toBeVisible();
    await expect(page.getByRole('heading', { name: /Frequently Asked Questions/i })).toBeVisible();
  });

  test('Features section should display all 6 features', async ({ page }) => {
    await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();

    await expect(page.getByRole('heading', { name: 'Real Student Reviews' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Verified Students Only' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Comprehensive Filters' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Photo Galleries' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Detailed Information' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Compare Accommodations' })).toBeVisible();
  });

  test('About Us section should display stats', async ({ page }) => {
    await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();

    await expect(page.getByText('5,000+', { exact: true })).toBeVisible();
    await expect(page.getByText('200+', { exact: true })).toBeVisible();
    await expect(page.getByText('98%')).toBeVisible();
    await expect(page.getByText('15K+')).toBeVisible();
  });

  test('FAQ section accordion should work', async ({ page }) => {
    await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);

    // Click first FAQ question
    const firstQuestion = page.getByText('How do I leave a review?');
    await firstQuestion.click();
    await page.waitForTimeout(500);

    // Answer should be visible
    await expect(
      page.getByText(/To leave a review, first create an account/i)
    ).toBeVisible();
  });

  test('should have no accessibility violations on all sections', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    // Test Features section
    await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();
    const featuresResults = await new AxeBuilder({ page })
      .include('section[aria-labelledby="features-heading"]')
      .analyze();
    expect(featuresResults.violations).toEqual([]);

    // Test About Us section
    await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();
    const aboutResults = await new AxeBuilder({ page })
      .include('section[aria-labelledby="about-heading"]')
      .analyze();
    expect(aboutResults.violations).toEqual([]);

    // Test FAQ section
    await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    const faqResults = await new AxeBuilder({ page })
      .include('section[aria-labelledby="faq-heading"]')
      .analyze();
    expect(faqResults.violations).toEqual([]);
  });

  test('sections should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Features section
    await page.locator('section[aria-labelledby="features-heading"]').scrollIntoViewIfNeeded();
    await expect(page.getByRole('heading', { name: 'Real Student Reviews' })).toBeVisible();

    // About Us section
    await page.locator('section[aria-labelledby="about-heading"]').scrollIntoViewIfNeeded();
    await expect(page.getByText('5,000+')).toBeVisible();

    // FAQ section
    await page.locator('section[aria-labelledby="faq-heading"]').scrollIntoViewIfNeeded();
    await expect(page.getByText('How do I leave a review?')).toBeVisible();
  });
});
