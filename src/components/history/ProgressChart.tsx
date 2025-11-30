import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { ExerciseProgress } from '@/lib/history'
import { formatDate } from '@/lib/utils'

interface WeightLineChartProps {
  data: ExerciseProgress[]
}

const WeightLineChart = ({ data }: WeightLineChartProps) => {
  // Chart dimensions - responsive
  const width = 800
  const height = 300
  const padding = { top: 20, right: 40, bottom: 60, left: 60 }
  const chartWidth = width - padding.left - padding.right
  const chartHeight = height - padding.top - padding.bottom

  // Filter data to only include entries with weight
  const weightData = data.filter(d => d.weight && d.weight > 0)
  
  if (weightData.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary">
        No weight data available for this exercise
      </div>
    )
  }

  // Aggregate data by date - use max weight per date for cleaner visualization
  const dataByDate = new Map<string, { weight: number; date: string; workoutName: string }>()
  
  weightData.forEach(entry => {
    const dateKey = entry.workout_date
    const existing = dataByDate.get(dateKey)
    
    if (!existing || entry.weight! > existing.weight) {
      dataByDate.set(dateKey, {
        weight: entry.weight!,
        date: entry.workout_date,
        workoutName: entry.workout_name
      })
    }
  })

  // Convert back to array and sort by date
  const aggregatedData = Array.from(dataByDate.values()).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  // Calculate min and max for scaling
  const weights = aggregatedData.map(d => d.weight)
  const minWeight = Math.min(...weights)
  const maxWeight = Math.max(...weights)
  const weightRange = maxWeight - minWeight || 1 // Avoid division by zero
  
  // Add some padding to the weight range for better visualization
  const paddedMinWeight = Math.max(0, minWeight - weightRange * 0.1)
  const paddedMaxWeight = maxWeight + weightRange * 0.1
  const paddedWeightRange = paddedMaxWeight - paddedMinWeight

  // Calculate x positions (dates)
  const dateRange = new Date(aggregatedData[aggregatedData.length - 1].date).getTime() - new Date(aggregatedData[0].date).getTime()
  const dateRangeMs = dateRange || 1 // Avoid division by zero

  // Generate points for the line
  const points = aggregatedData.map((entry) => {
    const date = new Date(entry.date).getTime()
    const firstDate = new Date(aggregatedData[0].date).getTime()
    const x = padding.left + ((date - firstDate) / dateRangeMs) * chartWidth
    const y = padding.top + chartHeight - ((entry.weight - paddedMinWeight) / paddedWeightRange) * chartHeight
    return { x, y, weight: entry.weight, date: entry.date, workoutName: entry.workoutName }
  })

  // Generate Y-axis labels (weight)
  const yAxisSteps = 5
  const yAxisLabels: number[] = []
  for (let i = 0; i <= yAxisSteps; i++) {
    const weight = paddedMinWeight + (paddedWeightRange / yAxisSteps) * i
    yAxisLabels.push(Math.round(weight))
  }

  // Generate X-axis labels (dates) - show every nth date to avoid crowding
  const xAxisLabelInterval = Math.max(1, Math.floor(aggregatedData.length / 6))
  const xAxisLabels = aggregatedData
    .filter((_, idx) => idx % xAxisLabelInterval === 0 || idx === aggregatedData.length - 1)
    .map((entry) => ({
      date: entry.date,
      index: aggregatedData.findIndex(d => d.date === entry.date)
    }))

  // Create path string for the line
  const pathData = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`)
    .join(' ')

  return (
    <div className="w-full overflow-x-auto bg-bg-tertiary/30 rounded-lg p-4">
      <svg 
        width={width} 
        height={height} 
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto min-w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Grid lines */}
        {yAxisLabels.map((label, index) => {
          const y = padding.top + chartHeight - (index / yAxisSteps) * chartHeight
          return (
            <g key={label}>
              <line
                x1={padding.left}
                y1={y}
                x2={width - padding.right}
                y2={y}
                stroke="currentColor"
                strokeWidth="1"
                className="text-border-line opacity-30"
              />
            </g>
          )
        })}

        {/* Y-axis labels (weight) */}
        {yAxisLabels.map((label, index) => {
          const y = padding.top + chartHeight - (index / yAxisSteps) * chartHeight
          return (
            <text
              key={label}
              x={padding.left - 10}
              y={y + 4}
              textAnchor="end"
              className="text-xs fill-text-secondary"
            >
              {label}
            </text>
          )
        })}

        {/* Y-axis label */}
        <text
          x={15}
          y={height / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${height / 2})`}
          className="text-sm fill-text-secondary font-medium"
        >
          Weight (lbs)
        </text>

        {/* X-axis labels (dates) */}
        {xAxisLabels.map(({ date, index }) => {
          const point = points[index]
          if (!point) return null
          return (
            <text
              key={`${date}-${index}`}
              x={point.x}
              y={height - padding.bottom + 20}
              textAnchor="middle"
              className="text-xs fill-text-secondary"
            >
              {formatDate(date)}
            </text>
          )
        })}

        {/* X-axis label */}
        <text
          x={width / 2}
          y={height - 10}
          textAnchor="middle"
          className="text-sm fill-text-secondary font-medium"
        >
          Date
        </text>

        {/* Line */}
        <path
          d={pathData}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-accent-primary"
        />

        {/* Data points */}
        {points.map((point, index) => (
          <g key={index}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              fill="currentColor"
              className="text-accent-primary"
            />
            <circle
              cx={point.x}
              cy={point.y}
              r="8"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-accent-primary opacity-0 hover:opacity-30 transition-opacity"
            />
            {/* Tooltip on hover */}
            <title>
              {point.workoutName}: {point.weight.toLocaleString()} lbs on {formatDate(point.date)}
            </title>
          </g>
        ))}
      </svg>
    </div>
  )
}

interface ProgressChartProps {
  progressData: ExerciseProgress[]
  exerciseName: string
}

export const ProgressChart = ({ progressData, exerciseName }: ProgressChartProps) => {
  const chartData = useMemo(() => {
    if (progressData.length === 0) return null

    const sortedData = [...progressData].sort((a, b) => 
      new Date(a.workout_date).getTime() - new Date(b.workout_date).getTime()
    )

    // Calculate trends
    const firstWeight = sortedData[0]?.weight || 0
    const lastWeight = sortedData[sortedData.length - 1]?.weight || 0
    const weightChange = lastWeight - firstWeight
    const weightTrend = weightChange > 0 ? 'up' : weightChange < 0 ? 'down' : 'stable'

    const firstReps = sortedData[0]?.reps || 0
    const lastReps = sortedData[sortedData.length - 1]?.reps || 0
    const repsChange = lastReps - firstReps
    const repsTrend = repsChange > 0 ? 'up' : repsChange < 0 ? 'down' : 'stable'

    return {
      sortedData,
      weightChange,
      weightTrend,
      repsChange,
      repsTrend,
      hasWeight: sortedData.some(d => d.weight && d.weight > 0)
    }
  }, [progressData])

  if (!chartData || chartData.sortedData.length === 0) {
    return (
      <div className="card-primary border border-border-line rounded-lg p-6 text-center">
        <p className="text-text-secondary">No progress data available for {exerciseName}</p>
      </div>
    )
  }

  const { sortedData, weightChange, weightTrend, repsChange, repsTrend, hasWeight } = chartData

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-success" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-error" />
      default:
        return <Minus className="h-4 w-4 text-text-secondary" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up':
        return 'text-success'
      case 'down':
        return 'text-error'
      default:
        return 'text-text-secondary'
    }
  }

  return (
    <div className="card-primary border border-border-line rounded-lg p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Progress Overview</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {hasWeight && (
            <div className="bg-bg-tertiary p-4 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-text-secondary">Weight Progress</span>
                {getTrendIcon(weightTrend)}
              </div>
              <div className={`text-2xl font-bold ${getTrendColor(weightTrend)}`}>
                {weightChange > 0 ? '+' : ''}{weightChange.toLocaleString()} lbs
              </div>
              <div className="text-xs text-text-secondary">
                {sortedData[0]?.weight?.toLocaleString()} → {sortedData[sortedData.length - 1]?.weight?.toLocaleString()} lbs
              </div>
            </div>
          )}

          <div className="bg-bg-tertiary p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-text-secondary">Reps Progress</span>
              {getTrendIcon(repsTrend)}
            </div>
            <div className={`text-2xl font-bold ${getTrendColor(repsTrend)}`}>
              {repsChange > 0 ? '+' : ''}{repsChange} reps
            </div>
            <div className="text-xs text-text-secondary">
              {sortedData[0]?.reps} → {sortedData[sortedData.length - 1]?.reps} reps
            </div>
          </div>

          <div className="bg-bg-tertiary p-4 rounded-lg">
            <div className="text-sm font-medium text-text-secondary mb-2">Total Workouts</div>
            <div className="text-2xl font-bold text-text-primary">{sortedData.length}</div>
            <div className="text-xs text-text-secondary">
              Over {Math.ceil((new Date(sortedData[sortedData.length - 1].workout_date).getTime() - new Date(sortedData[0].workout_date).getTime()) / (1000 * 60 * 60 * 24))} days
            </div>
          </div>
        </div>
      </div>

      {/* Progress Timeline */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-text-primary">Progress Timeline</h4>
        
        <div className="space-y-3">
          {sortedData.map((entry, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 bg-bg-tertiary/50 rounded-lg">
              <div className="flex-shrink-0 w-20 text-sm text-text-secondary">
                {formatDate(entry.workout_date)}
              </div>
              
              <div className="flex-1 grid grid-cols-3 gap-4 text-sm">
                {hasWeight && (
                  <div>
                    <span className="text-text-secondary">Weight:</span>
                    <span className="ml-2 font-medium">
                      {entry.weight ? `${entry.weight.toLocaleString()} lbs` : 'Bodyweight'}
                    </span>
                  </div>
                )}
                
                <div>
                  <span className="text-text-secondary">Reps:</span>
                  <span className="ml-2 font-medium">{entry.reps}</span>
                </div>
                
                <div>
                  <span className="text-text-secondary">RIR:</span>
                  <span className="ml-2 font-medium">{entry.rir}</span>
                </div>
              </div>
              
              <div className="flex-shrink-0 text-xs text-text-secondary">
                {entry.workout_name}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Line Chart for Weight Progress */}
      {hasWeight && sortedData.length > 1 && (
        <div className="mt-6">
          <h4 className="text-md font-medium text-text-primary mb-4">Weight Progress Chart</h4>
          <WeightLineChart data={sortedData} />
        </div>
      )}
    </div>
  )
}











