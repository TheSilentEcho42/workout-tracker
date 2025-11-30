import { supabase, isDatabaseConfigured } from './supabase'
import { ExerciseOption } from './exercises'
import {
  saveGuestActiveWorkout,
  getGuestActiveWorkoutById,
  getGuestActiveWorkouts,
  deleteGuestActiveWorkout,
  addGuestCompletedWorkout,
  deleteGuestWorkout
} from './guestData'

// Check if user is in guest mode (localStorage-based only, for backward compatibility)
// Note: New guest accounts are real database accounts, so they won't use this
const isGuestMode = (): boolean => {
  // Only check for old localStorage guest mode flag
  // New guest accounts are authenticated and use the database
  return localStorage.getItem('guest_mode') === 'true'
}

export interface WorkoutSet {
  id: string
  workout_id: string
  exercise_id: string
  exercise_name: string
  weight?: number
  reps: number
  rir: number // Reps in Reserve
  duration?: number // Duration in seconds for time-based exercises
  notes?: string
  order_index: number
}

export interface ActiveWorkout {
  id: string
  user_id: string
  name: string
  description?: string
  workout_date: string
  status: 'in_progress'
  ai_generated: boolean
  created_at: string
  updated_at: string
  sets: WorkoutSet[]
}

export interface CreateWorkoutData {
  name: string
  description?: string
  workout_date: string
}

export interface AddExerciseData {
  workout_id: string
  exercise: ExerciseOption
  sets: number
  reps: number
  weight?: number
  rir: number
  duration?: number
}

// Create a new workout
export const createWorkout = async (data: CreateWorkoutData): Promise<ActiveWorkout> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const workout: ActiveWorkout = {
      id: `guest_workout_${Date.now()}`,
      user_id: 'guest_user',
      name: data.name,
      description: data.description,
      workout_date: data.workout_date,
      status: 'in_progress',
      ai_generated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sets: []
    }
    saveGuestActiveWorkout(workout)
    return workout
  }
  
  try {
    // Check if database is configured
    if (!isDatabaseConfigured) {
      console.warn('⚠️ Database not configured - using mock workout')
      return {
        id: `mock_${Date.now()}`,
        user_id: 'mock_user',
        name: data.name,
        description: data.description,
        workout_date: data.workout_date,
        status: 'in_progress',
        ai_generated: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        sets: []
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('User not authenticated')

    const { data: workout, error } = await supabase
      .from('workouts')
      .insert({
        user_id: user.id,
        name: data.name,
        description: data.description,
        workout_date: data.workout_date,
        status: 'in_progress',
        ai_generated: false
      })
      .select()
      .single()

    if (error) throw error

    return {
      ...workout,
      sets: []
    }
  } catch (error) {
    // Fallback to mock workout if Supabase fails
    console.warn('Supabase error, using mock workout:', error)
    return {
      id: `mock_${Date.now()}`,
      user_id: 'mock_user',
      name: data.name,
      description: data.description,
      workout_date: data.workout_date,
      status: 'in_progress',
      ai_generated: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      sets: []
    }
  }
}

// Add an exercise to a workout
export const addExerciseToWorkout = async (data: AddExerciseData): Promise<WorkoutSet[]> => {
  const { workout_id, exercise, sets, reps, weight, rir, duration } = data
  
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const workout = getGuestActiveWorkoutById(workout_id)
    if (!workout) {
      throw new Error('Workout not found')
    }
    
    const existingSetsCount = workout.sets?.length || 0
    const newSets: WorkoutSet[] = Array.from({ length: sets }, (_, index) => ({
      id: `guest_set_${workout_id}_${Date.now()}_${index}`,
      workout_id,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      weight,
      reps,
      rir,
      duration,
      notes: '',
      order_index: existingSetsCount + index
    }))
    
    workout.sets = [...(workout.sets || []), ...newSets]
    workout.updated_at = new Date().toISOString()
    saveGuestActiveWorkout(workout)
    
    return newSets
  }
  
  try {
    // Ensure weight is properly formatted as a number if present
    const formattedWeight = weight !== undefined && weight !== null 
      ? (typeof weight === 'number' ? weight : parseFloat(String(weight)))
      : undefined
    
    if (formattedWeight !== undefined && isNaN(formattedWeight)) {
      console.error('Invalid weight value:', weight)
      throw new Error('Invalid weight value')
    }
    
    console.log('Adding exercise to workout:', { workout_id, exercise: exercise.name, sets, reps, weight: formattedWeight, rir, duration })
    
    // Create multiple sets for the exercise
    const newSets: Omit<WorkoutSet, 'id'>[] = Array.from({ length: sets }, (_, index) => ({
      workout_id,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      weight: formattedWeight,
      reps,
      rir,
      duration,
      notes: '',
      order_index: index
    }))

    console.log('Created sets to insert:', newSets)
    console.log('Weight values in sets:', newSets.map(s => ({ weight: s.weight, type: typeof s.weight })))

    // Save sets to the database
    const { data: savedSets, error } = await supabase
      .from('workout_sets')
      .insert(newSets)
      .select()

    if (error) {
      console.error('Error saving sets to database:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }

    console.log('✅ Sets saved successfully:', savedSets)
    return savedSets
  } catch (error) {
    console.error('Supabase error, using mock sets:', error)
    // Fallback to mock sets if Supabase fails
    return Array.from({ length: sets }, (_, index) => ({
      id: `mock_set_${Date.now()}_${index}`,
      workout_id,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      weight,
      reps,
      rir,
      duration,
      notes: '',
      order_index: index
    }))
  }
}

// Update a set (weight, reps, rir, notes)
export const updateSet = async (setId: string, updates: Partial<WorkoutSet>): Promise<void> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const activeWorkouts = getGuestActiveWorkouts()
    
    for (const workout of activeWorkouts) {
      if (workout.sets) {
        const setIndex = workout.sets.findIndex((s: WorkoutSet) => s.id === setId)
        if (setIndex !== -1) {
          workout.sets[setIndex] = { ...workout.sets[setIndex], ...updates }
          workout.updated_at = new Date().toISOString()
          saveGuestActiveWorkout(workout)
          return
        }
      }
    }
    throw new Error('Set not found')
  }
  
  try {
    // Ensure weight is properly formatted as a number if present
    const formattedUpdates = { ...updates }
    if ('weight' in formattedUpdates && formattedUpdates.weight !== undefined && formattedUpdates.weight !== null) {
      formattedUpdates.weight = typeof formattedUpdates.weight === 'number' 
        ? formattedUpdates.weight 
        : parseFloat(String(formattedUpdates.weight))
      
      // Validate the weight value
      if (isNaN(formattedUpdates.weight as number)) {
        console.error('Invalid weight value:', updates.weight)
        throw new Error('Invalid weight value')
      }
    }
    
    console.log('Updating set:', setId, 'with updates:', formattedUpdates)
    console.log('Weight value type:', typeof formattedUpdates.weight, 'Value:', formattedUpdates.weight)
    
    const { error } = await supabase
      .from('workout_sets')
      .update(formattedUpdates)
      .eq('id', setId)

    if (error) {
      console.error('Error updating set:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      throw error
    }
    
    console.log('✅ Set updated successfully:', setId)
  } catch (error) {
    console.error('Failed to update set:', error)
    throw error
  }
}

// Add a single set to an existing exercise in a workout
export const addSet = async (data: {
  workout_id: string
  exercise_name: string
  exercise_id: string
  weight?: number
  reps: number
  rir: number
  duration?: number
}): Promise<WorkoutSet> => {
  const { workout_id, exercise_id, exercise_name, weight, reps, rir, duration } = data
  
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const workout = getGuestActiveWorkoutById(workout_id)
    if (!workout) {
      throw new Error('Workout not found')
    }
    
    const existingSetsCount = workout.sets?.length || 0
    const newSet: WorkoutSet = {
      id: `guest_set_${workout_id}_${Date.now()}`,
      workout_id,
      exercise_id,
      exercise_name,
      weight,
      reps,
      rir,
      duration,
      notes: '',
      order_index: existingSetsCount
    }
    
    workout.sets = [...(workout.sets || []), newSet]
    workout.updated_at = new Date().toISOString()
    saveGuestActiveWorkout(workout)
    
    return newSet
  }
  
  try {
    const newSet: Omit<WorkoutSet, 'id'> = {
      workout_id,
      exercise_id,
      exercise_name,
      weight,
      reps,
      rir,
      duration,
      notes: '',
      order_index: 0 // Will be updated if needed
    }

    const { data: savedSet, error } = await supabase
      .from('workout_sets')
      .insert(newSet)
      .select()
      .single()

    if (error) throw error
    return savedSet
  } catch (error) {
    console.error('Supabase error, using mock set:', error)
    return {
      id: `mock_set_${Date.now()}`,
      workout_id,
      exercise_id,
      exercise_name,
      weight,
      reps,
      rir,
      duration,
      notes: '',
      order_index: 0
    }
  }
}

// Delete a set
export const deleteSet = async (setId: string): Promise<void> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const activeWorkouts = getGuestActiveWorkouts()
    
    for (const workout of activeWorkouts) {
      if (workout.sets) {
        const setIndex = workout.sets.findIndex((s: WorkoutSet) => s.id === setId)
        if (setIndex !== -1) {
          workout.sets = workout.sets.filter((s: WorkoutSet) => s.id !== setId)
          workout.updated_at = new Date().toISOString()
          saveGuestActiveWorkout(workout)
          return
        }
      }
    }
    throw new Error('Set not found')
  }
  
  const { error } = await supabase
    .from('workout_sets')
    .delete()
    .eq('id', setId)

  if (error) throw error
}

// Complete a workout
export const completeWorkout = async (workoutId: string): Promise<void> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const workout = getGuestActiveWorkoutById(workoutId)
    if (!workout) {
      throw new Error('Workout not found')
    }
    
    const completedWorkout = {
      ...workout,
      status: 'completed' as const,
      updated_at: new Date().toISOString()
    }
    
    addGuestCompletedWorkout(completedWorkout)
    deleteGuestActiveWorkout(workoutId)
    return
  }
  
  try {
    console.log('Completing workout:', workoutId)
    
    const { error } = await supabase
      .from('workouts')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', workoutId)

    if (error) {
      console.error('Error completing workout:', error)
      throw error
    }
    
    console.log('✅ Workout completed successfully:', workoutId)
  } catch (error) {
    console.error('Failed to complete workout:', error)
    throw error
  }
}

// Complete a workout with summary
export const completeWorkoutWithSummary = async (
  workoutId: string, 
  summary: string, 
  strengths: string[], 
  improvements: string[], 
  nextSteps: string[], 
  durationMinutes: number
): Promise<void> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    const workout = getGuestActiveWorkoutById(workoutId)
    if (!workout) {
      throw new Error('Workout not found')
    }
    
    const completedWorkout = {
      ...workout,
      status: 'completed' as const,
      summary,
      strengths,
      improvements,
      next_steps: nextSteps,
      duration_minutes: durationMinutes,
      updated_at: new Date().toISOString()
    }
    
    addGuestCompletedWorkout(completedWorkout)
    deleteGuestActiveWorkout(workoutId)
    return
  }
  
  try {
    console.log('Completing workout with summary:', workoutId)
    
    const { error } = await supabase
      .from('workouts')
      .update({ 
        status: 'completed',
        summary,
        strengths,
        improvements,
        next_steps: nextSteps,
        duration_minutes: durationMinutes,
        updated_at: new Date().toISOString()
      })
      .eq('id', workoutId)

    if (error) {
      console.error('Error completing workout with summary:', error)
      throw error
    }
    
    console.log('✅ Workout completed with summary successfully:', workoutId)
  } catch (error) {
    console.error('Failed to complete workout with summary:', error)
    throw error
  }
}

// Delete a workout and all its sets (cascade delete)
export const deleteWorkout = async (workoutId: string): Promise<void> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    deleteGuestWorkout(workoutId)
    return
  }
  
  try {
    console.log('Deleting workout:', workoutId)
    
    // Delete the workout - this will cascade delete all workout_sets due to foreign key constraint
    const { error } = await supabase
      .from('workouts')
      .delete()
      .eq('id', workoutId)

    if (error) {
      console.error('Error deleting workout:', error)
      throw error
    }
    
    console.log('✅ Workout deleted successfully:', workoutId)
  } catch (error) {
    console.error('Failed to delete workout:', error)
    throw error
  }
}

// Get user's active workouts
export const getActiveWorkouts = async (): Promise<ActiveWorkout[]> => {
  // Check if user is authenticated first (new guest accounts are authenticated)
  const { data: { user } } = await supabase.auth.getUser()
  
  // Only use localStorage guest mode if not authenticated and old guest mode flag is set
  if (!user && isGuestMode()) {
    return getGuestActiveWorkouts()
  }
  
  if (!user) throw new Error('User not authenticated')
  if (!user) throw new Error('User not authenticated')

  const { data: workouts, error } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .eq('status', 'in_progress')
    .order('created_at', { ascending: false })

  if (error) throw error

  // For now, return workouts without sets (you'll need to implement set fetching)
  return workouts.map(workout => ({
    ...workout,
    sets: []
  }))
}
