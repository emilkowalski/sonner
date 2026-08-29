import { expect, test } from '@playwright/test';

// `zoom` scales what getBoundingClientRect() and pointer events report, but not offsetHeight,
// so a toast measured with the rect and spent on a CSS length is wrong by the zoom factor.
const ZOOMS = ['0.5', '1', '2'];

test.describe('Ancestor CSS zoom', () => {
  for (const zoom of ZOOMS) {
    test(`stores the toast height in layout px at zoom ${zoom}`, async ({ page }) => {
      await page.goto(`/?zoom=${zoom}`);
      await page.getByTestId('infinity-toast').click();

      const toast = page.locator('[data-sonner-toast]').first();
      await expect(toast).toHaveCount(1);

      const measured = await toast.evaluate((element: HTMLElement) => ({
        initialHeight: Number.parseFloat(element.style.getPropertyValue('--initial-height')),
        offsetHeight: element.offsetHeight,
      }));

      // --initial-height is consumed as a CSS length inside the zoomed subtree, so it has to
      // agree with offsetHeight. Before the fix it was offsetHeight * zoom, which is what the
      // stack then spends on --offset and translateY.
      expect(Math.abs(measured.initialHeight - measured.offsetHeight)).toBeLessThanOrEqual(1);
    });
  }
});
