import { http, HttpResponse } from 'msw'
import { createMockUser, createMockWorkout, createMockWorkoutSet, mockWorkouts, mockCompletedWorkouts, mockWorkoutSets } from './data'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://test.supabase.co'

/**
 * MSW handlers for mocking Supabase API calls
 */

export const handlers = [
  // Auth: Get current user
  http.get(`${supabaseUrl}/auth/v1/user`, () => {
    return HttpResponse.json({
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' },
    })
  }),

  // Auth: Get session
  http.get(`${supabaseUrl}/auth/v1/session`, () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: createMockUser(),
    })
  }),

  // Auth: Sign in
  http.post(`${supabaseUrl}/auth/v1/token*`, () => {
    return HttpResponse.json({
      access_token: 'mock-token',
      user: createMockUser(),
      session: {
        access_token: 'mock-token',
        user: createMockUser(),
      },
    })
  }),

  // Auth: Sign up
  http.post(`${supabaseUrl}/auth/v1/signup`, () => {
    return HttpResponse.json({
      user: createMockUser(),
      session: {
        access_token: 'mock-token',
        user: createMockUser(),
      },
    })
  }),

  // Database: Get workouts
  http.get(`${supabaseUrl}/rest/v1/workouts*`, ({ request }) => {
    const url = new URL(request.url)
    const status = url.searchParams.get('status')
    
    if (status === 'completed') {
      return HttpResponse.json(mockCompletedWorkouts)
    }
    if (status === 'in_progress') {
      return HttpResponse.json(mockWorkouts)
    }
    return HttpResponse.json(mockWorkouts)
  }),

  // Database: Create workout
  http.post(`${supabaseUrl}/rest/v1/workouts`, () => {
    return HttpResponse.json([createMockWorkout()], { status: 201 })
  }),

  // Database: Update workout
  http.patch(`${supabaseUrl}/rest/v1/workouts*`, () => {
    return HttpResponse.json([createMockWorkout({ status: 'completed' })], { status: 200 })
  }),

  // Database: Delete workout
  http.delete(`${supabaseUrl}/rest/v1/workouts*`, () => {
    return HttpResponse.json(null, { status: 204 })
  }),

  // Database: Get workout sets
  http.get(`${supabaseUrl}/rest/v1/workout_sets*`, () => {
    return HttpResponse.json(mockWorkoutSets)
  }),

  // Database: Create workout sets
  http.post(`${supabaseUrl}/rest/v1/workout_sets`, () => {
    return HttpResponse.json([createMockWorkoutSet()], { status: 201 })
  }),

  // Database: Update workout set
  http.patch(`${supabaseUrl}/rest/v1/workout_sets*`, () => {
    return HttpResponse.json([createMockWorkoutSet({ weight: 140 })], { status: 200 })
  }),

  // Database: Delete workout set
  http.delete(`${supabaseUrl}/rest/v1/workout_sets*`, () => {
    return HttpResponse.json(null, { status: 204 })
  }),

  // Database: Get profiles
  http.get(`${supabaseUrl}/rest/v1/profiles*`, () => {
    return HttpResponse.json([{
      id: 'test-user-id',
      email: 'test@example.com',
      full_name: 'Test User',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }])
  }),

  // OpenAI: Chat completions (mock)
  http.post('https://api.openai.com/v1/chat/completions', () => {
    return HttpResponse.json({
      id: 'chatcmpl-test',
      object: 'chat.completion',
      created: Date.now(),
      model: 'gpt-4o',
      choices: [{
        index: 0,
        message: {
          role: 'assistant',
          content: JSON.stringify({
            plan: {
              name: 'Test Workout Plan',
              days: [
                {
                  day: 1,
                  name: 'Push Day',
                  exercises: [
                    { name: 'Bench Press', sets: 3, reps: 10, weight: 135 },
                  ],
                },
              ],
            },
          }),
        },
        finish_reason: 'stop',
      }],
      usage: {
        prompt_tokens: 100,
        completion_tokens: 200,
        total_tokens: 300,
      },
    })
  }),
]


