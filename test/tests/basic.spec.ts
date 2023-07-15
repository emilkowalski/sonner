import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Basic functionality', () => {
  test('toast is rendered and disappears after the default timeout', async ({ page }) => {
    await page.getByTestId('default-button').click();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
  });

  test('various toast types are rendered correctly', async ({ page }) => {
    await page.getByTestId('success').click();
    await expect(page.getByText('My Success Toast', { exact: true })).toHaveCount(1);

    await page.getByTestId('error').click();
    await expect(page.getByText('My Error Toast', { exact: true })).toHaveCount(1);

    await page.getByTestId('action').click();
    await expect(page.locator('[data-button]')).toHaveCount(1);
  });

  test('show correct toast content based on promise state', async ({ page }) => {
    await page.getByTestId('promise').click();
    await expect(page.getByText('Loading...')).toHaveCount(1);
    await expect(page.getByText('Loaded')).toHaveCount(1);
  });

  test('render custom jsx in toast', async ({ page }) => {
    await page.getByTestId('custom').click();
    await expect(page.getByText('jsx')).toHaveCount(1);
  });

  test('toast is removed after swiping down', async ({ page }) => {
    await page.getByTestId('default-button').click();
    await page.hover('[data-sonner-toast]');
    await page.mouse.down();
    await page.mouse.move(0, 800);
    await page.mouse.up();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
  });

  test('toast is removed after swiping up', async ({ page }) => {
    await page.goto('/?position=top-left');
    await page.getByTestId('default-button').click();
    await page.hover('[data-sonner-toast]');
    await page.mouse.down();
    await page.mouse.move(0, -800);
    await page.mouse.up();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
  });

  test('toast is not removed when hovered', async ({ page }) => {
    await page.getByTestId('default-button').click();
    await page.hover('[data-sonner-toast]');
    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));
    await timeout;
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
  });

  test('toast is not removed if duration is set to infinity', async ({ page }) => {
    await page.getByTestId('infinity-toast').click();
    await page.hover('[data-sonner-toast]');
    const timeout = new Promise((resolve) => setTimeout(resolve, 5000));
    await timeout;
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
  });

  test('toast is not removed when event prevented in action', async ({ page }) => {
    await page.getByTestId('action-prevent').click();
    await page.locator('[data-button]').click();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
  });

  test("toast's auto close callback gets executed correctly", async ({ page }) => {
    await page.getByTestId('auto-close-toast-callback').click();
    await expect(page.getByTestId('auto-close-el')).toHaveCount(1);
  });

  test("toast's dismiss callback gets executed correctly", async ({ page }) => {
    await page.getByTestId('dismiss-toast-callback').click();
    await page.hover('[data-sonner-toast]');
    await page.mouse.down();
    await page.mouse.move(0, 800);
    await page.mouse.up();
    await expect(page.getByTestId('dismiss-el')).toHaveCount(1);
  });

  test("toaster's theme should be light", async ({ page }) => {
    await page.getByTestId('infinity-toast').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('data-theme', 'light');
  });

  test("toaster's theme should be dark", async ({ page }) => {
    await page.goto('/?theme=dark');
    await page.getByTestId('infinity-toast').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('data-theme', 'dark');
  });

  test("toaster's theme should be changed", async ({ page }) => {
    await page.getByTestId('infinity-toast').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('data-theme', 'light');
    await page.getByTestId('theme-button').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('data-theme', 'dark');

    test('return focus to the previous focused element', async ({ page }) => {
      await page.getByTestId('custom').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
      await page.getByTestId('dismiss-button').focus();
      await page.keyboard.press('Enter');
      await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
    });
  });
});
