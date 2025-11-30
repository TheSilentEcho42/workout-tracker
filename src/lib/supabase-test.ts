import { supabase, isDatabaseConfigured } from './supabase'

// Comprehensive Supabase testing utility
export const testSupabaseConnection = async () => {
  console.log('🧪 STARTING SUPABASE CONNECTION TEST')
  console.log('=====================================')
  
  // Test 1: Environment Variables
  console.log('\n1️⃣ Testing Environment Variables:')
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('VITE_SUPABASE_URL:', supabaseUrl ? '✅ Set' : '❌ Missing')
  console.log('VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✅ Set' : '❌ Missing')
  console.log('isDatabaseConfigured:', isDatabaseConfigured ? '✅ True' : '❌ False')
  
  if (!isDatabaseConfigured) {
    console.log('❌ Environment variables not properly configured')
    return false
  }
  
  // Test 2: Basic Connection
  console.log('\n2️⃣ Testing Basic Connection:')
  try {
    const { error } = await supabase.from('workouts').select('count').limit(1)
    if (error) {
      console.log('❌ Connection failed:', error.message)
      return false
    }
    console.log('✅ Basic connection successful')
  } catch (err) {
    console.log('❌ Connection error:', err)
    return false
  }
  
  // Test 3: Authentication
  console.log('\n3️⃣ Testing Authentication:')
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.log('❌ Auth error:', error.message)
    } else if (user) {
      console.log('✅ User authenticated:', user.email)
    } else {
      console.log('⚠️ No user authenticated (this is normal if not logged in)')
    }
  } catch (err) {
    console.log('❌ Auth test error:', err)
  }
  
  // Test 4: Table Structure
  console.log('\n4️⃣ Testing Table Structure:')
  const tables = ['workouts', 'workout_sets', 'profiles']
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('*').limit(1)
      if (error) {
        console.log(`❌ Table '${table}' error:`, error.message)
      } else {
        console.log(`✅ Table '${table}' accessible`)
      }
    } catch (err) {
      console.log(`❌ Table '${table}' test error:`, err)
    }
  }
  
  // Test 5: Row Level Security
  console.log('\n5️⃣ Testing Row Level Security:')
  try {
    const { error } = await supabase.from('workouts').select('*')
    if (error && error.message.includes('permission')) {
      console.log('✅ RLS is working (permission denied as expected)')
    } else if (error) {
      console.log('⚠️ RLS test inconclusive:', error.message)
    } else {
      console.log('⚠️ RLS might not be properly configured (got data without auth)')
    }
  } catch (err) {
    console.log('❌ RLS test error:', err)
  }
  
  console.log('\n=====================================')
  console.log('🧪 SUPABASE CONNECTION TEST COMPLETE')
  
  return true
}

// Test database operations with mock data
export const testDatabaseOperations = async () => {
  console.log('\n🔧 TESTING DATABASE OPERATIONS')
  console.log('===============================')
  
  try {
    // Test creating a workout
    console.log('\n1️⃣ Testing workout creation:')
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.log('⚠️ No authenticated user - skipping operation tests')
      console.log('💡 Please log in to test full functionality')
      return false
    }
    
    const testWorkout = {
      user_id: user.id,
      name: 'Test Workout',
      description: 'Testing database operations',
      workout_date: new Date().toISOString().split('T')[0],
      status: 'in_progress',
      ai_generated: false
    }
    
    const { data: workout, error: workoutError } = await supabase
      .from('workouts')
      .insert(testWorkout)
      .select()
      .single()
    
    if (workoutError) {
      console.log('❌ Workout creation failed:', workoutError.message)
      return false
    }
    
    console.log('✅ Workout created successfully:', workout.id)
    
    // Test creating workout sets
    console.log('\n2️⃣ Testing workout set creation:')
    const testSets = [
      {
        workout_id: workout.id,
        exercise_id: 'test-exercise-1',
        exercise_name: 'Test Exercise 1',
        weight: 100,
        reps: 10,
        rir: 2,
        order_index: 0
      },
      {
        workout_id: workout.id,
        exercise_id: 'test-exercise-2',
        exercise_name: 'Test Exercise 2',
        weight: 50,
        reps: 15,
        rir: 1,
        order_index: 1
      }
    ]
    
    const { data: sets, error: setsError } = await supabase
      .from('workout_sets')
      .insert(testSets)
      .select()
    
    if (setsError) {
      console.log('❌ Workout sets creation failed:', setsError.message)
      return false
    }
    
    console.log('✅ Workout sets created successfully:', sets.length, 'sets')
    
    // Test completing workout
    console.log('\n3️⃣ Testing workout completion:')
    const { error: completeError } = await supabase
      .from('workouts')
      .update({ status: 'completed' })
      .eq('id', workout.id)
    
    if (completeError) {
      console.log('❌ Workout completion failed:', completeError.message)
      return false
    }
    
    console.log('✅ Workout completed successfully')
    
    // Test retrieving workout history
    console.log('\n4️⃣ Testing workout history retrieval:')
    const { data: history, error: historyError } = await supabase
      .from('workouts')
      .select(`
        *,
        workout_sets (*)
      `)
      .eq('user_id', user.id)
      .eq('status', 'completed')
    
    if (historyError) {
      console.log('❌ History retrieval failed:', historyError.message)
      return false
    }
    
    console.log('✅ History retrieved successfully:', history.length, 'workouts')
    
    // Cleanup test data
    console.log('\n5️⃣ Cleaning up test data:')
    await supabase.from('workout_sets').delete().eq('workout_id', workout.id)
    await supabase.from('workouts').delete().eq('id', workout.id)
    console.log('✅ Test data cleaned up')
    
    console.log('\n===============================')
    console.log('🔧 ALL DATABASE OPERATIONS WORKING!')
    
    return true
    
  } catch (error) {
    console.log('❌ Database operations test failed:', error)
    return false
  }
}

// Quick diagnostic function
export const quickDiagnostic = async () => {
  console.log('🚀 QUICK SUPABASE DIAGNOSTIC')
  console.log('============================')
  
  const url = import.meta.env.VITE_SUPABASE_URL
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY
  
  console.log('Environment check:')
  console.log('- URL configured:', url ? '✅' : '❌')
  console.log('- Key configured:', key ? '✅' : '❌')
  console.log('- URL looks valid:', url?.includes('supabase.co') ? '✅' : '❌')
  console.log('- Key looks valid:', key?.startsWith('eyJ') ? '✅' : '❌')
  
  if (!url || !key) {
    console.log('\n❌ Environment variables not configured properly')
    console.log('💡 Check your .env file')
    return false
  }
  
  try {
    const { error } = await supabase.from('workouts').select('count').limit(1)
    if (error) {
      console.log('\n❌ Database connection failed:', error.message)
      console.log('💡 Check your Supabase URL and key')
      return false
    }
    console.log('\n✅ Database connection successful!')
    return true
  } catch (err) {
    console.log('\n❌ Connection test failed:', err)
    return false
  }
}
