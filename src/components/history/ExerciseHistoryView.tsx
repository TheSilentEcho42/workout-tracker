import { useState, useEffect } from 'react'
import { TrendingUp, Target } from 'lucide-react'
import { getUserExercises, getExerciseHistory, ExerciseHistory } from '@/lib/history'
import { ExerciseSearch } from '@/components/workout/ExerciseSearch'
import { ProgressChart } from './ProgressChart'
import { ExerciseOption } from '@/lib/exercises'

export const ExerciseHistoryView = () => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null)
  const [exerciseHistory, setExerciseHistory] = useState<ExerciseHistory | null>(null)
  const [userExercises, setUserExercises] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const loadUserExercises = async () => {
      try {
        const exercises = await getUserExercises()
        setUserExercises(exercises)
      } catch (error) {
        console.error('Failed to load user exercises:', error)
      }
    }

    loadUserExercises()
  }, [])

  useEffect(() => {
    if (selectedExercise) {
      loadExerciseHistory(selectedExercise.name)
    }
  }, [selectedExercise])

  const loadExerciseHistory = async (exerciseName: string) => {
    setIsLoading(true)
    try {
      const history = await getExerciseHistory(exerciseName)
      setExerciseHistory(history)
    } catch (error) {
      console.error('Failed to load exercise history:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleExerciseSelect = (exercise: ExerciseOption) => {
    setSelectedExercise(exercise)
  }

  if (userExercises.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="h-16 w-16 mx-auto mb-4 text-text-secondary/50" />
        <h3 className="text-lg font-medium text-text-primary mb-2">No exercises performed yet</h3>
        <p className="text-text-secondary">Complete your first workout to see exercise history here!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Exercise Selection */}
      <div className="card-primary border border-border-line rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Select Exercise</h3>
        <ExerciseSearch
          onExerciseSelect={handleExerciseSelect}
          placeholder="Search for an exercise to view history..."
        />
        
        {selectedExercise && (
          <div className="mt-4 p-3 bg-bg-tertiary rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium text-text-primary">{selectedExercise.name}</span>
                <span className="ml-2 text-text-secondary">• {selectedExercise.category}</span>
                {selectedExercise.muscle_groups.length > 0 && (
                  <span className="ml-2 text-text-secondary">• {selectedExercise.muscle_groups.join(', ')}</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exercise History */}
      {selectedExercise && (
        <div>
          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-primary mx-auto mb-4"></div>
              <p className="text-text-secondary">Loading exercise history...</p>
            </div>
          ) : exerciseHistory ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="card-primary border border-border-line rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">{exerciseHistory.total_workouts}</div>
                  <div className="text-sm text-text-secondary">Total Workouts</div>
                </div>
                
                <div className="card-primary border border-border-line rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">{exerciseHistory.total_sets}</div>
                  <div className="text-sm text-text-secondary">Total Sets</div>
                </div>
                
                {exerciseHistory.best_weight && (
                  <div className="card-primary border border-border-line rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-text-primary">{exerciseHistory.best_weight.toLocaleString()}</div>
                    <div className="text-sm text-text-secondary">Best Weight (lbs)</div>
                  </div>
                )}
                
                <div className="card-primary border border-border-line rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-text-primary">{exerciseHistory.best_reps}</div>
                  <div className="text-sm text-text-secondary">Best Reps</div>
                </div>
              </div>

              {/* Progress Chart */}
              <ProgressChart 
                progressData={exerciseHistory.progress_data}
                exerciseName={exerciseHistory.exercise_name}
              />
            </div>
          ) : (
            <div className="text-center py-12">
              <TrendingUp className="h-16 w-16 mx-auto mb-4 text-text-secondary/50" />
              <h3 className="text-lg font-medium text-text-primary mb-2">No history found</h3>
              <p className="text-text-secondary">
                No workout data found for {selectedExercise.name}. 
                Complete a workout with this exercise to see progress tracking.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Quick Exercise List */}
      {!selectedExercise && (
        <div className="card-primary border border-border-line rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">Your Exercises</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {userExercises.map((exerciseName) => (
              <button
                key={exerciseName}
                onClick={() => {
                  // Create a mock ExerciseOption for the search
                  const mockExercise: ExerciseOption = {
                    id: exerciseName.toLowerCase().replace(/\s+/g, '-'),
                    name: exerciseName,
                    category: 'strength',
                    equipment: [],
                    muscle_groups: []
                  }
                  handleExerciseSelect(mockExercise)
                }}
                className="p-3 text-left bg-bg-tertiary hover:bg-bg-secondary rounded-lg transition-colors"
              >
                <div className="font-medium text-text-primary">{exerciseName}</div>
                <div className="text-xs text-text-secondary">Click to view history</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
