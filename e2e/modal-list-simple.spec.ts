import { test, expect } from '@playwright/test';

test.describe('ModalList Component - Quick Verification', () => {
  test('should display and open modal successfully', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check trigger button exists
    const trigger = page.getByRole('button', { name: /browse all accommodations/i });
    await expect(trigger).toBeVisible();

    // Open modal
    await trigger.click();

    // Check modal is visible
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();

    // Check title
    await expect(page.getByRole('heading', { name: /browse accommodations/i })).toBeVisible();

    // Check search input
    await expect(page.getByPlaceholder(/search accommodations/i)).toBeVisible();

    // Check that accommodations are loaded
    await page.waitForTimeout(1000);
    const modalContent = modal.locator('button').filter({ hasText: 'Village' });
    await expect(modalContent.first()).toBeVisible();

    // Close modal
    await page.keyboard.press('Escape');
    await expect(modal).not.toBeVisible();
  });
});
