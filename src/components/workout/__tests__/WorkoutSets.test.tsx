import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WorkoutSets } from '../WorkoutSets'
import { WorkoutSet } from '@/lib/workouts'

describe('WorkoutSets', () => {
  const mockOnUpdateSet = vi.fn()
  const mockOnDeleteSet = vi.fn()

  const mockSets: WorkoutSet[] = [
    {
      id: 'set-1',
      workout_id: 'workout-1',
      exercise_id: 'bench-press',
      exercise_name: 'Bench Press',
      weight: 135,
      reps: 10,
      rir: 2,
      notes: '',
      order_index: 0,
    },
    {
      id: 'set-2',
      workout_id: 'workout-1',
      exercise_id: 'bench-press',
      exercise_name: 'Bench Press',
      weight: 135,
      reps: 8,
      rir: 1,
      notes: '',
      order_index: 1,
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render empty state when no sets', () => {
    render(
      <WorkoutSets
        sets={[]}
        onUpdateSet={mockOnUpdateSet}
        onDeleteSet={mockOnDeleteSet}
      />
    )

    expect(screen.getByText(/no exercises added yet/i)).toBeInTheDocument()
  })

  it('should render sets when provided', () => {
    render(
      <WorkoutSets
        sets={mockSets}
        onUpdateSet={mockOnUpdateSet}
        onDeleteSet={mockOnDeleteSet}
      />
    )

    expect(screen.getByText('Bench Press')).toBeInTheDocument()
    expect(screen.getByText('Set 1')).toBeInTheDocument()
    expect(screen.getByText('Set 2')).toBeInTheDocument()
  })

  it('should display set information correctly', () => {
    render(
      <WorkoutSets
        sets={mockSets}
        onUpdateSet={mockOnUpdateSet}
        onDeleteSet={mockOnDeleteSet}
      />
    )

    // Check that weight and reps are displayed
    expect(screen.getByText(/135/i)).toBeInTheDocument()
    expect(screen.getByText(/10/i)).toBeInTheDocument()
  })

  it('should enter edit mode when edit button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <WorkoutSets
        sets={mockSets}
        onUpdateSet={mockOnUpdateSet}
        onDeleteSet={mockOnDeleteSet}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    // Should show save and cancel buttons
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /cancel/i })).toBeInTheDocument()
  })

  it('should call onDeleteSet when delete button is clicked', async () => {
    const user = userEvent.setup()
    render(
      <WorkoutSets
        sets={mockSets}
        onUpdateSet={mockOnUpdateSet}
        onDeleteSet={mockOnDeleteSet}
      />
    )

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i })
    await user.click(deleteButtons[0])

    expect(mockOnDeleteSet).toHaveBeenCalledWith('set-1')
  })

  it('should update set values in edit mode', async () => {
    const user = userEvent.setup()
    render(
      <WorkoutSets
        sets={mockSets}
        onUpdateSet={mockOnUpdateSet}
        onDeleteSet={mockOnDeleteSet}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    // Find and update weight input
    const weightInput = screen.getByDisplayValue('135')
    await user.clear(weightInput)
    await user.type(weightInput, '140')

    const saveButton = screen.getByRole('button', { name: /save/i })
    await user.click(saveButton)

    expect(mockOnUpdateSet).toHaveBeenCalledWith('set-1', expect.objectContaining({
      weight: 140,
    }))
  })

  it('should cancel edit mode without saving', async () => {
    const user = userEvent.setup()
    render(
      <WorkoutSets
        sets={mockSets}
        onUpdateSet={mockOnUpdateSet}
        onDeleteSet={mockOnDeleteSet}
      />
    )

    const editButtons = screen.getAllByRole('button', { name: /edit/i })
    await user.click(editButtons[0])

    const cancelButton = screen.getByRole('button', { name: /cancel/i })
    await user.click(cancelButton)

    // Should not call onUpdateSet
    expect(mockOnUpdateSet).not.toHaveBeenCalled()
  })
})

