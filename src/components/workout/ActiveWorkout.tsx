import { useState } from 'react'
import { Play, Plus, Save, Clock, Calendar, Bot } from 'lucide-react'
import { ExerciseOption } from '@/lib/exercises'
import { WorkoutSet, ActiveWorkout as ActiveWorkoutType, createWorkout, addExerciseToWorkout, completeWorkout } from '@/lib/workouts'
import { AddExerciseForm } from './AddExerciseForm'
import { WorkoutSets } from './WorkoutSets'
import { AIWorkoutChat } from './AIWorkoutChat'
import { WorkoutReview } from './WorkoutReview'
import { formatDate } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface ActiveWorkoutProps {
  onWorkoutComplete: () => void
}

export const ActiveWorkout = ({ onWorkoutComplete }: ActiveWorkoutProps) => {
  const { user } = useAuth()
  const [workout, setWorkout] = useState<ActiveWorkoutType | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [showAddExercise, setShowAddExercise] = useState(false)
  const [workoutName, setWorkoutName] = useState('')
  const [workoutDescription, setWorkoutDescription] = useState('')
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [showAIChat, setShowAIChat] = useState(false)
  const [showWorkoutReview, setShowWorkoutReview] = useState(false)

  const handleStartWorkout = async () => {
    if (!workoutName.trim()) return

    try {
      const newWorkout = await createWorkout({
        name: workoutName,
        description: workoutDescription,
        workout_date: new Date().toISOString().split('T')[0]
      })

      setWorkout(newWorkout)
      setIsCreating(false)
      setStartTime(new Date())
    } catch (error) {
      console.error('Failed to create workout:', error)
      // You could add a toast notification here
    }
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
    } catch (error) {
      console.error('Failed to add exercise:', error)
    }
  }

  const handleUpdateSet = async (setId: string, updates: Partial<WorkoutSet>) => {
    if (!workout) return

    setWorkout(prev => prev ? {
      ...prev,
      sets: prev.sets.map(set => 
        set.id === setId ? { ...set, ...updates } : set
      )
    } : null)

    // In a real app, you'd save this to the database
    // await updateSet(setId, updates)
  }

  const handleDeleteSet = (setId: string) => {
    if (!workout) return

    setWorkout(prev => prev ? {
      ...prev,
      sets: prev.sets.filter(set => set.id !== setId)
    } : null)
  }

  const handleCompleteWorkout = async () => {
    if (!workout) return

    try {
      await completeWorkout(workout.id)
      setShowWorkoutReview(true)
    } catch (error) {
      console.error('Failed to complete workout:', error)
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

  const getWorkoutDuration = () => {
    if (!startTime) return '0:00'
    const duration = Date.now() - startTime.getTime()
    const minutes = Math.floor(duration / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (!workout) {
    return (
      <div className="space-y-4 sm:space-y-6">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Start a New Workout</h2>
          <p className="text-gray-600 text-sm sm:text-base">Track your exercises and progress in real-time</p>
        </div>

        {!isCreating ? (
          <div className="text-center">
            <button
              onClick={() => setIsCreating(true)}
              className="px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium inline-flex items-center w-full sm:w-auto justify-center"
            >
              <Play className="h-5 w-5 sm:h-6 sm:w-6 mr-2" />
              Start Workout
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto">
            <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Workout Details</h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Workout Name
                  </label>
                  <input
                    type="text"
                    value={workoutName}
                    onChange={(e) => setWorkoutName(e.target.value)}
                    placeholder="e.g., Upper Body Strength"
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-cyan-500 transition-colors placeholder:text-gray-400 text-gray-900 text-sm sm:text-base"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-sm font-medium text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    value={workoutDescription}
                    onChange={(e) => setWorkoutDescription(e.target.value)}
                    placeholder="Any notes about this workout..."
                    rows={3}
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-cyan-500 transition-colors resize-none placeholder:text-gray-400 text-gray-900 text-sm sm:text-base"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <button
                    onClick={handleStartWorkout}
                    disabled={!workoutName.trim()}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium flex-1 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
                  >
                    Start Workout
                  </button>
                  <button
                    onClick={() => setIsCreating(false)}
                    className="px-6 py-2.5 text-gray-700 rounded-md border-b-2 border-gray-300 hover:border-gray-900 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Workout Header */}
      <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
          <div>
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900">{workout.name}</h2>
            {workout.description && (
              <p className="text-gray-600 text-sm sm:text-base mt-1">{workout.description}</p>
            )}
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-4">
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500">Duration</div>
              <div className="text-sm sm:text-lg font-semibold text-gray-900 flex items-center">
                <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {getWorkoutDuration()}
              </div>
            </div>
            <div className="text-center">
              <div className="text-xs sm:text-sm text-gray-500">Date</div>
              <div className="text-sm sm:text-lg font-semibold text-gray-900 flex items-center">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                {formatDate(workout.workout_date)}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="text-xs sm:text-sm text-gray-600">
            {workout.sets.length} sets • {workout.sets.reduce((total, set) => total + set.reps, 0)} total reps
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <button
              onClick={() => setShowAIChat(true)}
              className="px-6 py-2.5 text-cyan-600 rounded-md border-b-2 border-transparent hover:border-cyan-500 transition-colors font-medium inline-flex items-center justify-center text-xs sm:text-sm"
            >
              <Bot className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">AI Assistant</span>
              <span className="sm:hidden">AI</span>
            </button>
            <button
              onClick={() => setShowAddExercise(true)}
              className="px-6 py-2.5 text-cyan-600 rounded-md border-b-2 border-transparent hover:border-cyan-500 transition-colors font-medium inline-flex items-center justify-center text-xs sm:text-sm"
            >
              <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Add Exercise</span>
              <span className="sm:hidden">Add</span>
            </button>
            <button
              onClick={handleCompleteWorkout}
              className="px-6 py-2.5 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors font-medium inline-flex items-center justify-center text-xs sm:text-sm ml-auto"
            >
              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">Complete Workout</span>
              <span className="sm:hidden">Complete</span>
            </button>
          </div>
        </div>
      </div>

      {/* Add Exercise Form */}
      {showAddExercise && (
        <AddExerciseForm
          onAddExercise={handleAddExercise}
          onCancel={() => setShowAddExercise(false)}
          userId={user?.id || ''}
        />
      )}

      {/* Workout Sets */}
      <div>
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Exercises</h3>
        <WorkoutSets
          sets={workout.sets}
          onUpdateSet={handleUpdateSet}
          onDeleteSet={handleDeleteSet}
        />
      </div>

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
          duration={startTime ? Math.floor((Date.now() - startTime.getTime()) / 60000) : 0}
          onClose={handleWorkoutReviewClose}
        />
      )}
    </div>
  )
}
