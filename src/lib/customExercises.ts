import { supabase } from './supabase'
import { CustomExercise } from '@/types'

export const createCustomExercise = async (exercise: Omit<CustomExercise, 'id' | 'created_at' | 'updated_at'>): Promise<CustomExercise> => {
  console.log('Attempting to create custom exercise:', exercise)
  
  const { data, error } = await supabase
    .from('custom_exercises')
    .insert([exercise])
    .select()
    .single()

  if (error) {
    console.error('Error creating custom exercise:', error)
    console.error('Error details:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint
    })
    throw new Error(`Failed to create custom exercise: ${error.message}`)
  }

  console.log('Custom exercise created successfully:', data)
  return data
}

export const getUserCustomExercises = async (userId: string): Promise<CustomExercise[]> => {
  const { data, error } = await supabase
    .from('custom_exercises')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  if (error) {
    console.error('Error fetching custom exercises:', error)
    throw new Error(`Failed to fetch custom exercises: ${error.message}`)
  }

  return data || []
}

export const updateCustomExercise = async (id: string, updates: Partial<CustomExercise>): Promise<CustomExercise> => {
  const { data, error } = await supabase
    .from('custom_exercises')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating custom exercise:', error)
    throw new Error(`Failed to update custom exercise: ${error.message}`)
  }

  return data
}

export const deleteCustomExercise = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('custom_exercises')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting custom exercise:', error)
    throw new Error(`Failed to delete custom exercise: ${error.message}`)
  }
}

export const searchCustomExercises = async (userId: string, query: string): Promise<CustomExercise[]> => {
  if (!query.trim()) return []

  const { data, error } = await supabase
    .from('custom_exercises')
    .select('*')
    .eq('user_id', userId)
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(10)

  if (error) {
    console.error('Error searching custom exercises:', error)
    return []
  }

  return data || []
}
