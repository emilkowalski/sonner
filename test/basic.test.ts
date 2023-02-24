import { expect, test } from '@playwright/test'

test.describe('basic behavior', async () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('"Render a toast" btn should render a toast', async ({ page }) => {
    const renderBtn = page.locator(`data-testid=render-btn`)
    await renderBtn.click()

    expect(page.locator(`data-testid=toast`).isVisible)
  })
})