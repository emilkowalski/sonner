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

  test('promise toast with extended configuration', async ({ page }) => {
    await page.getByTestId('extended-promise').click();

    // Check loading state
    await expect(page.getByText('Loading...')).toHaveCount(1);

    // Check success state with custom message and description
    await expect(page.getByText('Sonner toast has been added')).toHaveCount(1);
    await expect(page.getByText('Custom description for the Success state')).toHaveCount(1);

    // Verify global description is not shown (overridden by success description)
    await expect(page.getByText('Global description')).toHaveCount(0);
  });

  test('promise toast with extended error configuration', async ({ page }) => {
    await page.getByTestId('extended-promise-error').click();

    // Check loading state
    await expect(page.getByText('Loading...')).toHaveCount(1);

    // Check error state
    await expect(page.getByText('An error occurred')).toHaveCount(1);

    // Verify action button is present
    const actionButton = page.getByText('Retry');
    await expect(actionButton).toHaveCount(1);

    // Click retry button and verify it doesn't close the toast (due to preventDefault)
    await actionButton.click();
    await expect(page.getByText('An error occurred')).toHaveCount(1);
  });

  test('promise toast with Error object rejection', async ({ page }) => {
    await page.getByTestId('error-promise').click();

    // Check error state shows the error message correctly
    await expect(page.getByText('Error Raise: Error: Not implemented')).toHaveCount(1);
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

    // Wait for toast to be visible first
    await expect(page.locator('[data-sonner-toast]')).toBeVisible();

    // Hover the toast
    await page.hover('[data-sonner-toast]');

    // Wait a bit to ensure hover is registered
    await page.waitForTimeout(100);

    // Create a longer timeout to verify toast persists
    await page.waitForTimeout(5000);

    // Verify toast is still visible
    await expect(page.locator('[data-sonner-toast]')).toBeVisible();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
  });

  test('toast is not removed if duration is set to infinity', async ({ page }) => {
    await page.getByTestId('infinity-toast').click();

    await expect(page.locator('[data-sonner-toast]')).toBeVisible();

    const toast = page.locator('[data-sonner-toast]');
    await toast.hover({ force: true });

    await page.waitForTimeout(100);

    await page.waitForTimeout(5000);

    await expect(toast).toBeVisible();
    await expect(toast).toHaveCount(1);
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

    await toast.waitFor({ state: 'visible' });

    const box = await toast.boundingBox();
    if (!box) return;

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // Small initial movement to trigger drag
    await page.mouse.move(startX, startY + 20, { steps: 5 });

    // Main swipe movement
    await page.mouse.move(startX, startY + 300, { steps: 10 });
    await page.mouse.up();

    await expect(page.getByTestId('dismiss-el')).toHaveCount(1);
  });

  test("toaster's theme should be light", async ({ page }) => {
    await page.getByTestId('infinity-toast').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('data-sonner-theme', 'light');
  });

  test("toaster's theme should be dark", async ({ page }) => {
    await page.goto('/?theme=dark');
    await page.getByTestId('infinity-toast').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('data-sonner-theme', 'dark');
  });

  test("toaster's theme should be changed", async ({ page }) => {
    await page.getByTestId('infinity-toast').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('data-sonner-theme', 'light');
    await page.getByTestId('theme-button').click();
    await expect(page.locator('[data-sonner-toaster]')).toHaveAttribute('data-sonner-theme', 'dark');
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

  test('aria labels are custom', async ({ page }) => {
    await page.getByRole('button', { name: 'With custom ARIA labels' }).click();
    await expect(page.getByText('Toast with custom ARIA labels')).toHaveCount(1);
    await expect(page.getByLabel('Notices')).toHaveCount(1);
    await expect(page.getByLabel('Yeet the notice', { exact: true })).toHaveCount(1);
  });

  test('toast with testId renders data-testid attribute correctly', async ({ page }) => {
    await page.getByTestId('testid-toast-button').click();
    await expect(page.getByTestId('my-test-toast')).toBeVisible();
    await expect(page.getByTestId('my-test-toast')).toHaveText('Toast with test ID');
  });

  test('toast without testId does not have data-testid attribute', async ({ page }) => {
    await page.getByTestId('default-button').click();
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toBeVisible();
    await expect(toast).not.toHaveAttribute('data-testid');
  });

  test('promise toast with testId maintains testId through state changes', async ({ page }) => {
    await page.getByTestId('testid-promise-toast-button').click();
    await expect(page.getByTestId('promise-test-toast')).toBeVisible();
    await expect(page.getByTestId('promise-test-toast')).toHaveText('Loading...');
    await expect(page.getByTestId('promise-test-toast')).toHaveText('Loaded');
  });
});
