import { useState } from 'react'
import { ChevronDown, ChevronUp, Dumbbell, Trash2, Bot, AlertTriangle } from 'lucide-react'
import { CompletedWorkout } from '@/lib/history'
import { deleteWorkout } from '@/lib/workouts'
import { formatDate } from '@/lib/utils'
import { EXERCISE_DATABASE } from '@/lib/exercises'

interface WorkoutHistoryCardsProps {
  workouts: CompletedWorkout[]
  onWorkoutDeleted?: () => void
}

export const WorkoutHistoryCards = ({ workouts, onWorkoutDeleted }: WorkoutHistoryCardsProps) => {
  const [expandedWorkouts, setExpandedWorkouts] = useState<Set<string>>(new Set())
  const [deletingWorkout, setDeletingWorkout] = useState<string | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)

  const toggleWorkout = (workoutId: string) => {
    const newExpanded = new Set(expandedWorkouts)
    if (newExpanded.has(workoutId)) {
      newExpanded.delete(workoutId)
    } else {
      newExpanded.add(workoutId)
    }
    setExpandedWorkouts(newExpanded)
  }

  const handleDeleteWorkout = async (workoutId: string) => {
    setDeletingWorkout(workoutId)
    try {
      await deleteWorkout(workoutId)
      console.log('✅ Workout deleted successfully')
      onWorkoutDeleted?.()
    } catch (error) {
      console.error('Failed to delete workout:', error)
      // You could show a toast notification here
    } finally {
      setDeletingWorkout(null)
      setShowDeleteConfirm(null)
    }
  }

  const isTimeBasedExercise = (exerciseName: string) => {
    const exercise = EXERCISE_DATABASE.find(e => e.name === exerciseName)
    return exercise?.isTimeBased || false
  }

  if (workouts.length === 0) {
    return (
      <div className="text-center py-12">
        <Dumbbell className="h-16 w-16 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No workout history yet</h3>
        <p className="text-gray-600">Complete your first workout to see it here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {workouts.map((workout) => {
        const isExpanded = expandedWorkouts.has(workout.id)
        const totalSets = workout.sets.length
        
        const hasWeight = workout.sets.some(set => set.weight && set.weight > 0)
        // Calculate total weight lifted: sum of (weight × reps) for each set
        const totalWeight = hasWeight 
          ? workout.sets.reduce((sum, set) => {
              // Only count rep-based exercises (not time-based)
              if (isTimeBasedExercise(set.exercise_name)) {
                return sum
              }
              return sum + ((set.weight || 0) * (set.reps || 0))
            }, 0)
          : 0

        return (
          <div key={workout.id} className="bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors overflow-hidden">
            {/* Workout Header */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => toggleWorkout(workout.id)}
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
                    {workout.ai_generated && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-100 text-cyan-800">
                        AI Generated
                      </span>
                    )}
                  </div>
                  
                  {workout.description && (
                    <p className="text-sm text-gray-600 mb-4">{workout.description}</p>
                  )}
                  
                  <div className="flex gap-6 text-sm text-gray-600">
                    <div>
                      <span className="text-gray-500">Date:</span> {formatDate(workout.workout_date)}
                    </div>
                    <div>
                      <span className="text-gray-500">Duration:</span> {workout.duration_minutes || workout.duration || 0} min
                    </div>
                    <div>
                      <span className="text-gray-500">Sets:</span> {totalSets}
                    </div>
                    {hasWeight && (
                      <div>
                        <span className="text-gray-500">Weight:</span> {totalWeight.toLocaleString()} lbs
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDeleteConfirm(workout.id)
                    }}
                    disabled={deletingWorkout === workout.id}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    title="Delete workout"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  
                  <div className="flex-shrink-0">
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Expanded Exercise Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 bg-gray-50">
                <div className="p-6">
                  {/* Workout Summary */}
                  {workout.summary && (
                    <div className="mb-4 bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex items-center space-x-2 mb-3">
                        <Bot className="h-4 w-4 text-cyan-500" />
                        <h4 className="text-sm font-medium text-gray-900">Workout Summary</h4>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{workout.summary}</p>
                      
                      {workout.strengths && workout.strengths.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-gray-900 mb-1">Strengths</h5>
                          <ul className="space-y-1">
                            {workout.strengths.map((strength, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-start">
                                <span className="text-green-600 mr-2">✓</span>
                                {strength}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {workout.improvements && workout.improvements.length > 0 && (
                        <div className="mb-3">
                          <h5 className="text-xs font-medium text-gray-900 mb-1">Areas for Improvement</h5>
                          <ul className="space-y-1">
                            {workout.improvements.map((improvement, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-start">
                                <span className="text-teal-600 mr-2">→</span>
                                {improvement}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {workout.next_steps && workout.next_steps.length > 0 && (
                        <div>
                          <h5 className="text-xs font-medium text-gray-900 mb-1">Next Steps</h5>
                          <ul className="space-y-1">
                            {workout.next_steps.map((step, index) => (
                              <li key={index} className="text-xs text-gray-600 flex items-start">
                                <span className="text-cyan-500 mr-2">•</span>
                                {step}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <h4 className="text-md font-medium text-gray-900 mb-3">Exercises</h4>
                  
                  {workout.sets.length === 0 ? (
                    <p className="text-gray-600 text-sm">No exercise data available for this workout.</p>
                  ) : (
                    <div className="space-y-3">
                      {/* Group sets by exercise */}
                      {Array.from(new Set(workout.sets.map(set => set.exercise_name))).map(exerciseName => {
                        const exerciseSets = workout.sets.filter(set => set.exercise_name === exerciseName)
                        const isTimeBased = isTimeBasedExercise(exerciseName)
                        const totalExerciseReps = exerciseSets.reduce((sum, set) => sum + set.reps, 0)
                        const totalExerciseDuration = exerciseSets.reduce((sum, set) => sum + (set.duration || 0), 0)
                        const exerciseWeight = exerciseSets[0]?.weight
                        
                        return (
                          <div key={exerciseName} className="bg-white p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-gray-900">{exerciseName}</h5>
                              <div className="text-sm text-gray-600">
                                {exerciseSets.length} sets • {
                                  isTimeBased 
                                    ? `${Math.round(totalExerciseDuration / 60)} min` 
                                    : `${totalExerciseReps} reps`
                                }
                                {exerciseWeight && ` • ${exerciseWeight.toLocaleString()} lbs`}
                              </div>
                            </div>
                            
                            <div className={`grid gap-2 text-xs ${isTimeBased ? 'grid-cols-3' : 'grid-cols-4'}`}>
                              <div className="text-gray-500">Set</div>
                              <div className="text-gray-500">Weight</div>
                              {isTimeBased ? (
                                <div className="text-gray-500">Duration</div>
                              ) : (
                                <>
                                  <div className="text-gray-500">Reps</div>
                                  <div className="text-gray-500">RIR</div>
                                </>
                              )}
                              
                              {exerciseSets.map((set, index) => (
                                <>
                                  <div key={`set-${index}`} className="font-medium text-gray-900">{index + 1}</div>
                                  <div className="text-gray-900">{set.weight ? `${set.weight.toLocaleString()} lbs` : 'BW'}</div>
                                  {isTimeBased ? (
                                    <div className="text-gray-900">{set.duration ? `${set.duration}s` : '0s'}</div>
                                  ) : (
                                    <>
                                      <div className="text-gray-900">{set.reps}</div>
                                      <div className="text-gray-900">{set.rir}</div>
                                    </>
                                  )}
                                </>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center space-x-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-xl font-semibold text-gray-900">Delete Workout</h3>
            </div>
            
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this workout? This action cannot be undone and will also delete all exercise history for this workout.
            </p>
            
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-6 py-2.5 text-gray-700 rounded-md border-b-2 border-gray-300 hover:border-gray-900 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteWorkout(showDeleteConfirm)}
                disabled={deletingWorkout === showDeleteConfirm}
                className="px-6 py-2.5 bg-red-500 text-white rounded-md hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {deletingWorkout === showDeleteConfirm ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}








