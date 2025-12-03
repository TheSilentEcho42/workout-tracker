import { TrendingUp } from 'lucide-react'

interface WeeklySummaryProps {
  weeklyStats: {
    workouts: number
    minutes: number
    sets: number
    reps: number
    weight: number
    analysis?: string
    summary?: string
  }
}

export const WeeklySummary = ({ weeklyStats }: WeeklySummaryProps) => {
  const stats = weeklyStats || {
    workouts: 0,
    minutes: 0,
    sets: 0,
    reps: 0,
    weight: 0,
    analysis: "Start tracking workouts to see your weekly summary!"
  }

  const analysis = stats.analysis || stats.summary || "Start tracking workouts to see your weekly summary!"

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">This Week's Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-600 mb-1">{stats.workouts}</div>
          <div className="text-sm text-gray-600">Workouts</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-600 mb-1">{stats.minutes}</div>
          <div className="text-sm text-gray-600">Minutes</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-600 mb-1">{stats.sets}</div>
          <div className="text-sm text-gray-600">Sets</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-cyan-600 mb-1">{stats.reps}</div>
          <div className="text-sm text-gray-600">Reps</div>
        </div>
      </div>
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start gap-2 text-sm text-gray-700">
          <TrendingUp className="w-4 h-4 text-cyan-600 mt-0.5 flex-shrink-0" />
          <p>{analysis}</p>
        </div>
      </div>
    </div>
  )
}
