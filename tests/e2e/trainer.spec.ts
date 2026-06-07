import { expect, test } from '@playwright/test'

test('renders the concept visualizer with a 3D cube', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: 'Old Pochmann model' })).toBeVisible()
  await expect(page.locator('twisty-player')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Letter scheme cube' })).toBeVisible()
  await expect(page.getByLabel('Full letter scheme net')).toBeVisible()
  await expect(page.getByLabel('Visible letter scheme cube')).toHaveCount(0)
  await expect(page.getByText('Edge buffer')).toBeVisible()
  await expect(page.getByText('Corner target')).toBeVisible()
})

test('switches through guided examples and trainer mode', async ({ page }) => {
  await page.goto('/')

  await page.getByRole('button', { name: 'Guided examples' }).click()
  await expect(page.getByRole('heading', { name: 'Setup-swap-undo drills' })).toBeVisible()
  await page.getByRole('button', { name: /Corner setup/ }).click()
  await expect(page.getByText("R D'", { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Scramble trainer' }).click()
  await expect(page.getByRole('heading', { name: 'Memo and execution flow' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Execution list' })).toBeVisible()
  await expect(page.locator('.execution-list button').first()).toBeVisible()
})
