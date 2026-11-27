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

  test('cancel button dismisses the custom toast with empty id', async ({ page }) => {
    await page.getByTestId('custom-with-empty-id').click();

    await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
    await page.getByTestId('dismiss-button').click();
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);
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

  test('toast with toasterId only appears in the correct Toaster', async ({ page }) => {
    await page.getByTestId('toast-secondary').click();
    const secondaryToaster = page.locator('[data-sonner-toaster][data-x-position="left"][data-y-position="top"]');
    await expect(secondaryToaster.getByText('Secondary Toaster Toast')).toHaveCount(1);
    const globalToaster = page.locator('[data-sonner-toaster][data-x-position="right"][data-y-position="bottom"]');
    await expect(globalToaster.getByText('Secondary Toaster Toast')).toHaveCount(0);
  });

  test('toast without toasterId only appears in the global Toaster', async ({ page }) => {
    await page.getByTestId('toast-global').click();
    const globalToaster = page.locator('[data-sonner-toaster][data-x-position="right"][data-y-position="bottom"]');
    await expect(globalToaster.getByText('Global Toaster Toast')).toHaveCount(1);
    const secondaryToaster = page.locator('[data-sonner-toaster][data-x-position="left"][data-y-position="top"]');
    await expect(secondaryToaster.getByText('Global Toaster Toast')).toHaveCount(0);
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

  test('classNames.default is only applied to toasts without a type', async ({ page }) => {
    await page.getByTestId('default-button').click();
    await expect(page.locator('[data-sonner-toast]')).toHaveClass(/default-toast-classname/);

    await page.getByTestId('success').click();
    const successToast = page.locator('[data-sonner-toast][data-type="success"]');
    await expect(successToast).toHaveClass(/success-toast-classname/);
    await expect(successToast).not.toHaveClass(/default-toast-classname/);
  });

  test('custom icon is only rendered once in a promise toast', async ({ page }) => {
    await page.getByTestId('promise-custom-icon').click();
    await expect(page.getByText('Loading...')).toHaveCount(1);

    await expect(page.getByText('Loaded')).toHaveCount(1);
    await expect(page.getByTestId('custom-success-icon')).toHaveCount(1);
  });

  test('icons are hidden from assistive technology', async ({ page }) => {
    await page.getByTestId('close-button').click();
    await expect(page.locator('[data-sonner-toast] [data-close-button] svg')).toHaveAttribute('aria-hidden', 'true');

    await page.getByTestId('success').click();
    await expect(page.locator('[data-sonner-toast] [data-icon] svg')).toHaveAttribute('aria-hidden', 'true');
  });

  test('toast created before the Toaster mounts is still shown', async ({ page }) => {
    await page.goto('/?toastOnMount');
    await expect(page.getByText('Toast rendered on mount')).toHaveCount(1);
  });

  test('a new toast reusing the id of a dismissed toast does not inherit its props', async ({ page }) => {
    await page.getByTestId('reused-id-with-action').click();
    await expect(page.locator('[data-action]')).toHaveCount(1);

    // Wait for the first toast to close on its own
    await expect(page.locator('[data-sonner-toast]')).toHaveCount(0);

    await page.getByTestId('reused-id-without-action').click();
    const newToast = page.locator('[data-sonner-toast]');
    await expect(newToast).toHaveCount(1);
    // Fails if the action button of the previous toast is still rendered
    await expect(newToast).toHaveText('Toast without action');
  });

  test('dismissed toasts do not pile up in the history', async ({ page }) => {
    await page.getByTestId('history-flood').click();
    await expect(page.getByTestId('history-size')).toHaveText('100');
  });

  test('toast is not dismissed by a fast swipe in a direction that is not allowed', async ({ page }) => {
    await page.goto('/?position=top-center&swipeDirections=top,right');
    await page.getByTestId('default-button').click();

    const toast = page.locator('[data-sonner-toast]');
    const box = await toast.boundingBox();
    if (!box) throw new Error('Toast not rendered');

    // Fast flick to the left, `left` is not in swipeDirections
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x - 200, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();

    // Long enough for the exit animation to have removed the toast if it had been dismissed
    await page.waitForTimeout(500);
    await expect(toast).toHaveCount(1);
  });

  test('toast() clears the loading state of a toast with the same id', async ({ page }) => {
    await page.getByTestId('loading-toast-fixed-id').click();
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toHaveAttribute('data-type', 'loading');

    await page.getByTestId('default-toast-fixed-id').click();
    await expect(toast).toHaveText('Done');
    await expect(toast).not.toHaveAttribute('data-type', 'loading');
    await expect(toast.locator('.sonner-loading-wrapper')).toHaveCount(0);
  });

  test('toast.custom() clears the loading state of a toast with the same id', async ({ page }) => {
    await page.getByTestId('loading-toast-fixed-id').click();
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toHaveAttribute('data-type', 'loading');

    await page.getByTestId('custom-toast-fixed-id').click();
    await expect(toast).toHaveText('Custom done');
    await expect(toast).not.toHaveAttribute('data-type', 'loading');
    await expect(toast.locator('.sonner-loading-wrapper')).toHaveCount(0);
  });

  test('toast recreated right after being dismissed stays on screen', async ({ page }) => {
    await page.getByTestId('dismiss-and-recreate').click();

    // The pending dismissal must not take the newly created toast down with it
    await page.waitForTimeout(500);
    await expect(page.getByText('Remounted toast')).toHaveCount(1);
  });

  test('description fills the width of the toast', async ({ page }) => {
    await page.getByTestId('react-node-description-wide').click();

    const description = await page.getByTestId('wide-description').boundingBox();
    const toast = await page.locator('[data-sonner-toast]').boundingBox();
    if (!description || !toast) throw new Error('Toast not rendered');

    // Full width minus the padding and the icon-less content offset
    expect(description.width).toBeGreaterThan(toast.width - 60);
  });

  test('action button stays right aligned', async ({ page }) => {
    await page.getByTestId('action').click();

    const button = await page.locator('[data-action]').boundingBox();
    const toast = await page.locator('[data-sonner-toast]').boundingBox();
    if (!button || !toast) throw new Error('Toast not rendered');

    expect(button.x + button.width).toBeGreaterThan(toast.x + toast.width - 30);
  });

  test('toast is dismissed by a fast swipe in an allowed direction', async ({ page }) => {
    await page.goto('/?position=top-center&swipeDirections=top,right');
    await page.getByTestId('default-button').click();

    const toast = page.locator('[data-sonner-toast]');
    const box = await toast.boundingBox();
    if (!box) throw new Error('Toast not rendered');

    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width + 200, box.y + box.height / 2, { steps: 5 });
    await page.mouse.up();

    await expect(toast).toHaveCount(0);
  });

  test('a shown toast is measured again when its width changes', async ({ page }) => {
    // At 600px and below a toast is as wide as the window, so narrowing the window rewraps a shown toast's text
    await page.setViewportSize({ width: 600, height: 800 });
    await page.getByTestId('long-toasts').click();
    const toasts = page.locator('[data-sonner-toast]');
    await expect(toasts).toHaveCount(2);
    const widthBefore = (await toasts.first().boundingBox())?.width ?? 0;

    await page.setViewportSize({ width: 320, height: 800 });
    await toasts.first().hover();
    await expect(toasts.last()).toHaveAttribute('data-expanded', 'true');

    // The height and offset transitions run on browser time, so the checks are tried again until they hold
    await expect(async () => {
      const newer = await toasts.first().boundingBox();
      const older = await toasts.last().boundingBox();
      if (!newer || !older) throw new Error('Toasts not rendered');
      expect(newer.width).toBeLessThan(widthBefore);
      for (const toast of await toasts.all()) {
        // The height it is shown at against its height with its content alone deciding
        const heights = await toast.evaluate((element: HTMLElement) => {
          const shown = element.offsetHeight;
          const inline = element.style.height;
          element.style.height = 'auto';
          const content = element.offsetHeight;
          element.style.height = inline;
          return { shown, content };
        });
        expect(heights.shown).toBe(heights.content);
      }
      expect(older.y + older.height).toBeLessThanOrEqual(newer.y);
    }).toPass();
  });

  test('a content-box toast and a border-box toast, expanded: each is as tall as its content, and the older ends one gap from the newer', async ({
    page,
  }) => {
    await page.getByTestId('box-models').click();
    const toasts = page.locator('[data-sonner-toast]');
    await expect(toasts).toHaveCount(2);
    const newer = toasts.first();
    const older = toasts.last();
    const boxSizing = (toast: typeof newer) => toast.evaluate((element) => getComputedStyle(element).boxSizing);
    expect(await boxSizing(newer)).toBe('content-box');
    expect(await boxSizing(older)).toBe('border-box');
    const gap = await newer.evaluate((element) =>
      parseFloat(getComputedStyle(element.closest('[data-sonner-toaster]')!).getPropertyValue('--gap')),
    );
    await newer.hover();
    await expect(older).toHaveAttribute('data-expanded', 'true');

    // The height and offset transitions run on browser time, so the checks are tried again until they hold
    await expect(async () => {
      for (const toast of [newer, older]) {
        // The height it is shown at against its height with its content alone deciding
        const heights = await toast.evaluate((element: HTMLElement) => {
          const shown = element.offsetHeight;
          const inline = element.style.height;
          element.style.height = 'auto';
          const content = element.offsetHeight;
          element.style.height = inline;
          return { shown, content };
        });
        expect(heights.shown).toBe(heights.content);
      }
      const newerBox = await newer.boundingBox();
      const olderBox = await older.boundingBox();
      if (!newerBox || !olderBox) throw new Error('Toasts not rendered');
      expect(newerBox.y - (olderBox.y + olderBox.height)).toBeCloseTo(gap, 0);
    }).toPass();
  });

  test('a toast whose width changes by less than a pixel, enough to rewrap its title, is measured again', async ({
    page,
  }) => {
    await page.getByTestId('long-toasts').click();
    const toasts = page.locator('[data-sonner-toast]');
    await expect(toasts).toHaveCount(2);
    const toast = toasts.first();
    // Two widths of the toaster less than a pixel apart, the newer toast's title wrapped to more lines at the narrower
    const widths = await toast.evaluate((element: HTMLElement) => {
      const toaster = element.closest<HTMLElement>('[data-sonner-toaster]')!;
      const title = element.querySelector<HTMLElement>('[data-title]')!;
      const at = (width: number) => {
        toaster.style.setProperty('--width', `${width}px`);
        return { titleHeight: title.offsetHeight, whole: element.offsetWidth };
      };
      let wide = parseFloat(getComputedStyle(toaster).width);
      let narrow = wide / 2;
      const start = at(wide).titleHeight;
      if (at(narrow).titleHeight <= start) throw new Error('The title does not wrap to more lines at half the width');
      while (wide - narrow > 1 / 64) {
        const middle = (wide + narrow) / 2;
        if (at(middle).titleHeight > start) narrow = middle;
        else wide = middle;
      }
      const narrowAt = at(narrow);
      const wideAt = at(wide);
      return { wide, narrow, wideAt, narrowAt };
    });
    expect(widths.narrowAt.titleHeight).toBeGreaterThan(widths.wideAt.titleHeight);
    expect(widths.narrowAt.whole).toBe(widths.wideAt.whole);
    // The height sonner stored against the height the toast is laid out at with its content alone deciding
    const gap = () =>
      toast.evaluate((element: HTMLElement) => {
        const inline = element.style.height;
        element.style.height = 'auto';
        const laidOut = parseFloat(getComputedStyle(element).height);
        element.style.height = inline;
        return Math.abs(parseFloat(element.style.getPropertyValue('--initial-height')) - laidOut);
      });
    await expect.poll(gap).toBeLessThan(1);

    await toast.evaluate((element: HTMLElement, width) => {
      element.closest<HTMLElement>('[data-sonner-toaster]')!.style.setProperty('--width', `${width}px`);
    }, widths.narrow);
    await expect.poll(gap).toBeLessThan(1);
  });

  test('a toast whose padding grows with its width unchanged, enough to rewrap its title, is measured again', async ({
    page,
  }) => {
    await page.getByTestId('long-toasts').click();
    const toasts = page.locator('[data-sonner-toast]');
    await expect(toasts).toHaveCount(2);
    const toast = toasts.first();
    // The height sonner stored against the height the toast is laid out at with its content alone deciding
    const gap = () =>
      toast.evaluate((element: HTMLElement) => {
        const inline = element.style.height;
        element.style.height = 'auto';
        const laidOut = parseFloat(getComputedStyle(element).height);
        element.style.height = inline;
        return Math.abs(parseFloat(element.style.getPropertyValue('--initial-height')) - laidOut);
      });
    await expect.poll(gap).toBeLessThan(1);

    const sizes = await toast.evaluate((element: HTMLElement) => {
      const style = getComputedStyle(element);
      const title = element.querySelector<HTMLElement>('[data-title]')!;
      const at = () => ({ width: style.width, titleHeight: title.offsetHeight });
      const before = at();
      // A quarter of the width more padding on each side, so the text has less than half the width to wrap in
      const more = parseFloat(before.width) / 4;
      element.style.paddingLeft = `${parseFloat(style.paddingLeft) + more}px`;
      element.style.paddingRight = `${parseFloat(style.paddingRight) + more}px`;
      return { before, after: at() };
    });
    expect(sizes.after.width).toBe(sizes.before.width);
    expect(sizes.after.titleHeight).toBeGreaterThan(sizes.before.titleHeight);
    await expect.poll(gap).toBeLessThan(1);
  });

  test('a toast laid out at a fraction of a pixel and then narrowed is stored at its height as laid out, the fraction included', async ({
    page,
  }) => {
    await page.getByTestId('infinity-toast').click();
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toHaveAttribute('data-mounted', 'true');
    // The height sonner stored and the height the toast is laid out at with its content alone deciding
    const heights = () =>
      toast.evaluate((element: HTMLElement) => {
        const inline = element.style.height;
        element.style.height = 'auto';
        const laidOut = getComputedStyle(element).height;
        element.style.height = inline;
        return { laidOut, stored: element.style.getPropertyValue('--initial-height') };
      });
    const before = await heights();
    await toast.evaluate((element: HTMLElement) => {
      // More padding under the text, so the toast's height ends half a pixel past a whole one
      const height = parseFloat(getComputedStyle(element).height);
      const more = 0.5 - (height % 1) + (height % 1 >= 0.5 ? 1 : 0);
      element.style.paddingBottom = `${parseFloat(getComputedStyle(element).paddingBottom) + more}px`;
      // A toaster one pixel narrower, so sonner measures the toast again
      const toaster = element.closest<HTMLElement>('[data-sonner-toaster]')!;
      toaster.style.setProperty('--width', `${parseFloat(getComputedStyle(toaster).width) - 1}px`);
    });
    await expect.poll(async () => (await heights()).stored).not.toBe(before.stored);
    const after = await heights();
    expect(after.laidOut).not.toMatch(/^\d+px$/);
    expect(after.stored).toBe(after.laidOut);
  });

  test('a toast shows and closes where the browser has no ResizeObserver', async ({ page }) => {
    await page.addInitScript(() => {
      delete (window as { ResizeObserver?: unknown }).ResizeObserver;
    });
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto('/');
    await page.getByTestId('held-close-button').click();
    const toast = page.locator('[data-sonner-toast]');
    await expect(toast).toHaveCount(1);
    await toast.locator('[data-close-button]').click();
    await expect(toast).toHaveCount(0);
    expect(errors).toEqual([]);
  });

  test('a toast dismissed while the width changes stays out of the stack', async ({ page }) => {
    // Browser time is held below, so the dismissed toast stays on the page, leaving, while the window narrows
    await page.clock.install();
    await page.goto('/');
    await page.setViewportSize({ width: 600, height: 800 });
    await page.getByTestId('long-toasts').click();
    const toasts = page.locator('[data-sonner-toast]');
    await expect(toasts).toHaveCount(2);
    // An hour on, longer than the test may run, so the pause is never in the page's past; these toasts have no lifetime to end
    const holdFor = 60 * 60 * 1000;
    expect(holdFor).toBeGreaterThan(test.info().timeout);
    await page.clock.pauseAt(await page.evaluate((ms) => Date.now() + ms, holdFor));
    const newer = toasts.first();
    const older = toasts.last();
    const style = (toast: typeof older, name: string) =>
      toast.evaluate((element: HTMLElement, name) => element.style.getPropertyValue(name), name);

    await newer.locator('[data-close-button]').click();
    await expect(newer).toHaveAttribute('data-removed', 'true');
    const heightBefore = await style(older, '--initial-height');
    await page.setViewportSize({ width: 320, height: 800 });

    // The older toast is measured again at its new width
    await expect.poll(() => style(older, '--initial-height')).not.toBe(heightBefore);
    await expect(newer).toHaveAttribute('data-removed', 'true');
    expect(await style(older, '--offset')).toBe('0px');
  });

  test('a hovered toast whose box gets shorter inside with its width unchanged keeps the height it was given', async ({
    page,
  }) => {
    await page.getByTestId('infinity-toast').click();
    const toast = page.locator('[data-sonner-toast]');
    // Hovered, the toast's height is the one sonner stored, so a taller padding leaves less height inside
    await toast.hover();
    await expect(toast).toHaveAttribute('data-expanded', 'true');
    const stored = () => toast.evaluate((element: HTMLElement) => element.style.getPropertyValue('--initial-height'));
    const heightBefore = await stored();

    const sizes = await toast.evaluate(async (element: HTMLElement) => {
      // The box inside the padding, which is the box a resize observer watches
      const inner = () => {
        const style = getComputedStyle(element);
        return {
          width: element.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight),
          height: element.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom),
        };
      };
      let notified = () => {};
      const notice = () => new Promise<void>((resolve) => (notified = resolve));
      const observer = new ResizeObserver(() => notified());
      let next = notice();
      observer.observe(element);
      // An observation's first notice comes with no change
      await next;
      const start = inner();
      next = notice();
      element.style.paddingBottom = '40px';
      const padded = inner();
      // The change's notice; sonner's observer, made first, had it before this one
      await next;
      observer.disconnect();
      // State sonner set in its observer renders in posted-message tasks
      for (let task = 0; task < 3; task += 1)
        await new Promise<void>((resolve) => {
          const channel = new MessageChannel();
          channel.port1.onmessage = () => resolve();
          channel.port2.postMessage(null);
        });
      return { start, padded };
    });

    expect(sizes.padded.width).toBe(sizes.start.width);
    expect(sizes.padded.height).toBeLessThan(sizes.start.height);
    expect(await stored()).toBe(heightBefore);
  });

  test('one resize observer watches a shown toast, and none once it is closed and gone', async ({ page }) => {
    // Every resize observer the page makes, with the elements it watches until it lets them go
    await page.addInitScript(() => {
      const watched = new Map<ResizeObserver, Set<Element>>();
      const Native = window.ResizeObserver;
      window.ResizeObserver = class extends Native {
        constructor(callback: ResizeObserverCallback) {
          super(callback);
          watched.set(this, new Set());
        }
        observe(target: Element, options?: ResizeObserverOptions) {
          watched.get(this)!.add(target);
          super.observe(target, options);
        }
        unobserve(target: Element) {
          watched.get(this)!.delete(target);
          super.unobserve(target);
        }
        disconnect() {
          watched.get(this)!.clear();
          super.disconnect();
        }
      };
      Object.assign(window, {
        watchersOf: (target: Element) => [...watched.values()].filter((targets) => targets.has(target)).length,
      });
    });
    await page.goto('/');
    await page.getByTestId('held-close-button').click();
    const toast = page.locator('[data-sonner-toast]');
    const element = await toast.elementHandle();
    const watchers = () =>
      page.evaluate(
        (node) => (window as unknown as { watchersOf: (target: Element) => number }).watchersOf(node),
        element,
      );
    expect(await watchers()).toBe(1);

    await toast.locator('[data-close-button]').click();
    await expect(toast).toHaveCount(0);
    expect(await watchers()).toBe(0);
  });
});
