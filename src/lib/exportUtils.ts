import { CompletedWorkout } from './history'

export interface ExportData {
  workouts: CompletedWorkout[]
  exportDate: string
  totalWorkouts: number
  totalSets: number
  totalReps: number
  totalWeight: number
}

export const exportToJSON = (data: ExportData): void => {
  const jsonString = JSON.stringify(data, null, 2)
  const blob = new Blob([jsonString], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `workout-data-${new Date().toISOString().split('T')[0]}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const exportToCSV = (data: ExportData): void => {
  const csvRows: string[] = []
  
  // Add header row
  csvRows.push('Workout Name,Date,Exercise,Weight,Reps,RIR,Duration (seconds),Notes')
  
  // Add data rows
  data.workouts.forEach(workout => {
    workout.sets.forEach(set => {
      csvRows.push([
        `"${workout.name}"`,
        workout.workout_date,
        `"${set.exercise_name}"`,
        set.weight || '',
        set.reps,
        set.rir,
        set.duration || '',
        `"${set.notes || ''}"`
      ].join(','))
    })
  })
  
  const csvString = csvRows.join('\n')
  const blob = new Blob([csvString], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  
  const link = document.createElement('a')
  link.href = url
  link.download = `workout-data-${new Date().toISOString().split('T')[0]}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export const prepareExportData = (workouts: CompletedWorkout[]): ExportData => {
  const totalSets = workouts.reduce((sum, workout) => sum + workout.sets.length, 0)
  const totalReps = workouts.reduce((sum, workout) => 
    sum + workout.sets.reduce((setSum, set) => setSum + set.reps, 0), 0)
  // Calculate total weight lifted: sum of (weight × reps) for each set
  const totalWeight = workouts.reduce((sum, workout) => 
    sum + workout.sets.reduce((setSum, set) => setSum + ((set.weight || 0) * (set.reps || 0)), 0), 0)

  return {
    workouts,
    exportDate: new Date().toISOString(),
    totalWorkouts: workouts.length,
    totalSets,
    totalReps,
    totalWeight
  }
}




