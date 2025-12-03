import Dexie, { Table } from 'dexie'
import { ActiveWorkout } from '../workouts'
import { WorkoutSet } from '../workouts'

/**
 * IndexedDB schema for offline storage
 */

export interface OfflineWorkout {
  id?: number
  userId: string
  workoutId: string  // Original Supabase workout ID
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
  syncStatus: 'synced' | 'pending' | 'failed'
  completedAt: string
  createdAt: string
  updatedAt: string
}

export interface OfflineExercise {
  id?: number
  workoutId: number  // Reference to OfflineWorkout.id
  exerciseId: string
  exerciseName: string
  weight?: number
  reps: number
  rir: number
  duration?: number
  notes?: string
  orderIndex: number
}

export interface SyncQueueItem {
  id?: number
  operation: 'create' | 'update' | 'delete'
  entityType: 'workout' | 'workout_set' | 'exercise'
  entityId: string
  status: 'pending' | 'processing' | 'failed' | 'completed'
  timestamp: number
  retryCount: number
  data: any
  error?: string
}

class WorkoutTrackerDB extends Dexie {
  workouts!: Table<OfflineWorkout>
  exercises!: Table<OfflineExercise>
  sync_queue!: Table<SyncQueueItem>

  constructor() {
    super('WorkoutTrackerDB')
    
    this.version(1).stores({
      workouts: '++id, userId, workoutId, completedAt, syncStatus, name',
      exercises: '++id, workoutId, exerciseName',
      sync_queue: '++id, operation, status, timestamp, retryCount',
    })
  }
}

export const db = new WorkoutTrackerDB()

/**
 * Helper functions for offline workout operations
 */

export async function saveWorkoutOffline(workout: Partial<ActiveWorkout>, userId: string): Promise<number> {
  const offlineWorkout: Omit<OfflineWorkout, 'id'> = {
    userId,
    workoutId: workout.id || `local_${Date.now()}`,
    name: workout.name || 'Untitled Workout',
    description: workout.description,
    workout_date: workout.workout_date || new Date().toISOString().split('T')[0],
    status: workout.status || 'in_progress',
    ai_generated: workout.ai_generated || false,
    syncStatus: 'pending',
    completedAt: new Date().toISOString(),
    createdAt: workout.created_at || new Date().toISOString(),
    updatedAt: workout.updated_at || new Date().toISOString(),
  }

  const id = await db.workouts.add(offlineWorkout)
  return id
}

export async function getWorkoutsOffline(userId: string): Promise<OfflineWorkout[]> {
  return await db.workouts
    .where('userId')
    .equals(userId)
    .toArray()
}

export async function updateWorkoutOffline(id: number, updates: Partial<OfflineWorkout>): Promise<void> {
  await db.workouts.update(id, {
    ...updates,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  })
}

export async function deleteWorkoutOffline(id: number): Promise<void> {
  await db.workouts.delete(id)
  // Also delete associated exercises
  await db.exercises.where('workoutId').equals(id).delete()
}

export async function saveExerciseOffline(exercise: WorkoutSet, workoutId: number): Promise<number> {
  const offlineExercise: Omit<OfflineExercise, 'id'> = {
    workoutId,
    exerciseId: exercise.exercise_id,
    exerciseName: exercise.exercise_name,
    weight: exercise.weight,
    reps: exercise.reps,
    rir: exercise.rir,
    duration: exercise.duration,
    notes: exercise.notes,
    orderIndex: exercise.order_index,
  }

  const id = await db.exercises.add(offlineExercise)
  return id
}

export async function getExercisesOffline(workoutId: number): Promise<OfflineExercise[]> {
  return await db.exercises
    .where('workoutId')
    .equals(workoutId)
    .toArray()
}

export async function addToSyncQueue(
  operation: 'create' | 'update' | 'delete',
  entityType: 'workout' | 'workout_set' | 'exercise',
  entityId: string,
  data: any
): Promise<number> {
  const queueItem: Omit<SyncQueueItem, 'id'> = {
    operation,
    entityType,
    entityId,
    status: 'pending',
    timestamp: Date.now(),
    retryCount: 0,
    data,
  }

  const id = await db.sync_queue.add(queueItem)
  return id
}

export async function getSyncQueue(status?: 'pending' | 'processing' | 'failed'): Promise<SyncQueueItem[]> {
  if (status) {
    return await db.sync_queue.where('status').equals(status).toArray()
  }
  return await db.sync_queue.toArray()
}

export async function updateSyncQueueItem(id: number, updates: Partial<SyncQueueItem>): Promise<void> {
  await db.sync_queue.update(id, updates)
}

export async function deleteSyncQueueItem(id: number): Promise<void> {
  await db.sync_queue.delete(id)
}


