import { useState, useEffect } from 'react'
import { Play, Check, ArrowLeft, Timer, Plus, X, MessageSquare, Clock, Dumbbell, TrendingUp } from 'lucide-react'
import { WorkoutDay, setLastCompletedWorkout } from '@/lib/workoutPlans'
import { ExerciseOption, EXERCISE_DATABASE } from '@/lib/exercises'
import { createWorkout, addExerciseToWorkout, completeWorkout, updateSet, deleteSet, addSet } from '@/lib/workouts'
import { ActiveWorkout as ActiveWorkoutType, WorkoutSet } from '@/lib/workouts'
import { AddExerciseForm } from './AddExerciseForm'
import { AIWorkoutChat } from './AIWorkoutChat'
import { WorkoutReview } from './WorkoutReview'
import { useAuth } from '@/contexts/AuthContext'

interface ExerciseData {
  id: string
  name: string
  completed: boolean
  sets: WorkoutSet[]
}

interface PlannedWorkoutProps {
  workoutDay: WorkoutDay
  onBack: () => void
  onWorkoutComplete: () => void
}

export const PlannedWorkout = ({ workoutDay, onBack, onWorkoutComplete }: PlannedWorkoutProps) => {
  const { user } = useAuth()
  const [workout, setWorkout] = useState<ActiveWorkoutType | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [exercises, setExercises] = useState<ExerciseOption[]>([])
  const [startTime, setStartTime] = useState<number | null>(null)
  const [duration, setDuration] = useState('00:00')
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([])
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [showAIChat, setShowAIChat] = useState(false)
  const [showWorkoutReview, setShowWorkoutReview] = useState(false)

  useEffect(() => {
    // Load exercises from the database
    setExercises(EXERCISE_DATABASE)
  }, [])

  // Update duration timer
  useEffect(() => {
    if (!startTime) return

    const timer = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000)
      const minutes = Math.floor(elapsed / 60)
      const seconds = elapsed % 60
      setDuration(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }, 1000)

    return () => clearInterval(timer)
  }, [startTime])

  // Update exercise data when workout sets change
  useEffect(() => {
    if (!workout || !workout.sets.length) {
      setExerciseData([])
      return
    }

    // Group sets by exercise name
    const grouped = workout.sets.reduce((acc, set) => {
      if (!acc[set.exercise_name]) {
        acc[set.exercise_name] = {
          id: set.exercise_name,
          name: set.exercise_name,
          completed: false,
          sets: []
        }
      }
      acc[set.exercise_name].sets.push(set)
      return acc
    }, {} as Record<string, ExerciseData>)

    setExerciseData(Object.values(grouped))
  }, [workout?.sets])

  const handleStartPlannedWorkout = async () => {
    setIsLoading(true)
    try {
      // Create the workout
      const newWorkout = await createWorkout({
        name: `${workoutDay.day} - ${workoutDay.focus}`,
        description: `Planned workout: ${workoutDay.focus}`,
        workout_date: new Date().toISOString().split('T')[0]
      })

      setWorkout(newWorkout)
      setStartTime(Date.now())

      // Add exercises from the plan
      const workoutSets: WorkoutSet[] = []
      
      for (const exerciseName of workoutDay.exercises) {
        // Find the exercise in our database
        const exercise = exercises.find(e => 
          e.name.toLowerCase().includes(exerciseName.toLowerCase()) ||
          exerciseName.toLowerCase().includes(e.name.toLowerCase())
        )

        if (exercise) {
          try {
            const newSets = await addExerciseToWorkout({
              workout_id: newWorkout.id,
              exercise,
              sets: 3, // Default sets
              reps: 10, // Default reps
              weight: 0, // No weight initially
              rir: 2 // Default RIR
            })
            workoutSets.push(...newSets)
          } catch (error) {
            console.error(`Failed to add exercise ${exerciseName}:`, error)
          }
        } else {
          // Create a mock exercise if not found in database
          console.warn(`Exercise "${exerciseName}" not found in database, creating mock exercise`)
          const mockExercise: ExerciseOption = {
            id: `mock_${exerciseName.toLowerCase().replace(/\s+/g, '_')}`,
            name: exerciseName,
            category: 'strength',
            equipment: [],
            muscle_groups: []
          }
          
          try {
            const newSets = await addExerciseToWorkout({
              workout_id: newWorkout.id,
              exercise: mockExercise,
              sets: 3,
              reps: 10,
              weight: 0,
              rir: 2
            })
            workoutSets.push(...newSets)
          } catch (error) {
            console.error(`Failed to add mock exercise ${exerciseName}:`, error)
          }
        }
      }

      setWorkout(prev => prev ? {
        ...prev,
        sets: workoutSets
      } : null)

    } catch (error) {
      console.error('Failed to start planned workout:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateSet = async (setId: string, field: keyof WorkoutSet, value: number) => {
    if (!workout) return

    // Validate the value before proceeding
    if (field === 'weight' && (isNaN(value) || value < 0)) {
      console.error('Invalid weight value:', value)
      return
    }
    if (field === 'reps' && (isNaN(value) || value < 0)) {
      console.error('Invalid reps value:', value)
      return
    }
    if (field === 'rir' && (isNaN(value) || value < 0 || value > 5)) {
      console.error('Invalid RIR value:', value)
      return
    }

    // Find the set directly by ID to avoid any index/ordering issues
    const set = workout.sets.find(s => s.id === setId)
    
    if (!set) {
      console.error('Set not found by ID:', setId)
      return
    }

    const updates: Partial<WorkoutSet> = { [field]: value }

    console.log(`Updating set ${setId} field ${field} to value:`, value, 'Current value:', set[field])

    // Update local state immediately using functional update to avoid stale closures
    setWorkout(prev => {
      if (!prev) return null
      
      // Find the set by ID to ensure we're updating the correct set
      const setToUpdate = prev.sets.find(s => s.id === setId)
      if (!setToUpdate) {
        console.error('Set not found by ID in state:', setId)
        return prev
      }
      
      return {
        ...prev,
        sets: prev.sets.map(s => 
          s.id === setId ? { ...s, ...updates } : s
        )
      }
    })

    // Save the update to the database (don't await to avoid blocking)
    updateSet(setId, updates).catch(error => {
      console.error('Failed to update set:', error)
    })
  }

  // Wrapper function to match ExerciseCard's expected signature
  const handleUpdateSetWrapper = (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: number) => {
    if (!workout) return
    
    // Find the exercise's sets
    const exerciseSets = workout.sets.filter(s => s.exercise_name === exerciseId)
    const set = exerciseSets[setIndex]
    
    if (!set) {
      console.error('Set not found by exerciseId and setIndex:', exerciseId, setIndex)
      return
    }
    
    // Call the actual handler with the set ID
    handleUpdateSet(set.id, field, value)
  }

  const handleAddSet = async (exerciseId: string) => {
    if (!workout) return

    const exercise = exerciseData.find(e => e.id === exerciseId)
    if (!exercise || exercise.completed) return

    const lastSet = exercise.sets[exercise.sets.length - 1]
    if (!lastSet) return

    try {
      // Find the exercise in the database
      const exerciseOption = exercises.find(e => e.name === exerciseId) || EXERCISE_DATABASE.find(e => e.name === exerciseId)
      if (!exerciseOption) return

      const newSet = await addSet({
        workout_id: workout.id,
        exercise_name: exerciseId,
        exercise_id: exerciseOption.id,
        weight: lastSet.weight || 0,
        reps: lastSet.reps || 10,
        rir: lastSet.rir || 2,
        duration: lastSet.duration
      })

      setWorkout(prev => prev ? {
        ...prev,
        sets: [...prev.sets, newSet]
      } : null)
    } catch (error) {
      console.error('Failed to add set:', error)
    }
  }

  const toggleExerciseComplete = (exerciseId: string) => {
    setExerciseData(prev => prev.map(e => 
      e.id === exerciseId ? { ...e, completed: !e.completed } : e
    ))
  }

  const handleCompleteWorkout = async () => {
    if (!workout) return

    try {
      // Mark the workout as completed in the database
      await completeWorkout(workout.id)
      console.log('✅ Workout completed and saved to history:', workout.name)
      
      // Record this workout as the last completed for recommendations
      setLastCompletedWorkout(workout.name)
      
      // Show workout review
      setShowWorkoutReview(true)
    } catch (error) {
      console.error('Failed to complete workout:', error)
      // Still show review even if database save fails
      setShowWorkoutReview(true)
    }
  }

  const handleWorkoutReviewClose = () => {
    setShowWorkoutReview(false)
    onWorkoutComplete()
  }

  const getCurrentExercises = () => {
    if (!workout) return []
    return [...new Set(workout.sets.map(set => set.exercise_name))]
  }

  const handleAddExercise = async (exercise: ExerciseOption, sets: number, reps: number, rir: number, weight?: number, duration?: number) => {
    if (!workout) return

    try {
      const newSets = await addExerciseToWorkout({
        workout_id: workout.id,
        exercise,
        sets,
        reps,
        weight,
        rir,
        duration
      })

      setWorkout(prev => prev ? {
        ...prev,
        sets: [...prev.sets, ...newSets]
      } : null)
      
      setShowAddExercise(false)
    } catch (error) {
      console.error('Failed to add exercise:', error)
    }
  }

  const handleRemoveExercise = async (exerciseId: string) => {
    if (!workout) return

    if (!window.confirm('Remove this exercise from the workout?')) {
      return
    }

    try {
      // Delete all sets for this exercise from the database
      const exercise = exerciseData.find(e => e.id === exerciseId)
      if (exercise) {
        for (const set of exercise.sets) {
          await deleteSet(set.id)
        }
      }

      setWorkout(prev => prev ? {
        ...prev,
        sets: prev.sets.filter(set => set.exercise_name !== exerciseId)
      } : null)
    } catch (error) {
      console.error('Failed to remove exercise:', error)
    }
  }

  if (!workout) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {workoutDay.day} - {workoutDay.focus}
            </h1>
            <p className="text-gray-600">
              Ready to start your planned workout?
            </p>
          </div>

          <div className="space-y-4 mb-6">
            <h3 className="font-semibold text-gray-900">Planned Exercises:</h3>
            <div className="grid gap-2">
              {workoutDay.exercises.map((exercise, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-100 rounded-lg"
                >
                  <span className="text-gray-900">{exercise}</span>
                  <span className="text-sm text-gray-600">3 sets × 10 reps</span>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={handleStartPlannedWorkout}
            disabled={isLoading}
            className="w-full px-6 py-3 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center disabled:opacity-50 font-medium"
          >
            {isLoading ? (
              <>
                <Timer className="w-4 h-4 mr-2 animate-spin" />
                Starting Workout...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Start Planned Workout
              </>
            )}
          </button>
        </div>
      </div>
    )
  }

  // Calculate stats
  const completedExercises = exerciseData.filter(e => e.completed).length
  const totalSets = exerciseData.reduce((acc, e) => acc + e.sets.length, 0)
  const completedSets = exerciseData.filter(e => e.completed).reduce((acc, e) => acc + e.sets.length, 0)
  const totalVolume = exerciseData.reduce((acc, e) => 
    acc + e.sets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0), 0
  )
  const totalReps = exerciseData.reduce((acc, e) => 
    acc + e.sets.reduce((sum, s) => sum + (s.reps || 0), 0), 0
  )

  // Show the active workout
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sticky Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          {/* Back Button */}
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
          
          {/* Workout Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{workout.name}</h1>
              <p className="text-sm text-gray-600">{workout.description || 'Planned workout'}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-gray-600 mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-sm font-medium">{duration}</span>
              </div>
              <div className="text-xs text-gray-500">
                Started {startTime ? new Date(startTime).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : ''}
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          {exerciseData.length > 0 && (
            <div className="mb-4">
              <div className="flex justify-between text-xs text-gray-600 mb-2">
                <span>{completedExercises} of {exerciseData.length} exercises</span>
                <span>{completedSets} of {totalSets} sets</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-cyan-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              onClick={() => setShowAIChat(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors text-sm font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              AI Assistant
            </button>
            <button 
              onClick={() => setShowAddExercise(true)}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Exercise
            </button>
            <button 
              onClick={handleCompleteWorkout}
              className="sm:ml-auto px-6 py-2 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors font-medium text-sm"
            >
              Complete Workout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Add Exercise Form */}
        {showAddExercise && (
          <div className="mb-6">
            <AddExerciseForm
              onAddExercise={handleAddExercise}
              onCancel={() => setShowAddExercise(false)}
              userId={user?.id || ''}
            />
          </div>
        )}

        {/* Exercise Cards */}
        <div className="space-y-4">
          {exerciseData.map((exercise, exerciseIndex) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              exerciseIndex={exerciseIndex}
              onToggleComplete={toggleExerciseComplete}
              onUpdateSet={handleUpdateSetWrapper}
              onAddSet={handleAddSet}
              onRemove={handleRemoveExercise}
            />
          ))}

          {exerciseData.length === 0 && (
            <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
              <p className="text-gray-500 mb-4">No exercises in this workout yet</p>
              <button 
                onClick={() => setShowAddExercise(true)}
                className="px-6 py-2.5 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors font-medium"
              >
                Add Exercise
              </button>
            </div>
          )}
        </div>

        {/* Summary Stats */}
        {exerciseData.length > 0 && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Total Volume</div>
              <div className="text-2xl font-bold text-gray-900">{totalVolume.toLocaleString()} lbs</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Total Sets</div>
              <div className="text-2xl font-bold text-gray-900">{totalSets}</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="text-xs text-gray-500 mb-1">Total Reps</div>
              <div className="text-2xl font-bold text-gray-900">{totalReps}</div>
            </div>
          </div>
        )}
      </main>

      {/* AI Chat Modal */}
      {showAIChat && (
        <AIWorkoutChat
          isOpen={showAIChat}
          onClose={() => setShowAIChat(false)}
          workoutName={workout.name}
          currentExercises={getCurrentExercises()}
        />
      )}

      {/* Workout Review Modal */}
      {showWorkoutReview && workout && (
        <WorkoutReview
          workoutId={workout.id}
          workoutName={workout.name}
          sets={workout.sets}
          duration={startTime ? Math.floor((Date.now() - startTime) / 60000) : 0}
          onClose={handleWorkoutReviewClose}
        />
      )}
    </div>
  )
}

// Exercise Card Sub-Component
interface ExerciseCardProps {
  exercise: ExerciseData
  exerciseIndex: number
  onToggleComplete: (exerciseId: string) => void
  onUpdateSet: (exerciseId: string, setIndex: number, field: keyof WorkoutSet, value: number) => void
  onAddSet: (exerciseId: string) => void
  onRemove: (exerciseId: string) => void
}

function ExerciseCard({ exercise, exerciseIndex, onToggleComplete, onUpdateSet, onAddSet, onRemove }: ExerciseCardProps) {
  const exerciseVolume = exercise.sets.reduce((acc, s) => acc + ((s.weight || 0) * (s.reps || 0)), 0)
  const avgRir = exercise.sets.length > 0 
    ? exercise.sets.reduce((acc, s) => acc + (s.rir || 0), 0) / exercise.sets.length 
    : 0

  return (
    <div 
      className={`bg-white rounded-lg border-2 transition-all ${
        exercise.completed 
          ? 'border-cyan-200 bg-cyan-50/30' 
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      {/* Exercise Header */}
      <div className="p-4 border-b border-gray-100 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
            exercise.completed 
              ? 'bg-cyan-500 text-white' 
              : 'bg-gray-100 text-gray-600'
          }`}>
            {exerciseIndex + 1}
          </div>
          <div>
            <h3 className="text-base font-semibold text-gray-900">{exercise.name}</h3>
            <p className="text-xs text-gray-500">{exercise.sets.length} sets</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onToggleComplete(exercise.id)}
            className={`p-2 rounded-md transition-all ${
              exercise.completed
                ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                : 'text-gray-400 hover:bg-cyan-50 hover:text-cyan-600'
            }`}
            title={exercise.completed ? 'Mark incomplete' : 'Mark complete'}
          >
            <Check className="w-5 h-5" />
          </button>
          <button 
            onClick={() => onRemove(exercise.id)}
            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Remove exercise"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Sets Table */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-3 mb-3 text-xs font-medium text-gray-500 uppercase">
          <div>Set</div>
          <div>Weight (lbs)</div>
          <div>Reps</div>
          <div>RIR</div>
        </div>
        
        {exercise.sets.map((set, setIndex) => (
          <div 
            key={set.id}
            className="grid grid-cols-4 gap-3 mb-3 items-center"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600">
                {setIndex + 1}
              </div>
            </div>
            
            <div className="relative">
              <input
                type="number"
                step="0.5"
                min="0"
                value={set.weight ?? ''}
                onChange={(e) => {
                  // Always read directly from the input element, never from state
                  const inputElement = e.target as HTMLInputElement
                  const rawValue = inputElement.value
                  
                  // Allow empty input
                  if (rawValue === '' || rawValue === null || rawValue === undefined) {
                    onUpdateSet(exercise.id, setIndex, 'weight', 0)
                    return
                  }
                  
                  // Parse the value directly from input
                  const numValue = parseFloat(rawValue)
                  
                  // Only update if we have a valid number
                  if (!isNaN(numValue) && isFinite(numValue)) {
                    onUpdateSet(exercise.id, setIndex, 'weight', numValue)
                  }
                }}
                onBlur={(e) => {
                  // Final validation on blur
                  const inputElement = e.target as HTMLInputElement
                  const rawValue = inputElement.value.trim()
                  
                  if (rawValue === '') {
                    onUpdateSet(exercise.id, setIndex, 'weight', 0)
                  } else {
                    const numValue = parseFloat(rawValue)
                    if (!isNaN(numValue) && isFinite(numValue)) {
                      onUpdateSet(exercise.id, setIndex, 'weight', numValue)
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-md focus:outline-none focus:border-cyan-500 focus:bg-white transition-all text-gray-900 font-medium"
                disabled={exercise.completed}
              />
            </div>
            
            <div className="relative">
              <input
                type="number"
                min="0"
                value={set.reps ?? ''}
                onChange={(e) => {
                  const inputValue = e.target.value.trim()
                  if (inputValue === '') {
                    onUpdateSet(exercise.id, setIndex, 'reps', 0)
                    return
                  }
                  const numValue = parseInt(inputValue, 10)
                  if (!isNaN(numValue) && isFinite(numValue)) {
                    onUpdateSet(exercise.id, setIndex, 'reps', numValue)
                  }
                }}
                onBlur={(e) => {
                  const inputValue = e.target.value.trim()
                  if (inputValue === '') {
                    onUpdateSet(exercise.id, setIndex, 'reps', 0)
                  } else {
                    const numValue = parseInt(inputValue, 10)
                    if (!isNaN(numValue) && isFinite(numValue)) {
                      onUpdateSet(exercise.id, setIndex, 'reps', numValue)
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-md focus:outline-none focus:border-cyan-500 focus:bg-white transition-all text-gray-900 font-medium"
                disabled={exercise.completed}
              />
            </div>
            
            <div className="relative">
              <input
                type="number"
                min="0"
                max="5"
                value={set.rir ?? ''}
                onChange={(e) => {
                  const inputValue = e.target.value
                  if (inputValue === '') {
                    onUpdateSet(exercise.id, setIndex, 'rir', 0)
                  } else {
                    const numValue = parseInt(inputValue, 10)
                    if (!isNaN(numValue)) {
                      onUpdateSet(exercise.id, setIndex, 'rir', numValue)
                    }
                  }
                }}
                className="w-full px-3 py-2 bg-gray-50 border-2 border-gray-200 rounded-md focus:outline-none focus:border-cyan-500 focus:bg-white transition-all text-gray-900 font-medium"
                disabled={exercise.completed}
              />
            </div>
          </div>
        ))}

        {/* Add Set Button */}
        {!exercise.completed && (
          <button 
            onClick={() => onAddSet(exercise.id)}
            className="w-full mt-2 py-2 text-sm text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors font-medium border-2 border-dashed border-gray-200 hover:border-cyan-200"
          >
            + Add Set
          </button>
        )}
      </div>

      {/* Quick Stats */}
      <div className="px-4 pb-4 flex gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-1">
          <Dumbbell className="w-3 h-3" />
          <span>Volume: {exerciseVolume.toLocaleString()} lbs</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="w-3 h-3" />
          <span>Avg RIR: {avgRir.toFixed(1)}</span>
        </div>
      </div>
    </div>
  )
}
