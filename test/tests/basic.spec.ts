import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Basic functionality', () => {
  test('toast is rendered and disappears after the default timeout', async ({ page }) => {
    await page.locator('button').click();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
    // Wait for the toast to disappear
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
  });

  test('toast is removed after swiping down', async ({ page }) => {
    await page.locator('button').click();
    await page.hover('[data-sonner-toast]');
    await page.mouse.down();
    await page.mouse.move(0, 800);
    await page.mouse.up();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
  });

  test('toast is not removed when hovered', async ({ page }) => {
    await page.locator('button').click();
    await page.hover('[data-sonner-toast]');
    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));
    await timeout;
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
  });
});
