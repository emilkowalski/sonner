import { expect, test } from '@playwright/test';
import { toast } from 'sonner';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});

test.describe('Basic functionality', () => {
  test('toast is rendered and disappears after the default timeout', async ({ page }) => {
    await page.getByTestId('default-button').click();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
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

  test('handle toast promise rejections', async ({ page }) => {
    const rejectedPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Promise rejected')), 100));
    try {
      toast.promise(rejectedPromise, {});
    } catch {
      throw new Error('Promise should not have rejected without unwrap');
    }

    await expect(toast.promise(rejectedPromise, {}).unwrap()).rejects.toThrow('Promise rejected');
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

  test('dismissible toast is not removed when dragged', async ({ page }) => {
    await page.getByTestId('non-dismissible-toast').click();
    const toast = page.locator('[data-sonner-toast]');
    const dragBoundingBox = await toast.boundingBox();

    if (!dragBoundingBox) return;
    await page.mouse.move(dragBoundingBox.x + dragBoundingBox.width / 2, dragBoundingBox.y);

    await page.mouse.down();
    await page.mouse.move(0, dragBoundingBox.y + 300);

    await page.mouse.up();
    await expect(page.getByTestId('non-dismissible-toast')).toHaveCount(1);
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
    const toast = page.locator('[data-sonner-toast]');
    const dragBoundingBox = await toast.boundingBox();

    if (!dragBoundingBox) return;

    // Initial touch point
    const startX = dragBoundingBox.x + dragBoundingBox.width / 2;
    const startY = dragBoundingBox.y;

    // Initial touch point
    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // Move mouse slightly to determine swipe direction
    await page.mouse.move(startX, startY + 10);

    // Complete the swipe - using relative position from start
    await page.mouse.move(startX, startY + 300);
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
  });

  test('return focus to the previous focused element', async ({ page }) => {
    await page.getByTestId('custom').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
    await page.getByTestId('dismiss-button').focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
    await expect(page.getByTestId('custom')).toBeFocused();
  });

  test("toaster's dir prop is reflected correctly", async ({ page }) => {
    await page.goto('/?dir=rtl');
    await page.getByTestId('default-button').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('dir', 'rtl');
  });

  test("toaster respects the HTML's dir attribute", async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
    });
    await page.getByTestId('default-button').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('dir', 'rtl');
  });

  test("toaster respects its own dir attribute over HTML's", async ({ page }) => {
    await page.goto('/?dir=ltr');
    await page.evaluate(() => {
      document.documentElement.setAttribute('dir', 'rtl');
    });
    await page.getByTestId('default-button').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('dir', 'ltr');
  });

  test('show correct toast content when updating', async ({ page }) => {
    await page.getByTestId('update-toast').click();
    await expect(page.getByText('My Unupdated Toast')).toHaveCount(0);
    await expect(page.getByText('My Updated Toast')).toHaveCount(1);
  });

  test('should update toast content and duration after 3 seconds', async ({ page }) => {
    await page.getByTestId('update-toast-duration').click();

    const initialToast = page.getByText('My Unupdated Toast, Updated After 3 Seconds');
    await expect(initialToast).toBeVisible();

    await page.waitForTimeout(3000);
    const updatedToast = page.getByText('My Updated Toast, Close After 1 Second');
    await expect(updatedToast).toBeVisible();

    await expect(initialToast).not.toBeVisible();

    await page.waitForTimeout(1200);
    await expect(updatedToast).not.toBeVisible();
  });

  test('cancel button is rendered with custom styles', async ({ page }) => {
    await page.getByTestId('custom-cancel-button-toast').click();
    const button = await page.locator('[data-cancel]');

    await expect(button).toHaveCSS('background-color', 'rgb(254, 226, 226)');
  });

  test('action button is rendered with custom styles', async ({ page }) => {
    await page.getByTestId('action').click();
    const button = await page.locator('[data-button]');

    await expect(button).toHaveCSS('background-color', 'rgb(219, 239, 255)');
  });

  test('string description is rendered', async ({ page }) => {
    await page.getByTestId('string-description').click();
    await expect(page.getByText('string description')).toHaveCount(1);
  });

  test('ReactNode description is rendered', async ({ page }) => {
    await page.getByTestId('react-node-description').click();
    await expect(page.getByText('This is my custom ReactNode description')).toHaveCount(1);
  });
});
