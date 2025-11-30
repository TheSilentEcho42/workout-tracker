import { useState } from 'react'
import { Plus, X, Wrench } from 'lucide-react'
import { ExerciseOption } from '@/lib/exercises'
import { ExerciseSearch } from './ExerciseSearch'
import { CustomExerciseForm } from './CustomExerciseForm'
import { CustomExercise } from '@/types'
import { cn } from '@/lib/utils'

interface AddExerciseFormProps {
  onAddExercise: (exercise: ExerciseOption, sets: number, reps: number, rir: number, weight?: number, duration?: number) => void
  onCancel: () => void
  userId: string
}

export const AddExerciseForm = ({ onAddExercise, onCancel, userId }: AddExerciseFormProps) => {
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null)
  const [sets, setSets] = useState(3)
  const [reps, setReps] = useState(10)
  const [duration, setDuration] = useState(30) // seconds for time-based exercises
  const [weight, setWeight] = useState<number | undefined>(undefined)
  const [rir, setRir] = useState(2)
  const [showWeight, setShowWeight] = useState(true)
  const [showRir, setShowRir] = useState(true)
  const [showCustomForm, setShowCustomForm] = useState(false)

  const handleExerciseSelect = (exercise: ExerciseOption) => {
    setSelectedExercise(exercise)
    // Auto-hide weight for bodyweight exercises
    setShowWeight(exercise.category !== 'bodyweight' && exercise.equipment.length > 0)
    // Auto-hide RIR for time-based exercises
    setShowRir(!exercise.isTimeBased)
  }

  const handleCustomExerciseSave = (customExercise: CustomExercise) => {
    // Convert custom exercise to ExerciseOption format
    const exerciseOption: ExerciseOption = {
      id: customExercise.id,
      name: customExercise.name,
      category: customExercise.category,
      equipment: customExercise.equipment,
      muscle_groups: customExercise.muscle_groups,
      instructions: customExercise.instructions,
      isTimeBased: customExercise.is_time_based
    }
    
    setSelectedExercise(exerciseOption)
    setShowWeight(exerciseOption.category !== 'bodyweight' && exerciseOption.equipment.length > 0)
    setShowRir(!exerciseOption.isTimeBased)
    setShowCustomForm(false)
    
    // Show success message
    console.log('Custom exercise saved successfully:', customExercise.name)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedExercise) return

    if (selectedExercise.isTimeBased) {
      onAddExercise(selectedExercise, sets, 0, 0, weight, duration)
    } else {
      onAddExercise(selectedExercise, sets, reps, rir, weight)
    }
    onCancel()
  }

  const isValid = selectedExercise && sets > 0 && 
    (selectedExercise.isTimeBased ? duration > 0 : reps > 0 && rir >= 0)

  return (
    <div className="card-primary border border-border-line rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary">Add Exercise</h3>
        <button
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      {showCustomForm ? (
        <CustomExerciseForm
          onSave={handleCustomExerciseSave}
          onCancel={() => setShowCustomForm(false)}
          userId={userId}
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
          {/* Exercise Search */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-text-primary">
                Exercise
              </label>
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="flex items-center gap-1 text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
              >
                <Wrench className="h-3 w-3" />
                Create Custom
              </button>
            </div>
            <ExerciseSearch
              onExerciseSelect={handleExerciseSelect}
              placeholder="Search for an exercise..."
            />
            {selectedExercise && (
              <div className="mt-2 p-2 bg-bg-tertiary rounded text-xs sm:text-sm text-text-secondary">
                <span className="font-medium">{selectedExercise.name}</span>
                <span className="ml-2">• {selectedExercise.category}</span>
                {selectedExercise.muscle_groups.length > 0 && (
                  <span className="ml-2">• {selectedExercise.muscle_groups.join(', ')}</span>
                )}
                {selectedExercise.isTimeBased && (
                  <span className="ml-2">• Time-based</span>
                )}
                {selectedExercise.weightConversion && (
                    <div className="mt-1 text-xs text-text-secondary">
                    💡 {selectedExercise.weightConversion.note}
                  </div>
                )}
              </div>
            )}
          </div>

        {/* Exercise Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Sets
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={sets}
              onChange={(e) => setSets(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base"
            />
          </div>

          {selectedExercise?.isTimeBased ? (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Duration (seconds)
              </label>
              <input
                type="number"
                min="1"
                max="600"
                value={duration}
                onChange={(e) => setDuration(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base"
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Reps
              </label>
              <input
                type="number"
                min="1"
                max="100"
                value={reps}
                onChange={(e) => setReps(parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base"
              />
            </div>
          )}
        </div>

        {/* Weight and RIR */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
          {showWeight && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Weight (lbs)
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={weight || ''}
                onChange={(e) => setWeight(e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder="0"
                className="w-full px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base"
              />
            </div>
          )}

          {showRir && (
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                RIR (Reps in Reserve)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                value={rir}
                onChange={(e) => setRir(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base"
              />
              <p className="text-xs text-text-secondary mt-1">
                How many more reps you could do
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary border border-border-line rounded-md hover:bg-bg-tertiary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!isValid}
            className={cn(
              "px-4 py-2 text-sm font-medium text-bg-primary bg-accent-primary rounded-md transition-colors",
              isValid 
                ? "hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary" 
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <Plus className="inline h-4 w-4 mr-2" />
            Add Exercise
          </button>
        </div>
        </form>
      )}
    </div>
  )
}
