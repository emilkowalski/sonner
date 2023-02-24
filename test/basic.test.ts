import { expect, test } from '@playwright/test'

test.describe('basic behavior', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('"Render a toast" btn should render a toast', async ({ page }) => {
    await page.getByTestId('render-btn').click()

    await expect(page.getByTestId('toast')).toBeVisible()
  })
})