import { describe, it, expect } from 'vitest'

// Helper functions from HistoryPage
function isThisWeek(date: string): boolean {
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  weekStart.setHours(0, 0, 0, 0)
  return new Date(date) >= weekStart
}

function calculateExerciseStats(workouts: any[]) {
  const exerciseMap = new Map<string, any>()

  workouts.forEach(workout => {
    workout.exercises?.forEach((exercise: any) => {
      if (!exerciseMap.has(exercise.name)) {
        exerciseMap.set(exercise.name, {
          name: exercise.name,
          totalWorkouts: 0,
          totalSets: 0,
          bestWeight: 0,
          bestReps: 0,
          history: []
        })
      }

      const stats = exerciseMap.get(exercise.name)!
      stats.totalWorkouts += 1
      stats.totalSets += exercise.sets?.length || 0

      exercise.sets?.forEach((set: any) => {
        if (typeof set.weight === 'number' && set.weight > stats.bestWeight) {
          stats.bestWeight = set.weight
        }
        if (set.reps > stats.bestReps) {
          stats.bestReps = set.reps
        }

        stats.history.push({
          date: workout.completedAt,
          weight: set.weight,
          reps: set.reps,
          rir: set.rir,
          workoutName: workout.name
        })
      })
    })
  })

  return Array.from(exerciseMap.values()).sort((a, b) =>
    b.totalWorkouts - a.totalWorkouts
  )
}

describe('HistoryPage helper functions', () => {
  describe('isThisWeek', () => {
    it('should return true for today', () => {
      const today = new Date().toISOString().split('T')[0]
      expect(isThisWeek(today)).toBe(true)
    })

    it('should return true for dates within current week', () => {
      const today = new Date()
      const daysAgo = new Date(today)
      daysAgo.setDate(today.getDate() - 3)
      const dateStr = daysAgo.toISOString().split('T')[0]
      expect(isThisWeek(dateStr)).toBe(true)
    })

    it('should return false for dates older than a week', () => {
      const today = new Date()
      const daysAgo = new Date(today)
      daysAgo.setDate(today.getDate() - 10)
      const dateStr = daysAgo.toISOString().split('T')[0]
      expect(isThisWeek(dateStr)).toBe(false)
    })
  })

  describe('calculateExerciseStats', () => {
    it('should return empty array for empty workouts', () => {
      const result = calculateExerciseStats([])
      expect(result).toEqual([])
    })

    it('should calculate stats for single workout with single exercise', () => {
      const workouts = [
        {
          completedAt: '2024-01-15',
          name: 'Workout 1',
          exercises: [
            {
              name: 'Bench Press',
              sets: [
                { weight: 135, reps: 10, rir: 2 },
                { weight: 135, reps: 8, rir: 1 },
              ],
            },
          ],
        },
      ]

      const result = calculateExerciseStats(workouts)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Bench Press')
      expect(result[0].totalWorkouts).toBe(1)
      expect(result[0].totalSets).toBe(2)
      expect(result[0].bestWeight).toBe(135)
      expect(result[0].bestReps).toBe(10)
      expect(result[0].history).toHaveLength(2)
    })

    it('should calculate stats for multiple workouts with same exercise', () => {
      const workouts = [
        {
          completedAt: '2024-01-15',
          name: 'Workout 1',
          exercises: [
            {
              name: 'Bench Press',
              sets: [
                { weight: 135, reps: 10, rir: 2 },
                { weight: 140, reps: 8, rir: 1 },
              ],
            },
          ],
        },
        {
          completedAt: '2024-01-20',
          name: 'Workout 2',
          exercises: [
            {
              name: 'Bench Press',
              sets: [
                { weight: 145, reps: 6, rir: 0 },
              ],
            },
          ],
        },
      ]

      const result = calculateExerciseStats(workouts)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Bench Press')
      expect(result[0].totalWorkouts).toBe(2)
      expect(result[0].totalSets).toBe(3)
      expect(result[0].bestWeight).toBe(145)
      expect(result[0].bestReps).toBe(10)
      expect(result[0].history).toHaveLength(3)
    })

    it('should handle multiple exercises', () => {
      const workouts = [
        {
          completedAt: '2024-01-15',
          name: 'Workout 1',
          exercises: [
            {
              name: 'Bench Press',
              sets: [{ weight: 135, reps: 10, rir: 2 }],
            },
            {
              name: 'Squat',
              sets: [{ weight: 225, reps: 12, rir: 1 }],
            },
          ],
        },
      ]

      const result = calculateExerciseStats(workouts)

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Bench Press')
      expect(result[1].name).toBe('Squat')
      expect(result[0].bestWeight).toBe(135)
      expect(result[1].bestWeight).toBe(225)
    })

    it('should handle exercises without weight', () => {
      const workouts = [
        {
          completedAt: '2024-01-15',
          name: 'Workout 1',
          exercises: [
            {
              name: 'Pull-ups',
              sets: [
                { weight: null, reps: 10, rir: 2 },
                { weight: undefined, reps: 12, rir: 1 },
              ],
            },
          ],
        },
      ]

      const result = calculateExerciseStats(workouts)

      expect(result).toHaveLength(1)
      expect(result[0].name).toBe('Pull-ups')
      expect(result[0].bestWeight).toBe(0)
      expect(result[0].bestReps).toBe(12)
    })

    it('should sort exercises by total workouts (descending)', () => {
      const workouts = [
        {
          completedAt: '2024-01-15',
          name: 'Workout 1',
          exercises: [
            { name: 'Exercise A', sets: [{ weight: 100, reps: 10, rir: 2 }] },
            { name: 'Exercise B', sets: [{ weight: 100, reps: 10, rir: 2 }] },
          ],
        },
        {
          completedAt: '2024-01-20',
          name: 'Workout 2',
          exercises: [
            { name: 'Exercise A', sets: [{ weight: 100, reps: 10, rir: 2 }] },
          ],
        },
      ]

      const result = calculateExerciseStats(workouts)

      expect(result[0].name).toBe('Exercise A')
      expect(result[0].totalWorkouts).toBe(2)
      expect(result[1].name).toBe('Exercise B')
      expect(result[1].totalWorkouts).toBe(1)
    })
  })
})


