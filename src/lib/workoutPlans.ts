import { saveGuestWorkoutPlan, getGuestWorkoutPlans, resetGuestData } from './guestData'

export interface WorkoutPlan {
  id: string
  name: string
  description: string
  split_type: string
  days_per_week: number
  workouts: WorkoutDay[]
  created_at: Date
  updated_at: Date
  user_id?: string
  is_active: boolean
}

export interface WorkoutDay {
  day: string
  focus: string
  exercises: string[]
  is_rest: boolean
}

export interface SavedWorkoutPlan {
  id: string
  name: string
  description: string
  split_type: string
  days_per_week: number
  workouts: WorkoutDay[]
  created_at: Date
  updated_at: Date
  is_active: boolean
}

// Local storage key for workout plans
const STORAGE_KEY = 'workout_tracker_plans'

// Get storage key for current user (guest accounts use user-specific keys)
const getStorageKey = (): string => {
  // Check if we have a guest user ID stored
  const guestUserId = localStorage.getItem('current_guest_user_id')
  if (guestUserId) {
    return `workout_tracker_plans_${guestUserId}`
  }
  // Check old guest mode flag for backward compatibility
  if (localStorage.getItem('guest_mode') === 'true') {
    return 'guest_workout_tracker_plans'
  }
  return STORAGE_KEY
}

// Check if user is in old localStorage guest mode (not new database guest accounts)
// New guest accounts use normal localStorage with user-specific keys
const isGuestMode = (): boolean => {
  // Only check old guest mode flag for backward compatibility
  // New guest accounts (with current_guest_user_id) use normal localStorage via getStorageKey()
  return localStorage.getItem('guest_mode') === 'true'
}

// Save workout plan to local storage
export const saveWorkoutPlan = (plan: WorkoutPlan): void => {
  // Only use old guest data functions for old localStorage guest mode
  // New guest accounts use normal localStorage with user-specific keys
  if (isGuestMode()) {
    return saveGuestWorkoutPlan(plan)
  }
  try {
    const savedPlans = getSavedWorkoutPlans()
    
    // Check if plan already exists
    const existingPlanIndex = savedPlans.findIndex(p => p.id === plan.id)
    
    if (existingPlanIndex !== -1) {
      // Update existing plan
      savedPlans[existingPlanIndex] = {
        ...plan,
        updated_at: new Date()
      }
    } else {
      // Add new plan
      const newPlan: SavedWorkoutPlan = {
        ...plan,
        created_at: new Date(),
        updated_at: new Date(),
        is_active: true
      }
      savedPlans.push(newPlan)
    }
    
    // Deactivate other plans if this one is active
    if (plan.is_active) {
      savedPlans.forEach(p => {
        if (p.id !== plan.id) {
          p.is_active = false
        }
      })
    }
    
    const storageKey = getStorageKey()
    localStorage.setItem(storageKey, JSON.stringify(savedPlans))
    console.log('💾 Workout plan saved successfully:', plan.name)
  } catch (error) {
    console.error('❌ Error saving workout plan:', error)
    throw new Error('Failed to save workout plan')
  }
}

// Get all saved workout plans
export const getSavedWorkoutPlans = (): SavedWorkoutPlan[] => {
  // Only use old guest data functions for old localStorage guest mode
  // New guest accounts use normal localStorage with user-specific keys
  if (isGuestMode()) {
    return getGuestWorkoutPlans()
  }
  
  try {
    const storageKey = getStorageKey()
    const stored = localStorage.getItem(storageKey)
    if (!stored) return []
    
    const plans = JSON.parse(stored)
    return plans.map((plan: any) => ({
      ...plan,
      created_at: new Date(plan.created_at),
      updated_at: new Date(plan.updated_at)
    }))
  } catch (error) {
    console.error('❌ Error loading workout plans:', error)
    return []
  }
}

// Get active workout plan
export const getActiveWorkoutPlan = (): SavedWorkoutPlan | null => {
  const plans = getSavedWorkoutPlans()
  return plans.find(plan => plan.is_active) || null
}

// Get workout plan by ID
export const getWorkoutPlanById = (id: string): SavedWorkoutPlan | null => {
  const plans = getSavedWorkoutPlans()
  return plans.find(plan => plan.id === id) || null
}

// Delete workout plan
export const deleteWorkoutPlan = (id: string): void => {
  // Only use old guest data functions for old localStorage guest mode
  // New guest accounts use normal localStorage with user-specific keys
  if (isGuestMode()) {
    // In old guest mode, we don't allow deleting the sample plan
    // Instead, we'll just reset to initial state
    resetGuestData()
    return
  }
  
  try {
    const savedPlans = getSavedWorkoutPlans()
    const filteredPlans = savedPlans.filter(plan => plan.id !== id)
    
    const storageKey = getStorageKey()
    localStorage.setItem(storageKey, JSON.stringify(filteredPlans))
    console.log('🗑️ Workout plan deleted successfully:', id)
  } catch (error) {
    console.error('❌ Error deleting workout plan:', error)
    throw new Error('Failed to delete workout plan')
  }
}

// Activate a workout plan
export const activateWorkoutPlan = (id: string): void => {
  if (isGuestMode()) {
    // In guest mode, update the plan and save it
    const plans = getSavedWorkoutPlans()
    const updatedPlans = plans.map(plan => ({
      ...plan,
      is_active: plan.id === id,
      updated_at: plan.id === id ? new Date() : plan.updated_at
    }))
    updatedPlans.forEach(plan => {
      if (plan.is_active) {
        saveWorkoutPlan(plan)
      }
    })
    return
  }
  
  try {
    const savedPlans = getSavedWorkoutPlans()
    
    savedPlans.forEach(plan => {
      plan.is_active = plan.id === id
      if (plan.is_active) {
        plan.updated_at = new Date()
      }
    })
    
    const storageKey = getStorageKey()
    localStorage.setItem(storageKey, JSON.stringify(savedPlans))
    console.log('✅ Workout plan activated:', id)
  } catch (error) {
    console.error('❌ Error activating workout plan:', error)
    throw new Error('Failed to activate workout plan')
  }
}

// Update workout plan
export const updateWorkoutPlan = (id: string, updates: Partial<WorkoutPlan>): void => {
  if (isGuestMode()) {
    const plans = getSavedWorkoutPlans()
    const plan = plans.find(p => p.id === id)
    if (!plan) {
      throw new Error('Workout plan not found')
    }
    const updatedPlan = { ...plan, ...updates, updated_at: new Date() }
    saveWorkoutPlan(updatedPlan)
    return
  }
  
  try {
    const savedPlans = getSavedWorkoutPlans()
    const planIndex = savedPlans.findIndex(plan => plan.id === id)
    
    if (planIndex === -1) {
      throw new Error('Workout plan not found')
    }
    
    savedPlans[planIndex] = {
      ...savedPlans[planIndex],
      ...updates,
      updated_at: new Date()
    }
    
    const storageKey = getStorageKey()
    localStorage.setItem(storageKey, JSON.stringify(savedPlans))
    console.log('✏️ Workout plan updated successfully:', id)
  } catch (error) {
    console.error('❌ Error updating workout plan:', error)
    throw new Error('Failed to update workout plan')
  }
}

// Get workout plan statistics
export const getWorkoutPlanStats = () => {
  const plans = getSavedWorkoutPlans()
  
  return {
    totalPlans: plans.length,
    activePlan: plans.find(p => p.is_active) || null,
    recentPlans: plans
      .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
      .slice(0, 3),
    plansByType: plans.reduce((acc, plan) => {
      acc[plan.split_type] = (acc[plan.split_type] || 0) + 1
      return acc
    }, {} as Record<string, number>)
  }
}

// Export workout plan data
export const exportWorkoutPlan = (id: string): string => {
  const plan = getWorkoutPlanById(id)
  if (!plan) {
    throw new Error('Workout plan not found')
  }
  
  const exportData = {
    ...plan,
    exported_at: new Date().toISOString(),
    version: '1.0'
  }
  
  return JSON.stringify(exportData, null, 2)
}

// Import workout plan data
export const importWorkoutPlan = (data: string): SavedWorkoutPlan => {
  try {
    const importedPlan = JSON.parse(data)
    
    // Validate required fields
    if (!importedPlan.name || !importedPlan.workouts) {
      throw new Error('Invalid workout plan data')
    }
    
    // Generate new ID and timestamps
    const newPlan: SavedWorkoutPlan = {
      ...importedPlan,
      id: `imported_${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
      is_active: false
    }
    
    // Save the imported plan
    saveWorkoutPlan(newPlan)
    
    return newPlan
  } catch (error) {
    console.error('❌ Error importing workout plan:', error)
    throw new Error('Failed to import workout plan')
  }
}

// Track last completed workout for recommendation
const LAST_WORKOUT_KEY = 'workout_tracker_last_workout'

export const setLastCompletedWorkout = (workoutName: string): void => {
  try {
    localStorage.setItem(LAST_WORKOUT_KEY, workoutName)
    console.log('📝 Last completed workout recorded:', workoutName)
  } catch (error) {
    console.error('❌ Error recording last workout:', error)
  }
}

export const getLastCompletedWorkout = (): string | null => {
  try {
    return localStorage.getItem(LAST_WORKOUT_KEY)
  } catch (error) {
    console.error('❌ Error getting last workout:', error)
    return null
  }
}

// Get recommended next workout based on last completed
export const getRecommendedWorkout = (plan: SavedWorkoutPlan): WorkoutDay | null => {
  const lastWorkout = getLastCompletedWorkout()
  
  if (!lastWorkout) {
    // If no last workout, recommend today's workout or first non-rest day
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
    const todayWorkout = plan.workouts.find(w => w.day.toLowerCase() === today)
    if (todayWorkout && !todayWorkout.is_rest) {
      return todayWorkout
    }
    return plan.workouts.find(w => !w.is_rest) || null
  }
  
  // Find the last completed workout in the plan
  const lastWorkoutIndex = plan.workouts.findIndex(w => 
    `${w.day} - ${w.focus}` === lastWorkout || w.focus === lastWorkout
  )
  
  if (lastWorkoutIndex === -1) {
    // If last workout not found in plan, recommend first non-rest day
    return plan.workouts.find(w => !w.is_rest) || null
  }
  
  // Find next non-rest workout after the last completed one
  for (let i = lastWorkoutIndex + 1; i < plan.workouts.length; i++) {
    if (!plan.workouts[i].is_rest) {
      return plan.workouts[i]
    }
  }
  
  // If no next workout found, loop back to beginning
  for (let i = 0; i < lastWorkoutIndex; i++) {
    if (!plan.workouts[i].is_rest) {
      return plan.workouts[i]
    }
  }
  
  // If still no workout found, return the last completed one
  return plan.workouts[lastWorkoutIndex]
}

