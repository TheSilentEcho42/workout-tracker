import { useState } from 'react'
import { ArrowLeft, Calendar, Target, Dumbbell, Save, MessageSquare, CheckCircle, Play, Loader2, Star, HelpCircle, X } from 'lucide-react'
import { processWorkoutFeedback, UserProfile, generateFollowUpQuestions, AIResponse } from '@/lib/ai'
import { saveWorkoutPlan, SavedWorkoutPlan } from '@/lib/workoutPlans'
import { useNavigate } from 'react-router-dom'

interface WorkoutDay {
  day: string
  focus: string
  exercises: string[]
  is_rest: boolean
}

interface WorkoutPlan {
  id: string
  name: string
  description: string
  split_type: string
  days_per_week: number
  workouts: WorkoutDay[]
}

interface WorkoutPlanDetailsProps {
  plan: WorkoutPlan
  onBack: () => void
  userProfile: UserProfile | null
}

export const WorkoutPlanDetails = ({ plan, onBack, userProfile }: WorkoutPlanDetailsProps) => {
  const navigate = useNavigate()
  const [feedback, setFeedback] = useState('')
  const [showFeedback, setShowFeedback] = useState(false)
  const [adjustedPlan, setAdjustedPlan] = useState<WorkoutPlan>(plan)
  const [isAdjusting, setIsAdjusting] = useState(false)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  
  // AI Questions state
  const [showAIQuestions, setShowAIQuestions] = useState(false)
  const [aiQuestions, setAiQuestions] = useState<string[]>([])
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({})
  const [isGeneratingQuestions, setIsGeneratingQuestions] = useState(false)
  const [questionsError, setQuestionsError] = useState<string | null>(null)

  const handleGenerateAIQuestions = async () => {
    if (!userProfile) return

    setIsGeneratingQuestions(true)
    setQuestionsError(null)

    try {
      const aiResponse: AIResponse = await generateFollowUpQuestions(userProfile)
      
      if (aiResponse.success) {
        setAiQuestions(aiResponse.data)
        setShowAIQuestions(true)
        if (aiResponse.tokenUsage) {
          console.log(`AI Questions Generated - Cost: $${aiResponse.tokenUsage.estimatedCost.toFixed(4)}`)
        }
      } else {
        setQuestionsError(aiResponse.error || 'Failed to generate AI questions')
        // Fallback to basic questions
        const fallbackQuestions = [
          "What specific exercises would you like to modify?",
          "Are there any muscle groups you'd like to focus more on?",
          "Do you have any equipment limitations or preferences?",
          "What's your preferred workout intensity level?"
        ]
        setAiQuestions(fallbackQuestions)
        setShowAIQuestions(true)
      }
    } catch (error) {
      setQuestionsError('Failed to connect to AI service')
      // Fallback to basic questions
      const fallbackQuestions = [
        "What specific exercises would you like to modify?",
        "Are there any muscle groups you'd like to focus more on?",
        "Do you have any equipment limitations or preferences?",
        "What's your preferred workout intensity level?"
      ]
      setAiQuestions(fallbackQuestions)
      setShowAIQuestions(true)
    } finally {
      setIsGeneratingQuestions(false)
    }
  }

  const handleAnswerChange = (question: string, answer: string) => {
    setAiAnswers(prev => ({ ...prev, [question]: answer }))
  }

  const canSubmitQuestions = () => {
    return aiQuestions.every(question => aiAnswers[question] && aiAnswers[question].trim().length > 0)
  }

  const handleSubmitQuestions = async () => {
    if (!canSubmitQuestions() || !userProfile) return

    setIsAdjusting(true)
    setAiError(null)

    try {
      // Use the answers to generate a more personalized plan
      const feedbackText = Object.entries(aiAnswers)
        .map(([question, answer]) => `${question}: ${answer}`)
        .join('\n')

      const aiResponse = await processWorkoutFeedback(plan, feedbackText, userProfile)

      if (aiResponse.success) {
        const newPlan = aiResponse.data
        newPlan.id = `questions_adjusted_${Date.now()}`
        setAdjustedPlan(newPlan)
        setShowAIQuestions(false)
        setAiAnswers({})
        if (aiResponse.tokenUsage) {
          console.log(`Plan Adjusted via AI Questions - Cost: $${aiResponse.tokenUsage.estimatedCost.toFixed(4)}`)
        }
      } else {
        setAiError(aiResponse.error || 'Failed to process questions with AI')
        const fallbackPlan = generateFallbackAdjustment(plan, feedbackText)
        setAdjustedPlan(fallbackPlan)
        setShowAIQuestions(false)
        setAiAnswers({})
      }
    } catch (error) {
      setAiError('Failed to connect to AI service')
      const feedbackText = Object.entries(aiAnswers)
        .map(([question, answer]) => `${question}: ${answer}`)
        .join('\n')
      const fallbackPlan = generateFallbackAdjustment(plan, feedbackText)
      setAdjustedPlan(fallbackPlan)
      setShowAIQuestions(false)
      setAiAnswers({})
    } finally {
      setIsAdjusting(false)
    }
  }

  const handleFeedbackSubmit = async () => {
    if (!feedback.trim() || !userProfile) return

    setIsAdjusting(true)
    setAiError(null)

    try {
      const aiResponse = await processWorkoutFeedback(plan, feedback, userProfile)

      if (aiResponse.success) {
        const newPlan = aiResponse.data
        newPlan.id = `adjusted_${Date.now()}` // Ensure unique ID for re-render
        setAdjustedPlan(newPlan)
        setShowFeedback(false)
        setFeedback('')
        if (aiResponse.tokenUsage) {
          console.log(`Plan Adjusted via AI - Cost: $${aiResponse.tokenUsage.estimatedCost.toFixed(4)}`)
        }
      } else {
        setAiError(aiResponse.error || 'Failed to process feedback with AI')
        const fallbackPlan = generateFallbackAdjustment(plan, feedback)
        setAdjustedPlan(fallbackPlan)
        setShowFeedback(false)
        setFeedback('')
      }
    } catch (error) {
      setAiError('Failed to connect to AI service')
      const fallbackPlan = generateFallbackAdjustment(plan, feedback)
      setAdjustedPlan(fallbackPlan)
      setShowFeedback(false)
      setFeedback('')
    } finally {
      setIsAdjusting(false)
    }
  }

  const handleSavePlan = async () => {
    if (!userProfile) return

    setIsSaving(true)
    try {
      // Convert the plan to the format expected by the workout plan service
      const planToSave: SavedWorkoutPlan = {
        id: adjustedPlan.id,
        name: adjustedPlan.name,
        description: adjustedPlan.description,
        split_type: adjustedPlan.split_type,
        days_per_week: adjustedPlan.days_per_week,
        workouts: adjustedPlan.workouts,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      }

      saveWorkoutPlan(planToSave)
      
      // Show success message and redirect to workout plans page
      alert('Workout plan saved successfully! You can now view and manage it from the Workout Plans page.')
      navigate('/workout-plans')
    } catch (error) {
      console.error('Failed to save plan:', error)
      alert('Failed to save workout plan. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleStartWorkout = () => {
    // Navigate to dashboard to use the new StartWorkoutModal
    navigate('/dashboard')
  }

  // Fallback adjustment function if AI fails
  const generateFallbackAdjustment = (originalPlan: WorkoutPlan, userFeedback: string): WorkoutPlan => {
    const newPlan = JSON.parse(JSON.stringify(originalPlan))
    const feedbackLower = userFeedback.toLowerCase()

    if (feedbackLower.includes('more volume') || feedbackLower.includes('more exercises')) {
      newPlan.workouts = newPlan.workouts.map((workout: WorkoutDay) => ({
        ...workout,
        exercises: workout.is_rest ? [] : [...workout.exercises, 'Additional Exercise 1', 'Additional Exercise 2']
      }))
      newPlan.description += ' (Adjusted for higher volume)'
    }

    if (feedbackLower.includes('less volume') || feedbackLower.includes('fewer exercises')) {
      newPlan.workouts = newPlan.workouts.map((workout: WorkoutDay) => ({
        ...workout,
        exercises: workout.is_rest ? [] : workout.exercises.slice(0, Math.max(2, workout.exercises.length - 2))
      }))
      newPlan.description += ' (Adjusted for lower volume)'
    }

    newPlan.id = `fallback_adjusted_${Date.now()}`
    return newPlan
  }

  const getSplitIcon = (splitType: string) => {
    switch (splitType) {
      case 'push_pull_legs':
        return <div className="w-12 h-12 bg-accent-secondary rounded-full flex items-center justify-center text-white text-lg font-bold">PPL</div>
      case 'upper_lower':
        return <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center text-white text-lg font-bold">UL</div>
      case 'full_body':
        return <div className="w-12 h-12 bg-accent-secondary rounded-full flex items-center justify-center text-white text-lg font-bold">FB</div>
      case 'ppl_upper':
        return <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center text-white text-lg font-bold">PPL+</div>
      case 'custom':
        return <div className="w-12 h-12 bg-accent-secondary rounded-full flex items-center justify-center text-white text-lg font-bold">C</div>
      default:
        return <Dumbbell className="w-12 h-12 text-accent-primary" />
    }
  }

  const displayPlan = adjustedPlan.id !== plan.id ? adjustedPlan : plan

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Plan Options
        </button>

        <div className="flex items-center space-x-3">
          {adjustedPlan.id !== plan.id && (
            <button
              onClick={() => setAdjustedPlan(plan)}
              className="btn-secondary text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Reset to Original
            </button>
          )}

          <button
            onClick={handleGenerateAIQuestions}
            disabled={isGeneratingQuestions}
            className="btn-secondary text-sm disabled:btn-disabled"
          >
            {isGeneratingQuestions ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                Generating...
              </>
            ) : (
              <>
                <HelpCircle className="w-4 h-4 mr-2" />
                Ask AI Questions
              </>
            )}
          </button>

          <button
            onClick={() => setShowFeedback(!showFeedback)}
            className="btn-secondary text-sm"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            AI Feedback
          </button>

          <button
            onClick={handleSavePlan}
            disabled={isSaving}
            className="btn-primary disabled:btn-disabled"
          >
            {isSaving ? (
              <>
                <Loader2 className="animate-spin h-4 w-4 mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Plan
              </>
            )}
          </button>

          <button
            onClick={handleStartWorkout}
            className="btn-primary"
          >
            <Play className="w-4 h-4 mr-2" />
            Start Workout
          </button>
        </div>
      </div>

      {/* AI Error Display */}
      {aiError && (
        <div className="bg-bg-tertiary border border-border-line rounded-lg p-4">
          <p className="text-text-primary text-sm">
            ⚠️ {aiError} - Using fallback adjustment mode.
          </p>
        </div>
      )}

      {/* Plan Overview */}
      <div className="card-primary p-6">
        <div className="flex items-start space-x-6">
          <div className="flex-shrink-0">
            {getSplitIcon(displayPlan.split_type)}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-text-primary">{displayPlan.name}</h1>
              {adjustedPlan.id !== plan.id && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-success/20 text-success border border-success/30">
                  ✓ AI Adjusted
                </span>
              )}
            </div>
            <p className="text-text-secondary text-lg mb-4">{displayPlan.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-accent-primary" />
                <span className="text-text-primary">{displayPlan.days_per_week} days per week</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-accent-primary" />
                <span className="text-text-primary">{displayPlan.workouts.filter(w => !w.is_rest).length} workout days</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Dumbbell className="w-5 h-5 text-accent-primary" />
                <span className="text-text-primary">{displayPlan.workouts.filter(w => w.is_rest).length} rest days</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-accent-primary" />
                <span className="text-text-primary">AI Generated</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Schedule */}
      <div className="card-primary p-6">
        <h2 className="text-2xl font-bold text-text-primary mb-6">Weekly Schedule</h2>
        
        <div className="space-y-4">
          {displayPlan.workouts.map((workout, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-colors ${
                workout.is_rest
                  ? 'border-border-line bg-bg-tertiary'
                  : 'border-accent-primary/20 bg-accent-primary/5 hover:border-accent-primary/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="font-bold text-lg text-text-primary">{workout.day}</div>
                  
                  {workout.is_rest ? (
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-text-secondary" />
                      <span className="text-text-secondary font-medium">Rest Day</span>
                    </div>
                  ) : (
                    <span className="text-text-primary font-medium">{workout.focus}</span>
                  )}
                </div>
              </div>
              
              {!workout.is_rest && (
                <div className="space-y-2">
                  {workout.exercises.map((exercise, exerciseIndex) => (
                    <div key={exerciseIndex} className="bg-bg-primary p-3 rounded-lg border border-border-line">
                      <span className="text-text-primary">{exercise}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Feedback Section */}
      {showFeedback && (
        <div className="card-primary p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">AI-Powered Plan Adjustments</h3>
          <p className="text-text-secondary mb-4">
            Our AI will intelligently modify your workout plan based on your feedback.
            Be specific about what you'd like to change (e.g., "I want more leg exercises", "Can we add cardio?", "I need more strength training").
          </p>

          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="e.g., 'I'd like more leg exercises', 'Can we add more cardio?', 'I prefer higher reps for arms', 'I need more recovery time'"
            className="input-primary w-full mb-4"
            rows={4}
          />

          <div className="flex justify-end">
            <button
              onClick={handleFeedbackSubmit}
              disabled={!feedback.trim() || isAdjusting}
              className="btn-primary disabled:btn-disabled text-sm"
            >
              {isAdjusting ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  AI is Processing...
                </>
              ) : (
                'Submit to AI'
              )}
            </button>
          </div>
        </div>
      )}

      {/* AI Questions Modal */}
      {showAIQuestions && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="card-primary p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-text-primary">AI-Powered Questions</h3>
              <button
                onClick={() => {
                  setShowAIQuestions(false)
                  setAiAnswers({})
                  setQuestionsError(null)
                }}
                className="text-text-secondary hover:text-text-primary transition-colors p-1 rounded-md hover:bg-bg-tertiary"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {questionsError && (
              <div className="bg-bg-tertiary border border-border-line rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-warning rounded-full"></div>
                  <p className="text-text-primary text-sm">
                    {questionsError} - Using fallback questions.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-accent-primary/5 border border-accent-primary/20 rounded-lg p-4 mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <HelpCircle className="w-4 h-4 text-accent-primary" />
                <span className="text-sm font-medium text-text-primary">Personalized Questions</span>
              </div>
              <p className="text-text-secondary text-sm">
                Answer these AI-generated questions to help us personalize your workout plan even further.
              </p>
            </div>

            <div className="space-y-6">
              {aiQuestions.map((question, index) => (
                <div key={index} className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-accent-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-medium text-accent-primary">{index + 1}</span>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        {question}
                      </label>
                      <textarea
                        value={aiAnswers[question] || ''}
                        onChange={(e) => handleAnswerChange(question, e.target.value)}
                        placeholder="Type your answer here..."
                        className="input-primary w-full"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                onClick={() => {
                  setShowAIQuestions(false)
                  setAiAnswers({})
                  setQuestionsError(null)
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitQuestions}
                disabled={!canSubmitQuestions() || isAdjusting}
                className="btn-primary disabled:btn-disabled"
              >
                {isAdjusting ? (
                  <>
                    <Loader2 className="animate-spin h-4 w-4 mr-2" />
                    Processing...
                  </>
                ) : (
                  'Submit Answers'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
