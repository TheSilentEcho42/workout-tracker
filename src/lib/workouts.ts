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
import {
  db,
  saveWorkoutOffline,
  getWorkoutsOffline,
  updateWorkoutOffline,
  deleteWorkoutOffline,
  saveExerciseOffline,
  getExercisesOffline,
  addToSyncQueue,
  OfflineWorkout,
  OfflineExercise,
} from './offline/db'

// Check if user is in guest mode (localStorage-based only, for backward compatibility)
// Note: New guest accounts are real database accounts, so they won't use this
const isGuestMode = (): boolean => {
  // Only check for old localStorage guest mode flag
  // New guest accounts are authenticated and use the database
  return localStorage.getItem('guest_mode') === 'true'
}

/**
 * Helper function to check if we're online
 */
const isOnline = (): boolean => {
  return typeof navigator !== 'undefined' && navigator.onLine
}

/**
 * Helper function to check if an error is a network error
 */
const isNetworkError = (error: any): boolean => {
  if (!error) return false
  // Check for network-related error messages
  const networkErrors = ['network', 'fetch', 'connection', 'timeout', 'offline']
  const errorMessage = error.message?.toLowerCase() || ''
  return networkErrors.some(keyword => errorMessage.includes(keyword))
}

/**
 * Convert OfflineWorkout to ActiveWorkout format
 */
const offlineWorkoutToActiveWorkout = (offline: OfflineWorkout, sets: WorkoutSet[] = []): ActiveWorkout => {
  return {
    id: offline.workoutId,
    user_id: offline.userId,
    name: offline.name,
    description: offline.description,
    workout_date: offline.workout_date,
    status: offline.status === 'in_progress' ? 'in_progress' : 'in_progress', // Force in_progress for ActiveWorkout
    ai_generated: offline.ai_generated,
    created_at: offline.createdAt,
    updated_at: offline.updatedAt,
    sets,
  }
}

/**
 * Convert OfflineExercise to WorkoutSet format
 */
const offlineExerciseToWorkoutSet = (offline: OfflineExercise, workoutId: string): WorkoutSet => {
  return {
    id: `offline_${offline.id}`,
    workout_id: workoutId,
    exercise_id: offline.exerciseId,
    exercise_name: offline.exerciseName,
    weight: offline.weight,
    reps: offline.reps,
    rir: offline.rir,
    duration: offline.duration,
    notes: offline.notes,
    order_index: offline.orderIndex,
  }
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
  
  if (!user) throw new Error('User not authenticated')

  // Try online first if available
  if (isOnline() && isDatabaseConfigured) {
    try {
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
      // If network error or offline, fall through to offline storage
      if (!isNetworkError(error) && isOnline()) {
        // Non-network error while online - rethrow
        throw error
      }
      // Network error or offline - continue to offline storage
      console.log('💾 Saving workout offline due to network issue:', error)
    }
  }

  // Offline mode: Save to IndexedDB and queue for sync
  const workoutId = `local_${Date.now()}`
  const workout: ActiveWorkout = {
    id: workoutId,
    user_id: user.id,
    name: data.name,
    description: data.description,
    workout_date: data.workout_date,
    status: 'in_progress',
    ai_generated: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    sets: []
  }

  try {
    await saveWorkoutOffline(workout, user.id)
    await addToSyncQueue('create', 'workout', workoutId, {
      user_id: user.id,
      name: data.name,
      description: data.description,
      workout_date: data.workout_date,
      status: 'in_progress',
      ai_generated: false,
    })
    console.log('✅ Workout saved offline, queued for sync')
  } catch (error) {
    console.error('Failed to save workout offline:', error)
    // Still return the workout object so UI doesn't break
  }

  return workout
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
  
  if (!user) throw new Error('User not authenticated')

  // Ensure weight is properly formatted as a number if present
  const formattedWeight = weight !== undefined && weight !== null 
    ? (typeof weight === 'number' ? weight : parseFloat(String(weight)))
    : undefined
  
  if (formattedWeight !== undefined && isNaN(formattedWeight)) {
    console.error('Invalid weight value:', weight)
    throw new Error('Invalid weight value')
  }

  // Check if workout is stored offline (starts with 'local_')
  const isOfflineWorkout = workout_id.startsWith('local_')
  
  // Try online first if available and not an offline workout
  if (isOnline() && isDatabaseConfigured && !isOfflineWorkout) {
    try {
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

      const { data: savedSets, error } = await supabase
        .from('workout_sets')
        .insert(newSets)
        .select()

      if (error) throw error

      console.log('✅ Sets saved successfully:', savedSets)
      return savedSets
    } catch (error) {
      // If network error, fall through to offline storage
      if (!isNetworkError(error) && isOnline()) {
        throw error
      }
      console.log('💾 Saving sets offline due to network issue:', error)
    }
  }

  // Offline mode: Save to IndexedDB
  // First, find the offline workout by workoutId
  const offlineWorkouts = await db.workouts
    .where('workoutId')
    .equals(workout_id)
    .toArray()
  
  if (offlineWorkouts.length === 0) {
    throw new Error('Workout not found in offline storage')
  }

  const offlineWorkout = offlineWorkouts[0]
  const existingExercises = await getExercisesOffline(offlineWorkout.id!)
  const existingSetsCount = existingExercises.length

  const newSets: WorkoutSet[] = []
  
  for (let index = 0; index < sets; index++) {
    const setData: Omit<WorkoutSet, 'id'> = {
      workout_id,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      weight: formattedWeight,
      reps,
      rir,
      duration,
      notes: '',
      order_index: existingSetsCount + index
    }

    try {
      // Save to IndexedDB and get the Dexie ID
      const offlineId = await saveExerciseOffline(setData as WorkoutSet, offlineWorkout.id!)
      
      // Create WorkoutSet with offline ID format
      const set: WorkoutSet = {
      ...setData,
        id: `offline_${offlineId}`,
      }
      
      await addToSyncQueue('create', 'workout_set', set.id, {
        workout_id,
        exercise_id: exercise.id,
        exercise_name: exercise.name,
        weight: formattedWeight,
        reps,
        rir,
        duration,
        notes: '',
        order_index: existingSetsCount + index,
      })
      newSets.push(set)
    } catch (error) {
      console.error('Failed to save set offline:', error)
    }
  }

  console.log('✅ Sets saved offline, queued for sync')
  return newSets
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
  
  if (!user) throw new Error('User not authenticated')

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

  // Check if set is stored offline (starts with 'offline_set_')
  const isOfflineSet = setId.startsWith('offline_set_')
  
  // Try online first if available and not an offline set
  if (isOnline() && isDatabaseConfigured && !isOfflineSet) {
    try {
      const { error } = await supabase
        .from('workout_sets')
        .update(formattedUpdates)
        .eq('id', setId)

      if (error) throw error
      
      console.log('✅ Set updated successfully:', setId)
      return
    } catch (error) {
      // If network error, fall through to offline storage
      if (!isNetworkError(error) && isOnline()) {
        throw error
      }
      console.log('💾 Updating set offline due to network issue:', error)
    }
  }

  // Offline mode: Update in IndexedDB
  // Extract numeric ID from offline_ prefix
  const offlineId = parseInt(setId.replace('offline_', ''))
  
  if (isNaN(offlineId)) {
    throw new Error('Invalid offline set ID')
  }

  try {
    const exercise = await db.exercises.get(offlineId)
    if (!exercise) {
      throw new Error('Set not found in offline storage')
    }

    // Update exercise in IndexedDB
    await db.exercises.update(offlineId, {
      weight: formattedUpdates.weight !== undefined ? formattedUpdates.weight : exercise.weight,
      reps: formattedUpdates.reps !== undefined ? formattedUpdates.reps : exercise.reps,
      rir: formattedUpdates.rir !== undefined ? formattedUpdates.rir : exercise.rir,
      duration: formattedUpdates.duration !== undefined ? formattedUpdates.duration : exercise.duration,
      notes: formattedUpdates.notes !== undefined ? formattedUpdates.notes : exercise.notes,
    })

    // Queue for sync
    await addToSyncQueue('update', 'workout_set', setId, formattedUpdates)
    console.log('✅ Set updated offline, queued for sync')
  } catch (error) {
    console.error('Failed to update set offline:', error)
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
  
  if (!user) throw new Error('User not authenticated')

  // Check if workout is stored offline
  const isOfflineWorkout = workout_id.startsWith('local_')
  
  // Try online first if available and not an offline workout
  if (isOnline() && isDatabaseConfigured && !isOfflineWorkout) {
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
        order_index: 0
      }

      const { data: savedSet, error } = await supabase
        .from('workout_sets')
        .insert(newSet)
        .select()
        .single()

      if (error) throw error
      return savedSet
    } catch (error) {
      // If network error, fall through to offline storage
      if (!isNetworkError(error) && isOnline()) {
        throw error
      }
      console.log('💾 Adding set offline due to network issue:', error)
    }
  }

  // Offline mode: Save to IndexedDB
  const offlineWorkouts = await db.workouts
    .where('workoutId')
    .equals(workout_id)
    .toArray()
  
  if (offlineWorkouts.length === 0) {
    throw new Error('Workout not found in offline storage')
  }

  const offlineWorkout = offlineWorkouts[0]
  const existingExercises = await getExercisesOffline(offlineWorkout.id!)
  const existingSetsCount = existingExercises.length

  const setData: Omit<WorkoutSet, 'id'> = {
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

  try {
    // Save to IndexedDB and get the Dexie ID
    const offlineId = await saveExerciseOffline(setData as WorkoutSet, offlineWorkout.id!)
    
    // Create WorkoutSet with offline ID format
    const newSet: WorkoutSet = {
      ...setData,
      id: `offline_${offlineId}`,
    }
    
    await addToSyncQueue('create', 'workout_set', newSet.id, setData)
    console.log('✅ Set added offline, queued for sync')
    return newSet
  } catch (error) {
    console.error('Failed to add set offline:', error)
    throw error
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
  
  if (!user) throw new Error('User not authenticated')

  // Check if set is stored offline
  const isOfflineSet = setId.startsWith('offline_set_')
  
  // Try online first if available and not an offline set
  if (isOnline() && isDatabaseConfigured && !isOfflineSet) {
    try {
      const { error } = await supabase
        .from('workout_sets')
        .delete()
        .eq('id', setId)

      if (error) throw error
      return
    } catch (error) {
      // If network error, fall through to offline storage
      if (!isNetworkError(error) && isOnline()) {
        throw error
      }
      console.log('💾 Deleting set offline due to network issue:', error)
    }
  }

  // Offline mode: Delete from IndexedDB
  // Extract numeric ID from offline_ prefix
  const offlineId = parseInt(setId.replace('offline_', ''))
  
  if (isNaN(offlineId)) {
    throw new Error('Invalid offline set ID')
  }

  try {
    const exercise = await db.exercises.get(offlineId)
    if (!exercise) {
      throw new Error('Set not found in offline storage')
    }

    await db.exercises.delete(offlineId)
    
    // Queue for sync
    await addToSyncQueue('delete', 'workout_set', setId, {})
    console.log('✅ Set deleted offline, queued for sync')
  } catch (error) {
    console.error('Failed to delete set offline:', error)
    throw error
  }
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
  
  if (!user) throw new Error('User not authenticated')

  // Check if workout is stored offline
  const isOfflineWorkout = workoutId.startsWith('local_')
  
  // Try online first if available and not an offline workout
  if (isOnline() && isDatabaseConfigured && !isOfflineWorkout) {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ 
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', workoutId)

      if (error) throw error
      
      console.log('✅ Workout completed successfully:', workoutId)
      return
    } catch (error) {
      // If network error, fall through to offline storage
      if (!isNetworkError(error) && isOnline()) {
        throw error
      }
      console.log('💾 Completing workout offline due to network issue:', error)
    }
  }

  // Offline mode: Update in IndexedDB
  const offlineWorkouts = await db.workouts
    .where('workoutId')
    .equals(workoutId)
    .toArray()
  
  if (offlineWorkouts.length === 0) {
    throw new Error('Workout not found in offline storage')
  }

  const offlineWorkout = offlineWorkouts[0]
  
  try {
    await updateWorkoutOffline(offlineWorkout.id!, {
      status: 'completed',
      syncStatus: 'pending',
    })
    
    // Queue for sync
    await addToSyncQueue('update', 'workout', workoutId, {
      status: 'completed',
      updated_at: new Date().toISOString(),
    })
    console.log('✅ Workout completed offline, queued for sync')
  } catch (error) {
    console.error('Failed to complete workout offline:', error)
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
  
  if (!user) throw new Error('User not authenticated')

  // Check if workout is stored offline
  const isOfflineWorkout = workoutId.startsWith('local_')
  
  // Try online first if available and not an offline workout
  if (isOnline() && isDatabaseConfigured && !isOfflineWorkout) {
    try {
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

      if (error) throw error
      
      console.log('✅ Workout completed with summary successfully:', workoutId)
      return
    } catch (error) {
      // If network error, fall through to offline storage
      if (!isNetworkError(error) && isOnline()) {
        throw error
      }
      console.log('💾 Completing workout offline due to network issue:', error)
    }
  }

  // Offline mode: Update in IndexedDB
  const offlineWorkouts = await db.workouts
    .where('workoutId')
    .equals(workoutId)
    .toArray()
  
  if (offlineWorkouts.length === 0) {
    throw new Error('Workout not found in offline storage')
  }

  const offlineWorkout = offlineWorkouts[0]
  
  try {
    await updateWorkoutOffline(offlineWorkout.id!, {
      status: 'completed',
      summary,
      strengths,
      improvements,
      next_steps: nextSteps,
      duration_minutes: durationMinutes,
      syncStatus: 'pending',
    })
    
    // Queue for sync
    await addToSyncQueue('update', 'workout', workoutId, {
      status: 'completed',
      summary,
      strengths,
      improvements,
      next_steps: nextSteps,
      duration_minutes: durationMinutes,
      updated_at: new Date().toISOString(),
    })
    console.log('✅ Workout completed offline with summary, queued for sync')
  } catch (error) {
    console.error('Failed to complete workout offline:', error)
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
  
  if (!user) throw new Error('User not authenticated')

  // Check if workout is stored offline
  const isOfflineWorkout = workoutId.startsWith('local_')
  
  // Try online first if available and not an offline workout
  if (isOnline() && isDatabaseConfigured && !isOfflineWorkout) {
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId)

      if (error) throw error
      
      console.log('✅ Workout deleted successfully:', workoutId)
      return
    } catch (error) {
      // If network error, fall through to offline storage
      if (!isNetworkError(error) && isOnline()) {
        throw error
      }
      console.log('💾 Deleting workout offline due to network issue:', error)
    }
  }

  // Offline mode: Delete from IndexedDB
  const offlineWorkouts = await db.workouts
    .where('workoutId')
    .equals(workoutId)
    .toArray()
  
  if (offlineWorkouts.length === 0) {
    throw new Error('Workout not found in offline storage')
  }

  const offlineWorkout = offlineWorkouts[0]
  
  try {
    await deleteWorkoutOffline(offlineWorkout.id!)
    
    // Queue for sync
    await addToSyncQueue('delete', 'workout', workoutId, {})
    console.log('✅ Workout deleted offline, queued for sync')
  } catch (error) {
    console.error('Failed to delete workout offline:', error)
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

  const allWorkouts: ActiveWorkout[] = []

  // Get online workouts
  if (isOnline() && isDatabaseConfigured) {
    try {
      const { data: workouts, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'in_progress')
        .order('created_at', { ascending: false })

      if (!error && workouts) {
        // Fetch sets for each workout
        for (const workout of workouts) {
          const { data: sets } = await supabase
            .from('workout_sets')
            .select('*')
            .eq('workout_id', workout.id)
            .order('order_index', { ascending: true })

          allWorkouts.push({
            ...workout,
            sets: sets || []
          })
        }
      }
    } catch (error) {
      console.warn('Error fetching online workouts:', error)
    }
  }

  // Get offline workouts
  try {
    const offlineWorkouts = await getWorkoutsOffline(user.id)
    const inProgressOffline = offlineWorkouts.filter(w => w.status === 'in_progress')
    
    for (const offline of inProgressOffline) {
      const exercises = await getExercisesOffline(offline.id!)
      const sets = exercises.map(ex => offlineExerciseToWorkoutSet(ex, offline.workoutId))
      
      allWorkouts.push(offlineWorkoutToActiveWorkout(offline, sets))
    }
  } catch (error) {
    console.warn('Error fetching offline workouts:', error)
  }

  // Sort by created_at descending
  return allWorkouts.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}
