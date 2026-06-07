import { expect, test } from '@playwright/test'

test('renders the concept visualizer with a 3D cube', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Old Pochmann model' })).toBeVisible()
  await expect(page.locator('twisty-player')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Letter scheme cube' })).toBeVisible()
  await expect(page.getByLabel('Full letter scheme net')).toBeVisible()
  await expect(page.getByLabel('Visible letter scheme cube')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Slow learner roadmap' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Readiness checklist' })).toBeVisible()
  await expect(page.locator('.letter-schemes')).toBeVisible()
  await expect(page.getByText("L Dw' L", { exact: true })).toBeVisible()
  await expect(page.getByText("L' Dw L'", { exact: true })).toBeVisible()
  await expect(page.getByText('Edge buffer', { exact: true })).toBeVisible()
  await expect(page.getByText('Corner target', { exact: true })).toBeVisible()
})

test('switches through guided example and trainer mode', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Guided example' }).click()
  await expect(page.getByRole('heading', { name: 'One complete example solve' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Worked example scramble' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Step 1: write edge memo' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Numbered execution walkthrough' })).toBeVisible()
  await expect(page.locator('.guided-execution-list button').first()).toContainText('setup')
  await expect(page.locator('.guided-execution-list button').first()).toContainText('swap')
  await expect(page.locator('.guided-execution-list button').first()).toContainText('undo')

  await page.getByRole('button', { name: 'Scramble trainer' }).click()
  await expect(page.getByRole('heading', { name: 'Memo and execution flow' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Execution list' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Slow solve protocol' })).toBeVisible()
  await expect(page.locator('.execution-parts').first()).toContainText('setup')
  await expect(page.locator('.execution-parts').first()).toContainText('swap')
  await expect(page.locator('.execution-parts').first()).toContainText('undo')
  await expect(page.locator('.execution-list button').first()).toBeVisible()
})

test('interacts with the letter scheme cube and shows setup/undo moves', async ({ page }) => {
  await page.goto('/')

  // Initially shows the placeholder text
  await expect(page.getByText('Click any letter to view setup & undo moves')).toBeVisible()
  await expect(page.locator('.sticker-details-card')).toHaveCount(0)

  // Find a letter sticker cell in the face grid, e.g., letter 'A' on U face (sticker 'UBL')
  const stickerA = page.locator('.face-U span').filter({ has: page.locator('small', { hasText: /^UBL$/ }) })
  await stickerA.click()

  // Details card should become visible
  await expect(page.locator('.sticker-details-card')).toBeVisible()
  await expect(page.getByText('Selected sticker')).toBeVisible()
  
  // Verify sticker data is correct
  await expect(page.locator('.sticker-letter-bubble')).toHaveText('A')
  await expect(page.locator('.sticker-id-pill')).toHaveText('UBL')
  await expect(page.locator('.piece-type-pill')).toHaveText('corners')

  // Verify setup and undo moves for corner A (sticker UBL is buffer, so it should say "Buffer (no setup required)"!)
  await expect(page.locator('.move-code').first()).toHaveText('Buffer (no setup required)')
  await expect(page.locator('.move-code').last()).toHaveText('Buffer (no setup required)')

  // Let's click a non-buffer corner, like 'B' on U face (sticker 'UBR')
  const stickerB = page.locator('.face-U span').filter({ has: page.locator('small', { hasText: /^UBR$/ }) })
  await stickerB.click()
  await expect(page.locator('.sticker-letter-bubble')).toHaveText('B')
  await expect(page.locator('.sticker-id-pill')).toHaveText('UBR')
  await expect(page.locator('.piece-type-pill')).toHaveText('corners')

  // For corner B, setup moves should be R2, and undo moves should be R2'
  await expect(page.locator('.move-card').first().locator('code')).toHaveText('R2')
  await expect(page.locator('.move-card').last().locator('code')).toHaveText("R2'")

  // Let's click the close button
  await page.locator('.close-details-btn').click()
  
  // Details card should be gone and placeholder should be visible again
  await expect(page.locator('.sticker-details-card')).toHaveCount(0)
  await expect(page.getByText('Click any letter to view setup & undo moves')).toBeVisible()
})

