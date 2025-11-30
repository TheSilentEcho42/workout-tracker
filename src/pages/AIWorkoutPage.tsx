import { useState } from 'react'
import { CheckCircle, Loader2 } from 'lucide-react'
import { WorkoutPlanQuestionnaire } from '@/components/ai/WorkoutPlanQuestionnaire'
import { WorkoutPlanOptions } from '@/components/ai/WorkoutPlanOptions'
import { WorkoutPlanDetails } from '@/components/ai/WorkoutPlanDetails'
import { 
  generateFollowUpQuestions, 
  generateWorkoutPlans, 
  UserProfile,
  AIResponse,
  getCostEstimates 
} from '@/lib/ai'

type PlanningStep = 'questionnaire' | 'ai-questions' | 'plan-options' | 'plan-details'

interface WorkoutPlan {
  id: string
  name: string
  description: string
  split_type: string
  days_per_week: number
  workouts: WorkoutDay[]
}

interface WorkoutDay {
  day: string
  focus: string
  exercises: string[]
  is_rest: boolean
}

export const AIWorkoutPage = () => {
  const [currentStep, setCurrentStep] = useState<PlanningStep>('questionnaire')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [aiQuestions, setAiQuestions] = useState<string[]>([])
  const [aiAnswers, setAiAnswers] = useState<Record<string, string>>({})
  const [planOptions, setPlanOptions] = useState<WorkoutPlan[]>([])
  const [selectedPlan, setSelectedPlan] = useState<WorkoutPlan | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [costEstimates] = useState(getCostEstimates())

  const handleQuestionnaireComplete = async (profile: UserProfile) => {
    setUserProfile(profile)
    setIsLoading(true)
    setError(null)
    
    try {
      // Use real AI to generate follow-up questions
      const aiResponse: AIResponse = await generateFollowUpQuestions(profile)
      
      if (aiResponse.success) {
        setAiQuestions(aiResponse.data)
        setCurrentStep('ai-questions')
        
        // Log cost information
        if (aiResponse.tokenUsage) {
          console.log(`AI Questions Generated - Cost: $${aiResponse.tokenUsage.estimatedCost.toFixed(4)}`)
        }
      } else {
        setError(aiResponse.error || 'Failed to generate AI questions')
        // Fallback to basic questions if AI fails
        const fallbackQuestions = generateFallbackQuestions(profile)
        setAiQuestions(fallbackQuestions)
        setCurrentStep('ai-questions')
      }
    } catch (err) {
      setError('Failed to connect to AI service')
      const fallbackQuestions = generateFallbackQuestions(profile)
      setAiQuestions(fallbackQuestions)
      setCurrentStep('ai-questions')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAIQuestionsComplete = async (answers: Record<string, string>) => {
    if (!userProfile) return
    
    setIsLoading(true)
    setError(null)
    
    try {
      // Use real AI to generate workout plans
      const aiResponse: AIResponse = await generateWorkoutPlans(userProfile, answers)
      
      if (aiResponse.success) {
        setPlanOptions(aiResponse.data)
        setCurrentStep('plan-options')
        
        // Log cost information
        if (aiResponse.tokenUsage) {
          console.log(`Workout Plans Generated - Cost: $${aiResponse.tokenUsage.estimatedCost.toFixed(4)}`)
        }
      } else {
        setError(aiResponse.error || 'Failed to generate workout plans')
        // Fallback to basic plans if AI fails
        const fallbackPlans = generateFallbackPlans(userProfile)
        setPlanOptions(fallbackPlans)
        setCurrentStep('plan-options')
      }
    } catch (err) {
      setError('Failed to connect to AI service')
      const fallbackPlans = generateFallbackPlans(userProfile)
      setPlanOptions(fallbackPlans)
      setCurrentStep('plan-options')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAnswerChange = (question: string, answer: string) => {
    setAiAnswers(prev => ({ ...prev, [question]: answer }))
  }

  const canProceedFromAIQuestions = () => {
    return aiQuestions.every(question => aiAnswers[question] && aiAnswers[question].trim().length > 0)
  }

  const handlePlanSelection = (plan: WorkoutPlan) => {
    setSelectedPlan(plan)
    setCurrentStep('plan-details')
  }

  const handleBackToOptions = () => {
    setCurrentStep('plan-options')
  }

  // Fallback functions in case AI service fails
  const generateFallbackQuestions = (profile: UserProfile): string[] => {
    const questions = []
    
    if (profile.experience_level === 'beginner') {
      questions.push('Have you done any form of exercise before?')
      questions.push('Do you have any specific movements that feel uncomfortable?')
    }
    
    if (profile.goals.includes('strength')) {
      questions.push('What is your current 1RM for basic lifts (if known)?')
      questions.push('Are you interested in powerlifting or general strength?')
    }
    
    if (profile.goals.includes('muscle')) {
      questions.push('What is your current body weight and target weight?')
      questions.push('Do you prefer high volume or moderate volume training?')
    }
    
    if (profile.equipment.includes('limited')) {
      questions.push('What specific equipment do you have access to?')
      questions.push('Are you open to bodyweight alternatives?')
    }
    
    return questions
  }

  const generateFallbackPlans = (profile: UserProfile): WorkoutPlan[] => {
    const plans: WorkoutPlan[] = []
    const daysPerWeek = profile.days_per_week
    
    // Generate basic plans as fallback
    if (daysPerWeek >= 3) {
      plans.push({
        id: 'fallback_1',
        name: 'Basic Full Body',
        description: 'Simple full body routine for beginners',
        split_type: 'full_body',
        days_per_week: 3,
        workouts: [
          { day: 'Monday', focus: 'Full Body A', exercises: ['Squats', 'Push-ups', 'Rows'], is_rest: false },
          { day: 'Tuesday', focus: 'Rest', exercises: [], is_rest: true },
          { day: 'Wednesday', focus: 'Full Body B', exercises: ['Deadlift', 'Pull-ups', 'Dips'], is_rest: false },
          { day: 'Thursday', focus: 'Rest', exercises: [], is_rest: true },
          { day: 'Friday', focus: 'Full Body C', exercises: ['Lunges', 'Bench Press', 'Planks'], is_rest: false },
          { day: 'Saturday', focus: 'Rest', exercises: [], is_rest: true },
          { day: 'Sunday', focus: 'Rest', exercises: [], is_rest: true }
        ]
      })
    }
    
    return plans
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-4">AI Workout Planning</h1>
        <p className="text-text-secondary mb-6">
          Get a personalized, AI-powered workout plan tailored to your goals, experience, and equipment availability.
        </p>
        <p className="text-sm text-text-secondary mb-8">
          AI-powered planning costs approximately ${costEstimates.workoutPlanGeneration.estimatedCost} per user
        </p>

        {/* Error Display */}
        {error && (
          <div className="border border-error p-4 mb-6">
            <p className="text-error text-sm">
              {error} - Using fallback mode. Some features may be limited.
            </p>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="card-primary p-4 mb-6">
          <div className="flex items-center justify-between overflow-x-auto">
            <div className={`flex items-center space-x-2 min-w-0 ${currentStep === 'questionnaire' ? 'text-accent-primary' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 flex items-center justify-center text-sm border ${currentStep === 'questionnaire' ? 'bg-accent-primary text-bg-primary border-accent-primary' : 'bg-bg-tertiary border-border-line'}`}>
                1
              </div>
              <span className="text-sm font-medium whitespace-nowrap">Profile & Goals</span>
            </div>
            
            <div className={`flex items-center space-x-2 min-w-0 ${currentStep === 'ai-questions' ? 'text-accent-primary' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 flex items-center justify-center text-sm border ${currentStep === 'ai-questions' ? 'bg-accent-primary text-bg-primary border-accent-primary' : 'bg-bg-tertiary border-border-line'}`}>
                2
              </div>
              <span className="text-sm font-medium whitespace-nowrap">AI Questions</span>
            </div>
            
            <div className={`flex items-center space-x-2 min-w-0 ${currentStep === 'plan-options' ? 'text-accent-primary' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 flex items-center justify-center text-sm border ${currentStep === 'plan-options' ? 'bg-accent-primary text-bg-primary border-accent-primary' : 'bg-bg-tertiary border-border-line'}`}>
                3
              </div>
              <span className="text-sm font-medium whitespace-nowrap">Plan Options</span>
            </div>
            
            <div className={`flex items-center space-x-2 min-w-0 ${currentStep === 'plan-details' ? 'text-accent-primary' : 'text-text-secondary'}`}>
              <div className={`w-8 h-8 flex items-center justify-center text-sm border ${currentStep === 'plan-details' ? 'bg-accent-primary text-bg-primary border-accent-primary' : 'bg-bg-tertiary border-border-line'}`}>
                4
              </div>
              <span className="text-sm font-medium whitespace-nowrap">Your Plan</span>
            </div>
          </div>
        </div>

        {/* Loading Overlay */}
        {isLoading && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="card-primary p-6 flex flex-col items-center space-y-4 max-w-sm w-full">
              <Loader2 className="h-8 w-8 animate-spin text-accent-primary" />
              <p className="text-text-primary text-base text-center">AI is analyzing your profile...</p>
              <p className="text-sm text-text-secondary text-center">This may take a few moments</p>
            </div>
          </div>
        )}

      {/* Step Content */}
      {currentStep === 'questionnaire' && (
        <WorkoutPlanQuestionnaire onComplete={handleQuestionnaireComplete} />
      )}
      
      {currentStep === 'ai-questions' && (
        <div className="card-primary p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">AI Follow-up Questions</h2>
          <p className="text-text-secondary mb-6">
            Our AI has analyzed your profile and needs more information to create the perfect workout plan:
          </p>
          
          <div className="space-y-4">
            {aiQuestions.map((question, index) => (
              <div key={index} className="p-4 bg-bg-tertiary rounded-lg">
                <p className="font-medium text-text-primary mb-2">{question}</p>
                <textarea
                  className="input-primary w-full"
                  rows={2}
                  placeholder="Your answer..."
                  value={aiAnswers[question] || ''}
                  onChange={(e) => handleAnswerChange(question, e.target.value)}
                />
                {aiAnswers[question] && aiAnswers[question].trim().length > 0 && (
                  <div className="mt-2 text-xs text-success flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Answered
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <div className="text-sm text-text-secondary">
              {aiQuestions.filter(q => aiAnswers[q] && aiAnswers[q].trim().length > 0).length} of {aiQuestions.length} questions answered
            </div>
            <button
              onClick={() => handleAIQuestionsComplete(aiAnswers)}
              disabled={!canProceedFromAIQuestions()}
              className="btn-primary disabled:btn-disabled flex items-center justify-center"
            >
              {canProceedFromAIQuestions() ? 'Generate AI Workout Plans' : 'Please Answer All Questions'}
            </button>
          </div>
        </div>
      )}
      
      <>
        {currentStep === 'plan-options' && (
          <WorkoutPlanOptions 
            plans={planOptions} 
            onPlanSelect={handlePlanSelection} 
          />
        )}
        
        {currentStep === 'plan-details' && selectedPlan && (
          <WorkoutPlanDetails 
            plan={selectedPlan} 
            onBack={handleBackToOptions}
            userProfile={userProfile}
          />
        )}
        </>

      </div>
    </div>
  )
}
