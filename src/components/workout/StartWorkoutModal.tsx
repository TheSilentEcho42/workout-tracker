import { useState, useEffect } from 'react'
import { Play, Calendar, Plus, Clock, Target, Star } from 'lucide-react'
import { getActiveWorkoutPlan, getRecommendedWorkout, SavedWorkoutPlan, WorkoutDay } from '@/lib/workoutPlans'

interface StartWorkoutModalProps {
  isOpen: boolean
  onClose: () => void
  onStartPlannedWorkout: (workout: WorkoutDay) => void
  onStartCustomWorkout: () => void
}

export const StartWorkoutModal = ({ 
  isOpen, 
  onClose, 
  onStartPlannedWorkout, 
  onStartCustomWorkout 
}: StartWorkoutModalProps) => {
  const [activePlan, setActivePlan] = useState<SavedWorkoutPlan | null>(null)
  const [recommendedWorkout, setRecommendedWorkout] = useState<WorkoutDay | null>(null)

  useEffect(() => {
    if (isOpen) {
      const plan = getActiveWorkoutPlan()
      setActivePlan(plan)
      
      if (plan) {
        // Get recommended workout based on last completed
        const recommended = getRecommendedWorkout(plan)
        setRecommendedWorkout(recommended)
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="card-primary p-4 sm:p-6 w-full max-w-md mx-auto">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl font-bold text-text-primary">Start Workout</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors text-lg sm:text-xl"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {/* All Planned Workouts */}
          {activePlan && activePlan.workouts.filter(w => !w.is_rest).length > 0 && (
            <div className="space-y-2 sm:space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-text-primary">Choose a Workout</h3>
              
              {activePlan.workouts
                .filter(workout => !workout.is_rest)
                .map((workout, index) => {
                  const isRecommended = recommendedWorkout && 
                    workout.day === recommendedWorkout.day && 
                    workout.focus === recommendedWorkout.focus
                  
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        onStartPlannedWorkout(workout)
                        onClose()
                      }}
                      className={`w-full p-3 sm:p-4 border-2 rounded-lg transition-colors text-left ${
                        isRecommended
                          ? 'border-accent-primary/40 bg-accent-primary/5 hover:border-accent-primary/60'
                          : 'border-border-line hover:border-accent-primary/30 hover:bg-bg-tertiary'
                      }`}
                    >
                      <div className="flex items-start space-x-2 sm:space-x-3">
                        <div className={`p-1.5 sm:p-2 rounded-lg ${
                          isRecommended ? 'bg-accent-primary/20' : 'bg-bg-tertiary'
                        }`}>
                          <Calendar className={`h-4 w-4 sm:h-5 sm:w-5 ${
                            isRecommended ? 'text-accent-primary' : 'text-text-secondary'
                          }`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-1 sm:space-x-2 mb-1">
                            <h4 className="font-semibold text-text-primary text-sm sm:text-base truncate">
                              {workout.day} • {workout.focus}
                            </h4>
                            {isRecommended && (
                              <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-accent-primary text-bg-primary flex-shrink-0">
                                <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 sm:mr-1" />
                                <span className="hidden sm:inline">Recommended</span>
                                <span className="sm:hidden">Rec</span>
                              </span>
                            )}
                          </div>
                          <div className="flex items-center text-xs text-text-secondary">
                            <Target className="w-3 h-3 mr-1" />
                            {workout.exercises.length} exercises
                          </div>
                        </div>
                        <Play className={`h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0 ${
                          isRecommended ? 'text-accent-primary' : 'text-text-secondary'
                        }`} />
                      </div>
                    </button>
                  )
                })}
            </div>
          )}

          {/* Custom Workout Option */}
          <button
            onClick={() => {
              onStartCustomWorkout()
              onClose()
            }}
            className="w-full p-3 sm:p-4 border-2 border-border-line rounded-lg hover:border-accent-primary/50 hover:bg-bg-tertiary transition-colors text-left"
          >
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-bg-tertiary rounded-lg">
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-text-secondary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-text-primary text-sm sm:text-base">Custom Workout</h3>
                <p className="text-xs sm:text-sm text-text-secondary">
                  Create your own workout from scratch
                </p>
              </div>
              <Play className="h-4 w-4 sm:h-5 sm:w-5 text-text-secondary flex-shrink-0" />
            </div>
          </button>

          {/* No Active Plan Message */}
          {!activePlan && (
            <div className="p-3 sm:p-4 bg-bg-tertiary/30 rounded-lg text-center">
              <Calendar className="h-6 w-6 sm:h-8 sm:w-8 mx-auto mb-2 text-text-secondary" />
              <p className="text-xs sm:text-sm text-text-secondary">
                No active workout plan found. Create a plan to see scheduled workouts.
              </p>
            </div>
          )}

          {/* Rest Day Message */}
          {activePlan && activePlan.workouts.some(w => w.is_rest) && (
            <div className="p-3 sm:p-4 bg-accent-primary/10 border border-accent-primary/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-accent-primary flex-shrink-0" />
                <p className="text-xs sm:text-sm text-accent-primary">
                  Your plan includes rest days. You can still do a custom workout if you'd like.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 sm:mt-6 flex space-x-2 sm:space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-text-secondary border border-border-line rounded-md hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

