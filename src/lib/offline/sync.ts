import { db, getSyncQueue, updateSyncQueueItem, deleteSyncQueueItem, SyncQueueItem } from './db'
import { supabase } from '../supabase'
import { WorkoutSet } from '../workouts'

/**
 * Sync queue manager for offline operations
 */

const MAX_RETRIES = 5

/**
 * Process sync queue when online
 */
export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  if (!navigator.onLine) {
    console.log('⚠️ Offline - cannot process sync queue')
    return { success: 0, failed: 0 }
  }

  const pendingItems = await getSyncQueue('pending')
  const failedItems = await getSyncQueue('failed')

  const itemsToProcess = [...pendingItems, ...failedItems]
  
  if (itemsToProcess.length === 0) {
    return { success: 0, failed: 0 }
  }

  let success = 0
  let failed = 0

  for (const item of itemsToProcess) {
    try {
      // Mark as processing
      await updateSyncQueueItem(item.id!, { status: 'processing' })

      // Process based on operation type
      const result = await processSyncItem(item)

      if (result.success) {
        // Mark as completed and remove from queue
        await deleteSyncQueueItem(item.id!)
        success++
      } else {
        // Mark as failed and increment retry count
        const newRetryCount = item.retryCount + 1
        const status = newRetryCount >= MAX_RETRIES ? 'failed' : 'pending'
        
        await updateSyncQueueItem(item.id!, {
          status,
          retryCount: newRetryCount,
          error: result.error,
        })
        
        if (status === 'failed') {
          failed++
        }
      }
    } catch (error) {
      console.error('Error processing sync item:', error)
      const newRetryCount = item.retryCount + 1
      const status = newRetryCount >= MAX_RETRIES ? 'failed' : 'pending'
      
      await updateSyncQueueItem(item.id!, {
        status,
        retryCount: newRetryCount,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
      
      if (status === 'failed') {
        failed++
      }
    }
  }

  return { success, failed }
}

/**
 * Process a single sync queue item
 */
async function processSyncItem(item: SyncQueueItem): Promise<{ success: boolean; error?: string }> {
  const { operation, entityType, entityId, data } = item

  try {
    switch (entityType) {
      case 'workout':
        return await syncWorkout(operation, entityId, data)
      case 'workout_set':
      case 'exercise':
        return await syncWorkoutSet(operation, entityId, data)
      default:
        return { success: false, error: 'Unknown entity type' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Sync workout operation
 */
async function syncWorkout(
  operation: 'create' | 'update' | 'delete',
  entityId: string,
  data: any // Using any to support workout completion fields (summary, strengths, etc.)
): Promise<{ success: boolean; error?: string }> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'User not authenticated' }
  }

  try {
    switch (operation) {
      case 'create': {
        const { data: createdWorkout, error } = await supabase
          .from('workouts')
          .insert({
            user_id: user.id,
            name: data.name!,
            description: data.description,
            workout_date: data.workout_date!,
            status: data.status || 'in_progress',
            ai_generated: data.ai_generated || false,
          })
          .select()
          .single()
        if (error) throw error
        
        // Update offline workout with new Supabase ID if it was a local workout
        if (entityId.startsWith('local_') && createdWorkout) {
          const offlineWorkouts = await db.workouts
            .where('workoutId')
            .equals(entityId)
            .toArray()
          if (offlineWorkouts.length > 0) {
            await db.workouts.update(offlineWorkouts[0].id!, {
              workoutId: createdWorkout.id,
              syncStatus: 'synced',
            })
          }
        }
        return { success: true }
      }

      case 'update': {
        // Handle offline workout IDs - need to find the real Supabase ID
        let workoutId = entityId
        if (entityId.startsWith('local_')) {
          const offlineWorkouts = await db.workouts
            .where('workoutId')
            .equals(entityId)
            .toArray()
          if (offlineWorkouts.length > 0 && !offlineWorkouts[0].workoutId.startsWith('local_')) {
            workoutId = offlineWorkouts[0].workoutId
          } else {
            // Workout hasn't been synced yet, skip update (will be handled on create)
            return { success: true }
          }
        }
        
        const updateData: any = {
          updated_at: new Date().toISOString(),
        }
        if (data.name) updateData.name = data.name
        if (data.description !== undefined) updateData.description = data.description
        if (data.status) updateData.status = data.status
        if (data.summary) updateData.summary = data.summary
        if (data.strengths) updateData.strengths = data.strengths
        if (data.improvements) updateData.improvements = data.improvements
        if (data.next_steps) updateData.next_steps = data.next_steps
        if (data.duration_minutes !== undefined) updateData.duration_minutes = data.duration_minutes
        
        const { error } = await supabase
          .from('workouts')
          .update(updateData)
          .eq('id', workoutId)
        if (error) throw error
        return { success: true }
      }

      case 'delete': {
        // Handle offline workout IDs
        let workoutId = entityId
        if (entityId.startsWith('local_')) {
          const offlineWorkouts = await db.workouts
            .where('workoutId')
            .equals(entityId)
            .toArray()
          if (offlineWorkouts.length > 0 && !offlineWorkouts[0].workoutId.startsWith('local_')) {
            workoutId = offlineWorkouts[0].workoutId
          } else {
            // Workout was never synced, just delete from offline storage (already done)
            return { success: true }
          }
        }
        
        const { error } = await supabase.from('workouts').delete().eq('id', workoutId)
        if (error) throw error
        return { success: true }
      }

      default:
        return { success: false, error: 'Unknown operation' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Sync workout set operation
 */
async function syncWorkoutSet(
  operation: 'create' | 'update' | 'delete',
  entityId: string,
  data: Partial<WorkoutSet>
): Promise<{ success: boolean; error?: string }> {
  try {
    switch (operation) {
      case 'create': {
        // Handle offline workout IDs - need to find the real Supabase workout ID
        let workoutId = data.workout_id!
        if (workoutId.startsWith('local_')) {
          const offlineWorkouts = await db.workouts
            .where('workoutId')
            .equals(workoutId)
            .toArray()
          if (offlineWorkouts.length > 0 && !offlineWorkouts[0].workoutId.startsWith('local_')) {
            workoutId = offlineWorkouts[0].workoutId
          } else {
            // Workout hasn't been synced yet, skip (will be handled when workout syncs)
            return { success: true }
          }
        }
        
        const { error } = await supabase.from('workout_sets').insert({
          workout_id: workoutId,
          exercise_id: data.exercise_id!,
          exercise_name: data.exercise_name!,
          weight: data.weight,
          reps: data.reps!,
          rir: data.rir!,
          duration: data.duration,
          notes: data.notes,
          order_index: data.order_index!,
        })
        if (error) throw error
        return { success: true }
      }

      case 'update': {
        // Offline sets use offline_ prefix, but we can't update them in Supabase
        // because they don't exist there yet. Skip if offline ID.
        if (entityId.startsWith('offline_')) {
          // Set was created offline and workout might not be synced yet
          // This will be handled when the workout is synced
          return { success: true }
        }
        
        const { error } = await supabase
          .from('workout_sets')
          .update({
            weight: data.weight,
            reps: data.reps,
            rir: data.rir,
            duration: data.duration,
            notes: data.notes,
          })
          .eq('id', entityId)
        if (error) throw error
        return { success: true }
      }

      case 'delete': {
        // Offline sets can't be deleted from Supabase if they don't exist there
        if (entityId.startsWith('offline_')) {
          // Set was created offline and never synced, already deleted locally
          return { success: true }
        }
        
        const { error } = await supabase.from('workout_sets').delete().eq('id', entityId)
        if (error) throw error
        return { success: true }
      }

      default:
        return { success: false, error: 'Unknown operation' }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Get sync queue status
 */
export async function getSyncQueueStatus(): Promise<{
  pending: number
  failed: number
  total: number
}> {
  const pending = await getSyncQueue('pending')
  const failed = await getSyncQueue('failed')
  const total = await getSyncQueue()

  return {
    pending: pending.length,
    failed: failed.length,
    total: total.length,
  }
}

