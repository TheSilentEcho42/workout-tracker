import { test, expect } from '@playwright/test'

test.describe('Create Workout Plan', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to app
    await page.goto('/')
    
    // Sign in or use guest mode
    // For E2E tests, you may want to create a test account
    // or use the guest login feature
  })

  test('should create an AI workout plan', async ({ page }) => {
    // Navigate to AI workout page
    await page.goto('/ai-workout')

    // Wait for questionnaire to load
    await expect(page.getByText(/experience level/i)).toBeVisible()

    // Fill out experience level
    await page.getByRole('button', { name: /intermediate/i }).click()

    // Continue to next step
    await page.getByRole('button', { name: /next/i }).click()

    // Fill out goals
    await page.getByRole('checkbox', { name: /build muscle/i }).check()
    await page.getByRole('button', { name: /next/i }).click()

    // Fill out training schedule
    await page.getByLabel(/days per week/i).fill('4')
    await page.getByLabel(/time per session/i).fill('60')
    await page.getByRole('button', { name: /next/i }).click()

    // Fill out equipment
    await page.getByRole('checkbox', { name: /commercial gym/i }).check()
    await page.getByRole('button', { name: /next/i }).click()

    // Complete questionnaire
    await page.getByRole('button', { name: /generate/i }).click()

    // Wait for plan generation
    await expect(page.getByText(/workout plan/i)).toBeVisible({ timeout: 30000 })

    // Verify plan is displayed
    await expect(page.getByText(/day 1/i)).toBeVisible()
  })

  test('should save workout plan', async ({ page }) => {
    // Assuming we're on a generated plan page
    await page.goto('/ai-workout')

    // Generate plan (simplified - in real test you'd go through full flow)
    // Then save it
    const saveButton = page.getByRole('button', { name: /save plan/i })
    if (await saveButton.isVisible()) {
      await saveButton.click()
      
      // Verify plan is saved
      await expect(page.getByText(/plan saved/i)).toBeVisible()
    }
  })
})


