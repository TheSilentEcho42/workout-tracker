import { WorkoutSet, ActiveWorkout } from '@/lib/workouts'
import { CompletedWorkout } from '@/lib/history'

/**
 * Test data factories for creating mock data
 */

export const createMockUser = (overrides = {}) => ({
  id: 'test-user-id',
  email: 'test@example.com',
  user_metadata: {
    full_name: 'Test User',
  },
  ...overrides,
})

export const createMockWorkout = (overrides = {}): ActiveWorkout => ({
  id: 'test-workout-id',
  user_id: 'test-user-id',
  name: 'Test Workout',
  description: 'A test workout',
  workout_date: new Date().toISOString().split('T')[0],
  status: 'in_progress',
  ai_generated: false,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sets: [],
  ...overrides,
})

export const createMockWorkoutSet = (overrides = {}): WorkoutSet => ({
  id: 'test-set-id',
  workout_id: 'test-workout-id',
  exercise_id: 'bench-press',
  exercise_name: 'Bench Press',
  weight: 135,
  reps: 10,
  rir: 2,
  notes: '',
  order_index: 0,
  ...overrides,
})

export const createMockCompletedWorkout = (overrides = {}): CompletedWorkout => ({
  id: 'test-completed-workout-id',
  user_id: 'test-user-id',
  name: 'Completed Test Workout',
  description: 'A completed test workout',
  workout_date: new Date().toISOString().split('T')[0],
  status: 'completed',
  ai_generated: false,
  summary: 'Great workout!',
  strengths: ['Good form', 'Consistent pace'],
  improvements: ['Increase weight next time'],
  next_steps: ['Focus on tricep isolation'],
  duration_minutes: 45,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  sets: [
    createMockWorkoutSet({ id: 'set-1', exercise_name: 'Bench Press' }),
    createMockWorkoutSet({ id: 'set-2', exercise_name: 'Squat' }),
  ],
  ...overrides,
})

export const mockWorkouts = [
  createMockWorkout({ id: 'workout-1', name: 'Push Day' }),
  createMockWorkout({ id: 'workout-2', name: 'Pull Day' }),
]

export const mockCompletedWorkouts = [
  createMockCompletedWorkout({ id: 'completed-1', name: 'Monday Workout' }),
  createMockCompletedWorkout({ id: 'completed-2', name: 'Wednesday Workout' }),
]

export const mockWorkoutSets = [
  createMockWorkoutSet({ id: 'set-1', exercise_name: 'Bench Press', weight: 135, reps: 10 }),
  createMockWorkoutSet({ id: 'set-2', exercise_name: 'Bench Press', weight: 135, reps: 8 }),
  createMockWorkoutSet({ id: 'set-3', exercise_name: 'Squat', weight: 225, reps: 12 }),
]


