import { useState, useEffect } from 'react'
import { Calendar, Clock, Target, Dumbbell, TrendingUp, Loader2 } from 'lucide-react'
import { getWeeklyWorkoutSummary } from '@/lib/history'
import { CompletedWorkout } from '@/lib/history'

interface WeeklySummaryProps {
  onRefresh?: () => void
}

export const WeeklySummary = ({ onRefresh }: WeeklySummaryProps) => {
  const [summaryData, setSummaryData] = useState<{
    totalWorkouts: number
    totalDuration: number
    totalSets: number
    totalReps: number
    totalWeight: number
    workouts: CompletedWorkout[]
    summary: string
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadWeeklySummary()
  }, [])

  const loadWeeklySummary = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getWeeklyWorkoutSummary()
      setSummaryData(data)
    } catch (err) {
      console.error('Failed to load weekly summary:', err)
      setError('Failed to load weekly summary')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadWeeklySummary()
    onRefresh?.()
  }

  if (isLoading) {
    return (
      <div className="card-primary p-6">
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto mb-3 text-accent-primary" />
          <p className="text-text-secondary">Loading weekly summary...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="card-primary p-6">
        <div className="text-center">
          <p className="text-error mb-3">{error}</p>
          <button
            onClick={handleRefresh}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!summaryData) {
    return null
  }

  const { totalWorkouts, totalDuration, totalSets, totalReps, totalWeight, summary } = summaryData

  return (
    <div className="card-primary p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-accent-primary" />
          <h3 className="text-lg font-semibold text-text-primary">This Week's Summary</h3>
        </div>
        <button
          onClick={handleRefresh}
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <TrendingUp className="h-4 w-4" />
        </button>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-primary">{totalWorkouts}</div>
          <div className="text-sm text-text-secondary">Workouts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-primary">{totalDuration}</div>
          <div className="text-sm text-text-secondary">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-primary">{totalSets}</div>
          <div className="text-sm text-text-secondary">Sets</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-accent-primary">{totalReps}</div>
          <div className="text-sm text-text-secondary">Reps</div>
        </div>
      </div>

      {/* Weight Summary */}
      {totalWeight > 0 && (
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-2">
            <Dumbbell className="h-4 w-4 text-text-secondary" />
            <span className="text-sm text-text-secondary">
              {totalWeight.toLocaleString()} lbs moved
            </span>
          </div>
        </div>
      )}

      {/* AI Summary */}
      <div className="bg-bg-tertiary rounded-lg p-4">
        <div className="flex items-center space-x-2 mb-2">
          <TrendingUp className="h-4 w-4 text-accent-primary" />
          <h4 className="text-sm font-medium text-text-primary">Weekly Analysis</h4>
        </div>
        <p className="text-sm text-text-secondary">{summary}</p>
      </div>

      {/* Recent Workouts */}
      {summaryData.workouts.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-text-primary mb-2">Recent Workouts</h4>
          <div className="space-y-2">
            {summaryData.workouts.slice(0, 3).map((workout) => (
              <div key={workout.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3 text-text-secondary" />
                  <span className="text-text-primary">{workout.name}</span>
                </div>
                <div className="flex items-center space-x-3 text-text-secondary">
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3" />
                    <span>{workout.duration_minutes || 0}m</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Target className="h-3 w-3" />
                    <span>{workout.sets.length} sets</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
