import React, { useState, useEffect } from 'react'
import { Play, Calendar, History, Sparkles, TrendingUp, Flame, Dumbbell, Target, ArrowRight, Check } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { ActiveWorkout } from '@/components/workout/ActiveWorkout'
import { StartWorkoutModal } from '@/components/workout/StartWorkoutModal'
import { PlannedWorkout } from '@/components/workout/PlannedWorkout'
import { WorkoutDay, getSavedWorkoutPlans, SavedWorkoutPlan } from '@/lib/workoutPlans'
import { getWeeklyWorkoutSummary, getCompletedWorkouts, CompletedWorkout } from '@/lib/history'

export const DashboardPage = () => {
  const navigate = useNavigate()
  const [showWorkoutLogging, setShowWorkoutLogging] = useState(false)
  const [showStartModal, setShowStartModal] = useState(false)
  const [currentPlannedWorkout, setCurrentPlannedWorkout] = useState<WorkoutDay | null>(null)
  const [weeklyData, setWeeklyData] = useState<{
    totalWorkouts: number
    totalWeight: number
  }>({ totalWorkouts: 0, totalWeight: 0 })
  const [nextWorkout, setNextWorkout] = useState<{
    plan: SavedWorkoutPlan | null
    workoutDay: WorkoutDay | null
  }>({ plan: null, workoutDay: null })
  const [streakData, setStreakData] = useState<{
    currentStreak: number
    longestStreak: number
  }>({ currentStreak: 0, longestStreak: 0 })
  const [recentWorkouts, setRecentWorkouts] = useState<CompletedWorkout[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setIsLoading(true)
    try {
      // Load weekly workout data
      const weeklySummary = await getWeeklyWorkoutSummary()
      setWeeklyData({
        totalWorkouts: weeklySummary.totalWorkouts,
        totalWeight: weeklySummary.totalWeight
      })

      // Calculate workout streak (simplified - you could enhance this)
      const streak = calculateWorkoutStreak(weeklySummary.workouts)
      setStreakData(streak)

      // Load recent workouts
      const completed = await getCompletedWorkouts()
      setRecentWorkouts(completed.slice(0, 2))

      // Find next planned workout
      const plans = getSavedWorkoutPlans()
      const activePlan = plans.find(plan => plan.is_active)
      
      if (activePlan) {
        const nextWorkoutDay = getNextWorkoutDay(activePlan)
        setNextWorkout({
          plan: activePlan,
          workoutDay: nextWorkoutDay
        })
      } else {
        setNextWorkout({ plan: null, workoutDay: null })
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const calculateWorkoutStreak = (workouts: any[]) => {
    // Simple streak calculation - you could enhance this
    const sortedWorkouts = workouts.sort((a, b) => new Date(b.workout_date).getTime() - new Date(a.workout_date).getTime())
    
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    
    const today = new Date()
    const oneDayMs = 24 * 60 * 60 * 1000
    
    for (let i = 0; i < sortedWorkouts.length; i++) {
      const workoutDate = new Date(sortedWorkouts[i].workout_date)
      const daysDiff = Math.floor((today.getTime() - workoutDate.getTime()) / oneDayMs)
      
      if (i === 0 && daysDiff <= 1) {
        currentStreak = 1
        tempStreak = 1
      } else if (i > 0) {
        const prevWorkoutDate = new Date(sortedWorkouts[i - 1].workout_date)
        const daysBetween = Math.floor((prevWorkoutDate.getTime() - workoutDate.getTime()) / oneDayMs)
        
        if (daysBetween <= 1) {
          tempStreak++
          if (i === 0 || daysDiff <= 1) {
            currentStreak = tempStreak
          }
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak)
    
    return { currentStreak, longestStreak }
  }

  const getNextWorkoutDay = (plan: SavedWorkoutPlan): WorkoutDay | null => {
    const today = new Date()
    const dayOfWeek = today.getDay() // 0 = Sunday, 1 = Monday, etc.
    
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const todayName = dayNames[dayOfWeek]
    
    // Find today's workout or the next workout day
    const todayWorkout = plan.workouts.find(w => w.day === todayName && !w.is_rest)
    if (todayWorkout) {
      return todayWorkout
    }
    
    // Find next workout day
    for (let i = 1; i <= 7; i++) {
      const nextDayIndex = (dayOfWeek + i) % 7
      const nextDayName = dayNames[nextDayIndex]
      const nextWorkout = plan.workouts.find(w => w.day === nextDayName && !w.is_rest)
      if (nextWorkout) {
        return nextWorkout
      }
    }
    
    return null
  }

  const handleWorkoutComplete = () => {
    setShowWorkoutLogging(false)
    setCurrentPlannedWorkout(null)
    // Refresh dashboard data after workout completion
    loadDashboardData()
  }

  const handleStartPlannedWorkout = (workoutDay: WorkoutDay) => {
    setCurrentPlannedWorkout(workoutDay)
  }

  const handleStartCustomWorkout = () => {
    setShowWorkoutLogging(true)
  }

  // Format relative date helper
  const formatRelativeDate = (dateString: string) => {
    const now = new Date()
    const then = new Date(dateString)
    const diffInDays = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return 'Today'
    if (diffInDays === 1) return 'Yesterday'
    if (diffInDays < 7) return `${diffInDays} days ago`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`
    return `${Math.floor(diffInDays / 30)} months ago`
  }

  // Get upcoming workouts from active plan
  const upcomingWorkouts = nextWorkout.plan?.workouts?.filter(w => !w.is_rest).slice(0, 3) || []

  // Format recent activity
  const recentActivity = recentWorkouts.map(w => {
    const totalSets = w.sets?.length || 0
    const totalWeight = w.sets?.reduce((sum, set) => sum + ((set.weight || 0) * (set.reps || 0)), 0) || 0
    return {
      date: formatRelativeDate(w.workout_date),
      name: w.name,
      sets: totalSets,
      volume: totalWeight
    }
  })

  // Show planned workout if one is selected
  if (currentPlannedWorkout) {
    return (
      <PlannedWorkout
        workoutDay={currentPlannedWorkout}
        onBack={() => setCurrentPlannedWorkout(null)}
        onWorkoutComplete={handleWorkoutComplete}
      />
    )
  }

  // Show custom workout if selected
  if (showWorkoutLogging) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowWorkoutLogging(false)}
            className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
          >
            ← Back to Dashboard
          </button>
        </div>
        <ActiveWorkout onWorkoutComplete={handleWorkoutComplete} />
      </div>
    )
  }

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
        <p className="text-gray-600">Ready to crush your next workout?</p>
      </div>

      {/* Hero Action Card */}
      <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 sm:p-8 mb-8 text-white shadow-lg">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Next Up: {isLoading ? '...' : nextWorkout.workoutDay ? nextWorkout.workoutDay.day : 'No plan'}
            </h2>
            <p className="text-cyan-50 text-lg">
              {isLoading ? '...' : nextWorkout.workoutDay ? nextWorkout.workoutDay.focus : 'Create a workout plan'}
            </p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-2">
            <div className="text-xs text-cyan-100 mb-1">Your Streak</div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-yellow-300" />
              <span className="text-2xl font-bold">{isLoading ? '...' : streakData.currentStreak}</span>
            </div>
          </div>
        </div>

        <button 
          onClick={() => setShowStartModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-white text-cyan-600 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-md hover:shadow-lg"
        >
          <Play className="w-5 h-5" />
          Start Workout
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          icon={TrendingUp}
          iconBgColor="bg-cyan-100"
          iconColor="text-cyan-600"
          label="This Week"
          value={isLoading ? '...' : `${weeklyData.totalWorkouts} workouts`}
          subtitle={isLoading ? '...' : `${Math.round(weeklyData.totalWeight).toLocaleString()} lbs lifted`}
        />

        <StatCard
          icon={Flame}
          iconBgColor="bg-orange-100"
          iconColor="text-orange-600"
          label="Streak"
          value={isLoading ? '...' : `${streakData.currentStreak} days`}
          subtitle={isLoading ? '...' : `Best: ${streakData.longestStreak} days`}
        />

        <StatCard
          icon={Target}
          iconBgColor="bg-purple-100"
          iconColor="text-purple-600"
          label="Goal"
          value={isLoading ? '...' : `${weeklyData.totalWorkouts}/${nextWorkout.plan?.days_per_week || 5}`}
          subtitle="Weekly workouts"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Upcoming Workouts (2/3 width) */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-xl font-semibold text-gray-900">Upcoming Workouts</h2>
              <p className="text-sm text-gray-600 mt-1">Your scheduled sessions this week</p>
            </div>
            <div className="p-6">
              {upcomingWorkouts.length > 0 ? (
                <div className="space-y-3">
                  {upcomingWorkouts.map((workout, index) => (
                    <button
                      key={`${workout.day}-${index}`}
                      onClick={() => {
                        setCurrentPlannedWorkout(workout)
                      }}
                      className="w-full flex items-center justify-between p-4 rounded-lg border-2 border-gray-200 hover:border-cyan-500 hover:bg-cyan-50/50 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-cyan-100 transition-colors">
                          <Dumbbell className="w-6 h-6 text-gray-600 group-hover:text-cyan-600 transition-colors" />
                        </div>
                        <div className="text-left">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold text-gray-900">{workout.day} - {workout.focus}</span>
                            {index === 0 && (
                              <span className="text-xs bg-cyan-100 text-cyan-700 px-2 py-0.5 rounded-full font-medium">
                                Recommended
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{workout.exercises?.length || 0} exercises</div>
                        </div>
                      </div>
                      <Play className="w-5 h-5 text-gray-400 group-hover:text-cyan-600 transition-colors" />
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Calendar className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 mb-4">No workout plan yet</p>
                  <button
                    onClick={() => navigate('/workout-plans')}
                    className="px-6 py-2.5 bg-cyan-500 text-white rounded-md hover:bg-cyan-600 transition-colors font-medium"
                  >
                    View Plans
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Quick Actions & Recent (1/3 width) */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <QuickActionLink
                href="/workout-plans"
                icon={Calendar}
                label="View Plans"
              />
              <QuickActionLink
                href="/history"
                icon={History}
                label="History"
              />
              <QuickActionLink
                href="/ai-workout"
                icon={Sparkles}
                label="AI Planning"
              />
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-cyan-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm">{activity.name}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{activity.date}</div>
                      <div className="flex gap-3 mt-2 text-xs text-gray-600">
                        <span>{activity.sets} sets</span>
                        <span>•</span>
                        <span>{activity.volume.toLocaleString()} lbs</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-sm text-gray-500">No recent workouts</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <StartWorkoutModal
        isOpen={showStartModal}
        onClose={() => setShowStartModal(false)}
        onStartPlannedWorkout={handleStartPlannedWorkout}
        onStartCustomWorkout={handleStartCustomWorkout}
      />
    </>
  )
}

// StatCard Component
interface StatCardProps {
  icon: React.ComponentType<{ className?: string }>
  iconBgColor: string
  iconColor: string
  label: string
  value: string
  subtitle: string
}

function StatCard({ icon: Icon, iconBgColor, iconColor, label, value, subtitle }: StatCardProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 hover:border-gray-300 transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 ${iconBgColor} rounded-lg flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <span className="text-xs font-medium text-gray-500 uppercase">{label}</span>
      </div>
      <div className="text-3xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </div>
  )
}

// QuickActionLink Component
interface QuickActionLinkProps {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
}

function QuickActionLink({ href, icon: Icon, label }: QuickActionLinkProps) {
  const navigate = useNavigate()
  
  return (
    <button
      onClick={() => navigate(href)}
      className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-gray-600" />
        </div>
        <span className="text-sm font-medium text-gray-900">{label}</span>
      </div>
      <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 transition-colors" />
    </button>
  )
}
