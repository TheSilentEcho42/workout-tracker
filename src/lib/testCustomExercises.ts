import { supabase } from './supabase'

// Test function to check if custom_exercises table exists and RLS policies work
export const testCustomExercisesTable = async (): Promise<{
  success: boolean
  message: string
  details?: any
}> => {
  try {
    // First, check if we're authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return {
        success: false,
        message: 'User not authenticated. Please log in first.',
        details: authError
      }
    }

    console.log('Authenticated user:', user.id)

    // Test the debug function
    const { data: debugData, error: debugError } = await supabase
      .rpc('debug_auth')
    
    if (debugError) {
      console.error('Debug auth failed:', debugError)
    } else {
      console.log('Debug auth result:', debugData)
    }

    // Test the insert function
    const { data: testResult, error: testError } = await supabase
      .rpc('test_custom_exercise_insert')
    
    if (testError) {
      console.error('Test insert failed:', testError)
      return {
        success: false,
        message: `Test failed: ${testError.message}`,
        details: testError
      }
    }

    console.log('Test result:', testResult)

    // If we get here, the test passed
    return {
      success: true,
      message: testResult || 'Custom exercises table is accessible!',
      details: { userId: user.id, debugData, testResult }
    }
  } catch (error) {
    console.error('Error testing custom exercises table:', error)
    return {
      success: false,
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      details: error
    }
  }
}