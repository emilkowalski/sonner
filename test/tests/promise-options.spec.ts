import { expect, test } from '@playwright/test';

for (const outcome of ['success', 'rejection', 'error', 'http', 'jsx']) {
  for (const loading of [false, true]) {
    test(`${outcome} preserves shared promise options ${loading ? 'with' : 'without'} loading`, async ({ page }) => {
      await page.goto(`/promise-options?outcome=${outcome}${loading ? '&loading=1' : ''}`);
      await page.getByRole('button', { name: 'Save project' }).click();

      const toast = page.getByTestId('promise-options-toast');
      await expect(toast.getByText('Project saved')).toHaveCount(1);
      await expect(toast).toHaveClass(/shared-options/);
      await expect(toast.getByText('Shared description')).toHaveCount(1);
      await expect(toast.locator('..')).toHaveAttribute('data-x-position', 'left');
      await expect(page.locator('[data-sonner-toast]')).toHaveCount(1);
      await expect(page.getByTestId('finally-called')).toHaveText('true');

      // The action dismisses by the explicit id supplied before the promise settled.
      await toast.getByRole('button', { name: 'Dismiss' }).click();
      await expect(toast).toHaveCount(0);
    });
  }

  test(`${outcome} handles a description callback`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`/promise-options?outcome=${outcome}&callback=1`);
    await page.getByRole('button', { name: 'Save project' }).click();
    const toast = page.getByTestId('promise-options-toast');
    await expect(toast.getByText('Project saved')).toHaveCount(1);
    await expect(toast.getByText('Callback description')).toHaveCount(outcome === 'jsx' ? 0 : 1);
    expect(errors).toEqual([]);
  });
}

for (const outcome of ['success', 'rejection', 'error', 'http']) {
  test(`${outcome} lets extended results override shared options`, async ({ page }) => {
    await page.goto(`/promise-options?outcome=${outcome}&extended=1&callback=1`);
    await page.getByRole('button', { name: 'Save project' }).click();
    const toast = page.getByTestId('promise-options-toast');
    await expect(toast.getByText('Extended result')).toHaveCount(1);
    await expect(toast.getByText('Extended description')).toHaveCount(1);
    await expect(toast).toHaveClass(/extended-options/);
    await expect(toast).not.toHaveClass(/shared-options/);
    await expect(toast.getByText('Callback description')).toHaveCount(0);
  });
}
