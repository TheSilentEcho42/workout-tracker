import { useState, useEffect } from 'react'
import { CheckCircle, Target, Clock, Bot } from 'lucide-react'
import { generateWorkoutSummary } from '@/lib/ai'
import { WorkoutSet, completeWorkoutWithSummary } from '@/lib/workouts'
import { ExerciseMatchModal } from './ExerciseMatchModal'
import { useAuth } from '@/contexts/AuthContext'

interface WorkoutReviewProps {
  workoutId: string
  workoutName: string
  sets: WorkoutSet[]
  duration: number
  onClose: () => void
}

interface WorkoutSummary {
  summary: string
  strengths: string[]
  improvements: string[]
  nextSteps: string[]
}

export const WorkoutReview = ({ 
  workoutId,
  workoutName, 
  sets, 
  duration, 
  onClose 
}: WorkoutReviewProps) => {
  const { user, isGuest } = useAuth()
  const [summary, setSummary] = useState<WorkoutSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [showExerciseMatch, setShowExerciseMatch] = useState(false)
  const [customExercises, setCustomExercises] = useState<string[]>([])

  useEffect(() => {
    const generateSummary = async () => {
      try {
        // Get unique exercises and their data
        const exerciseMap = new Map<string, { sets: number; weight?: number; reps: number; rir: number; duration?: number }>()
        
        sets.forEach(set => {
          const existing = exerciseMap.get(set.exercise_name)
          if (existing) {
            existing.sets += 1
            existing.weight = Math.max(existing.weight || 0, set.weight || 0)
            existing.reps = Math.max(existing.reps, set.reps)
            existing.rir = Math.max(existing.rir, set.rir)
            existing.duration = Math.max(existing.duration || 0, set.duration || 0)
          } else {
            exerciseMap.set(set.exercise_name, {
              sets: 1,
              weight: set.weight,
              reps: set.reps,
              rir: set.rir,
              duration: set.duration
            })
          }
        })

        const exercises = Array.from(exerciseMap.entries()).map(([name, data]) => ({
          name,
          ...data
        }))

        // Check for custom exercises (exercises with UUID-like IDs)
        const customExerciseNames = exercises
          .filter(ex => ex.name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i))
          .map(ex => ex.name)

        if (customExerciseNames.length > 0) {
          setCustomExercises(customExerciseNames)
          setShowExerciseMatch(true)
        }

        // Generate AI summary
        const aiSummary = await generateWorkoutSummary({
          workoutName,
          exercises,
          duration,
          totalSets: sets.length
        })

        setSummary(aiSummary)
      } catch (error) {
        console.error('Failed to generate summary:', error)
        setSummary({
          summary: "Great job completing your workout! You showed consistency and dedication.",
          strengths: ["Completed all planned exercises", "Maintained good form"],
          improvements: ["Consider tracking your progress more consistently"],
          nextSteps: ["Plan your next workout", "Focus on progressive overload"]
        })
      } finally {
        setIsLoading(false)
      }
    }

    generateSummary()
  }, [workoutName, sets, duration])

  const handleSaveSummary = async () => {
    if (!summary) return
    
    setIsSaving(true)
    try {
      await completeWorkoutWithSummary(
        workoutId,
        summary.summary,
        summary.strengths,
        summary.improvements,
        summary.nextSteps,
        duration
      )
      console.log('✅ Workout summary saved successfully')
      onClose()
    } catch (error) {
      console.error('Failed to save workout summary:', error)
      // Still close the modal even if saving fails
      onClose()
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
        <div className="card-primary rounded-lg p-8 max-w-2xl w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">Analyzing Your Workout</h2>
            <p className="text-text-secondary">Generating AI summary and muscle analysis...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
      <div className="card-primary rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <CheckCircle className="h-6 w-6 text-success" />
            <h1 className="text-2xl font-bold text-text-primary">Workout Complete!</h1>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Workout Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="card-primary border border-border-line rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-accent-primary" />
              <span className="text-sm font-medium text-text-primary">Duration</span>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-1">{duration} min</p>
          </div>
          
          <div className="card-primary border border-border-line rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5 text-accent-primary" />
              <span className="text-sm font-medium text-text-primary">Total Sets</span>
            </div>
            <p className="text-2xl font-bold text-text-primary mt-1">{sets.length}</p>
          </div>
        </div>

        {/* AI Summary */}
        <div className="card-primary border border-border-line rounded-lg p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Bot className="h-5 w-5 text-accent-primary" />
            <h2 className="text-lg font-semibold text-text-primary">AI Workout Analysis</h2>
          </div>
            
            {summary && (
              <div className="space-y-4">
                {/* Summary */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">Summary</h3>
                  <p className="text-sm text-text-secondary">{summary.summary}</p>
                </div>

                {/* Strengths */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">What You Did Well</h3>
                  <ul className="space-y-1">
                    {summary.strengths.map((strength, index) => (
                      <li key={index} className="text-sm text-text-secondary flex items-start">
                        <span className="text-success mr-2">✓</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">Areas for Improvement</h3>
                  <ul className="space-y-1">
                    {summary.improvements.map((improvement, index) => (
                      <li key={index} className="text-sm text-text-secondary flex items-start">
                        <span className="text-accent-primary mr-2">→</span>
                        {improvement}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Next Steps */}
                <div>
                  <h3 className="text-sm font-medium text-text-primary mb-2">Next Steps</h3>
                  <ul className="space-y-1">
                    {summary.nextSteps.map((step, index) => (
                      <li key={index} className="text-sm text-text-secondary flex items-start">
                        <span className="text-accent-secondary mr-2">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-6 py-2 border border-border-line rounded-lg hover:bg-bg-tertiary transition-colors"
          >
            Close
          </button>
          <button
            onClick={handleSaveSummary}
            disabled={isSaving || !summary}
            className="px-6 py-2 bg-accent-primary text-bg-primary rounded-lg hover:bg-accent-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSaving ? 'Saving...' : 'Save Summary'}
          </button>
        </div>
      </div>

      {/* Exercise Match Modal */}
      {showExerciseMatch && (user || isGuest) && (
        <ExerciseMatchModal
          customExercises={customExercises}
          userId={user?.id || 'guest'}
          onClose={() => setShowExerciseMatch(false)}
        />
      )}
    </div>
  )
}
