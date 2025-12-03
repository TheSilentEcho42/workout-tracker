import OpenAI from 'openai'

// Constants
const API_KEY_PLACEHOLDER = 'your_openai_api_key_here'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, use backend API calls
})

// Model selection based on task complexity and cost
const MODELS = {
  SIMPLE: 'gpt-4o-mini',      // $0.15/1M input, $0.60/1M output - for basic tasks
  STANDARD: 'gpt-4o'          // $2.50/1M input, $10.00/1M output - for complex reasoning
}

// Cost estimation (per 1M tokens)
const COST_ESTIMATES = {
  [MODELS.SIMPLE]: { input: 0.15, output: 0.60 },
  [MODELS.STANDARD]: { input: 2.50, output: 10.00 }
}

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
  height?: number // in cm
  weight?: number // in kg
}

export interface Workout {
  day: string
  focus: string
  exercises: string[]
  is_rest: boolean
}

export interface WorkoutPlan {
  id: string
  name: string
  description: string
  split_type: string
  days_per_week: number
  workouts: Workout[]
}

export interface AIResponse<T = unknown> {
  success: boolean
  data: T
  error?: string
  tokenUsage?: {
    model: string
    inputTokens: number
    outputTokens: number
    estimatedCost: number
  }
}

// Helper: Check if API key is valid
const isApiKeyValid = (): boolean => {
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY
  return !!(apiKey && apiKey !== API_KEY_PLACEHOLDER)
}

// Helper: Format unavailable days list for prompts
const formatUnavailableDays = (unavailableDays: string[]): string => {
  return unavailableDays.length > 0 
    ? unavailableDays.map(day => day.charAt(0).toUpperCase() + day.slice(1)).join(', ')
    : 'None'
}

// Helper: Enforce unavailable days in workout plans
const enforceUnavailableDays = (workouts: Workout[], unavailableDays: string[]): Workout[] => {
  return workouts.map((workout) => {
    const dayName = workout.day || ''
    const isUnavailable = isDayUnavailable(dayName, unavailableDays)
    
    if (isUnavailable) {
      return {
        ...workout,
        day: dayName,
        focus: 'Rest',
        exercises: [],
        is_rest: true
      }
    }
    return workout
  })
}

// Helper: Log error details consistently
const logError = (error: unknown, context: string): void => {
  console.error(`❌ ${context}:`, error)
  console.error('🔍 Error details:', {
    name: error instanceof Error ? error.name : 'Unknown',
    message: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : 'No stack trace'
  })
}

// Dispatch cost event for monitoring
function dispatchCostEvent(operation: string, cost: number) {
  const event = new CustomEvent('ai-cost-log', {
    detail: { operation, cost }
  })
  window.dispatchEvent(event)
}

// Calculate estimated cost for token usage
function calculateCost(inputTokens: number, outputTokens: number, model: string): number {
  const costs = COST_ESTIMATES[model as keyof typeof COST_ESTIMATES]
  if (!costs) return 0
  
  const inputCost = (inputTokens / 1000000) * costs.input
  const outputCost = (outputTokens / 1000000) * costs.output
  
  return inputCost + outputCost
}

// Generate contextual follow-up questions based on user profile
export const generateFollowUpQuestions = async (profile: UserProfile): Promise<AIResponse<string[]>> => {
  try {
    console.log('🔍 Starting AI follow-up questions generation...')
    console.log('📊 User Profile:', profile)
    
    // Check if API key is available
    if (!isApiKeyValid()) {
      console.error('❌ No OpenAI API key found in environment variables')
      return {
        success: false,
        data: generateFallbackQuestions(profile),
        error: 'OpenAI API key not configured'
      }
    }
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY!
    console.log('🔑 API Key found, length:', apiKey.length)
    
    const prompt = `You are a fitness expert creating personalized workout plans. Generate exactly 3-5 relevant follow-up questions.

IMPORTANT: Respond ONLY with a valid JSON array of strings. No markdown, no explanations, no additional text.

User Profile:
- Experience: ${profile.experience_level}
- Goals: ${profile.goals.join(', ')}
- Days per week: ${profile.days_per_week}
- Equipment: ${profile.equipment.join(', ')}
- Injuries: ${profile.injury_history.length > 0 ? profile.injury_history.join(', ') : 'None'}
- Age: ${profile.age}
- Fitness level: ${profile.current_fitness}
- Session time: ${profile.time_per_session} minutes
- Height: ${profile.height ? `${profile.height} cm` : 'Not provided'}
- Weight: ${profile.weight ? `${profile.weight} kg` : 'Not provided'}

Generate specific, actionable questions that will help create the best workout plan. Focus on:
1. Specific limitations or preferences
2. Previous exercise experience details
3. Specific goals clarification
4. Equipment-specific questions
5. Injury-related modifications

RESPONSE FORMAT: Only a JSON array like ["Question 1", "Question 2", "Question 3"]`

    console.log('📝 Sending prompt to OpenAI...')
    console.log('🤖 Using model:', MODELS.SIMPLE)
    
    const response = await openai.chat.completions.create({
      model: MODELS.SIMPLE, // Use mini for basic question generation
      messages: [
        {
          role: 'system',
          content: 'You are a fitness expert. You must respond ONLY with valid JSON arrays. Never use markdown or add explanatory text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 300,
      temperature: 0.3, // Lower temperature for more consistent JSON
      response_format: { type: "json_object" } // Force JSON response
    })

    console.log('✅ OpenAI response received')
    console.log('📊 Response usage:', response.usage)
    console.log('📝 Raw content:', response.choices[0].message.content)

    let questions: string[] = []
    const content = response.choices[0].message.content || '{}'
    
    try {
      // Try to parse as JSON object first
      const parsed = JSON.parse(content)
      console.log('🔍 Parsed JSON:', parsed)
      
      if (parsed.questions && Array.isArray(parsed.questions)) {
        questions = parsed.questions
        console.log('✅ Found questions array:', questions)
      } else if (Array.isArray(parsed)) {
        questions = parsed
        console.log('✅ Found direct array:', questions)
      } else {
        // Fallback: try to extract array from text
        const arrayMatch = content.match(/\[.*\]/s)
        if (arrayMatch) {
          questions = JSON.parse(arrayMatch[0])
          console.log('✅ Extracted array from text:', questions)
        } else {
          console.warn('⚠️ No valid array found in response')
        }
      }
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError)
      console.error('📝 Raw AI response:', content)
      // Return fallback questions
      questions = generateFallbackQuestions(profile)
      console.log('🔄 Using fallback questions:', questions)
    }
    
    const cost = calculateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      MODELS.SIMPLE
    )
    
    console.log('💰 Calculated cost:', cost)
    
    // Dispatch cost event
    dispatchCostEvent('followUpQuestions', cost)
    
    return {
      success: true,
      data: questions,
      tokenUsage: {
        model: MODELS.SIMPLE,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        estimatedCost: cost
      }
    }
  } catch (error) {
    logError(error, 'AI API error in generateFollowUpQuestions')
    return {
      success: false,
      data: generateFallbackQuestions(profile),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Helper function to normalize day names for comparison
export const normalizeDayName = (day: string): string => {
  return day.toLowerCase().trim()
}

// Helper function to check if a day is unavailable
export const isDayUnavailable = (day: string, unavailableDays: string[]): boolean => {
  const normalizedDay = normalizeDayName(day)
  return unavailableDays.some(unavailable => normalizeDayName(unavailable) === normalizedDay)
}

// Generate personalized workout plans using AI
export const generateWorkoutPlans = async (
  profile: UserProfile, 
  aiAnswers: Record<string, string>
): Promise<AIResponse<WorkoutPlan[]>> => {
  try {
    console.log('🔍 Starting AI workout plan generation...')
    
    const unavailableDaysList = formatUnavailableDays(profile.unavailable_days)
    
    const prompt = `You are an expert fitness trainer. Create exactly 2-3 personalized workout plans.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, no additional text.

User Profile:
- Experience: ${profile.experience_level}
- Goals: ${profile.goals.join(', ')}
- Days per week: ${profile.days_per_week}
- Equipment: ${profile.equipment.join(', ')}
- Injuries: ${profile.injury_history.length > 0 ? profile.injury_history.join(', ') : 'None'}
- Age: ${profile.age}
- Fitness level: ${profile.current_fitness}
- Session time: ${profile.time_per_session} minutes
- Height: ${profile.height ? `${profile.height} cm` : 'Not provided'}
- Weight: ${profile.weight ? `${profile.weight} kg` : 'Not provided'}
- Unavailable days: ${unavailableDaysList}

CRITICAL: The user CANNOT work out on these days: ${unavailableDaysList}. 
- DO NOT schedule any workouts on these days
- Set "is_rest": true for all unavailable days
- Only schedule workouts on days that are NOT in the unavailable days list
- Distribute workouts evenly across available days

AI Follow-up Answers:
${Object.entries(aiAnswers).map(([q, a]) => `- ${q}: ${a}`).join('\n')}

Generate workout plans that are:
1. Safe for their experience level and injuries
2. Appropriate for their equipment availability
3. Aligned with their specific goals
4. Optimized for their time constraints
5. Progressive and sustainable
6. NEVER schedule workouts on unavailable days (${unavailableDaysList})

RESPONSE FORMAT: Only valid JSON with this exact structure:
{
  "plans": [
    {
      "id": "unique_id",
      "name": "Plan Name",
      "description": "Detailed description",
      "split_type": "push_pull_legs|upper_lower|full_body|custom",
      "days_per_week": 5,
      "workouts": [
        {
          "day": "Monday",
          "focus": "Focus area description",
          "exercises": ["Exercise 1", "Exercise 2"],
          "is_rest": false
        }
      ]
    }
  ]
}`

    const response = await openai.chat.completions.create({
      model: MODELS.STANDARD, // Use GPT-4o for complex plan generation
      messages: [
        {
          role: 'system',
          content: 'You are an expert fitness trainer. You must respond ONLY with valid JSON. Never use markdown or add explanatory text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1500,
      temperature: 0.5, // Lower temperature for more consistent JSON
      response_format: { type: "json_object" } // Force JSON response
    })

    let plans: WorkoutPlan[] = []
    const content = response.choices[0].message.content || '{}'
    
    try {
      const parsed = JSON.parse(content)
      if (parsed.plans && Array.isArray(parsed.plans)) {
        plans = parsed.plans
      } else if (Array.isArray(parsed)) {
        plans = parsed
      } else {
        // Fallback: try to extract plans from text
        const plansMatch = content.match(/"plans":\s*\[.*\]/s)
        if (plansMatch) {
          const fullJson = '{' + plansMatch[0] + '}'
          const extracted = JSON.parse(fullJson)
          plans = extracted.plans || []
        }
      }
      
      // Post-process plans to ensure unavailable days are respected
      plans = plans.map(plan => ({
        ...plan,
        workouts: enforceUnavailableDays(plan.workouts, profile.unavailable_days)
      }))
    } catch (parseError) {
      logError(parseError, 'JSON parse error in generateWorkoutPlans')
      console.error('📝 Raw AI response:', content)
      // Return fallback plans
      plans = generateFallbackPlans(profile)
    }
    
    const cost = calculateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      MODELS.STANDARD
    )
    
    // Dispatch cost event
    dispatchCostEvent('workoutPlans', cost)
    
    return {
      success: true,
      data: plans,
      tokenUsage: {
        model: MODELS.STANDARD,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        estimatedCost: cost
      }
    }
  } catch (error) {
    logError(error, 'AI API error in generateWorkoutPlans')
    return {
      success: false,
      data: generateFallbackPlans(profile),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Process user feedback and adjust workout plans intelligently
export const processWorkoutFeedback = async (
  originalPlan: WorkoutPlan,
  userFeedback: string,
  userProfile: UserProfile
): Promise<AIResponse<WorkoutPlan>> => {
  try {
    const unavailableDaysList = formatUnavailableDays(userProfile.unavailable_days)
    
    const prompt = `You are an expert fitness trainer. Modify this workout plan based on user feedback.

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, no additional text.

Original Plan:
${JSON.stringify(originalPlan, null, 2)}

User Feedback: "${userFeedback}"

User Profile:
- Experience: ${userProfile.experience_level}
- Goals: ${userProfile.goals.join(', ')}
- Equipment: ${userProfile.equipment.join(', ')}
- Injuries: ${userProfile.injury_history.length > 0 ? userProfile.injury_history.join(', ') : 'None'}
- Height: ${userProfile.height ? `${userProfile.height} cm` : 'Not provided'}
- Weight: ${userProfile.weight ? `${userProfile.weight} kg` : 'Not provided'}
- Unavailable days: ${unavailableDaysList}

CRITICAL: The user CANNOT work out on these days: ${unavailableDaysList}. 
- DO NOT schedule any workouts on these days
- Set "is_rest": true for all unavailable days
- Only schedule workouts on days that are NOT in the unavailable days list

Intelligently modify the plan based on the feedback while:
1. Maintaining safety and appropriateness for their level
2. Using exercises they can perform with their equipment
3. Respecting their injury limitations
4. Keeping the plan balanced and effective
5. NEVER scheduling workouts on unavailable days (${unavailableDaysList})

RESPONSE FORMAT: Return the modified plan as valid JSON with the same structure as the original.`

    const response = await openai.chat.completions.create({
      model: MODELS.STANDARD, // Use GPT-4o for intelligent plan modification
      messages: [
        {
          role: 'system',
          content: 'You are an expert fitness trainer. You must respond ONLY with valid JSON. Never use markdown or add explanatory text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1200,
      temperature: 0.5, // Lower temperature for more consistent JSON
      response_format: { type: "json_object" } // Force JSON response
    })

    let modifiedPlan = originalPlan
    const content = response.choices[0].message.content || '{}'
    
    try {
      const parsed = JSON.parse(content)
      if (parsed.id || parsed.workouts) {
        modifiedPlan = parsed
      } else {
        // Fallback: try to extract plan from text
        const planMatch = content.match(/\{.*\}/s)
        if (planMatch) {
          modifiedPlan = JSON.parse(planMatch[0])
        }
      }
      
      // Post-process plan to ensure unavailable days are respected
      if (modifiedPlan.workouts && Array.isArray(modifiedPlan.workouts)) {
        modifiedPlan.workouts = enforceUnavailableDays(modifiedPlan.workouts, userProfile.unavailable_days)
      }
    } catch (parseError) {
      logError(parseError, 'JSON parse error in processWorkoutFeedback')
      console.error('📝 Raw AI response:', content)
      // Return fallback adjustment
      modifiedPlan = generateFallbackAdjustment(originalPlan, userFeedback)
    }
    
    const cost = calculateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      MODELS.STANDARD
    )
    
    // Dispatch cost event
    dispatchCostEvent('feedbackProcessing', cost)
    
    return {
      success: true,
      data: modifiedPlan,
      tokenUsage: {
        model: MODELS.STANDARD,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        estimatedCost: cost
      }
    }
  } catch (error) {
    logError(error, 'AI API error in processWorkoutFeedback')
    return {
      success: false,
      data: generateFallbackAdjustment(originalPlan, userFeedback),
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Generate exercise variations and alternatives
export const generateExerciseAlternatives = async (
  exercise: string,
  equipment: string[],
  injuries: string[]
): Promise<AIResponse<string[]>> => {
  try {
    const prompt = `Generate 3-5 exercise alternatives for "${exercise}" that are:

Equipment Available: ${equipment.join(', ')}
Injuries/Limitations: ${injuries.length > 0 ? injuries.join(', ') : 'None'}

Requirements:
1. Target the same muscle groups
2. Use available equipment
3. Safe for their injury profile
4. Similar difficulty level
5. Include bodyweight alternatives if equipment is limited

Return as JSON array of strings with exercise names.`

    const response = await openai.chat.completions.create({
      model: MODELS.SIMPLE, // Use mini for simple exercise alternatives
      messages: [
        {
          role: 'system',
          content: 'You are a fitness expert who can suggest safe, effective exercise alternatives.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.6,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0].message.content || '{}'
    let alternatives: string[] = []
    
    try {
      const parsed = JSON.parse(content)
      if (Array.isArray(parsed)) {
        alternatives = parsed
      } else if (parsed.alternatives && Array.isArray(parsed.alternatives)) {
        alternatives = parsed.alternatives
      } else if (parsed.exercises && Array.isArray(parsed.exercises)) {
        alternatives = parsed.exercises
      }
    } catch (parseError) {
      logError(parseError, 'JSON parse error in generateExerciseAlternatives')
      console.error('📝 Raw AI response:', content)
    }
    
    const cost = calculateCost(
      response.usage?.prompt_tokens || 0,
      response.usage?.completion_tokens || 0,
      MODELS.SIMPLE
    )
    
    // Dispatch cost event
    dispatchCostEvent('exerciseAlternatives', cost)
    
    return {
      success: true,
      data: alternatives,
      tokenUsage: {
        model: MODELS.SIMPLE,
        inputTokens: response.usage?.prompt_tokens || 0,
        outputTokens: response.usage?.completion_tokens || 0,
        estimatedCost: cost
      }
    }
  } catch (error) {
    logError(error, 'AI API error in generateExerciseAlternatives')
    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

// Fallback functions for when AI fails
function generateFallbackQuestions(profile: UserProfile): string[] {
  const questions = []
  
  if (profile.experience_level === 'beginner') {
    questions.push('Have you done any form of exercise before?')
    questions.push('Do you have any specific movements that feel uncomfortable?')
  }
  
  if (profile.goals.includes('strength')) {
    questions.push('What is your current 1RM for basic lifts (if known)?')
    questions.push('Are you interested in powerlifting or general strength?')
  }
  
  if (profile.goals.includes('muscle')) {
    questions.push('What is your current body weight and target weight?')
    questions.push('Do you prefer high volume or moderate volume training?')
  }
  
  if (profile.equipment.includes('limited')) {
    questions.push('What specific equipment do you have access to?')
    questions.push('Are you open to bodyweight alternatives?')
  }
  
  return questions
}

function generateFallbackPlans(profile: UserProfile): WorkoutPlan[] {
  const plans = []
  const daysPerWeek = profile.days_per_week
  
  // Define all days of the week
  const allDays = [
    { day: 'Monday', value: 'monday' },
    { day: 'Tuesday', value: 'tuesday' },
    { day: 'Wednesday', value: 'wednesday' },
    { day: 'Thursday', value: 'thursday' },
    { day: 'Friday', value: 'friday' },
    { day: 'Saturday', value: 'saturday' },
    { day: 'Sunday', value: 'sunday' }
  ]
  
  // Filter out unavailable days
  const availableDays = allDays.filter(dayObj => 
    !isDayUnavailable(dayObj.value, profile.unavailable_days)
  )
  
  // Generate basic plans as fallback
  if (daysPerWeek >= 3 && availableDays.length >= daysPerWeek) {
    const workoutDays = availableDays.slice(0, daysPerWeek)
    const workouts = allDays.map(dayObj => {
      const isUnavailable = isDayUnavailable(dayObj.value, profile.unavailable_days)
      const isWorkoutDay = workoutDays.some(wd => wd.value === dayObj.value)
      
      if (isUnavailable) {
        return {
          day: dayObj.day,
          focus: 'Rest',
          exercises: [],
          is_rest: true
        }
      } else if (isWorkoutDay) {
        const workoutIndex = workoutDays.findIndex(wd => wd.value === dayObj.value)
        const workoutLabels = ['Full Body A', 'Full Body B', 'Full Body C', 'Full Body D', 'Full Body E', 'Full Body F', 'Full Body G']
        const exerciseSets = [
          ['Squats', 'Push-ups', 'Rows'],
          ['Deadlift', 'Pull-ups', 'Dips'],
          ['Lunges', 'Bench Press', 'Planks'],
          ['Leg Press', 'Overhead Press', 'Curls'],
          ['Romanian Deadlift', 'Incline Press', 'Lat Pulldowns'],
          ['Step-ups', 'Chest Flyes', 'Face Pulls'],
          ['Bulgarian Split Squats', 'Tricep Extensions', 'Bicep Curls']
        ]
        
        return {
          day: dayObj.day,
          focus: workoutLabels[workoutIndex] || 'Full Body',
          exercises: exerciseSets[workoutIndex] || ['Exercise 1', 'Exercise 2', 'Exercise 3'],
          is_rest: false
        }
      } else {
        return {
          day: dayObj.day,
          focus: 'Rest',
          exercises: [],
          is_rest: true
        }
      }
    })
    
    plans.push({
      id: 'fallback_1',
      name: 'Basic Full Body',
      description: 'Simple full body routine for beginners',
      split_type: 'full_body',
      days_per_week: daysPerWeek,
      workouts
    })
  }
  
  return plans
}

function generateFallbackAdjustment(originalPlan: WorkoutPlan, userFeedback: string): WorkoutPlan {
  const newPlan = JSON.parse(JSON.stringify(originalPlan))
  const feedbackLower = userFeedback.toLowerCase()
  
  if (feedbackLower.includes('more volume') || feedbackLower.includes('more exercises')) {
    newPlan.workouts = newPlan.workouts.map((workout: any) => ({
      ...workout,
      exercises: workout.is_rest ? [] : [...workout.exercises, 'Additional Exercise 1', 'Additional Exercise 2']
    }))
    newPlan.description += ' (Adjusted for higher volume)'
  }
  
  if (feedbackLower.includes('less volume') || feedbackLower.includes('fewer exercises')) {
    newPlan.workouts = newPlan.workouts.map((workout: any) => ({
      ...workout,
      exercises: workout.is_rest ? [] : workout.exercises.slice(0, Math.max(2, workout.exercises.length - 2))
    }))
    newPlan.description += ' (Adjusted for lower volume)'
  }
  
  newPlan.id = `fallback_adjusted_${Date.now()}`
  return newPlan
}

// Get cost estimates for different operations
export const getCostEstimates = () => {
  return {
    followUpQuestions: {
      model: MODELS.SIMPLE,
      estimatedCost: '$0.01-0.05 per user',
      description: '3-5 contextual questions based on profile'
    },
    workoutPlanGeneration: {
      model: MODELS.STANDARD,
      estimatedCost: '$0.05-0.15 per user',
      description: '2-3 personalized workout plans'
    },
    feedbackProcessing: {
      model: MODELS.STANDARD,
      estimatedCost: '$0.03-0.10 per feedback',
      description: 'Intelligent plan modifications'
    },
    exerciseAlternatives: {
      model: MODELS.SIMPLE,
      estimatedCost: '$0.005-0.02 per request',
      description: '3-5 exercise alternatives'
    },
    workoutChat: {
      model: MODELS.SIMPLE,
      estimatedCost: '$0.005-0.02 per question',
      description: 'Real-time workout assistance'
    },
    workoutSummary: {
      model: MODELS.STANDARD,
      estimatedCost: '$0.03-0.08 per summary',
      description: 'Post-workout analysis and recommendations'
    }
  }
}

export const generateWorkoutChatResponse = async (data: {
  question: string
  workoutName: string
  currentExercises: string[]
}): Promise<string> => {
  try {
    console.log('🤖 Generating workout chat response for:', data.question)
    
    // Check if API key is available
    if (!isApiKeyValid()) {
      console.error('❌ No OpenAI API key found or using placeholder')
      return "I'm here to help with your workout! Ask me about form, technique, or any fitness questions. (Note: AI features require OpenAI API key configuration)"
    }
    
    const prompt = `You are an expert fitness coach helping a user during their workout. 

Current workout: ${data.workoutName}
Exercises in this workout: ${data.currentExercises.join(', ')}

User question: "${data.question}"

IMPORTANT: 
- Answer the user's specific question directly and helpfully
- Do NOT give generic responses like "I'm here to help" or "Feel free to ask questions"
- Do NOT use markdown formatting (no **, *, #, ###, etc.)
- Write in plain text only
- Use simple bullet points with • if needed

Provide specific, actionable advice based on their question. Focus on:
- Form and technique advice for their specific exercises
- Safety tips relevant to their question
- Exercise modifications if they're asking about alternatives
- Specific answers to their fitness questions
- Encouragement that's relevant to their situation

Keep your response conversational, friendly, and under 150 words. Be specific and helpful.`
    
    const response = await openai.chat.completions.create({
      model: MODELS.SIMPLE,
      messages: [
        {
          role: 'system',
          content: 'You are an expert fitness coach. Always provide specific, helpful answers to user questions. Never give generic responses. Do NOT use markdown formatting - write in plain text only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 300
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    console.log('🤖 AI Response:', content)
    dispatchCostEvent('workoutChat', calculateCost(response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0, MODELS.SIMPLE))
    
    return content
  } catch (error) {
    logError(error, 'AI error in generateWorkoutChatResponse')
    return "I'm having trouble connecting to the AI service right now. Please try asking your question again in a moment, or check your OpenAI API key configuration."
  }
}

export const matchCustomExercise = async (customExerciseName: string): Promise<{
  matched: boolean
  suggested_exercise?: string
  confidence: number
  reason?: string
}> => {
  try {
    console.log('🔍 Starting AI exercise matching for:', customExerciseName)
    
    // Check if API key is available
    if (!isApiKeyValid()) {
      console.error('❌ No OpenAI API key found or using placeholder')
      return {
        matched: false,
        confidence: 0,
        reason: 'AI features require OpenAI API key configuration'
      }
    }
    
    const prompt = `You are a fitness expert. Analyze this custom exercise name and determine if it matches any standard exercise from our database.

Custom Exercise: "${customExerciseName}"

Our exercise database includes exercises like:
- Barbell Bench Press, Dumbbell Bench Press, Incline Bench Press
- Squats, Deadlifts, Lunges
- Pull-ups, Chin-ups, Lat Pulldowns
- Push-ups, Dips, Planks
- Bicep Curls, Tricep Extensions, Shoulder Press
- And many more standard exercises...

IMPORTANT: Respond ONLY with valid JSON. No markdown, no explanations, no additional text.

Return JSON with this exact structure:
{
  "matched": true/false,
  "suggested_exercise": "Exact name from our database if matched",
  "confidence": 0.0-1.0,
  "reason": "Brief explanation of why it matches or doesn't match"
}

Consider:
1. Common variations (e.g., "Bench Press" matches "Barbell Bench Press")
2. Equipment differences (e.g., "Dumbbell Press" matches "Dumbbell Bench Press")
3. Similar movements (e.g., "Push Ups" matches "Push-ups")
4. Abbreviations (e.g., "BP" might match "Bench Press")
5. Typos and common misspellings

Only suggest a match if confidence is above 0.7.`

    const response = await openai.chat.completions.create({
      model: MODELS.SIMPLE,
      messages: [
        {
          role: 'system',
          content: 'You are a fitness expert who can identify exercise matches. You must respond ONLY with valid JSON. Never use markdown or add explanatory text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 200,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    console.log('🤖 AI Response:', content)
    
    let result: { matched: boolean; suggested_exercise?: string; confidence: number; reason?: string }
    
    try {
      result = JSON.parse(content)
    } catch (parseError) {
      logError(parseError, 'JSON parse error in matchCustomExercise')
      console.error('📝 Raw AI response:', content)
      return {
        matched: false,
        confidence: 0,
        reason: 'Failed to parse AI response'
      }
    }
    
    dispatchCostEvent('exerciseMatching', calculateCost(response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0, MODELS.SIMPLE))
    
    return result
  } catch (error) {
    logError(error, 'AI error in matchCustomExercise')
    return {
      matched: false,
      confidence: 0,
      reason: 'Failed to analyze exercise name'
    }
  }
}

export const generateWorkoutSummary = async (data: {
  workoutName: string
  exercises: Array<{
    name: string
    sets: number
    weight?: number
    reps: number
    rir: number
  }>
  duration: number
  totalSets: number
}): Promise<{
  summary: string
  strengths: string[]
  improvements: string[]
  nextSteps: string[]
}> => {
  try {
    console.log('🤖 Generating workout summary for:', data.workoutName)
    console.log('📊 Workout data:', data)
    
    // Check if API key is available
    if (!isApiKeyValid()) {
      console.error('❌ No OpenAI API key found or using placeholder')
      throw new Error('OpenAI API key not configured')
    }
    
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY!
    console.log('🔑 API Key found, length:', apiKey.length)
    
    const exerciseDetails = data.exercises.map(ex => 
      `${ex.name}: ${ex.sets} sets, ${ex.reps} reps${ex.weight ? `, ${ex.weight.toLocaleString()}lbs` : ''}, RIR ${ex.rir}`
    ).join('\n')
    
    const prompt = `You are a fitness coach reviewing a completed workout. 

Workout: ${data.workoutName}
Duration: ${data.duration} minutes
Total sets: ${data.totalSets}

Exercises performed:
${exerciseDetails}

Provide a comprehensive workout review in JSON format:
{
  "summary": "Brief overview of the workout (2-3 sentences)",
  "strengths": ["What the user did well", "Positive aspects"],
  "improvements": ["Areas for improvement", "Suggestions"],
  "nextSteps": ["Recommendations for next workout", "Progression tips"]
}

Keep each section concise and encouraging. Focus on form, consistency, and progression.`
    
    console.log('📝 Sending prompt to AI:', prompt)
    
    const response = await openai.chat.completions.create({
      model: MODELS.STANDARD,
      messages: [
        {
          role: 'system',
          content: 'You are a fitness coach who provides comprehensive workout reviews. You must respond ONLY with valid JSON. Never use markdown or add explanatory text.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 600,
      response_format: { type: 'json_object' }
    })

    const content = response.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    console.log('🤖 AI Response:', content)
    console.log('📊 Token usage:', response.usage)
    
    let result: { summary: string; strengths: string[]; improvements: string[]; nextSteps: string[] }
    
    try {
      result = JSON.parse(content)
    } catch (parseError) {
      logError(parseError, 'JSON parse error in generateWorkoutSummary')
      console.error('📝 Raw AI response:', content)
      // Return fallback summary
      return {
        summary: "Great job completing your workout! You showed consistency and dedication.",
        strengths: ["Completed all planned exercises", "Maintained good form"],
        improvements: ["Consider tracking your progress more consistently"],
        nextSteps: ["Plan your next workout", "Focus on progressive overload"]
      }
    }
    
    dispatchCostEvent('workoutSummary', calculateCost(response.usage?.prompt_tokens || 0, response.usage?.completion_tokens || 0, MODELS.STANDARD))
    
    return result
  } catch (error) {
    logError(error, 'AI error in generateWorkoutSummary')
    return {
      summary: "Great job completing your workout! You showed consistency and dedication.",
      strengths: ["Completed all planned exercises", "Maintained good form"],
      improvements: ["Consider tracking your progress more consistently"],
      nextSteps: ["Plan your next workout", "Focus on progressive overload"]
    }
  }
}
