import { useState } from 'react'
import { Edit2, Check, X, Trash2 } from 'lucide-react'
import { WorkoutSet } from '@/lib/workouts'
import { EXERCISE_DATABASE } from '@/lib/exercises'

interface WorkoutSetsProps {
  sets: WorkoutSet[]
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void
  onDeleteSet: (setId: string) => void
}

export const WorkoutSets = ({ sets, onUpdateSet, onDeleteSet }: WorkoutSetsProps) => {
  const [editingSet, setEditingSet] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<Partial<WorkoutSet>>({})

  const startEditing = (set: WorkoutSet) => {
    setEditingSet(set.id)
    setEditValues({
      weight: set.weight,
      reps: set.reps,
      rir: set.rir,
      duration: set.duration,
      notes: set.notes
    })
  }

  const saveEdit = async () => {
    if (editingSet) {
      try {
        // Update the local state immediately for better UX
        onUpdateSet(editingSet, editValues)
        
        // Save to database
        const { updateSet } = await import('@/lib/workouts')
        await updateSet(editingSet, editValues)
        
        setEditingSet(null)
        setEditValues({})
      } catch (error) {
        console.error('Failed to update set:', error)
        // You could add a toast notification here
      }
    }
  }

  const cancelEdit = () => {
    setEditingSet(null)
    setEditValues({})
  }

  const handleInputChange = (field: keyof WorkoutSet, value: string | number | undefined) => {
    setEditValues(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const isTimeBasedExercise = (exerciseName: string) => {
    const exercise = EXERCISE_DATABASE.find(e => e.name === exerciseName)
    return exercise?.isTimeBased || false
  }

  const handleDeleteSet = async (setId: string) => {
    try {
      // Delete from database first
      const { deleteSet } = await import('@/lib/workouts')
      await deleteSet(setId)
      
      // Then update local state
      onDeleteSet(setId)
    } catch (error) {
      console.error('Failed to delete set:', error)
      // You could add a toast notification here
    }
  }

  if (sets.length === 0) {
    return (
      <div className="text-center py-6 sm:py-8 text-gray-600">
        <p className="text-sm sm:text-base">No exercises added yet. Add your first exercise to get started!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 sm:space-y-4">
      {sets.map((set, index) => (
        <div key={set.id} className="bg-white border border-gray-200 rounded-lg p-3 sm:p-4">
          <div className="flex items-center justify-between mb-2 sm:mb-3">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="text-xs sm:text-sm font-medium text-gray-500">
                Set {index + 1}
              </span>
              <span className="text-sm sm:text-lg font-semibold text-gray-900">
                {set.exercise_name}
              </span>
            </div>
            <div className="flex items-center space-x-1 sm:space-x-2">
              <button
                onClick={() => startEditing(set)}
                className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors"
              >
                <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
              <button
                onClick={() => handleDeleteSet(set.id)}
                className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
              >
                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
              </button>
            </div>
          </div>

          {editingSet === set.id ? (
            // Edit Mode
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs text-gray-500 block mb-1">
                  Set {index + 1} - Weight (lbs)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={editValues.weight ?? ''}
                  onChange={(e) => {
                    const inputValue = e.target.value
                    if (inputValue === '') {
                      handleInputChange('weight', undefined)
                    } else {
                      const numValue = parseFloat(inputValue)
                      if (!isNaN(numValue)) {
                        handleInputChange('weight', numValue)
                      }
                    }
                  }}
                  placeholder="0"
                  className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-cyan-500 transition-colors text-gray-900"
                />
              </div>
              {isTimeBasedExercise(set.exercise_name) ? (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Duration (sec)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="600"
                    value={editValues.duration || 0}
                    onChange={(e) => handleInputChange('duration', parseInt(e.target.value) || 0)}
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-cyan-500 transition-colors text-gray-900"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editValues.reps || 0}
                    onChange={(e) => handleInputChange('reps', parseInt(e.target.value) || 0)}
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-cyan-500 transition-colors text-gray-900"
                  />
                </div>
              )}
              {!isTimeBasedExercise(set.exercise_name) && (
                <div>
                  <label className="text-xs text-gray-500 block mb-1">
                    RIR
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    value={editValues.rir || 0}
                    onChange={(e) => handleInputChange('rir', parseInt(e.target.value) || 0)}
                    className="w-full px-0 py-2 bg-transparent border-0 border-b-2 border-gray-200 focus:outline-none focus:border-cyan-500 transition-colors text-gray-900"
                  />
                </div>
              )}
              <div className="flex items-end gap-2 col-span-3">
                <button
                  onClick={saveEdit}
                  className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded-md transition-colors"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={cancelEdit}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ) : (
            // Display Mode
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
              <div>
                <span className="text-gray-500">Weight</span>
                <div className="font-medium text-gray-900">
                  {set.weight ? `${set.weight.toLocaleString()} lbs` : 'Bodyweight'}
                </div>
              </div>
              {isTimeBasedExercise(set.exercise_name) ? (
                <div>
                  <span className="text-gray-500">Duration</span>
                  <div className="font-medium text-gray-900">{set.duration ? `${set.duration}s` : '0s'}</div>
                </div>
              ) : (
                <div>
                  <span className="text-gray-500">Reps</span>
                  <div className="font-medium text-gray-900">{set.reps}</div>
                </div>
              )}
              {!isTimeBasedExercise(set.exercise_name) && (
                <div>
                  <span className="text-gray-500">RIR</span>
                  <div className="font-medium text-gray-900">{set.rir}</div>
                </div>
              )}
              <div className="col-span-2 sm:col-span-1">
                <span className="text-gray-500">Notes</span>
                <div className="font-medium text-gray-900">
                  {set.notes || 'No notes'}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
