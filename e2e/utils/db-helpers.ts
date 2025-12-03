import { createClient } from '@supabase/supabase-js'

/**
 * Database helper functions for E2E tests
 * Uses Supabase service role key for admin operations
 */

const supabaseUrl = process.env.VITE_SUPABASE_URL || ''
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('⚠️ Supabase credentials not configured for E2E tests')
}

// Admin client with service role key (bypasses RLS)
export const adminClient = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null

/**
 * Seed test database with sample data
 */
export async function seedTestData(userId: string) {
  if (!adminClient) {
    console.warn('⚠️ Admin client not available, skipping seed')
    return
  }

  // Create test workouts
  const { data: workouts, error: workoutsError } = await adminClient
    .from('workouts')
    .insert([
      {
        user_id: userId,
        name: 'Test Workout 1',
        workout_date: new Date().toISOString().split('T')[0],
        status: 'completed',
        ai_generated: false,
      },
      {
        user_id: userId,
        name: 'Test Workout 2',
        workout_date: new Date().toISOString().split('T')[0],
        status: 'in_progress',
        ai_generated: false,
      },
    ])
    .select()

  if (workoutsError) {
    console.error('Error seeding workouts:', workoutsError)
    return
  }

  // Create test sets for first workout
  if (workouts && workouts.length > 0) {
    await adminClient.from('workout_sets').insert([
      {
        workout_id: workouts[0].id,
        exercise_id: 'bench-press',
        exercise_name: 'Bench Press',
        weight: 135,
        reps: 10,
        rir: 2,
        order_index: 0,
      },
      {
        workout_id: workouts[0].id,
        exercise_id: 'squat',
        exercise_name: 'Squat',
        weight: 225,
        reps: 12,
        rir: 1,
        order_index: 1,
      },
    ])
  }

  return workouts
}

/**
 * Clean up test data for a user
 */
export async function cleanupTestData(userId: string) {
  if (!adminClient) {
    console.warn('⚠️ Admin client not available, skipping cleanup')
    return
  }

  // Delete all workouts (cascade will delete sets)
  await adminClient.from('workouts').delete().eq('user_id', userId)

  // Delete profile if exists
  await adminClient.from('profiles').delete().eq('id', userId)
}

/**
 * Create a test user account
 */
export async function createTestUser(email: string, password: string) {
  if (!adminClient) {
    throw new Error('Admin client not available')
  }

  // Note: In a real scenario, you'd use Supabase Admin API
  // For E2E tests, we'll rely on the app's sign-up flow
  return { email, password }
}


