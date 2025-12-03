import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddExerciseForm } from '../AddExerciseForm'

describe('AddExerciseForm', () => {
  const mockOnAddExercise = vi.fn()
  const mockOnCancel = vi.fn()
  const userId = 'test-user-id'

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the form', () => {
    render(
      <AddExerciseForm
        onAddExercise={mockOnAddExercise}
        onCancel={mockOnCancel}
        userId={userId}
      />
    )

    expect(screen.getByText('Add Exercise')).toBeInTheDocument()
    expect(screen.getByLabelText(/sets/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/reps/i)).toBeInTheDocument()
  })

  it('should call onCancel when cancel button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AddExerciseForm
        onAddExercise={mockOnAddExercise}
        onCancel={mockOnCancel}
        userId={userId}
      />
    )

    const cancelButton = screen.getByRole('button', { name: /close/i })
    await user.click(cancelButton)

    expect(mockOnCancel).toHaveBeenCalledTimes(1)
  })

  it('should validate form before submission', async () => {
    const user = userEvent.setup()
    render(
      <AddExerciseForm
        onAddExercise={mockOnAddExercise}
        onCancel={mockOnCancel}
        userId={userId}
      />
    )

    const submitButton = screen.getByRole('button', { name: /add exercise/i })
    await user.click(submitButton)

    // Form should not submit without exercise selected
    expect(mockOnAddExercise).not.toHaveBeenCalled()
  })

  it('should show custom exercise form when button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <AddExerciseForm
        onAddExercise={mockOnAddExercise}
        onCancel={mockOnCancel}
        userId={userId}
      />
    )

    const customButton = screen.getByText(/create custom/i)
    await user.click(customButton)

    // Custom form should be visible
    expect(screen.getByText(/custom exercise/i)).toBeInTheDocument()
  })

  it('should update sets value when input changes', async () => {
    const user = userEvent.setup()
    render(
      <AddExerciseForm
        onAddExercise={mockOnAddExercise}
        onCancel={mockOnCancel}
        userId={userId}
      />
    )

    const setsInput = screen.getByLabelText(/sets/i)
    await user.clear(setsInput)
    await user.type(setsInput, '5')

    expect(setsInput).toHaveValue(5)
  })

  it('should update reps value when input changes', async () => {
    const user = userEvent.setup()
    render(
      <AddExerciseForm
        onAddExercise={mockOnAddExercise}
        onCancel={mockOnCancel}
        userId={userId}
      />
    )

    const repsInput = screen.getByLabelText(/reps/i)
    await user.clear(repsInput)
    await user.type(repsInput, '12')

    expect(repsInput).toHaveValue(12)
  })

  it('should update weight value when input changes', async () => {
    const user = userEvent.setup()
    render(
      <AddExerciseForm
        onAddExercise={mockOnAddExercise}
        onCancel={mockOnCancel}
        userId={userId}
      />
    )

    const weightInput = screen.getByLabelText(/weight/i)
    await user.clear(weightInput)
    await user.type(weightInput, '135')

    expect(weightInput).toHaveValue(135)
  })

  it('should update RIR value when input changes', async () => {
    const user = userEvent.setup()
    render(
      <AddExerciseForm
        onAddExercise={mockOnAddExercise}
        onCancel={mockOnCancel}
        userId={userId}
      />
    )

    const rirInput = screen.getByLabelText(/rir/i)
    await user.clear(rirInput)
    await user.type(rirInput, '3')

    expect(rirInput).toHaveValue(3)
  })
})

