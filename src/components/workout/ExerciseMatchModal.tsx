import { useState, useEffect } from 'react'
import { CheckCircle, X, Bot, Lightbulb } from 'lucide-react'
import { matchCustomExercise } from '@/lib/ai'
import { createCustomExercise } from '@/lib/customExercises'
import { CustomExercise } from '@/types'
import { cn } from '@/lib/utils'

interface ExerciseMatchModalProps {
  customExercises: string[]
  userId: string
  onClose: () => void
  onExerciseCreated?: (exercise: CustomExercise) => void
}

interface ExerciseMatch {
  exerciseName: string
  matched: boolean
  suggested_exercise?: string
  confidence: number
  reason?: string
  isLoading: boolean
  isCreating: boolean
}

export const ExerciseMatchModal = ({ 
  customExercises, 
  userId, 
  onClose, 
  onExerciseCreated 
}: ExerciseMatchModalProps) => {
  const [matches, setMatches] = useState<ExerciseMatch[]>([])
  const [isProcessing, setIsProcessing] = useState(true)
  const [completedMatches, setCompletedMatches] = useState(0)

  useEffect(() => {
    const processExercises = async () => {
      if (customExercises.length === 0) {
        setIsProcessing(false)
        return
      }

      const initialMatches: ExerciseMatch[] = customExercises.map(name => ({
        exerciseName: name,
        matched: false,
        confidence: 0,
        isLoading: true,
        isCreating: false
      }))

      setMatches(initialMatches)

      // Process each exercise
      for (let i = 0; i < customExercises.length; i++) {
        const exerciseName = customExercises[i]
        
        try {
          const result = await matchCustomExercise(exerciseName)
          
          setMatches(prev => prev.map((match, index) => 
            index === i 
              ? { ...match, ...result, isLoading: false }
              : match
          ))
          
          setCompletedMatches(prev => prev + 1)
        } catch (error) {
          console.error(`Failed to match exercise ${exerciseName}:`, error)
          setMatches(prev => prev.map((match, index) => 
            index === i 
              ? { 
                  ...match, 
                  matched: false, 
                  confidence: 0, 
                  reason: 'Failed to analyze',
                  isLoading: false 
                }
              : match
          ))
          setCompletedMatches(prev => prev + 1)
        }
      }

      setIsProcessing(false)
    }

    processExercises()
  }, [customExercises])

  const handleCreateCustomExercise = async (exerciseName: string, index: number) => {
    setMatches(prev => prev.map((match, i) => 
      i === index ? { ...match, isCreating: true } : match
    ))

    try {
      const newExercise = await createCustomExercise({
        user_id: userId,
        name: exerciseName,
        category: 'strength', // Default category, user can edit later
        equipment: [],
        muscle_groups: [],
        is_time_based: false
      })

      onExerciseCreated?.(newExercise)
      
      setMatches(prev => prev.map((match, i) => 
        i === index ? { ...match, isCreating: false } : match
      ))
    } catch (error) {
      console.error('Failed to create custom exercise:', error)
      setMatches(prev => prev.map((match, i) => 
        i === index ? { ...match, isCreating: false } : match
      ))
    }
  }

  const handleAcceptMatch = async (suggestedExercise: string, _index: number) => {
    // For now, just close the modal. In a full implementation, you might want to
    // update the workout to use the suggested exercise instead of the custom one
    console.log(`User accepted match: ${suggestedExercise}`)
    onClose()
  }

  const allProcessed = completedMatches === customExercises.length

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="card-primary rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Bot className="h-6 w-6 text-accent-primary" />
            <h1 className="text-xl font-bold text-text-primary">Exercise Analysis</h1>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress */}
        {isProcessing && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-text-primary">Analyzing exercises...</span>
              <span className="text-sm text-text-secondary">{completedMatches}/{customExercises.length}</span>
            </div>
            <div className="w-full bg-bg-tertiary rounded-full h-2">
              <div 
                className="bg-accent-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${(completedMatches / customExercises.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* Results */}
        <div className="space-y-4">
          {matches.map((match, index) => (
            <div key={index} className="card-primary border border-border-line rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-medium text-text-primary mb-1">{match.exerciseName}</h3>
                  {match.isLoading && (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-accent-primary"></div>
                      <span className="text-sm text-text-secondary">Analyzing...</span>
                    </div>
                  )}
                </div>
              </div>

              {!match.isLoading && (
                <div className="space-y-3">
                  {match.matched && match.confidence > 0.7 ? (
                    <div className="bg-success/10 border border-success/20 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="h-5 w-5 text-success mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-success mb-1">
                            Match Found! ({Math.round(match.confidence * 100)}% confidence)
                          </p>
                          <p className="text-sm text-text-primary mb-2">
                            Suggested: <span className="font-medium">{match.suggested_exercise}</span>
                          </p>
                          {match.reason && (
                            <p className="text-xs text-text-secondary mb-3">{match.reason}</p>
                          )}
                          <button
                            onClick={() => handleAcceptMatch(match.suggested_exercise!, index)}
                            className="px-3 py-1 text-xs bg-success text-white rounded hover:bg-success/90 transition-colors"
                          >
                            Use Suggested Exercise
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-accent-primary/10 border border-accent-primary/20 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <Lightbulb className="h-5 w-5 text-accent-primary mt-0.5" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-accent-primary mb-1">
                            No Match Found
                          </p>
                          {match.reason && (
                            <p className="text-xs text-text-secondary mb-3">{match.reason}</p>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleCreateCustomExercise(match.exerciseName, index)}
                              disabled={match.isCreating}
                              className={cn(
                                "px-3 py-1 text-xs rounded transition-colors",
                                match.isCreating
                                  ? "bg-bg-tertiary text-text-secondary cursor-not-allowed"
                                  : "bg-accent-primary text-white hover:bg-accent-primary/90"
                              )}
                            >
                              {match.isCreating ? 'Creating...' : 'Create Custom Exercise'}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary */}
        {allProcessed && (
          <div className="mt-6 p-4 bg-bg-tertiary rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Bot className="h-5 w-5 text-accent-primary" />
              <h3 className="font-medium text-text-primary">Analysis Complete</h3>
            </div>
            <p className="text-sm text-text-secondary">
              We've analyzed your custom exercises and provided suggestions. You can accept matches to use standard exercises or create custom exercises for unique movements.
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border-line rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
