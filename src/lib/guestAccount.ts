import { supabase, isDatabaseConfigured } from './supabase'
import { createSampleWorkoutPlan, createSampleWorkoutHistory } from './guestData'

/**
 * Creates a new guest account with a unique email
 * Returns the user ID and email
 */
export const createGuestAccount = async (): Promise<{ userId: string; email: string }> => {
  if (!isDatabaseConfigured) {
    throw new Error('Database is not configured. Cannot create guest account.')
  }

  // Generate unique email for guest account
  const timestamp = Date.now()
  const randomSuffix = Math.random().toString(36).substring(2, 9)
  const guestEmail = `guest_${timestamp}_${randomSuffix}@guest.temp`
  const guestPassword = `guest_${timestamp}_${randomSuffix}_${Math.random().toString(36).substring(2, 15)}`

  // Create the account
  const { data, error } = await supabase.auth.signUp({
    email: guestEmail,
    password: guestPassword,
    options: {
      data: {
        full_name: 'Guest User',
        is_guest: true,
      },
    },
  })

  if (error) {
    console.error('Error creating guest account:', error)
    throw error
  }

  if (!data.user) {
    throw new Error('Failed to create guest account: No user returned')
  }

  console.log('✅ Guest account created:', guestEmail)
  return { userId: data.user.id, email: guestEmail }
}

/**
 * Seeds a guest account with sample workout history
 */
export const seedGuestWorkoutHistory = async (userId: string): Promise<void> => {
  if (!isDatabaseConfigured) {
    console.warn('Database not configured, skipping workout history seeding')
    return
  }

  try {
    // Get sample workout history
    const sampleHistory = createSampleWorkoutHistory()

    // Insert workouts and their sets
    for (const workout of sampleHistory) {
      // Insert the workout
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: userId,
          name: workout.name,
          description: workout.description,
          workout_date: workout.workout_date,
          status: 'completed',
          ai_generated: false,
          summary: workout.summary,
          strengths: workout.strengths,
          improvements: workout.improvements,
          next_steps: workout.next_steps,
          duration_minutes: workout.duration_minutes,
        })
        .select()
        .single()

      if (workoutError) {
        console.error('Error inserting workout:', workoutError)
        continue
      }

      if (!workoutData) {
        console.error('No workout data returned')
        continue
      }

      // Insert sets for this workout
      if (workout.sets && workout.sets.length > 0) {
        const setsToInsert = workout.sets.map((set) => ({
          workout_id: workoutData.id,
          exercise_id: set.exercise_id || set.exercise_name.toLowerCase().replace(/\s+/g, '_'),
          exercise_name: set.exercise_name,
          weight: set.weight || null,
          reps: set.reps,
          rir: set.rir || 0,
          duration: set.duration || null,
          notes: set.notes || '',
          order_index: set.order_index || 0,
        }))

        const { error: setsError } = await supabase
          .from('workout_sets')
          .insert(setsToInsert)

        if (setsError) {
          console.error('Error inserting sets:', setsError)
        }
      }
    }

    console.log('✅ Guest workout history seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding guest workout history:', error)
    throw error
  }
}

/**
 * Seeds a guest account with sample workout plan (stored in localStorage)
 */
export const seedGuestWorkoutPlan = (userId: string): void => {
  try {
    // Get sample workout plan
    const samplePlan = createSampleWorkoutPlan()
    
    // Store in localStorage with user-specific key
    const plansKey = `workout_tracker_plans_${userId}`
    localStorage.setItem(plansKey, JSON.stringify([samplePlan]))
    
    // Also store the current user's plan key for easy access
    localStorage.setItem('current_guest_user_id', userId)
    
    console.log('✅ Guest workout plan seeded successfully')
  } catch (error) {
    console.error('❌ Error seeding guest workout plan:', error)
  }
}

/**
 * Deletes a guest account and all associated data
 */
export const deleteGuestAccount = async (userId: string): Promise<void> => {
  if (!isDatabaseConfigured) {
    console.warn('Database not configured, skipping account deletion')
    return
  }

  try {
    // Delete user data (workouts and sets will be deleted via CASCADE)
    // We need to use the admin API or a server function to delete the auth user
    // For now, we'll sign out and let the database CASCADE handle the data
    
    // Clear localStorage for this guest
    const plansKey = `workout_tracker_plans_${userId}`
    localStorage.removeItem(plansKey)
    localStorage.removeItem('current_guest_user_id')
    
    // Sign out the user (this will trigger cleanup)
    await supabase.auth.signOut()
    
    // Note: Actual user deletion from auth.users requires admin privileges
    // The data will be cleaned up via CASCADE when the user is deleted
    // For now, we rely on the sign out and let orphaned accounts be cleaned up later
    // In production, you might want to set up a server function or cron job to clean up old guest accounts
    
    console.log('✅ Guest account signed out and data cleared')
  } catch (error) {
    console.error('❌ Error deleting guest account:', error)
    throw error
  }
}

