import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder_key'

// Enhanced environment variable validation
const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && 
  import.meta.env.VITE_SUPABASE_ANON_KEY &&
  import.meta.env.VITE_SUPABASE_URL !== 'https://placeholder.supabase.co' &&
  import.meta.env.VITE_SUPABASE_ANON_KEY !== 'placeholder_key'

if (!isSupabaseConfigured) {
  console.error('🚨 SUPABASE NOT CONFIGURED!')
  console.error('Please create a .env file with your Supabase credentials:')
  console.error('VITE_SUPABASE_URL=your_supabase_url')
  console.error('VITE_SUPABASE_ANON_KEY=your_supabase_anon_key')
  console.error('')
  console.error('Without proper Supabase configuration:')
  console.error('- Workout history will not work')
  console.error('- Data will not be saved between sessions')
  console.error('- All features will use mock/fallback data')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Export configuration status for debugging
export const isDatabaseConfigured = isSupabaseConfigured

// Database types (you'll generate these later)
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      workouts: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          workout_date: string
          status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          workout_date: string
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          workout_date?: string
          status?: 'planned' | 'in_progress' | 'completed' | 'cancelled'
          ai_generated?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      exercises: {
        Row: {
          id: string
          workout_id: string
          name: string
          sets: number
          reps: number
          weight: number | null
          duration: number | null
          rest_time: number
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          workout_id: string
          name: string
          sets: number
          reps: number
          weight?: number | null
          duration?: number | null
          rest_time: number
          order_index: number
          created_at?: string
        }
        Update: {
          id?: string
          workout_id?: string
          name?: string
          sets?: number
          reps?: number
          weight?: number | null
          duration?: number | null
          rest_time?: number
          order_index?: number
          created_at?: string
        }
      }
    }
  }
}



