import { useState } from 'react'
import { Plus, X, Save } from 'lucide-react'
import { CustomExercise } from '@/types'
import { createCustomExercise } from '@/lib/customExercises'
import { cn } from '@/lib/utils'
import { useAuth } from '@/contexts/AuthContext'

interface CustomExerciseFormProps {
  onSave: (exercise: CustomExercise) => void
  onCancel: () => void
  userId: string
}

export const CustomExerciseForm = ({ onSave, onCancel, userId }: CustomExerciseFormProps) => {
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    category: 'strength' as 'strength' | 'cardio' | 'flexibility' | 'bodyweight',
    equipment: [] as string[],
    muscleGroups: [] as string[],
    instructions: '',
    isTimeBased: false
  })
  const [isSaving, setIsSaving] = useState(false)
  const [equipmentInput, setEquipmentInput] = useState('')
  const [muscleGroupInput, setMuscleGroupInput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const categories = [
    { value: 'strength', label: 'Strength' },
    { value: 'cardio', label: 'Cardio' },
    { value: 'flexibility', label: 'Flexibility' },
    { value: 'bodyweight', label: 'Bodyweight' }
  ]

  const commonEquipment = [
    'barbell', 'dumbbell', 'kettlebell', 'cable_machine', 'bench', 'pull_up_bar',
    'treadmill', 'bike', 'rowing_machine', 'yoga_mat', 'resistance_bands'
  ]

  const commonMuscleGroups = [
    'chest', 'back', 'shoulders', 'biceps', 'triceps', 'abs', 'obliques',
    'quads', 'hamstrings', 'glutes', 'calves', 'forearms', 'traps', 'lats',
    'rhomboids', 'cardiovascular', 'full_body'
  ]

  const handleAddEquipment = () => {
    if (equipmentInput.trim() && !formData.equipment.includes(equipmentInput.trim())) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, equipmentInput.trim()]
      }))
      setEquipmentInput('')
    }
  }

  const handleRemoveEquipment = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter(e => e !== equipment)
    }))
  }

  const handleAddMuscleGroup = () => {
    if (muscleGroupInput.trim() && !formData.muscleGroups.includes(muscleGroupInput.trim())) {
      setFormData(prev => ({
        ...prev,
        muscleGroups: [...prev.muscleGroups, muscleGroupInput.trim()]
      }))
      setMuscleGroupInput('')
    }
  }

  const handleRemoveMuscleGroup = (muscleGroup: string) => {
    setFormData(prev => ({
      ...prev,
      muscleGroups: prev.muscleGroups.filter(m => m !== muscleGroup)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSaving(true)
    setError(null)
    try {
      console.log('Creating custom exercise with data:', {
        prop_user_id: userId,
        auth_user_id: user?.id,
        name: formData.name.trim(),
        category: formData.category,
        equipment: formData.equipment,
        muscle_groups: formData.muscleGroups,
        instructions: formData.instructions.trim() || undefined,
        is_time_based: formData.isTimeBased
      })

      // Use user ID from auth context instead of prop
      const currentUserId = user?.id || userId
      
      // Check if userId is valid
      if (!currentUserId || currentUserId.trim() === '') {
        throw new Error('User ID is missing. Please make sure you are logged in.')
      }

      console.log('Using user ID:', currentUserId)

      const newExercise = await createCustomExercise({
        user_id: currentUserId,
        name: formData.name.trim(),
        category: formData.category,
        equipment: formData.equipment,
        muscle_groups: formData.muscleGroups,
        instructions: formData.instructions.trim() || undefined,
        is_time_based: formData.isTimeBased
      })
      
      console.log('Custom exercise created successfully:', newExercise)
      onSave(newExercise)
    } catch (error) {
      console.error('Failed to create custom exercise:', error)
      setError(error instanceof Error ? error.message : 'Failed to create custom exercise')
    } finally {
      setIsSaving(false)
    }
  }

  const isValid = formData.name.trim().length > 0

  return (
    <div className="card-primary border border-border-line rounded-lg p-4 sm:p-6">
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <h3 className="text-base sm:text-lg font-semibold text-text-primary">Create Custom Exercise</h3>
        <button
          onClick={onCancel}
          className="text-text-secondary hover:text-text-primary"
        >
          <X className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Exercise Name */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Exercise Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter exercise name..."
            className="w-full px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base"
            required
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Category *
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
            className="w-full px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base"
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        {/* Equipment */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Equipment
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={equipmentInput}
              onChange={(e) => setEquipmentInput(e.target.value)}
              placeholder="Add equipment..."
              className="flex-1 px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEquipment())}
            />
            <button
              type="button"
              onClick={handleAddEquipment}
              className="px-3 py-2 bg-accent-primary text-bg-primary rounded-md hover:bg-accent-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {/* Common equipment suggestions */}
          <div className="flex flex-wrap gap-1 mb-2">
            {commonEquipment.map(equipment => (
              <button
                key={equipment}
                type="button"
                onClick={() => {
                  if (!formData.equipment.includes(equipment)) {
                    setFormData(prev => ({
                      ...prev,
                      equipment: [...prev.equipment, equipment]
                    }))
                  }
                }}
                className="px-2 py-1 text-xs bg-bg-tertiary text-text-secondary hover:text-text-primary rounded border border-border-line transition-colors"
                disabled={formData.equipment.includes(equipment)}
              >
                {equipment.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Selected equipment */}
          {formData.equipment.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.equipment.map(equipment => (
                <span
                  key={equipment}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent-primary/20 text-accent-primary rounded border border-accent-primary/30"
                >
                  {equipment.replace('_', ' ')}
                  <button
                    type="button"
                    onClick={() => handleRemoveEquipment(equipment)}
                    className="hover:text-accent-primary/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Muscle Groups */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Muscle Groups
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={muscleGroupInput}
              onChange={(e) => setMuscleGroupInput(e.target.value)}
              placeholder="Add muscle group..."
              className="flex-1 px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddMuscleGroup())}
            />
            <button
              type="button"
              onClick={handleAddMuscleGroup}
              className="px-3 py-2 bg-accent-primary text-bg-primary rounded-md hover:bg-accent-primary/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          
          {/* Common muscle group suggestions */}
          <div className="flex flex-wrap gap-1 mb-2">
            {commonMuscleGroups.map(muscleGroup => (
              <button
                key={muscleGroup}
                type="button"
                onClick={() => {
                  if (!formData.muscleGroups.includes(muscleGroup)) {
                    setFormData(prev => ({
                      ...prev,
                      muscleGroups: [...prev.muscleGroups, muscleGroup]
                    }))
                  }
                }}
                className="px-2 py-1 text-xs bg-bg-tertiary text-text-secondary hover:text-text-primary rounded border border-border-line transition-colors"
                disabled={formData.muscleGroups.includes(muscleGroup)}
              >
                {muscleGroup.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Selected muscle groups */}
          {formData.muscleGroups.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {formData.muscleGroups.map(muscleGroup => (
                <span
                  key={muscleGroup}
                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-accent-secondary/20 text-accent-secondary rounded border border-accent-secondary/30"
                >
                  {muscleGroup.replace('_', ' ')}
                  <button
                    type="button"
                    onClick={() => handleRemoveMuscleGroup(muscleGroup)}
                    className="hover:text-accent-secondary/70"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div>
          <label className="block text-sm font-medium text-text-primary mb-2">
            Instructions (Optional)
          </label>
          <textarea
            value={formData.instructions}
            onChange={(e) => setFormData(prev => ({ ...prev, instructions: e.target.value }))}
            placeholder="Add exercise instructions or notes..."
            rows={3}
            className="w-full px-3 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary text-sm sm:text-base resize-none"
          />
        </div>

        {/* Time-based toggle */}
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="isTimeBased"
            checked={formData.isTimeBased}
            onChange={(e) => setFormData(prev => ({ ...prev, isTimeBased: e.target.checked }))}
            className="rounded border-border-line text-accent-primary focus:ring-accent-primary"
          />
          <label htmlFor="isTimeBased" className="text-sm text-text-primary">
            Time-based exercise (e.g., planks, wall sits)
          </label>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

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
            disabled={!isValid || isSaving}
            className={cn(
              "px-4 py-2 text-sm font-medium text-bg-primary bg-accent-primary rounded-md transition-colors",
              isValid && !isSaving
                ? "hover:bg-accent-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent-primary" 
                : "opacity-50 cursor-not-allowed"
            )}
          >
            <Save className="inline h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Exercise'}
          </button>
        </div>
      </form>
    </div>
  )
}
