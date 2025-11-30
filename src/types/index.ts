export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Workout {
  id: string
  user_id: string
  name: string
  description?: string
  workout_date: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  ai_generated: boolean
  summary?: string
  strengths?: string[]
  improvements?: string[]
  next_steps?: string[]
  duration_minutes?: number
  created_at: string
  updated_at: string
}

export interface Exercise {
  id: string
  workout_id: string
  name: string
  sets: number
  reps: number
  weight?: number
  duration?: number
  rest_time: number
  order_index: number
  created_at: string
}

export interface WorkoutWithExercises extends Workout {
  exercises: Exercise[]
}

export interface AIWorkoutRequest {
  user_id: string
  fitness_level: 'beginner' | 'intermediate' | 'advanced'
  goals: string[]
  available_equipment: string[]
  workout_duration: number // in minutes
  focus_areas: string[]
  previous_injuries?: string[]
}

export interface AIWorkoutResponse {
  workout: Omit<Workout, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  exercises: Omit<Exercise, 'id' | 'workout_id' | 'created_at'>[]
  reasoning: string
  next_workout_suggestions: string[]
}

// Active workout types for real-time workout tracking
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

export interface ActiveWorkoutType {
  id: string
  user_id: string
  name: string
  description?: string
  workout_date: string
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled'
  ai_generated: boolean
  sets: WorkoutSet[]
  created_at: string
  updated_at: string
}

// User profile for AI workout generation
export interface UserProfile {
  experience_level: string
  goals: string[]
  days_per_week: number
  equipment: string[]
  injury_history: string[]
  age: number
  current_fitness: string
  time_per_session: number
  unavailable_days: string[]
}

export interface CustomExercise {
  id: string
  user_id: string
  name: string
  category: 'strength' | 'cardio' | 'flexibility' | 'bodyweight'
  equipment: string[]
  muscle_groups: string[]
  instructions?: string
  is_time_based: boolean
  created_at: string
  updated_at: string
}

export interface ExerciseMatchResult {
  matched: boolean
  suggested_exercise?: string
  confidence: number
  reason?: string
}



