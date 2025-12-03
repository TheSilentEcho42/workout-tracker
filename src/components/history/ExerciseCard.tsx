import { ChevronDown, ChevronUp, TrendingUp } from 'lucide-react'

interface ExerciseCardProps {
  exercise: {
    name: string
    totalWorkouts: number
    totalSets: number
    bestWeight: number
    bestReps: number
    history: Array<{
      date: string
      weight?: number
      reps: number
      rir: number
      workoutName: string
    }>
  }
  isExpanded: boolean
  onToggleExpand: () => void
  workouts?: any[]
}

export const ExerciseCard = ({ exercise, isExpanded, onToggleExpand }: ExerciseCardProps) => {
  // Get recent history for this exercise
  const recentSets = exercise.history
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <div className="font-semibold text-gray-900 mb-1">{exercise.name}</div>
          <div className="text-xs text-gray-600">
            {exercise.totalWorkouts} workout{exercise.totalWorkouts !== 1 ? 's' : ''} • 
            Best: {exercise.bestWeight > 0 ? `${exercise.bestWeight} lbs × ` : ''}{exercise.bestReps}
          </div>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-1">Total Sets</div>
              <div className="text-xl font-bold text-gray-900">{exercise.totalSets}</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-3">
              <div className="text-xs text-gray-500 mb-1">Best Weight</div>
              <div className="text-xl font-bold text-gray-900">
                {exercise.bestWeight} {typeof exercise.bestWeight === 'number' && exercise.bestWeight > 0 ? 'lbs' : ''}
              </div>
            </div>
          </div>

          {/* Chart Placeholder */}
          <div className="bg-white rounded-lg border border-gray-200 p-3 mb-3">
            <div className="h-32 flex items-center justify-center bg-gray-50 rounded border-2 border-dashed border-gray-300">
              <div className="text-center">
                <TrendingUp className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                <p className="text-gray-500 text-xs">Progress chart</p>
              </div>
            </div>
          </div>

          {/* Recent Sets */}
          <div className="space-y-2">
            <div className="text-xs font-semibold text-gray-900 mb-2">Recent Sets</div>
            {recentSets.length > 0 ? (
              recentSets.map((entry, idx) => {
                const date = new Date(entry.date)
                const formattedDate = date.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric'
                })

                return (
                  <div key={idx} className="flex justify-between text-xs bg-white rounded p-2 border border-gray-200">
                    <span className="text-gray-600">{formattedDate}</span>
                    <span className="font-medium text-gray-900">
                      {entry.weight && entry.weight > 0 ? `${entry.weight} lbs × ` : ''}{entry.reps}
                    </span>
                  </div>
                )
              })
            ) : (
              <p className="text-xs text-gray-500">No recent sets</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

