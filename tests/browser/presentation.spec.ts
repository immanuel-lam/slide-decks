import { test, expect } from '@playwright/test'

test('shadcn controls keep click and keyboard input inside the slide', async ({ page }) => {
  await page.goto('/#/demo/15')
  const detail = page.getByRole('tab', { name: 'detail', exact: true })
  await detail.click()
  await expect(detail).toHaveAttribute('aria-selected', 'true')
  await detail.press('ArrowRight')
  await expect(page.getByRole('tab', { name: 'progress', exact: true })).toHaveAttribute('aria-selected', 'true')
  await page.getByRole('button', { name: 'save example', exact: true }).click()
  await expect(page.getByRole('button', { name: 'saved ✓', exact: true })).toHaveAttribute('aria-pressed', 'true')
  await expect(page).toHaveURL(/demo\/15$/)
  await page.getByRole('button', { name: 'saved ✓', exact: true }).press('Space')
  await expect(page.getByRole('button', { name: 'save example', exact: true })).toHaveAttribute('aria-pressed', 'false')
  await expect(page).toHaveURL(/demo\/15$/)
})

test('switching from the last demo slide to a shorter deck resets the canvas', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/#/demo/17')
  await expect(page.getByText('make your own.', { exact: true })).toBeVisible()
  await page.evaluate(() => { window.location.hash = '#/arrayah-2026-09-20/1' })
  await expect(page.getByText('originally built for me', { exact: true })).toBeVisible()
  expect(errors).toEqual([])
})

test('presenter sync and homepage return work together', async ({ page, context }) => {
  await page.goto('/#/demo/1')
  const presenter = await context.newPage()
  await presenter.goto('/?presenter#/demo/1')
  await presenter.getByRole('button', { name: 'NEXT →', exact: true }).click()
  await expect(page).toHaveURL(/demo\/2$/)
  await presenter.getByRole('button', { name: '← all decks', exact: true }).click()
  await expect(presenter).toHaveURL(/#\/$/)
  await expect(presenter.getByRole('heading', { name: 'slides.', exact: true })).toBeVisible()
  await expect(page).toHaveURL(/demo\/2$/)
})

test('the export view renders every slide as a 1280×720 page and themes apply', async ({ page }) => {
  await page.goto('/?export&theme=midnight#/demo')
  await expect(page.locator('[data-export-ready="true"]')).toBeVisible()
  const pages = page.locator('[data-export-slide]')
  await expect(pages).toHaveCount(17)
  const box = await pages.first().boundingBox()
  expect(box?.width).toBe(1280)
  expect(box?.height).toBe(720)
  const bg = await page.locator('[data-theme="midnight"]').evaluate(el => getComputedStyle(el).getPropertyValue('--bg').trim())
  expect(bg).toBe('#121417')
})

test('the presenter export button opens the export view', async ({ page, context }) => {
  await page.goto('/?presenter#/demo/1')
  const [exportPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('button', { name: 'export ↗', exact: true }).click(),
  ])
  await expect(exportPage).toHaveURL(/\?export#\/demo$/)
  await expect(exportPage.getByRole('button', { name: 'download PDF' })).toBeEnabled()
})

test('the index export link opens the export view in a new tab', async ({ page, context }) => {
  await page.goto('/#/')
  const [exportPage] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: 'Export Kit demo — every layout as PDF or PNG' }).click(),
  ])
  await expect(exportPage).toHaveURL(/\?export#\/demo$/)
  await expect(page).toHaveURL(/#\/$/)
})

test('the export view downloads a PDF and a zip of PNGs', async ({ page }) => {
  await page.goto('/?export#/arrayah-2026-09-20')
  await expect(page.locator('[data-export-ready="true"]')).toBeVisible()

  const [pdf] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'download PDF' }).click(),
  ])
  expect(pdf.suggestedFilename()).toBe('arrayah-2026-09-20.pdf')
  const pdfText = (await import('node:fs')).readFileSync(await pdf.path(), 'latin1')
  expect(pdfText.startsWith('%PDF-1.4')).toBe(true)
  expect(pdfText).toContain('/Count 6')
  await expect(page.getByRole('status')).toHaveText('PDF downloaded')

  const [zip] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'download PNGs (.zip)' }).click(),
  ])
  expect(zip.suggestedFilename()).toBe('arrayah-2026-09-20-slides.zip')
  const { unzipSync } = await import('fflate')
  const files = unzipSync(new Uint8Array((await import('node:fs')).readFileSync(await zip.path())))
  expect(Object.keys(files).sort()).toEqual(['slide-01.png', 'slide-02.png', 'slide-03.png', 'slide-04.png', 'slide-05.png', 'slide-06.png'])
  const png = files['slide-01.png']
  const view = new DataView(png.buffer, png.byteOffset)
  expect([view.getUint32(16), view.getUint32(20)]).toEqual([2560, 1440])
})
