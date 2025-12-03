import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react'
import { ExerciseDetail } from './ExerciseDetail'

interface WorkoutCardProps {
  workout: {
    id: string
    name: string
    completedAt: string
    duration: number
    totalSets: number
    totalWeight: number
    exercises: Array<{
      name: string
      sets: Array<{
        weight?: number
        reps: number
        rir: number
        duration?: number
      }>
    }>
    description?: string
    summary?: string
    strengths?: string[]
    improvements?: string[]
    next_steps?: string[]
    ai_generated?: boolean
  }
  isExpanded: boolean
  onToggleExpand: () => void
  onDelete: () => void
}

export const WorkoutCard = ({ workout, isExpanded, onToggleExpand, onDelete }: WorkoutCardProps) => {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} min`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
      {/* Workout Header */}
      <button
        onClick={onToggleExpand}
        className="w-full p-4 flex justify-between items-center hover:bg-gray-50 transition-colors"
      >
        <div className="text-left">
          <h3 className="text-base font-semibold text-gray-900 mb-1">{workout.name}</h3>
          <div className="flex gap-4 text-sm text-gray-600">
            <span>{formatDate(workout.completedAt)}</span>
            <span>•</span>
            <span>{formatDuration(workout.duration || 0)}</span>
            <span>•</span>
            <span>{workout.totalSets || 0} sets</span>
            <span>•</span>
            <span>{workout.totalWeight?.toLocaleString() || 0} lbs</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Delete workout"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-3">Exercises</h4>
          <div className="space-y-3">
            {workout.exercises?.map((exercise, idx) => (
              <ExerciseDetail key={idx} exercise={exercise} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}


