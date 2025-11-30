import { supabase, isDatabaseConfigured } from './supabase'
import { WorkoutSet } from './workouts'
import { getGuestWorkoutHistory } from './guestData'

export interface CompletedWorkout {
  id: string
  user_id: string
  name: string
  description?: string
  workout_date: string
  status: 'completed'
  ai_generated: boolean
  summary?: string
  strengths?: string[]
  improvements?: string[]
  next_steps?: string[]
  duration_minutes?: number
  duration?: number
  created_at: string
  updated_at: string
  sets: WorkoutSet[]
}

export interface ExerciseProgress {
  exercise_name: string
  workout_date: string
  weight?: number
  reps: number
  rir: number
  duration?: number
  workout_name: string
}

export interface ExerciseHistory {
  exercise_name: string
  total_workouts: number
  total_sets: number
  best_weight?: number
  best_reps: number
  progress_data: ExerciseProgress[]
}

// Debug function to check database state
export const debugDatabase = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('No authenticated user')
      return
    }

    console.log('=== DATABASE DEBUG ===')
    console.log('User ID:', user.id)

    // Check all workouts
    const { data: allWorkouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)

    console.log('All workouts:', allWorkouts)
    if (workoutsError) console.error('Workouts error:', workoutsError)

    // Check all sets
    const { data: allSets, error: setsError } = await supabase
      .from('workout_sets')
      .select('*')

    console.log('All sets:', allSets)
    if (setsError) console.error('Sets error:', setsError)

    console.log('=== END DEBUG ===')
  } catch (error) {
    console.error('Debug error:', error)
  }
}

// Check if user is in guest mode (localStorage-based only, for backward compatibility)
// Note: New guest accounts are real database accounts, so they won't use this
const isGuestMode = (): boolean => {
  // Only check for old localStorage guest mode flag
  // New guest accounts are authenticated and use the database
  return localStorage.getItem('guest_mode') === 'true'
}

// Get all completed workouts for a user with their sets
export const getCompletedWorkouts = async (): Promise<CompletedWorkout[]> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    return getGuestWorkoutHistory()
  }
  
  try {
    // Check if database is configured
    if (!isDatabaseConfigured) {
      console.warn('⚠️ Database not configured - returning empty workout history')
      return []
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.error('No authenticated user found')
      return []
    }

    console.log('🔍 Fetching completed workouts for user:', user.id)

    // Test database connection first
    const { error: testError } = await supabase
      .from('workouts')
      .select('count')
      .limit(1)
    
    if (testError) {
      console.error('❌ Database connection test failed:', testError)
      return []
    }

    console.log('✅ Database connection test successful')

    // First get all completed workouts
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .order('workout_date', { ascending: false })

    if (workoutsError) {
      console.error('❌ Error fetching workouts:', workoutsError)
      throw workoutsError
    }

    console.log('📊 Found completed workouts:', workouts?.length || 0)

    // Then get all sets for these workouts
    const workoutIds = workouts?.map(w => w.id) || []
    
    if (workoutIds.length === 0) {
      console.log('ℹ️ No completed workouts found')
      return []
    }

    console.log('🔍 Fetching sets for workout IDs:', workoutIds)

    const { data: sets, error: setsError } = await supabase
      .from('workout_sets')
      .select('*')
      .in('workout_id', workoutIds)
      .order('order_index', { ascending: true })

    if (setsError) {
      console.error('❌ Error fetching sets:', setsError)
      throw setsError
    }

    console.log('📊 Found sets:', sets?.length || 0)

    // Group sets by workout_id
    const setsByWorkout = (sets || []).reduce((acc, set) => {
      if (!acc[set.workout_id]) {
        acc[set.workout_id] = []
      }
      acc[set.workout_id].push(set)
      return acc
    }, {} as Record<string, any[]>)

    console.log('📋 Sets grouped by workout:', Object.keys(setsByWorkout).length, 'workouts')

    // Combine workouts with their sets
    const result = (workouts || []).map(workout => ({
      ...workout,
      sets: setsByWorkout[workout.id] || []
    }))

    console.log('✅ Final result:', result.length, 'completed workouts')
    return result
  } catch (error) {
    console.error('❌ Error in getCompletedWorkouts:', error)
    // Return empty array instead of throwing to prevent UI crashes
    return []
  }
}

// Get exercise history for a specific exercise using real data
export const getExerciseHistory = async (exerciseName: string): Promise<ExerciseHistory> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const history = await getCompletedWorkouts()
    const exerciseSets = history
      .flatMap(workout => workout.sets)
      .filter(set => set.exercise_name === exerciseName)
    
    if (exerciseSets.length === 0) {
      return {
        exercise_name: exerciseName,
        total_workouts: 0,
        total_sets: 0,
        best_weight: undefined,
        best_reps: 0,
        progress_data: []
      }
    }
    
    const progressData: ExerciseProgress[] = exerciseSets.map(set => {
      const workout = history.find(w => w.sets.some(s => s.id === set.id))
      return {
        exercise_name: set.exercise_name,
        workout_date: workout?.workout_date || '',
        weight: set.weight,
        reps: set.reps,
        rir: set.rir,
        duration: set.duration,
        workout_name: workout?.name || ''
      }
    })
    
    const totalWorkouts = new Set(progressData.map(p => p.workout_date)).size
    const totalSets = progressData.length
    const weights = progressData.filter(p => p.weight && p.weight > 0).map(p => p.weight!)
    const bestWeight = weights.length > 0 ? Math.max(...weights) : undefined
    const bestReps = Math.max(...progressData.map(p => p.reps))
    
    return {
      exercise_name: exerciseName,
      total_workouts: totalWorkouts,
      total_sets: totalSets,
      best_weight: bestWeight,
      best_reps: bestReps,
      progress_data: progressData
    }
  }
  
  if (!user) throw new Error('User not authenticated')

  console.log('Getting exercise history for:', exerciseName)

  // First get all completed workouts for this user
  const { data: workouts, error: workoutsError } = await supabase
    .from('workouts')
    .select('id, name, workout_date')
    .eq('user_id', user.id)
    .eq('status', 'completed')
    .order('workout_date', { ascending: true })

  if (workoutsError) {
    console.error('Error fetching workouts:', workoutsError)
    throw workoutsError
  }

  console.log('Found completed workouts:', workouts)

  if (!workouts || workouts.length === 0) {
    return {
      exercise_name: exerciseName,
      total_workouts: 0,
      total_sets: 0,
      best_weight: undefined,
      best_reps: 0,
      progress_data: []
    }
  }

  // Get workout IDs
  const workoutIds = workouts.map(w => w.id)

  // Then get all sets for this exercise from those workouts
  const { data: sets, error: setsError } = await supabase
    .from('workout_sets')
    .select('*')
    .eq('exercise_name', exerciseName)
    .in('workout_id', workoutIds)

  if (setsError) {
    console.error('Error fetching sets:', setsError)
    throw setsError
  }

  console.log('Found sets for exercise:', sets)

  if (!sets || sets.length === 0) {
    return {
      exercise_name: exerciseName,
      total_workouts: 0,
      total_sets: 0,
      best_weight: undefined,
      best_reps: 0,
      progress_data: []
    }
  }

  // Convert to ExerciseProgress format
  const progressData: ExerciseProgress[] = sets.map(set => {
    const workout = workouts.find(w => w.id === set.workout_id)
    return {
      exercise_name: set.exercise_name,
      workout_date: workout?.workout_date || '',
      weight: set.weight,
      reps: set.reps,
      rir: set.rir,
      duration: set.duration,
      workout_name: workout?.name || ''
    }
  })

  // Calculate statistics
  const totalWorkouts = new Set(progressData.map(p => p.workout_date)).size
  const totalSets = progressData.length
  const weights = progressData.filter(p => p.weight && p.weight > 0).map(p => p.weight!)
  const bestWeight = weights.length > 0 ? Math.max(...weights) : undefined
  const bestReps = Math.max(...progressData.map(p => p.reps))

  console.log('Calculated stats:', { totalWorkouts, totalSets, bestWeight, bestReps })

  return {
    exercise_name: exerciseName,
    total_workouts: totalWorkouts,
    total_sets: totalSets,
    best_weight: bestWeight,
    best_reps: bestReps,
    progress_data: progressData
  }
}

// Get all exercises the user has performed using real data
export const getUserExercises = async (): Promise<string[]> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const history = await getCompletedWorkouts()
    const exercises = [...new Set(history.flatMap(workout => workout.sets.map(set => set.exercise_name)))]
    return exercises.sort()
  }
  
  if (!user) throw new Error('User not authenticated')

  // Get distinct exercise names from workout_sets where the workout is completed
  const { data: exercises, error } = await supabase
    .from('workout_sets')
    .select(`
      exercise_name,
      workouts!inner(
        status,
        user_id
      )
    `)
    .eq('workouts.status', 'completed')
    .eq('workouts.user_id', user.id)

  if (error) throw error

  if (!exercises || exercises.length === 0) {
    return []
  }

  // Get unique exercise names
  const uniqueExercises = [...new Set(exercises.map(e => e.exercise_name))]
  return uniqueExercises.sort()
}

// Get weekly workout summary
export const getWeeklyWorkoutSummary = async (): Promise<{
  totalWorkouts: number
  totalDuration: number
  totalSets: number
  totalReps: number
  totalWeight: number
  workouts: CompletedWorkout[]
  summary: string
}> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const history = await getCompletedWorkouts()
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    
    const recentWorkouts = history.filter(workout => 
      new Date(workout.workout_date) >= oneWeekAgo
    )
    
    const totalWorkouts = recentWorkouts.length
    const totalDuration = recentWorkouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
    const totalSets = recentWorkouts.reduce((sum, w) => sum + w.sets.length, 0)
    const totalReps = recentWorkouts.reduce((sum, w) => sum + w.sets.reduce((s, set) => s + set.reps, 0), 0)
    // Calculate total weight lifted: sum of (weight × reps) for each set
    const totalWeight = recentWorkouts.reduce((sum, w) => 
      sum + w.sets.reduce((s, set) => s + ((set.weight || 0) * (set.reps || 0)), 0), 0)
    
    const summary = generateWeeklySummaryText({
      totalWorkouts,
      totalDuration,
      totalSets,
      totalReps,
      totalWeight,
      workouts: recentWorkouts
    })
    
    return {
      totalWorkouts,
      totalDuration,
      totalSets,
      totalReps,
      totalWeight,
      workouts: recentWorkouts,
      summary
    }
  }
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    // Get workouts from the last 7 days
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
    const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0]

    console.log('Getting weekly summary from:', oneWeekAgoStr)

    // Get completed workouts from the last week
    const { data: workouts, error: workoutsError } = await supabase
      .from('workouts')
      .select('*')
      .eq('user_id', user.id)
      .eq('status', 'completed')
      .gte('workout_date', oneWeekAgoStr)
      .order('workout_date', { ascending: false })

    if (workoutsError) {
      console.error('Error fetching weekly workouts:', workoutsError)
      throw workoutsError
    }

    if (!workouts || workouts.length === 0) {
      return {
        totalWorkouts: 0,
        totalDuration: 0,
        totalSets: 0,
        totalReps: 0,
        totalWeight: 0,
        workouts: [],
        summary: "No workouts completed in the last week. Time to get back on track!"
      }
    }

    // Get all sets for these workouts
    const workoutIds = workouts.map(w => w.id)
    const { data: sets, error: setsError } = await supabase
      .from('workout_sets')
      .select('*')
      .in('workout_id', workoutIds)

    if (setsError) {
      console.error('Error fetching weekly sets:', setsError)
      throw setsError
    }

    // Group sets by workout
    const setsByWorkout = (sets || []).reduce((acc, set) => {
      if (!acc[set.workout_id]) {
        acc[set.workout_id] = []
      }
      acc[set.workout_id].push(set)
      return acc
    }, {} as Record<string, any[]>)

    // Combine workouts with their sets
    const workoutsWithSets = workouts.map(workout => ({
      ...workout,
      sets: setsByWorkout[workout.id] || []
    }))

    // Calculate totals
    const totalWorkouts = workouts.length
    const totalDuration = workouts.reduce((sum, w) => sum + (w.duration_minutes || 0), 0)
    const totalSets = (sets || []).length
    const totalReps = (sets || []).reduce((sum, set) => sum + set.reps, 0)
    // Calculate total weight lifted: sum of (weight × reps) for each set
    const totalWeight = (sets || []).reduce((sum, set) => sum + ((set.weight || 0) * (set.reps || 0)), 0)

    // Generate summary
    const summary = generateWeeklySummaryText({
      totalWorkouts,
      totalDuration,
      totalSets,
      totalReps,
      totalWeight,
      workouts: workoutsWithSets
    })

    return {
      totalWorkouts,
      totalDuration,
      totalSets,
      totalReps,
      totalWeight,
      workouts: workoutsWithSets,
      summary
    }
  } catch (error) {
    console.error('Error getting weekly summary:', error)
    throw error
  }
}

// Helper function to generate weekly summary text
const generateWeeklySummaryText = (data: {
  totalWorkouts: number
  totalDuration: number
  totalSets: number
  totalReps: number
  totalWeight: number
  workouts: CompletedWorkout[]
}): string => {
  const { totalWorkouts, totalDuration, totalSets, totalReps, totalWeight } = data

  let summary = `Great week! You completed ${totalWorkouts} workout${totalWorkouts !== 1 ? 's' : ''} `
  
  if (totalDuration > 0) {
    summary += `totaling ${totalDuration} minutes of training. `
  }
  
  summary += `You performed ${totalSets} sets with ${totalReps} total reps`
  
  if (totalWeight > 0) {
    summary += `, moving ${totalWeight.toLocaleString()} pounds of weight`
  }
  
  summary += `. `

  // Add motivational message based on performance
  if (totalWorkouts >= 4) {
    summary += "Excellent consistency! You're building great habits."
  } else if (totalWorkouts >= 2) {
    summary += "Good progress! Consider adding one more workout next week."
  } else {
    summary += "Every workout counts! Try to increase frequency next week."
  }

  return summary
}
