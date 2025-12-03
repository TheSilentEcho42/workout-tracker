interface ExerciseDetailProps {
  exercise: {
    name: string
    sets: Array<{
      weight?: number
      reps: number
      rir: number
      duration?: number
    }>
  }
}

export const ExerciseDetail = ({ exercise }: ExerciseDetailProps) => {
  const totalVolume = exercise.sets?.reduce(
    (acc, set) => acc + (typeof set.weight === 'number' ? set.weight * set.reps : 0),
    0
  ) || 0

  const isTimeBased = exercise.sets.some(set => set.duration !== undefined && set.duration > 0)

  return (
    <div className="bg-white rounded-lg p-4 border border-gray-200">
      <div className="font-medium text-gray-900 mb-3 flex justify-between">
        <span>{exercise.name}</span>
        <span className="text-sm text-gray-500">
          {exercise.sets?.length || 0} sets • {totalVolume.toLocaleString()} lbs
        </span>
      </div>
      <div className="space-y-2">
        <div className={`grid gap-3 text-xs font-medium text-gray-500 uppercase pb-2 ${isTimeBased ? 'grid-cols-3' : 'grid-cols-4'}`}>
          <div>Set</div>
          <div>Weight</div>
          {isTimeBased ? (
            <div>Duration</div>
          ) : (
            <>
              <div>Reps</div>
              <div>RIR</div>
            </>
          )}
        </div>
        {exercise.sets?.map((set, setIdx) => (
          <div key={setIdx} className={`grid gap-3 text-sm text-gray-900 ${isTimeBased ? 'grid-cols-3' : 'grid-cols-4'}`}>
            <div className="text-gray-600">{setIdx + 1}</div>
            <div className="font-medium">
              {set.weight && set.weight > 0 ? `${set.weight} lbs` : 'BW'}
            </div>
            {isTimeBased ? (
              <div className="font-medium">{set.duration ? `${set.duration}s` : '0s'}</div>
            ) : (
              <>
                <div className="font-medium">{set.reps}</div>
                <div className="font-medium">{set.rir}</div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

