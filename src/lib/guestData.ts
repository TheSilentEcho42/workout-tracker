import { WorkoutPlan, SavedWorkoutPlan } from './workoutPlans'
import { CompletedWorkout } from './history'
import { WorkoutSet } from './workouts'

// Guest mode storage keys
const GUEST_PLANS_KEY = 'guest_workout_tracker_plans'
const GUEST_HISTORY_KEY = 'guest_workout_history'
const GUEST_ACTIVE_WORKOUTS_KEY = 'guest_active_workouts'

// Sample workout plan for guest mode
export const createSampleWorkoutPlan = (): SavedWorkoutPlan => {
  const now = new Date()
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  
  return {
    id: 'guest_sample_plan',
    name: 'Beginner Full Body Plan',
    description: 'A balanced full-body workout plan perfect for getting started with strength training',
    split_type: 'Full Body',
    days_per_week: 3,
    workouts: [
      {
        day: 'Monday',
        focus: 'Upper Body Strength',
        exercises: [
          'Barbell Bench Press',
          'Bent-Over Barbell Row',
          'Overhead Press',
          'Barbell Bicep Curl',
          'Tricep Dips'
        ],
        is_rest: false
      },
      {
        day: 'Wednesday',
        focus: 'Lower Body Strength',
        exercises: [
          'Barbell Back Squat',
          'Romanian Deadlift',
          'Leg Press',
          'Leg Curl',
          'Calf Raise'
        ],
        is_rest: false
      },
      {
        day: 'Friday',
        focus: 'Full Body',
        exercises: [
          'Deadlift',
          'Pull-Ups',
          'Dumbbell Shoulder Press',
          'Dumbbell Lunges',
          'Plank'
        ],
        is_rest: false
      },
      {
        day: 'Tuesday',
        focus: 'Rest Day',
        exercises: [],
        is_rest: true
      },
      {
        day: 'Thursday',
        focus: 'Rest Day',
        exercises: [],
        is_rest: true
      },
      {
        day: 'Saturday',
        focus: 'Rest Day',
        exercises: [],
        is_rest: true
      },
      {
        day: 'Sunday',
        focus: 'Rest Day',
        exercises: [],
        is_rest: true
      }
    ],
    created_at: oneWeekAgo,
    updated_at: oneWeekAgo,
    is_active: true
  }
}

// Sample workout history for guest mode
export const createSampleWorkoutHistory = (): CompletedWorkout[] => {
  const workouts: CompletedWorkout[] = []
  const now = new Date()
  
  // Create 5 sample completed workouts from the past 2 weeks
  const workoutDates = [
    new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    new Date(now.getTime() - 12 * 24 * 60 * 60 * 1000) // 12 days ago
  ]
  
  const workoutTemplates = [
    {
      name: 'Upper Body Strength',
      exercises: [
        { name: 'Barbell Bench Press', sets: 4, reps: 8, weight: 135, rir: 2 },
        { name: 'Bent-Over Barbell Row', sets: 4, reps: 8, weight: 135, rir: 2 },
        { name: 'Overhead Press', sets: 3, reps: 10, weight: 95, rir: 1 },
        { name: 'Barbell Bicep Curl', sets: 3, reps: 12, weight: 65, rir: 0 },
        { name: 'Tricep Dips', sets: 3, reps: 12, weight: 0, rir: 1 }
      ]
    },
    {
      name: 'Lower Body Strength',
      exercises: [
        { name: 'Barbell Back Squat', sets: 4, reps: 8, weight: 185, rir: 2 },
        { name: 'Romanian Deadlift', sets: 4, reps: 8, weight: 225, rir: 1 },
        { name: 'Leg Press', sets: 3, reps: 12, weight: 315, rir: 2 },
        { name: 'Leg Curl', sets: 3, reps: 12, weight: 120, rir: 1 },
        { name: 'Calf Raise', sets: 4, reps: 15, weight: 225, rir: 0 }
      ]
    },
    {
      name: 'Full Body',
      exercises: [
        { name: 'Deadlift', sets: 4, reps: 5, weight: 275, rir: 2 },
        { name: 'Pull-Ups', sets: 3, reps: 8, weight: 0, rir: 1 },
        { name: 'Dumbbell Shoulder Press', sets: 3, reps: 10, weight: 50, rir: 1 },
        { name: 'Dumbbell Lunges', sets: 3, reps: 12, weight: 40, rir: 0 },
        { name: 'Plank', sets: 3, reps: 1, duration: 60, rir: 0 }
      ]
    }
  ]
  
  workoutDates.forEach((date, index) => {
    const template = workoutTemplates[index % workoutTemplates.length]
    const workoutId = `guest_workout_${index + 1}`
    const sets: WorkoutSet[] = []
    let orderIndex = 0
    
    template.exercises.forEach((exercise) => {
      for (let setNum = 0; setNum < exercise.sets; setNum++) {
        sets.push({
          id: `guest_set_${workoutId}_${orderIndex}`,
          workout_id: workoutId,
          exercise_id: exercise.name.toLowerCase().replace(/\s+/g, '_'),
          exercise_name: exercise.name,
          weight: exercise.weight || undefined,
          reps: exercise.reps,
          rir: exercise.rir,
          duration: exercise.duration || undefined,
          notes: '',
          order_index: orderIndex++
        })
      }
    })
    
    workouts.push({
      id: workoutId,
      user_id: 'guest_user',
      name: template.name,
      description: `Sample ${template.name} workout`,
      workout_date: date.toISOString().split('T')[0],
      status: 'completed',
      ai_generated: false,
      summary: `Completed ${template.name} workout with ${sets.length} sets`,
      strengths: ['Good form maintained', 'Progressive overload'],
      improvements: ['Increase rest time between sets', 'Focus on mind-muscle connection'],
      next_steps: ['Continue with current plan', 'Add one more set next week'],
      duration_minutes: 45 + Math.floor(Math.random() * 15),
      created_at: date.toISOString(),
      updated_at: date.toISOString(),
      sets
    })
  })
  
  return workouts.sort((a, b) => 
    new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime()
  )
}

// Initialize guest data
export const initializeGuestData = (): void => {
  try {
    // Initialize sample workout plan
    const samplePlan = createSampleWorkoutPlan()
    localStorage.setItem(GUEST_PLANS_KEY, JSON.stringify([samplePlan]))
    
    // Initialize sample workout history
    const sampleHistory = createSampleWorkoutHistory()
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(sampleHistory))
    
    // Initialize empty active workouts
    localStorage.setItem(GUEST_ACTIVE_WORKOUTS_KEY, JSON.stringify([]))
    
    console.log('✅ Guest data initialized')
  } catch (error) {
    console.error('❌ Error initializing guest data:', error)
  }
}

// Reset guest data to initial state
export const resetGuestData = (): void => {
  try {
    initializeGuestData()
    console.log('✅ Guest data reset to initial state')
  } catch (error) {
    console.error('❌ Error resetting guest data:', error)
  }
}

// Get guest workout plans
export const getGuestWorkoutPlans = (): SavedWorkoutPlan[] => {
  try {
    const stored = localStorage.getItem(GUEST_PLANS_KEY)
    if (!stored) {
      initializeGuestData()
      return [createSampleWorkoutPlan()]
    }
    
    const plans = JSON.parse(stored)
    return plans.map((plan: any) => ({
      ...plan,
      created_at: new Date(plan.created_at),
      updated_at: new Date(plan.updated_at)
    }))
  } catch (error) {
    console.error('❌ Error loading guest workout plans:', error)
    return [createSampleWorkoutPlan()]
  }
}

// Save guest workout plan
export const saveGuestWorkoutPlan = (plan: WorkoutPlan): void => {
  try {
    const savedPlans = getGuestWorkoutPlans()
    
    const existingPlanIndex = savedPlans.findIndex(p => p.id === plan.id)
    
    if (existingPlanIndex !== -1) {
      savedPlans[existingPlanIndex] = {
        ...plan,
        updated_at: new Date()
      }
    } else {
      const newPlan: SavedWorkoutPlan = {
        ...plan,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      }
      savedPlans.push(newPlan)
    }
    
    if (plan.is_active) {
      savedPlans.forEach(p => {
        if (p.id !== plan.id) {
          p.is_active = false
        }
      })
    }
    
    localStorage.setItem(GUEST_PLANS_KEY, JSON.stringify(savedPlans))
    console.log('💾 Guest workout plan saved:', plan.name)
  } catch (error) {
    console.error('❌ Error saving guest workout plan:', error)
    throw new Error('Failed to save guest workout plan')
  }
}

// Get guest workout history
export const getGuestWorkoutHistory = (): CompletedWorkout[] => {
  try {
    const stored = localStorage.getItem(GUEST_HISTORY_KEY)
    if (!stored) {
      initializeGuestData()
      return createSampleWorkoutHistory()
    }
    
    const history = JSON.parse(stored)
    return history.map((workout: any) => ({
      ...workout,
      created_at: workout.created_at,
      updated_at: workout.updated_at
    }))
  } catch (error) {
    console.error('❌ Error loading guest workout history:', error)
    return createSampleWorkoutHistory()
  }
}

// Add completed workout to guest history
export const addGuestCompletedWorkout = (workout: CompletedWorkout): void => {
  try {
    const history = getGuestWorkoutHistory()
    history.unshift(workout)
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(history))
    console.log('💾 Guest workout added to history:', workout.name)
  } catch (error) {
    console.error('❌ Error adding guest workout to history:', error)
  }
}

// Delete guest workout from history
export const deleteGuestWorkout = (workoutId: string): void => {
  try {
    const history = getGuestWorkoutHistory()
    const filtered = history.filter(w => w.id !== workoutId)
    localStorage.setItem(GUEST_HISTORY_KEY, JSON.stringify(filtered))
    console.log('🗑️ Guest workout deleted from history:', workoutId)
  } catch (error) {
    console.error('❌ Error deleting guest workout:', error)
  }
}

// Get guest active workouts
export const getGuestActiveWorkouts = (): any[] => {
  try {
    const stored = localStorage.getItem(GUEST_ACTIVE_WORKOUTS_KEY)
    if (!stored) return []
    return JSON.parse(stored)
  } catch (error) {
    console.error('❌ Error loading guest active workouts:', error)
    return []
  }
}

// Get guest active workout by ID
export const getGuestActiveWorkoutById = (workoutId: string): any | null => {
  try {
    const activeWorkouts = getGuestActiveWorkouts()
    return activeWorkouts.find((w: any) => w.id === workoutId) || null
  } catch (error) {
    console.error('❌ Error getting guest active workout:', error)
    return null
  }
}

// Save guest active workout
export const saveGuestActiveWorkout = (workout: any): void => {
  try {
    const activeWorkouts = getGuestActiveWorkouts()
    const existingIndex = activeWorkouts.findIndex((w: any) => w.id === workout.id)
    
    if (existingIndex !== -1) {
      activeWorkouts[existingIndex] = workout
    } else {
      activeWorkouts.push(workout)
    }
    
    localStorage.setItem(GUEST_ACTIVE_WORKOUTS_KEY, JSON.stringify(activeWorkouts))
    console.log('💾 Guest active workout saved:', workout.id)
  } catch (error) {
    console.error('❌ Error saving guest active workout:', error)
  }
}

// Delete guest active workout
export const deleteGuestActiveWorkout = (workoutId: string): void => {
  try {
    const activeWorkouts = getGuestActiveWorkouts()
    const filtered = activeWorkouts.filter((w: any) => w.id !== workoutId)
    localStorage.setItem(GUEST_ACTIVE_WORKOUTS_KEY, JSON.stringify(filtered))
    console.log('🗑️ Guest active workout deleted:', workoutId)
  } catch (error) {
    console.error('❌ Error deleting guest active workout:', error)
  }
}

// Clear all guest data
export const clearGuestData = (): void => {
  try {
    localStorage.removeItem(GUEST_PLANS_KEY)
    localStorage.removeItem(GUEST_HISTORY_KEY)
    localStorage.removeItem(GUEST_ACTIVE_WORKOUTS_KEY)
    console.log('🗑️ All guest data cleared')
  } catch (error) {
    console.error('❌ Error clearing guest data:', error)
  }
}

