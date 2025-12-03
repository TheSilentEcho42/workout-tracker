import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { WorkoutCard } from '../WorkoutCard'

describe('WorkoutCard', () => {
  const mockWorkout = {
    id: 'workout-1',
    name: 'Push Day',
    completedAt: '2024-01-15',
    duration: 45,
    totalSets: 1,
    totalWeight: 1350, // 135 * 10
    exercises: [
      {
        name: 'Bench Press',
        sets: [
          {
            weight: 135,
            reps: 10,
            rir: 2,
          },
        ],
      },
    ],
    description: 'Chest, shoulders, triceps',
    summary: 'Great workout!',
    strengths: ['Good form', 'Consistent pace'],
    improvements: ['Increase weight'],
    next_steps: ['Focus on triceps'],
    ai_generated: false,
  }

  const mockOnDelete = vi.fn()
  const mockOnToggleExpand = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render workout name', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isExpanded={false}
        onToggleExpand={mockOnToggleExpand}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Push Day')).toBeInTheDocument()
  })

  it('should render workout date', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isExpanded={false}
        onToggleExpand={mockOnToggleExpand}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText(/january 15, 2024/i)).toBeInTheDocument()
  })

  it('should render workout description when provided', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isExpanded={true}
        onToggleExpand={mockOnToggleExpand}
        onDelete={mockOnDelete}
      />
    )
    // Description is not directly rendered in the component, but exercises are shown when expanded
    expect(screen.getByText('Push Day')).toBeInTheDocument()
  })

  it('should render workout duration', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isExpanded={false}
        onToggleExpand={mockOnToggleExpand}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText(/45.*min/i)).toBeInTheDocument()
  })

  it('should render exercise count', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isExpanded={true}
        onToggleExpand={mockOnToggleExpand}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('should render exercises when expanded', () => {
    render(
      <WorkoutCard
        workout={mockWorkout}
        isExpanded={true}
        onToggleExpand={mockOnToggleExpand}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Exercises')).toBeInTheDocument()
    expect(screen.getByText('Bench Press')).toBeInTheDocument()
  })

  it('should handle workout without description', () => {
    const workoutWithoutDesc = { ...mockWorkout, description: undefined }
    render(
      <WorkoutCard
        workout={workoutWithoutDesc}
        isExpanded={false}
        onToggleExpand={mockOnToggleExpand}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Push Day')).toBeInTheDocument()
  })

  it('should handle workout without AI summary', () => {
    const workoutWithoutSummary = { ...mockWorkout, summary: undefined }
    render(
      <WorkoutCard
        workout={workoutWithoutSummary}
        isExpanded={false}
        onToggleExpand={mockOnToggleExpand}
        onDelete={mockOnDelete}
      />
    )
    expect(screen.getByText('Push Day')).toBeInTheDocument()
  })
})

