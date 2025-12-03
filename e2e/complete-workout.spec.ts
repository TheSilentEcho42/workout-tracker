import { test, expect } from '@playwright/test'

test.describe('Complete Workout Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Sign in or authenticate
  })

  test('should start a new workout', async ({ page }) => {
    await page.goto('/dashboard')

    // Click start workout button
    const startButton = page.getByRole('button', { name: /start.*workout/i })
    await startButton.click()

    // Fill workout form
    await page.getByLabel(/workout name/i).fill('Test Workout')
    await page.getByRole('button', { name: /start/i }).click()

    // Verify workout started
    await expect(page.getByText(/test workout/i)).toBeVisible()
  })

  test('should add exercises to workout', async ({ page }) => {
    // Assuming workout is already started
    await page.goto('/workout/test-workout-id')

    // Click add exercise
    await page.getByRole('button', { name: /add exercise/i }).click()

    // Search and select exercise
    await page.getByPlaceholder(/search.*exercise/i).fill('Bench Press')
    await page.getByText(/bench press/i).first().click()

    // Fill exercise details
    await page.getByLabel(/sets/i).fill('3')
    await page.getByLabel(/reps/i).fill('10')
    await page.getByLabel(/weight/i).fill('135')
    await page.getByLabel(/rir/i).fill('2')

    // Add exercise
    await page.getByRole('button', { name: /add exercise/i }).click()

    // Verify exercise added
    await expect(page.getByText(/bench press/i)).toBeVisible()
  })

  test('should update set values', async ({ page }) => {
    await page.goto('/workout/test-workout-id')

    // Find and click edit button on a set
    const editButton = page.getByRole('button', { name: /edit/i }).first()
    await editButton.click()

    // Update weight
    const weightInput = page.getByDisplayValue('135')
    await weightInput.clear()
    await weightInput.fill('140')

    // Save
    await page.getByRole('button', { name: /save/i }).click()

    // Verify update
    await expect(page.getByText(/140/i)).toBeVisible()
  })

  test('should complete workout', async ({ page }) => {
    await page.goto('/workout/test-workout-id')

    // Click complete workout
    const completeButton = page.getByRole('button', { name: /complete.*workout/i })
    await completeButton.click()

    // Fill completion form if needed
    const durationInput = page.getByLabel(/duration/i)
    if (await durationInput.isVisible()) {
      await durationInput.fill('45')
    }

    // Submit
    await page.getByRole('button', { name: /finish/i }).click()

    // Verify workout completed
    await expect(page.getByText(/workout completed/i)).toBeVisible()
  })
})


