import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getWeeklyWorkoutSummary, getExerciseHistory } from '../history'
import { supabase } from '../supabase'

// Mock Supabase
vi.mock('../supabase', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
    },
    from: vi.fn(),
  },
}))

describe('history', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getWeeklyWorkoutSummary', () => {
    it('should return empty summary when no workouts exist', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user' } as any },
        error: null,
      })

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockGte = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        gte: mockGte,
        order: mockOrder,
      } as any)

      const result = await getWeeklyWorkoutSummary()

      expect(result.totalWorkouts).toBe(0)
      expect(result.totalDuration).toBe(0)
      expect(result.totalSets).toBe(0)
      expect(result.totalReps).toBe(0)
      expect(result.totalWeight).toBe(0)
      expect(result.workouts).toEqual([])
      expect(result.summary).toContain('No workouts completed')
    })

    it('should calculate totals correctly for multiple workouts', async () => {
      const mockUser = { id: 'test-user' } as any
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockWorkouts = [
        {
          id: 'workout-1',
          user_id: 'test-user',
          name: 'Workout 1',
          workout_date: new Date().toISOString().split('T')[0],
          status: 'completed',
          duration_minutes: 45,
        },
        {
          id: 'workout-2',
          user_id: 'test-user',
          name: 'Workout 2',
          workout_date: new Date().toISOString().split('T')[0],
          status: 'completed',
          duration_minutes: 30,
        },
      ]

      const mockSets = [
        { workout_id: 'workout-1', weight: 100, reps: 10 },
        { workout_id: 'workout-1', weight: 100, reps: 8 },
        { workout_id: 'workout-2', weight: 150, reps: 12 },
      ]

      let callCount = 0
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          // First call: workouts
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            gte: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockWorkouts,
              error: null,
            }),
          }
        } else {
          // Second call: sets
          return {
            select: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: mockSets,
              error: null,
            }),
          }
        }
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      const result = await getWeeklyWorkoutSummary()

      expect(result.totalWorkouts).toBe(2)
      expect(result.totalDuration).toBe(75) // 45 + 30
      expect(result.totalSets).toBe(3)
      expect(result.totalReps).toBe(30) // 10 + 8 + 12
      expect(result.totalWeight).toBe(3600) // (100*10) + (100*8) + (150*12)
      expect(result.workouts).toHaveLength(2)
      expect(result.summary).toContain('Great week')
    })
  })

  describe('getExerciseHistory', () => {
    it('should return empty history when exercise has no data', async () => {
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: { id: 'test-user' } as any },
        error: null,
      })

      const mockSelect = vi.fn().mockReturnThis()
      const mockEq = vi.fn().mockReturnThis()
      const mockOrder = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      })

      vi.mocked(supabase.from).mockReturnValue({
        select: mockSelect,
        eq: mockEq,
        order: mockOrder,
      } as any)

      const result = await getExerciseHistory('Bench Press')

      expect(result.exercise_name).toBe('Bench Press')
      expect(result.total_workouts).toBe(0)
      expect(result.total_sets).toBe(0)
      expect(result.best_weight).toBeUndefined()
      expect(result.best_reps).toBe(0)
      expect(result.progress_data).toEqual([])
    })

    it('should calculate exercise statistics correctly', async () => {
      const mockUser = { id: 'test-user' } as any
      vi.mocked(supabase.auth.getUser).mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const mockWorkouts = [
        {
          id: 'workout-1',
          name: 'Workout 1',
          workout_date: '2024-01-15',
        },
        {
          id: 'workout-2',
          name: 'Workout 2',
          workout_date: '2024-01-20',
        },
      ]

      const mockSets = [
        {
          workout_id: 'workout-1',
          exercise_name: 'Bench Press',
          weight: 135,
          reps: 10,
          rir: 2,
        },
        {
          workout_id: 'workout-1',
          exercise_name: 'Bench Press',
          weight: 140,
          reps: 8,
          rir: 1,
        },
        {
          workout_id: 'workout-2',
          exercise_name: 'Bench Press',
          weight: 145,
          reps: 6,
          rir: 0,
        },
      ]

      let callCount = 0
      const mockFrom = vi.fn().mockImplementation(() => {
        callCount++
        if (callCount === 1) {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            order: vi.fn().mockResolvedValue({
              data: mockWorkouts,
              error: null,
            }),
          }
        } else {
          return {
            select: vi.fn().mockReturnThis(),
            eq: vi.fn().mockReturnThis(),
            in: vi.fn().mockResolvedValue({
              data: mockSets,
              error: null,
            }),
          }
        }
      })

      vi.mocked(supabase.from).mockImplementation(mockFrom as any)

      const result = await getExerciseHistory('Bench Press')

      expect(result.exercise_name).toBe('Bench Press')
      expect(result.total_workouts).toBe(2)
      expect(result.total_sets).toBe(3)
      expect(result.best_weight).toBe(145)
      expect(result.best_reps).toBe(10)
      expect(result.progress_data).toHaveLength(3)
    })
  })
})

