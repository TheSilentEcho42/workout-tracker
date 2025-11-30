import { useState, useEffect } from 'react'
import { History, Calendar, TrendingUp, Loader2, AlertTriangle } from 'lucide-react'
import { getCompletedWorkouts, CompletedWorkout, debugDatabase } from '@/lib/history'
import { isDatabaseConfigured } from '@/lib/supabase'
import { testSupabaseConnection, testDatabaseOperations, quickDiagnostic } from '@/lib/supabase-test'
import { WorkoutHistoryCards } from '@/components/history/WorkoutHistoryCards'
import { ExerciseHistoryView } from '@/components/history/ExerciseHistoryView'
import { WeeklySummary } from '@/components/history/WeeklySummary'
import { useAuth } from '@/contexts/AuthContext'

type HistoryView = 'workouts' | 'exercises'

export const HistoryPage = () => {
  const { isGuest } = useAuth()
  const [activeView, setActiveView] = useState<HistoryView>('workouts')
  const [workouts, setWorkouts] = useState<CompletedWorkout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadWorkoutHistory()
  }, [])

  const loadWorkoutHistory = async () => {
    setIsLoading(true)
    try {
      console.log('Loading workout history...')
      const completedWorkouts = await getCompletedWorkouts()
      console.log('Loaded workouts:', completedWorkouts)
      setWorkouts(completedWorkouts)
    } catch (error) {
      console.error('Failed to load workout history:', error)
      // Set empty array to prevent UI crashes
      setWorkouts([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = () => {
    loadWorkoutHistory()
  }

  const handleWorkoutDeleted = () => {
    loadWorkoutHistory()
  }

  const handleDebug = async () => {
    console.log('Running database debug...')
    await debugDatabase()
  }

  const handleQuickTest = async () => {
    console.log('Running quick Supabase diagnostic...')
    await quickDiagnostic()
  }

  const handleFullTest = async () => {
    console.log('Running full Supabase connection test...')
    await testSupabaseConnection()
  }

  const handleOperationsTest = async () => {
    console.log('Running database operations test...')
    await testDatabaseOperations()
  }

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Workout History</h1>

      {!isDatabaseConfigured && !isGuest && (
        <div className="bg-white p-4 mb-6 rounded-lg border border-gray-200">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="h-5 w-5 text-gray-900 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-gray-900">Database Not Configured</h3>
              <p className="text-sm text-gray-600 mt-1">
                Workout history is not working because Supabase is not configured. 
                Create a <code className="bg-gray-100 px-1 text-gray-900 rounded">.env</code> file with your Supabase credentials to enable data persistence.
              </p>
              <div className="mt-2 text-xs text-gray-500">
                <p>Required environment variables:</p>
                <ul className="list-disc list-inside mt-1">
                  <li>VITE_SUPABASE_URL=your_supabase_url</li>
                  <li>VITE_SUPABASE_ANON_KEY=your_supabase_anon_key</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {/* Stats Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Workouts</div>
            <div className="text-3xl font-semibold text-gray-900">
              {isLoading ? '...' : workouts.length}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">This Week</div>
            <div className="text-3xl font-semibold text-gray-900">
              {isLoading ? '...' : workouts.filter(w => {
                const workoutDate = new Date(w.workout_date)
                const weekAgo = new Date()
                weekAgo.setDate(weekAgo.getDate() - 7)
                return workoutDate >= weekAgo
              }).length}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">Total Weight</div>
            <div className="text-3xl font-semibold text-gray-900">
              {isLoading ? '...' : Math.round(workouts.reduce((total, workout) => {
                return total + (workout.sets || []).reduce((setTotal, set) => {
                  // Calculate total weight lifted: weight × reps for each set
                  return setTotal + ((set.weight || 0) * (set.reps || 0))
                }, 0)
              }, 0)).toLocaleString()} lbs
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="text-sm font-medium text-gray-500 mb-1">Avg Duration</div>
            <div className="text-3xl font-semibold text-gray-900">
              {isLoading ? '...' : workouts.length > 0 ? 
                Math.round(workouts.reduce((total, workout) => total + (workout.duration_minutes || workout.duration || 0), 0) / workouts.length) : 0} min
            </div>
          </div>
        </div>

        {/* View Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8 px-6">
              <button
                onClick={() => setActiveView('workouts')}
                className={`pb-3 border-b-2 transition-colors font-medium text-sm ${
                  activeView === 'workouts'
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Workout History</span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveView('exercises')}
                className={`pb-3 border-b-2 transition-colors font-medium text-sm ${
                  activeView === 'exercises'
                    ? 'border-cyan-500 text-cyan-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4" />
                  <span>Exercise Progress</span>
                </div>
              </button>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeView === 'workouts' ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
                  <h2 className="text-xl font-semibold text-gray-900">Completed Workouts</h2>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-600">
                      {workouts.length} workout{workouts.length !== 1 ? 's' : ''} completed
                    </div>
                    <button
                      onClick={handleRefresh}
                      disabled={isLoading}
                      className="px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed flex items-center"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <History className="h-4 w-4 mr-2" />
                      )}
                      Refresh
                    </button>
                  </div>
                </div>
                
                {/* Weekly Summary */}
                <div className="mb-6">
                  <WeeklySummary onRefresh={handleRefresh} />
                </div>
                
                {isLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-cyan-500" />
                    <p className="text-gray-600">Loading workout history...</p>
                  </div>
                ) : (
                  <WorkoutHistoryCards workouts={workouts} onWorkoutDeleted={handleWorkoutDeleted} />
                )}
              </div>
            ) : (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-2">Exercise Progress Tracking</h2>
                  <p className="text-gray-600">
                    Select an exercise to view detailed progress history and performance trends
                  </p>
                </div>
                
                <ExerciseHistoryView />
              </div>
            )}
          </div>
        </div>

        {/* Debug Tools (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Debug Tools</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleQuickTest}
                className="px-6 py-2.5 text-gray-700 rounded-md border-b-2 border-gray-300 hover:border-gray-900 transition-colors font-medium text-sm"
              >
                Quick Test
              </button>
              <button
                onClick={handleFullTest}
                className="px-6 py-2.5 text-gray-700 rounded-md border-b-2 border-gray-300 hover:border-gray-900 transition-colors font-medium text-sm"
              >
                Full Test
              </button>
              <button
                onClick={handleOperationsTest}
                className="px-6 py-2.5 text-gray-700 rounded-md border-b-2 border-gray-300 hover:border-gray-900 transition-colors font-medium text-sm"
              >
                Ops Test
              </button>
              <button
                onClick={handleDebug}
                className="px-6 py-2.5 text-gray-700 rounded-md border-b-2 border-gray-300 hover:border-gray-900 transition-colors font-medium text-sm"
              >
                Debug
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  )
}








