import { useState, useEffect, useMemo } from 'react'
import { Calendar, TrendingUp, Filter, Loader2, AlertTriangle } from 'lucide-react'
import { getCompletedWorkouts, CompletedWorkout, getWeeklyWorkoutSummary } from '@/lib/history'
import { deleteWorkout } from '@/lib/workouts'
import { isDatabaseConfigured } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { WeeklySummary } from '@/components/history/WeeklySummary'
import { WorkoutCard } from '@/components/history/WorkoutCard'
import { ExerciseCard } from '@/components/history/ExerciseCard'

export const HistoryPage = () => {
  const { isGuest } = useAuth()
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([])
  const [weeklyStats, setWeeklyStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [expandedWorkout, setExpandedWorkout] = useState<string | null>(null)
  const [expandedExercise, setExpandedExercise] = useState<string | null>(null)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [completedWorkouts, weeklyData] = await Promise.all([
        getCompletedWorkouts(),
        getWeeklyWorkoutSummary().catch(() => null)
      ])
      setWorkouts(completedWorkouts)
      // Transform weekly data to match expected format
      if (weeklyData) {
        setWeeklyStats({
          workouts: weeklyData.totalWorkouts,
          minutes: weeklyData.totalDuration,
          sets: weeklyData.totalSets,
          reps: weeklyData.totalReps,
          weight: weeklyData.totalWeight,
          analysis: weeklyData.summary
        })
      }
    } catch (error) {
      console.error('Failed to load workout history:', error)
      setWorkouts([])
    } finally {
      setIsLoading(false)
    }
  }

  // Transform workouts to match expected format
  const transformedWorkouts = useMemo(() => {
    return workouts.map(workout => {
      // Group sets by exercise
      const exerciseMap = new Map<string, any[]>()
      workout.sets.forEach(set => {
        if (!exerciseMap.has(set.exercise_name)) {
          exerciseMap.set(set.exercise_name, [])
        }
        exerciseMap.get(set.exercise_name)!.push(set)
      })

      const exercises = Array.from(exerciseMap.entries()).map(([name, sets]) => ({
        name,
        sets: sets.map(set => ({
          weight: set.weight,
          reps: set.reps,
          rir: set.rir,
          duration: set.duration
        }))
      }))

      // Calculate totals
      const totalSets = workout.sets.length
      const totalWeight = workout.sets.reduce((sum, set) => {
        return sum + ((set.weight || 0) * (set.reps || 0))
      }, 0)

      return {
        id: workout.id,
        name: workout.name,
        completedAt: workout.workout_date,
        duration: workout.duration_minutes || workout.duration || 0,
        totalSets,
        totalWeight,
        exercises,
        description: workout.description,
        summary: workout.summary,
        strengths: workout.strengths,
        improvements: workout.improvements,
        next_steps: workout.next_steps,
        ai_generated: workout.ai_generated
      }
    })
  }, [workouts])

  // Calculate stats
  const stats = useMemo(() => {
    return {
      totalWorkouts: transformedWorkouts.length,
      thisWeek: transformedWorkouts.filter(w => isThisWeek(w.completedAt)).length,
      totalWeight: transformedWorkouts.reduce((acc, w) => acc + (w.totalWeight || 0), 0),
      avgDuration: transformedWorkouts.length > 0
        ? Math.round(transformedWorkouts.reduce((acc, w) => acc + (w.duration || 0), 0) / transformedWorkouts.length)
        : 0
    }
  }, [transformedWorkouts])

  // Get exercises with their stats
  const exercises = useMemo(() => {
    return calculateExerciseStats(transformedWorkouts)
  }, [transformedWorkouts])

  const handleDeleteWorkout = async (workoutId: string) => {
    if (window.confirm('Are you sure you want to delete this workout?')) {
      try {
        await deleteWorkout(workoutId)
        await loadData()
      } catch (error) {
        console.error('Failed to delete workout:', error)
        alert('Failed to delete workout. Please try again.')
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-500" />
          <p className="text-gray-600">Loading workout history...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Inline Stats */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row justify-between items-start mb-4 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Workout History</h1>
              <p className="text-gray-600">Track your progress and analyze your performance</p>
            </div>
            {/* Compact Stats */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 bg-white rounded-lg border border-gray-200 px-4 sm:px-6 py-4 w-full lg:w-auto">
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Total</div>
                <div className="text-2xl font-bold text-gray-900">{stats.totalWorkouts}</div>
              </div>
              <div className="border-l border-gray-200 hidden sm:block"></div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">This Week</div>
                <div className="text-2xl font-bold text-gray-900">{stats.thisWeek}</div>
              </div>
              <div className="border-l border-gray-200 hidden sm:block"></div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Weight</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.totalWeight.toLocaleString()} <span className="text-sm font-normal text-gray-500">lbs</span>
                </div>
              </div>
              <div className="border-l border-gray-200 hidden sm:block"></div>
              <div>
                <div className="text-xs text-gray-500 mb-0.5">Avg Time</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stats.avgDuration} <span className="text-sm font-normal text-gray-500">min</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {!isDatabaseConfigured && !isGuest && (
          <div className="bg-white p-4 mb-6 rounded-lg border border-gray-200">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-gray-900 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-gray-900">Database Not Configured</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Workout history is not working because Supabase is not configured.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Weekly Trends Section */}
        {weeklyStats && (
          <WeeklySummary weeklyStats={weeklyStats} />
        )}

        {/* Recent Workouts Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Recent Workouts</h2>
              <p className="text-sm text-gray-600 mt-1">
                {transformedWorkouts.length} workout{transformedWorkouts.length !== 1 ? 's' : ''} completed
              </p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md transition-colors text-sm font-medium flex items-center gap-2">
                <Filter className="w-4 h-4" />
                Filter
              </button>
            </div>
          </div>
          <div className="p-6 space-y-3">
            {transformedWorkouts.length > 0 ? (
              transformedWorkouts.map(workout => (
                <WorkoutCard
                  key={workout.id}
                  workout={workout}
                  isExpanded={expandedWorkout === workout.id}
                  onToggleExpand={() => setExpandedWorkout(expandedWorkout === workout.id ? null : workout.id)}
                  onDelete={() => handleDeleteWorkout(workout.id)}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No workouts yet. Start tracking to see your history!</p>
              </div>
            )}
          </div>
        </div>

        {/* Exercise Progress Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">Exercise Progress</h2>
            <p className="text-sm text-gray-600 mt-1">Track improvements across all exercises</p>
          </div>
          <div className="p-6">
            {exercises.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {exercises.map((exercise, idx) => (
                  <ExerciseCard
                    key={idx}
                    exercise={exercise}
                    isExpanded={expandedExercise === exercise.name}
                    onToggleExpand={() => setExpandedExercise(expandedExercise === exercise.name ? null : exercise.name)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No exercise data yet. Complete workouts to see your progress!</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

// Helper function
function isThisWeek(date: string): boolean {
  const now = new Date()
  const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
  weekStart.setHours(0, 0, 0, 0)
  return new Date(date) >= weekStart
}

// Calculate exercise statistics from workouts
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
