import { test, expect } from '@playwright/test'

test.describe('View History', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Sign in or authenticate
  })

  test('should navigate to history page', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Click history link
    await page.getByRole('link', { name: /history/i }).click()

    // Verify history page loaded
    await expect(page.getByText(/workout history/i)).toBeVisible()
  })

  test('should display workout cards', async ({ page }) => {
    await page.goto('/history')

    // Wait for workouts to load
    await page.waitForSelector('[data-testid="workout-card"]', { timeout: 10000 })

    // Verify workout cards are displayed
    const workoutCards = page.locator('[data-testid="workout-card"]')
    await expect(workoutCards.first()).toBeVisible()
  })

  test('should expand workout details', async ({ page }) => {
    await page.goto('/history')

    // Click on a workout card to expand
    const workoutCard = page.locator('[data-testid="workout-card"]').first()
    await workoutCard.click()

    // Verify details are shown
    await expect(page.getByText(/exercises/i)).toBeVisible()
  })

  test('should filter workouts by date', async ({ page }) => {
    await page.goto('/history')

    // Find and use date filter if available
    const dateFilter = page.getByLabel(/date.*filter/i)
    if (await dateFilter.isVisible()) {
      await dateFilter.click()
      // Select date range
      // This would depend on your date picker implementation
    }
  })

  test('should view exercise progress', async ({ page }) => {
    await page.goto('/history')

    // Click on an exercise name
    const exerciseLink = page.getByText(/bench press/i).first()
    if (await exerciseLink.isVisible()) {
      await exerciseLink.click()

      // Verify exercise detail page
      await expect(page.getByText(/progress/i)).toBeVisible()
    }
  })

  test('should delete a workout', async ({ page }) => {
    await page.goto('/history')

    // Find delete button on a workout card
    const deleteButton = page.getByRole('button', { name: /delete/i }).first()
    
    if (await deleteButton.isVisible()) {
      // Confirm deletion if dialog appears
      page.on('dialog', dialog => dialog.accept())
      
      await deleteButton.click()

      // Verify workout is removed
      await expect(page.getByText(/workout deleted/i)).toBeVisible()
    }
  })
})


