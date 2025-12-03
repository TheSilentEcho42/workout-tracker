import { useState } from 'react'
import { Target, Calendar, Dumbbell, AlertTriangle, ArrowRight } from 'lucide-react'

interface UserProfile {
  experience_level: string
  goals: string[]
  days_per_week: number
  equipment: string[]
  injury_history: string[]
  age: number
  current_fitness: string
  time_per_session: number
  unavailable_days: string[]
  height?: number // in cm
  weight?: number // in kg
}

interface WorkoutPlanQuestionnaireProps {
  onComplete: (profile: UserProfile) => void
}

export const WorkoutPlanQuestionnaire = ({ onComplete }: WorkoutPlanQuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [heightUnit, setHeightUnit] = useState<'cm' | 'inches'>('cm')
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>('kg')
  const [heightInput, setHeightInput] = useState<string>('')
  const [weightInput, setWeightInput] = useState<string>('')
  const [profile, setProfile] = useState<UserProfile>({
    experience_level: '',
    goals: [],
    days_per_week: 0,
    equipment: [],
    injury_history: [],
    age: 25,
    current_fitness: '',
    time_per_session: 60,
    unavailable_days: [],
    height: undefined,
    weight: undefined
  })

  const steps = [
    {
      title: 'Experience Level',
      description: 'How long have you been working out?',
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { value: 'beginner', label: 'Beginner', description: '0-6 months' },
              { value: 'intermediate', label: 'Intermediate', description: '6 months - 2 years' },
              { value: 'advanced', label: 'Advanced', description: '2+ years' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setProfile(prev => ({ ...prev, experience_level: option.value }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  profile.experience_level === option.value
                    ? 'border-accent-primary bg-accent-primary/5 text-accent-primary'
                    : 'border-border-line hover:border-accent-primary/50'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-text-secondary">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Fitness Goals',
      description: 'What are your primary fitness goals?',
      icon: Target,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'strength', label: 'Build Strength', description: 'Increase lifting capacity' },
              { value: 'muscle', label: 'Build Muscle', description: 'Increase muscle mass' },
              { value: 'endurance', label: 'Improve Endurance', description: 'Better cardiovascular fitness' },
              { value: 'weight_loss', label: 'Weight Loss', description: 'Reduce body fat' },
              { value: 'general_fitness', label: 'General Fitness', description: 'Overall health and wellness' },
              { value: 'sports_performance', label: 'Sports Performance', description: 'Improve athletic ability' }
            ].map((goal) => (
              <button
                key={goal.value}
                onClick={() => {
                  const newGoals = profile.goals.includes(goal.value)
                    ? profile.goals.filter(g => g !== goal.value)
                    : [...profile.goals, goal.value]
                  setProfile(prev => ({ ...prev, goals: newGoals }))
                }}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  profile.goals.includes(goal.value)
                    ? 'border-accent-primary bg-accent-primary/5 text-accent-primary'
                    : 'border-border-line hover:border-accent-primary/50'
                }`}
              >
                <div className="font-medium">{goal.label}</div>
                <div className="text-sm text-text-secondary">{goal.description}</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Training Frequency',
      description: 'How many days per week can you work out?',
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[3, 4, 5, 6].map((days) => (
              <button
                key={days}
                onClick={() => setProfile(prev => ({ ...prev, days_per_week: days }))}
                className={`p-6 border-2 rounded-lg text-center transition-colors ${
                  profile.days_per_week === days
                    ? 'border-accent-primary bg-accent-primary/5 text-accent-primary'
                    : 'border-border-line hover:border-accent-primary/50'
                }`}
              >
                <div className="text-2xl font-bold">{days}</div>
                <div className="text-sm text-text-secondary">days/week</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Unavailable Days',
      description: 'Which days of the week can you NOT work out?',
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {[
              { value: 'monday', label: 'Mon' },
              { value: 'tuesday', label: 'Tue' },
              { value: 'wednesday', label: 'Wed' },
              { value: 'thursday', label: 'Thu' },
              { value: 'friday', label: 'Fri' },
              { value: 'saturday', label: 'Sat' },
              { value: 'sunday', label: 'Sun' }
            ].map((day) => (
              <button
                key={day.value}
                onClick={() => {
                  const newUnavailableDays = profile.unavailable_days.includes(day.value)
                    ? profile.unavailable_days.filter(d => d !== day.value)
                    : [...profile.unavailable_days, day.value]
                  setProfile(prev => ({ ...prev, unavailable_days: newUnavailableDays }))
                }}
                className={`p-4 border-2 rounded-lg text-center transition-colors ${
                  profile.unavailable_days.includes(day.value)
                    ? 'border-error bg-error/10 text-error'
                    : 'border-border-line hover:border-accent-primary/50'
                }`}
              >
                <div className="font-medium">{day.label}</div>
                {profile.unavailable_days.includes(day.value) && (
                  <div className="text-xs text-error">Unavailable</div>
                )}
              </button>
            ))}
          </div>
          <p className="text-sm text-text-secondary text-center">
            Select the days when you cannot work out. Your plan will be adjusted accordingly.
          </p>
        </div>
      )
    },
    {
      title: 'Equipment Availability',
      description: 'What equipment do you have access to?',
      icon: Dumbbell,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { value: 'full_gym', label: 'Full Gym', description: 'Commercial gym with all equipment' },
              { value: 'home_gym', label: 'Home Gym', description: 'Basic equipment at home' },
              { value: 'limited', label: 'Limited Equipment', description: 'Few pieces of equipment' },
              { value: 'bodyweight', label: 'Bodyweight Only', description: 'No equipment needed' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setProfile(prev => ({ ...prev, equipment: [option.value] }))}
                className={`p-4 border-2 rounded-lg text-left transition-colors ${
                  profile.equipment.includes(option.value)
                    ? 'border-accent-primary bg-accent-primary/5 text-accent-primary'
                    : 'border-border-line hover:border-accent-primary/50'
                }`}
              >
                <div className="font-medium">{option.label}</div>
                <div className="text-sm text-text-secondary">{option.description}</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Injury History',
      description: 'Do you have any injuries or limitations?',
      icon: AlertTriangle,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">Injury History & Limitations</label>
              <textarea
                className="w-full p-3 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                rows={4}
                placeholder="List any injuries, pain points, or limitations (e.g., lower back pain, knee issues, shoulder problems)"
                defaultValue=""
                onInput={(e) => {
                  const value = e.currentTarget.value
                  // Handle comma-separated input and trim whitespace
                  const injuries = value.split(',').map(s => s.trim()).filter(s => s.length > 0)
                  setProfile(prev => ({ ...prev, injury_history: injuries }))
                }}
              />
              <p className="text-sm text-text-secondary mt-2">
                Leave blank if you have no injuries or limitations. This helps us create a safe and effective plan.
              </p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Session Duration',
      description: 'How long can you spend on each workout session?',
      icon: Calendar,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[45, 60, 90].map((minutes) => (
              <button
                key={minutes}
                onClick={() => setProfile(prev => ({ ...prev, time_per_session: minutes }))}
                className={`p-6 border-2 rounded-lg text-center transition-colors ${
                  profile.time_per_session === minutes
                    ? 'border-accent-primary bg-accent-primary/5 text-accent-primary'
                    : 'border-border-line hover:border-accent-primary/50'
                }`}
              >
                <div className="text-2xl font-bold">{minutes}</div>
                <div className="text-sm text-text-secondary">minutes</div>
              </button>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Body Measurements',
      description: 'Your height and weight help us create a more personalized plan',
      icon: Target,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">
                  Height
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (heightUnit !== 'cm' && heightInput) {
                        // Convert from inches to cm
                        const inches = parseFloat(heightInput)
                        if (!isNaN(inches)) {
                          const cm = inches * 2.54
                          setHeightInput(cm.toFixed(1))
                          setProfile(prev => ({ ...prev, height: Math.round(cm * 10) / 10 }))
                        }
                      }
                      setHeightUnit('cm')
                    }}
                    className={`px-2 py-1 text-xs border rounded transition-colors ${
                      heightUnit === 'cm'
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                        : 'border-border-line hover:border-accent-primary/50'
                    }`}
                  >
                    cm
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (heightUnit !== 'inches' && heightInput) {
                        // Convert from cm to inches
                        const cm = parseFloat(heightInput)
                        if (!isNaN(cm)) {
                          const inches = cm / 2.54
                          setHeightInput(inches.toFixed(1))
                          setProfile(prev => ({ ...prev, height: Math.round(cm * 10) / 10 }))
                        }
                      }
                      setHeightUnit('inches')
                    }}
                    className={`px-2 py-1 text-xs border rounded transition-colors ${
                      heightUnit === 'inches'
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                        : 'border-border-line hover:border-accent-primary/50'
                    }`}
                  >
                    inches
                  </button>
                </div>
              </div>
              <input
                type="number"
                min={heightUnit === 'cm' ? '100' : '39'}
                max={heightUnit === 'cm' ? '250' : '98'}
                step="0.1"
                className="w-full p-3 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                placeholder={heightUnit === 'cm' ? 'e.g., 175' : 'e.g., 69'}
                value={heightInput}
                onChange={(e) => {
                  const value = e.target.value
                  setHeightInput(value)
                  if (value) {
                    const numValue = parseFloat(value)
                    if (!isNaN(numValue)) {
                      // Convert to cm for storage
                      const heightInCm = heightUnit === 'inches' ? numValue * 2.54 : numValue
                      setProfile(prev => ({ ...prev, height: Math.round(heightInCm * 10) / 10 }))
                    } else {
                      setProfile(prev => ({ ...prev, height: undefined }))
                    }
                  } else {
                    setProfile(prev => ({ ...prev, height: undefined }))
                  }
                }}
              />
              <p className="text-xs text-text-secondary mt-1">
                Optional - helps calculate appropriate weights and volumes
              </p>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-text-primary">
                  Weight
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (weightUnit !== 'kg' && weightInput) {
                        // Convert from lbs to kg
                        const lbs = parseFloat(weightInput)
                        if (!isNaN(lbs)) {
                          const kg = lbs / 2.20462
                          setWeightInput(kg.toFixed(1))
                          setProfile(prev => ({ ...prev, weight: Math.round(kg * 10) / 10 }))
                        }
                      }
                      setWeightUnit('kg')
                    }}
                    className={`px-2 py-1 text-xs border rounded transition-colors ${
                      weightUnit === 'kg'
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                        : 'border-border-line hover:border-accent-primary/50'
                    }`}
                  >
                    kg
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (weightUnit !== 'lbs' && weightInput) {
                        // Convert from kg to lbs
                        const kg = parseFloat(weightInput)
                        if (!isNaN(kg)) {
                          const lbs = kg * 2.20462
                          setWeightInput(lbs.toFixed(1))
                          setProfile(prev => ({ ...prev, weight: Math.round(kg * 10) / 10 }))
                        }
                      }
                      setWeightUnit('lbs')
                    }}
                    className={`px-2 py-1 text-xs border rounded transition-colors ${
                      weightUnit === 'lbs'
                        ? 'border-accent-primary bg-accent-primary/10 text-accent-primary'
                        : 'border-border-line hover:border-accent-primary/50'
                    }`}
                  >
                    lbs
                  </button>
                </div>
              </div>
              <input
                type="number"
                min={weightUnit === 'kg' ? '30' : '66'}
                max={weightUnit === 'kg' ? '300' : '661'}
                step="0.1"
                className="w-full p-3 border border-border-line rounded-md bg-bg-secondary text-text-primary focus:ring-2 focus:ring-accent-primary/20 focus:border-accent-primary"
                placeholder={weightUnit === 'kg' ? 'e.g., 75' : 'e.g., 165'}
                value={weightInput}
                onChange={(e) => {
                  const value = e.target.value
                  setWeightInput(value)
                  if (value) {
                    const numValue = parseFloat(value)
                    if (!isNaN(numValue)) {
                      // Convert to kg for storage
                      const weightInKg = weightUnit === 'lbs' ? numValue / 2.20462 : numValue
                      setProfile(prev => ({ ...prev, weight: Math.round(weightInKg * 10) / 10 }))
                    } else {
                      setProfile(prev => ({ ...prev, weight: undefined }))
                    }
                  } else {
                    setProfile(prev => ({ ...prev, weight: undefined }))
                  }
                }}
              />
              <p className="text-xs text-text-secondary mt-1">
                Optional - helps tailor exercise recommendations
              </p>
            </div>
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    // Validate required fields
    if (!profile.experience_level || profile.goals.length === 0 || profile.days_per_week === 0) {
      alert('Please complete all required fields before continuing.')
      return
    }
    onComplete(profile)
  }

  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return profile.experience_level !== ''
      case 1:
        return profile.goals.length > 0
      case 2:
        return profile.days_per_week > 0
      case 3:
        return true // Unavailable days is optional
      case 4:
        return profile.equipment.length > 0
      case 5:
        return true // Injury history is optional
      case 6:
        return profile.time_per_session > 0
      case 7:
        return true // Body measurements are optional
      default:
        return false
    }
  }

  const currentStepData = steps[currentStep]
  const StepIcon = currentStepData.icon

  return (
    <div className="card-primary border border-border-line rounded-lg p-6">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <StepIcon className="h-8 w-8 text-accent-primary mr-3" />
          <h2 className="text-2xl font-bold text-text-primary">{currentStepData.title}</h2>
        </div>
        <p className="text-text-secondary">{currentStepData.description}</p>
      </div>

      {/* Step Content */}
      <div className="mb-8">
        {currentStepData.content}
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="w-full bg-bg-tertiary rounded-full h-2">
          <div 
            className="bg-accent-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        <div className="text-center mt-2 text-sm text-text-secondary">
          Step {currentStep + 1} of {steps.length}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={handlePrevious}
          disabled={currentStep === 0}
          className="px-6 py-2 border border-border-line rounded-md hover:bg-bg-tertiary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>

        {currentStep === steps.length - 1 ? (
          <button
            onClick={handleComplete}
            disabled={!canProceed()}
            className="px-6 py-2 bg-accent-primary text-bg-primary rounded-md hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Generate Workout Plan
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed()}
            className="px-6 py-2 bg-accent-primary text-bg-primary rounded-md hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  )
}
