# API Documentation

This document describes all Supabase database operations used in the AI Workout Tracker application.

## Table of Contents

- [Authentication](#authentication)
- [Workout Operations](#workout-operations)
- [Exercise Set Operations](#exercise-set-operations)
- [History & Analytics](#history--analytics)
- [User Profile Operations](#user-profile-operations)
- [Error Handling](#error-handling)

## Authentication

### Sign Up

**Purpose**: Create a new user account.

**Request Format**:
```typescript
await supabase.auth.signUp({
  email: string,
  password: string,
  options: {
    data: {
      full_name: string
    }
  }
})
```

**Response Format**:
```typescript
{
  data: {
    user: User | null,
    session: Session | null
  },
  error: AuthError | null
}
```

**Example**:
```typescript
const { error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
  options: {
    data: {
      full_name: 'John Doe'
    }
  }
})
if (error) throw error
```

**Error Cases**:
- `email` already exists
- `password` too weak
- Invalid email format
- Network errors

---

### Sign In

**Purpose**: Authenticate an existing user.

**Request Format**:
```typescript
await supabase.auth.signInWithPassword({
  email: string,
  password: string
})
```

**Response Format**:
```typescript
{
  data: {
    user: User,
    session: Session
  },
  error: AuthError | null
}
```

**Example**:
```typescript
const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123'
})
if (error) throw error
```

**Error Cases**:
- Invalid credentials
- User not found
- Network errors

---

### Get Current User

**Purpose**: Retrieve the currently authenticated user.

**Request Format**:
```typescript
await supabase.auth.getUser()
```

**Response Format**:
```typescript
{
  data: {
    user: User | null
  },
  error: AuthError | null
}
```

**Example**:
```typescript
const { data: { user }, error } = await supabase.auth.getUser()
if (error) throw error
if (!user) {
  // User not authenticated
}
```

---

### Get Session

**Purpose**: Retrieve the current user session.

**Request Format**:
```typescript
await supabase.auth.getSession()
```

**Response Format**:
```typescript
{
  data: {
    session: Session | null
  },
  error: AuthError | null
}
```

---

### Sign Out

**Purpose**: Sign out the current user.

**Request Format**:
```typescript
await supabase.auth.signOut()
```

**Response Format**:
```typescript
{
  error: AuthError | null
}
```

---

## Workout Operations

### Create Workout

**Purpose**: Create a new workout session.

**Request Format**:
```typescript
await supabase
  .from('workouts')
  .insert({
    user_id: string,        // UUID from auth.users
    name: string,          // Workout name
    description?: string,  // Optional description
    workout_date: string,  // ISO date string (YYYY-MM-DD)
    status?: 'planned' | 'in_progress' | 'completed' | 'cancelled',
    ai_generated?: boolean
  })
  .select()
  .single()
```

**Response Format**:
```typescript
{
  data: {
    id: string,
    user_id: string,
    name: string,
    description: string | null,
    workout_date: string,
    status: string,
    ai_generated: boolean,
    summary: string | null,
    strengths: string[] | null,
    improvements: string[] | null,
    next_steps: string[] | null,
    duration_minutes: number | null,
    created_at: string,
    updated_at: string
  } | null,
  error: PostgrestError | null
}
```

**Example**:
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('User not authenticated')

const { data: workout, error } = await supabase
  .from('workouts')
  .insert({
    user_id: user.id,
    name: 'Push Day',
    description: 'Chest, shoulders, triceps',
    workout_date: new Date().toISOString().split('T')[0],
    status: 'in_progress',
    ai_generated: false
  })
  .select()
  .single()

if (error) throw error
```

**Error Cases**:
- User not authenticated
- Invalid `user_id`
- Missing required fields (`name`, `workout_date`)
- RLS policy violation

---

### Update Workout

**Purpose**: Update an existing workout.

**Request Format**:
```typescript
await supabase
  .from('workouts')
  .update({
    name?: string,
    description?: string,
    status?: 'planned' | 'in_progress' | 'completed' | 'cancelled',
    summary?: string,
    strengths?: string[],
    improvements?: string[],
    next_steps?: string[],
    duration_minutes?: number,
    updated_at: string  // ISO timestamp
  })
  .eq('id', workoutId)
```

**Response Format**:
```typescript
{
  data: Workout[] | null,
  error: PostgrestError | null
}
```

**Example**:
```typescript
const { error } = await supabase
  .from('workouts')
  .update({
    status: 'completed',
    summary: 'Great workout!',
    duration_minutes: 45,
    updated_at: new Date().toISOString()
  })
  .eq('id', workoutId)

if (error) throw error
```

**Error Cases**:
- Workout not found
- User doesn't own the workout (RLS)
- Invalid status value

---

### Complete Workout with Summary

**Purpose**: Mark a workout as completed with AI-generated summary.

**Request Format**:
```typescript
await supabase
  .from('workouts')
  .update({
    status: 'completed',
    summary: string,
    strengths: string[],
    improvements: string[],
    next_steps: string[],
    duration_minutes: number,
    updated_at: string
  })
  .eq('id', workoutId)
```

**Example**:
```typescript
const { error } = await supabase
  .from('workouts')
  .update({
    status: 'completed',
    summary: 'Excellent form and consistency',
    strengths: ['Strong bench press', 'Good endurance'],
    improvements: ['Focus on tricep isolation'],
    next_steps: ['Increase weight next session'],
    duration_minutes: 60,
    updated_at: new Date().toISOString()
  })
  .eq('id', workoutId)
```

---

### Get Active Workouts

**Purpose**: Retrieve all in-progress workouts for the current user.

**Request Format**:
```typescript
await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'in_progress')
  .order('created_at', { ascending: false })
```

**Response Format**:
```typescript
{
  data: Workout[] | null,
  error: PostgrestError | null
}
```

**Example**:
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('User not authenticated')

const { data: workouts, error } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', user.id)
  .eq('status', 'in_progress')
  .order('created_at', { ascending: false })

if (error) throw error
```

---

### Delete Workout

**Purpose**: Delete a workout and all associated sets (cascade delete).

**Request Format**:
```typescript
await supabase
  .from('workouts')
  .delete()
  .eq('id', workoutId)
```

**Response Format**:
```typescript
{
  data: Workout[] | null,
  error: PostgrestError | null
}
```

**Example**:
```typescript
const { error } = await supabase
  .from('workouts')
  .delete()
  .eq('id', workoutId)

if (error) throw error
// Note: workout_sets are automatically deleted due to foreign key cascade
```

**Error Cases**:
- Workout not found
- User doesn't own the workout (RLS)

---

## Exercise Set Operations

### Add Exercise Sets to Workout

**Purpose**: Add one or more sets of an exercise to a workout.

**Request Format**:
```typescript
await supabase
  .from('workout_sets')
  .insert([
    {
      workout_id: string,
      exercise_id: string,
      exercise_name: string,
      weight?: number,      // Weight in kg/lbs (nullable)
      reps: number,         // Number of repetitions
      rir: number,          // Reps in Reserve (RPE scale)
      duration?: number,    // Duration in seconds (for time-based exercises)
      notes?: string,
      order_index: number   // Order within workout
    },
    // ... more sets
  ])
  .select()
```

**Response Format**:
```typescript
{
  data: WorkoutSet[] | null,
  error: PostgrestError | null
}
```

**Example**:
```typescript
const newSets = Array.from({ length: 3 }, (_, index) => ({
  workout_id: 'workout-uuid',
  exercise_id: 'bench-press',
  exercise_name: 'Bench Press',
  weight: 135,
  reps: 10,
  rir: 2,
  notes: '',
  order_index: index
}))

const { data: savedSets, error } = await supabase
  .from('workout_sets')
  .insert(newSets)
  .select()

if (error) throw error
```

**Error Cases**:
- Invalid `workout_id` (workout doesn't exist)
- Missing required fields (`exercise_name`, `reps`, `rir`)
- Invalid weight format (must be number or null)
- RLS policy violation

---

### Update Set

**Purpose**: Update an existing exercise set.

**Request Format**:
```typescript
await supabase
  .from('workout_sets')
  .update({
    weight?: number,
    reps?: number,
    rir?: number,
    duration?: number,
    notes?: string
  })
  .eq('id', setId)
```

**Response Format**:
```typescript
{
  data: WorkoutSet[] | null,
  error: PostgrestError | null
}
```

**Example**:
```typescript
const { error } = await supabase
  .from('workout_sets')
  .update({
    weight: 140,
    reps: 8,
    rir: 1
  })
  .eq('id', setId)

if (error) throw error
```

**Error Cases**:
- Set not found
- Invalid weight value (NaN)
- User doesn't own the workout (RLS)

---

### Delete Set

**Purpose**: Delete an exercise set.

**Request Format**:
```typescript
await supabase
  .from('workout_sets')
  .delete()
  .eq('id', setId)
```

**Response Format**:
```typescript
{
  data: WorkoutSet[] | null,
  error: PostgrestError | null
}
```

**Example**:
```typescript
const { error } = await supabase
  .from('workout_sets')
  .delete()
  .eq('id', setId)

if (error) throw error
```

---

### Get Sets for Workout

**Purpose**: Retrieve all sets for a specific workout.

**Request Format**:
```typescript
await supabase
  .from('workout_sets')
  .select('*')
  .eq('workout_id', workoutId)
  .order('order_index', { ascending: true })
```

**Response Format**:
```typescript
{
  data: WorkoutSet[] | null,
  error: PostgrestError | null
}
```

**Example**:
```typescript
const { data: sets, error } = await supabase
  .from('workout_sets')
  .select('*')
  .eq('workout_id', workoutId)
  .order('order_index', { ascending: true })

if (error) throw error
```

---

## History & Analytics

### Get Completed Workouts

**Purpose**: Retrieve all completed workouts with their sets for the current user.

**Request Format**:
```typescript
// Step 1: Get completed workouts
const { data: workouts, error } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'completed')
  .order('workout_date', { ascending: false })

// Step 2: Get sets for these workouts
const workoutIds = workouts.map(w => w.id)
const { data: sets, error: setsError } = await supabase
  .from('workout_sets')
  .select('*')
  .in('workout_id', workoutIds)
  .order('order_index', { ascending: true })
```

**Response Format**:
```typescript
{
  workouts: CompletedWorkout[],  // Workouts with sets attached
  error: PostgrestError | null
}
```

**Example**:
```typescript
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw new Error('User not authenticated')

// Get workouts
const { data: workouts, error: workoutsError } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', user.id)
  .eq('status', 'completed')
  .order('workout_date', { ascending: false })

if (workoutsError) throw workoutsError

// Get sets
const workoutIds = workouts?.map(w => w.id) || []
const { data: sets, error: setsError } = await supabase
  .from('workout_sets')
  .select('*')
  .in('workout_id', workoutIds)
  .order('order_index', { ascending: true })

if (setsError) throw setsError

// Group sets by workout
const setsByWorkout = (sets || []).reduce((acc, set) => {
  if (!acc[set.workout_id]) acc[set.workout_id] = []
  acc[set.workout_id].push(set)
  return acc
}, {} as Record<string, WorkoutSet[]>)

// Combine workouts with sets
const workoutsWithSets = (workouts || []).map(workout => ({
  ...workout,
  sets: setsByWorkout[workout.id] || []
}))
```

---

### Get Exercise History

**Purpose**: Get all historical data for a specific exercise.

**Request Format**:
```typescript
// Step 1: Get completed workouts
const { data: workouts, error } = await supabase
  .from('workouts')
  .select('id, name, workout_date')
  .eq('user_id', userId)
  .eq('status', 'completed')
  .order('workout_date', { ascending: true })

// Step 2: Get sets for this exercise
const workoutIds = workouts.map(w => w.id)
const { data: sets, error: setsError } = await supabase
  .from('workout_sets')
  .select('*')
  .eq('exercise_name', exerciseName)
  .in('workout_id', workoutIds)
```

**Response Format**:
```typescript
{
  exercise_name: string,
  total_workouts: number,
  total_sets: number,
  best_weight?: number,
  best_reps: number,
  progress_data: ExerciseProgress[]
}
```

**Example**:
```typescript
const exerciseName = 'Bench Press'

// Get workouts
const { data: workouts, error: workoutsError } = await supabase
  .from('workouts')
  .select('id, name, workout_date')
  .eq('user_id', user.id)
  .eq('status', 'completed')
  .order('workout_date', { ascending: true })

if (workoutsError) throw workoutsError

// Get sets
const workoutIds = workouts.map(w => w.id)
const { data: sets, error: setsError } = await supabase
  .from('workout_sets')
  .select('*')
  .eq('exercise_name', exerciseName)
  .in('workout_id', workoutIds)

if (setsError) throw setsError

// Calculate statistics
const progressData = sets.map(set => {
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

const totalWorkouts = new Set(progressData.map(p => p.workout_date)).size
const totalSets = progressData.length
const weights = progressData.filter(p => p.weight && p.weight > 0).map(p => p.weight!)
const bestWeight = weights.length > 0 ? Math.max(...weights) : undefined
const bestReps = Math.max(...progressData.map(p => p.reps))
```

---

### Get Weekly Workout Summary

**Purpose**: Get statistics for workouts completed in the last 7 days.

**Request Format**:
```typescript
const oneWeekAgo = new Date()
oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
const oneWeekAgoStr = oneWeekAgo.toISOString().split('T')[0]

// Get workouts
const { data: workouts, error } = await supabase
  .from('workouts')
  .select('*')
  .eq('user_id', userId)
  .eq('status', 'completed')
  .gte('workout_date', oneWeekAgoStr)
  .order('workout_date', { ascending: false })

// Get sets
const workoutIds = workouts.map(w => w.id)
const { data: sets, error: setsError } = await supabase
  .from('workout_sets')
  .select('*')
  .in('workout_id', workoutIds)
```

**Response Format**:
```typescript
{
  totalWorkouts: number,
  totalDuration: number,    // Total minutes
  totalSets: number,
  totalReps: number,
  totalWeight: number,     // Total weight × reps
  workouts: CompletedWorkout[],
  summary: string           // Generated summary text
}
```

---

### Get User Exercises

**Purpose**: Get a list of all unique exercises the user has performed.

**Request Format**:
```typescript
await supabase
  .from('workout_sets')
  .select(`
    exercise_name,
    workouts!inner(
      status,
      user_id
    )
  `)
  .eq('workouts.status', 'completed')
  .eq('workouts.user_id', userId)
```

**Response Format**:
```typescript
{
  data: Array<{ exercise_name: string }> | null,
  error: PostgrestError | null
}
```

**Example**:
```typescript
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

// Get unique exercise names
const uniqueExercises = [...new Set(exercises.map(e => e.exercise_name))]
```

---

## User Profile Operations

### Get User Profile

**Purpose**: Retrieve user profile information.

**Request Format**:
```typescript
await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single()
```

**Response Format**:
```typescript
{
  data: {
    id: string,
    email: string,
    full_name: string | null,
    avatar_url: string | null,
    created_at: string,
    updated_at: string
  } | null,
  error: PostgrestError | null
}
```

---

### Update User Profile

**Purpose**: Update user profile information.

**Request Format**:
```typescript
await supabase
  .from('profiles')
  .update({
    full_name?: string,
    avatar_url?: string,
    updated_at: string
  })
  .eq('id', userId)
```

---

## Error Handling

### Common Error Types

1. **PostgrestError**: Database operation errors
   - `code`: Error code (e.g., '23505' for unique violation)
   - `message`: Human-readable error message
   - `details`: Additional error details

2. **AuthError**: Authentication errors
   - `message`: Error description
   - `status`: HTTP status code

### Error Handling Pattern

```typescript
try {
  const { data, error } = await supabase
    .from('workouts')
    .insert(workoutData)
    .select()
    .single()

  if (error) {
    console.error('Database error:', error)
    throw error
  }

  return data
} catch (error) {
  // Handle error
  if (error.code === '23505') {
    // Handle unique constraint violation
  } else if (error.code === 'PGRST116') {
    // Handle not found
  } else {
    // Handle other errors
  }
  throw error
}
```

### RLS Policy Errors

If you receive an error about insufficient permissions, check:
1. User is authenticated
2. RLS policies are correctly configured
3. User owns the resource (for user-specific data)

---

## Type Definitions

### WorkoutSet

```typescript
interface WorkoutSet {
  id: string
  workout_id: string
  exercise_id: string
  exercise_name: string
  weight?: number
  reps: number
  rir: number
  duration?: number
  notes?: string
  order_index: number
}
```

### ActiveWorkout

```typescript
interface ActiveWorkout {
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
```

### CompletedWorkout

```typescript
interface CompletedWorkout {
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
  created_at: string
  updated_at: string
  sets: WorkoutSet[]
}
```

---

## Best Practices

1. **Always check authentication** before database operations
2. **Handle errors gracefully** with try-catch blocks
3. **Use transactions** for multi-step operations (when available)
4. **Validate input** before sending to database
5. **Use RLS policies** for security (never bypass client-side)
6. **Order results** for consistent UI display
7. **Limit queries** when possible to reduce data transfer
8. **Cache results** using React Query for better performance


