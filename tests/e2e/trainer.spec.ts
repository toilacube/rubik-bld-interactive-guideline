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
