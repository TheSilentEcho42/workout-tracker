import { useState } from 'react'
import { Calendar, Target, Dumbbell, ArrowRight, CheckCircle } from 'lucide-react'

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

interface WorkoutPlanOptionsProps {
  plans: WorkoutPlan[]
  onPlanSelect: (plan: WorkoutPlan) => void
}

export const WorkoutPlanOptions = ({ plans, onPlanSelect }: WorkoutPlanOptionsProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const handlePlanSelect = (plan: WorkoutPlan) => {
    setSelectedPlan(plan.id)
    onPlanSelect(plan)
  }

  const getSplitIcon = (splitType: string) => {
    switch (splitType) {
      case 'push_pull_legs':
        return <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">PPL</div>
      case 'upper_lower':
        return <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center text-white text-xs font-bold">UL</div>
      case 'full_body':
        return <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">FB</div>
      case 'ppl_upper':
        return <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center text-white text-xs font-bold">PPL+</div>
      case 'custom':
        return <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
      default:
        return <Dumbbell className="w-8 h-8 text-accent-primary" />
    }
  }

  const getSplitColor = (splitType: string) => {
    switch (splitType) {
      case 'push_pull_legs':
        return 'border-accent-secondary/30 hover:border-accent-secondary/50'
      case 'upper_lower':
        return 'border-accent-primary/30 hover:border-accent-primary/50'
      case 'full_body':
        return 'border-accent-secondary/30 hover:border-accent-secondary/50'
      case 'ppl_upper':
        return 'border-accent-primary/30 hover:border-accent-primary/50'
      case 'custom':
        return 'border-accent-secondary/30 hover:border-accent-secondary/50'
      default:
        return 'border-border-line hover:border-accent-primary/50'
    }
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-text-primary mb-2">Choose Your Workout Plan</h2>
        <p className="text-text-secondary">
          Based on your profile, here are {plans.length} personalized workout plans. 
          Each plan is designed to help you achieve your fitness goals efficiently.
        </p>
      </div>

      <div className={`grid gap-6 ${
        plans.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
        plans.length === 2 ? 'grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto' :
        'grid-cols-1 lg:grid-cols-3'
      }`}>
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card-primary border-2 p-6 transition-all duration-200 cursor-pointer ${
              selectedPlan === plan.id 
                ? 'border-accent-primary shadow-lg scale-105' 
                : getSplitColor(plan.split_type)
            }`}
            onClick={() => handlePlanSelect(plan)}
          >
            {/* Plan Header */}
            <div className="text-center mb-6">
              <div className="flex justify-center mb-3">
                {getSplitIcon(plan.split_type)}
              </div>
              <h3 className="text-xl font-bold text-text-primary mb-2">{plan.name}</h3>
              <p className="text-sm text-text-secondary mb-3">{plan.description}</p>
              <div className="flex items-center justify-center space-x-4 text-sm">
                <div className="flex items-center text-text-secondary">
                  <Calendar className="w-4 h-4 mr-1" />
                  {plan.days_per_week} days/week
                </div>
                <div className="flex items-center text-text-secondary">
                  <Target className="w-4 h-4 mr-1" />
                  {plan.workouts.filter(w => !w.is_rest).length} workouts
                </div>
              </div>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-3 mb-6">
              <h4 className="font-semibold text-text-primary text-center mb-3">Weekly Schedule</h4>
              {plan.workouts.map((workout, index) => (
                <div
                  key={index}
                  className={`p-3 rounded-lg text-sm ${
                    workout.is_rest 
                      ? 'bg-bg-tertiary text-text-secondary' 
                      : 'bg-accent-primary/5 text-text-primary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{workout.day}</div>
                    {workout.is_rest ? (
                      <div className="flex items-center text-text-secondary">
                        <span className="mr-2">Rest</span>
                        <CheckCircle className="w-4 h-4" />
                      </div>
                    ) : (
                      <div className="text-right">
                        <div className="font-medium">{workout.focus}</div>
                        <div className="text-xs text-text-secondary">
                          {workout.exercises.length} exercises
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Plan Benefits */}
            <div className="space-y-2 mb-6">
              <h4 className="font-semibold text-text-primary text-center mb-3">Key Benefits</h4>
              <div className="text-xs space-y-1">
                {plan.split_type === 'push_pull_legs' && (
                  <>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Optimal muscle group separation
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      High frequency training
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Balanced movement patterns
                    </div>
                  </>
                )}
                {plan.split_type === 'ppl_upper' && (
                  <>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Balanced PPL structure
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Extra upper body focus
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Optimal for 5-day training
                    </div>
                  </>
                )}
                {plan.split_type === 'upper_lower' && (
                  <>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Balanced upper/lower development
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Adequate recovery time
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Time-efficient training
                    </div>
                  </>
                )}
                {plan.split_type === 'full_body' && (
                  <>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Maximum efficiency
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Great for beginners
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Balanced full-body development
                    </div>
                  </>
                )}
                {plan.split_type === 'custom' && (
                  <>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Personalized to your goals
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Optimized for {plan.days_per_week} days
                    </div>
                    <div className="flex items-center text-text-primary">
                      <CheckCircle className="w-3 h-3 text-success mr-2" />
                      Balanced muscle development
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Select Button */}
            <button
              onClick={() => handlePlanSelect(plan)}
              className={`w-full py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center ${
                selectedPlan === plan.id
                  ? 'btn-primary'
                  : 'btn-secondary'
              }`}
            >
              {selectedPlan === plan.id ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Selected
                </>
              ) : (
                <>
                  Select This Plan
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="text-center text-sm text-text-secondary">
        <p>Click on a plan to see detailed workouts and exercises</p>
      </div>
    </div>
  )
}
