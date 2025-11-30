interface MuscleGroup {
  id: string
  name: string
  frontPath: string
  backPath: string
  sidePath: string
  color: string
}

interface MuscleDiagramProps {
  workedMuscles: string[]
  size?: 'small' | 'medium' | 'large'
}

const MUSCLE_GROUPS: MuscleGroup[] = [
  {
    id: 'chest',
    name: 'Chest',
    frontPath: 'M 35 25 C 40 20, 60 20, 65 25 C 70 30, 70 40, 65 45 C 60 50, 40 50, 35 45 C 30 40, 30 30, 35 25 Z',
    backPath: '',
    sidePath: 'M 40 25 C 45 20, 55 20, 60 25 C 65 30, 65 40, 60 45 C 55 50, 45 50, 40 45 C 35 40, 35 30, 40 25 Z',
    color: '#32ecc6'
  },
  {
    id: 'shoulders',
    name: 'Shoulders',
    frontPath: 'M 20 20 C 25 15, 35 15, 40 20 C 45 25, 45 30, 40 35 C 35 40, 25 40, 20 35 C 15 30, 15 25, 20 20 Z M 80 20 C 85 15, 95 15, 100 20 C 105 25, 105 30, 100 35 C 95 40, 85 40, 80 35 C 75 30, 75 25, 80 20 Z',
    backPath: 'M 20 20 C 25 15, 35 15, 40 20 C 45 25, 45 30, 40 35 C 35 40, 25 40, 20 35 C 15 30, 15 25, 20 20 Z M 80 20 C 85 15, 95 15, 100 20 C 105 25, 105 30, 100 35 C 95 40, 85 40, 80 35 C 75 30, 75 25, 80 20 Z',
    sidePath: 'M 25 20 C 30 15, 40 15, 45 20 C 50 25, 50 30, 45 35 C 40 40, 30 40, 25 35 C 20 30, 20 25, 25 20 Z',
    color: '#32ecc6'
  },
  {
    id: 'biceps',
    name: 'Biceps',
    frontPath: 'M 15 35 C 20 30, 30 30, 35 35 C 40 40, 40 45, 35 50 C 30 55, 20 55, 15 50 C 10 45, 10 40, 15 35 Z M 85 35 C 90 30, 100 30, 105 35 C 110 40, 110 45, 105 50 C 100 55, 90 55, 85 50 C 80 45, 80 40, 85 35 Z',
    backPath: '',
    sidePath: 'M 20 35 C 25 30, 35 30, 40 35 C 45 40, 45 45, 40 50 C 35 55, 25 55, 20 50 C 15 45, 15 40, 20 35 Z',
    color: '#32ecc6'
  },
  {
    id: 'triceps',
    name: 'Triceps',
    frontPath: '',
    backPath: 'M 15 35 C 20 30, 30 30, 35 35 C 40 40, 40 45, 35 50 C 30 55, 20 55, 15 50 C 10 45, 10 40, 15 35 Z M 85 35 C 90 30, 100 30, 105 35 C 110 40, 110 45, 105 50 C 100 55, 90 55, 85 50 C 80 45, 80 40, 85 35 Z',
    sidePath: 'M 20 35 C 25 30, 35 30, 40 35 C 45 40, 45 45, 40 50 C 35 55, 25 55, 20 50 C 15 45, 15 40, 20 35 Z',
    color: '#32ecc6'
  },
  {
    id: 'forearms',
    name: 'Forearms',
    frontPath: 'M 10 45 C 15 40, 25 40, 30 45 C 35 50, 35 55, 30 60 C 25 65, 15 65, 10 60 C 5 55, 5 50, 10 45 Z M 90 45 C 95 40, 105 40, 110 45 C 115 50, 115 55, 110 60 C 105 65, 95 65, 90 60 C 85 55, 85 50, 90 45 Z',
    backPath: 'M 10 45 C 15 40, 25 40, 30 45 C 35 50, 35 55, 30 60 C 25 65, 15 65, 10 60 C 5 55, 5 50, 10 45 Z M 90 45 C 95 40, 105 40, 110 45 C 115 50, 115 55, 110 60 C 105 65, 95 65, 90 60 C 85 55, 85 50, 90 45 Z',
    sidePath: 'M 15 45 C 20 40, 30 40, 35 45 C 40 50, 40 55, 35 60 C 30 65, 20 65, 15 60 C 10 55, 10 50, 15 45 Z',
    color: '#32ecc6'
  },
  {
    id: 'abs',
    name: 'Abs',
    frontPath: 'M 35 40 C 40 35, 60 35, 65 40 C 70 45, 70 50, 65 55 C 60 60, 40 60, 35 55 C 30 50, 30 45, 35 40 Z M 35 50 C 40 45, 60 45, 65 50 C 70 55, 70 60, 65 65 C 60 70, 40 70, 35 65 C 30 60, 30 55, 35 50 Z',
    backPath: '',
    sidePath: 'M 40 40 C 45 35, 55 35, 60 40 C 65 45, 65 50, 60 55 C 55 60, 45 60, 40 55 C 35 50, 35 45, 40 40 Z M 40 50 C 45 45, 55 45, 60 50 C 65 55, 65 60, 60 65 C 55 70, 45 70, 40 65 C 35 60, 35 55, 40 50 Z',
    color: '#32ecc6'
  },
  {
    id: 'obliques',
    name: 'Obliques',
    frontPath: 'M 30 45 C 35 40, 45 40, 50 45 C 55 50, 55 55, 50 60 C 45 65, 35 65, 30 60 C 25 55, 25 50, 30 45 Z M 70 45 C 75 40, 85 40, 90 45 C 95 50, 95 55, 90 60 C 85 65, 75 65, 70 60 C 65 55, 65 50, 70 45 Z',
    backPath: '',
    sidePath: 'M 30 45 C 35 40, 45 40, 50 45 C 55 50, 55 55, 50 60 C 45 65, 35 65, 30 60 C 25 55, 25 50, 30 45 Z M 70 45 C 75 40, 85 40, 90 45 C 95 50, 95 55, 90 60 C 85 65, 75 65, 70 60 C 65 55, 65 50, 70 45 Z',
    color: '#32ecc6'
  },
  {
    id: 'quads',
    name: 'Quadriceps',
    frontPath: 'M 25 60 C 30 55, 40 55, 45 60 C 50 65, 50 70, 45 75 C 40 80, 30 80, 25 75 C 20 70, 20 65, 25 60 Z M 75 60 C 80 55, 90 55, 95 60 C 100 65, 100 70, 95 75 C 90 80, 80 80, 75 75 C 70 70, 70 65, 75 60 Z',
    backPath: '',
    sidePath: 'M 30 60 C 35 55, 45 55, 50 60 C 55 65, 55 70, 50 75 C 45 80, 35 80, 30 75 C 25 70, 25 65, 30 60 Z M 80 60 C 85 55, 95 55, 100 60 C 105 65, 105 70, 100 75 C 95 80, 85 80, 80 75 C 75 70, 75 65, 80 60 Z',
    color: '#32ecc6'
  },
  {
    id: 'hamstrings',
    name: 'Hamstrings',
    frontPath: '',
    backPath: 'M 25 60 C 30 55, 40 55, 45 60 C 50 65, 50 70, 45 75 C 40 80, 30 80, 25 75 C 20 70, 20 65, 25 60 Z M 75 60 C 80 55, 90 55, 95 60 C 100 65, 100 70, 95 75 C 90 80, 80 80, 75 75 C 70 70, 70 65, 75 60 Z',
    sidePath: 'M 30 60 C 35 55, 45 55, 50 60 C 55 65, 55 70, 50 75 C 45 80, 35 80, 30 75 C 25 70, 25 65, 30 60 Z M 80 60 C 85 55, 95 55, 100 60 C 105 65, 105 70, 100 75 C 95 80, 85 80, 80 75 C 75 70, 75 65, 80 60 Z',
    color: '#32ecc6'
  },
  {
    id: 'calves',
    name: 'Calves',
    frontPath: 'M 25 75 C 30 70, 40 70, 45 75 C 50 80, 50 85, 45 90 C 40 95, 30 95, 25 90 C 20 85, 20 80, 25 75 Z M 75 75 C 80 70, 90 70, 95 75 C 100 80, 100 85, 95 90 C 90 95, 80 95, 75 90 C 70 85, 70 80, 75 75 Z',
    backPath: 'M 25 75 C 30 70, 40 70, 45 75 C 50 80, 50 85, 45 90 C 40 95, 30 95, 25 90 C 20 85, 20 80, 25 75 Z M 75 75 C 80 70, 90 70, 95 75 C 100 80, 100 85, 95 90 C 90 95, 80 95, 75 90 C 70 85, 70 80, 75 75 Z',
    sidePath: 'M 30 75 C 35 70, 45 70, 50 75 C 55 80, 55 85, 50 90 C 45 95, 35 95, 30 90 C 25 85, 25 80, 30 75 Z M 80 75 C 85 70, 95 70, 100 75 C 105 80, 105 85, 100 90 C 95 95, 85 95, 80 90 C 75 85, 75 80, 80 75 Z',
    color: '#32ecc6'
  },
  {
    id: 'glutes',
    name: 'Glutes',
    frontPath: '',
    backPath: 'M 35 55 C 40 50, 60 50, 65 55 C 70 60, 70 65, 65 70 C 60 75, 40 75, 35 70 C 30 65, 30 60, 35 55 Z',
    sidePath: 'M 35 55 C 40 50, 60 50, 65 55 C 70 60, 70 65, 65 70 C 60 75, 40 75, 35 70 C 30 65, 30 60, 35 55 Z',
    color: '#32ecc6'
  },
  {
    id: 'lats',
    name: 'Lats',
    frontPath: '',
    backPath: 'M 20 30 C 25 25, 35 25, 50 30 C 55 35, 55 45, 50 50 C 35 55, 25 55, 20 50 C 15 45, 15 35, 20 30 Z M 70 30 C 75 25, 85 25, 100 30 C 105 35, 105 45, 100 50 C 85 55, 75 55, 70 50 C 65 45, 65 35, 70 30 Z',
    sidePath: 'M 25 30 C 30 25, 40 25, 55 30 C 60 35, 60 45, 55 50 C 40 55, 30 55, 25 50 C 20 45, 20 35, 25 30 Z',
    color: '#32ecc6'
  },
  {
    id: 'traps',
    name: 'Traps',
    frontPath: '',
    backPath: 'M 35 15 C 40 10, 60 10, 65 15 C 70 20, 70 25, 65 30 C 60 35, 40 35, 35 30 C 30 25, 30 20, 35 15 Z',
    sidePath: 'M 35 15 C 40 10, 60 10, 65 15 C 70 20, 70 25, 65 30 C 60 35, 40 35, 35 30 C 30 25, 30 20, 35 15 Z',
    color: '#32ecc6'
  },
  {
    id: 'rhomboids',
    name: 'Rhomboids',
    frontPath: '',
    backPath: 'M 40 25 C 45 20, 55 20, 60 25 C 65 30, 65 35, 60 40 C 55 45, 45 45, 40 40 C 35 35, 35 30, 40 25 Z',
    sidePath: '',
    color: '#32ecc6'
  }
]

export const MuscleDiagram = ({ workedMuscles }: MuscleDiagramProps) => {
  const isWorked = (muscleId: string) => workedMuscles.includes(muscleId)

  return (
    <div className="flex flex-col items-center">
      <h3 className="text-sm font-semibold text-text-primary mb-4">Muscles Worked</h3>
      
      {/* Three Views */}
      <div className="flex gap-4 justify-center">
        {/* Front View */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Front View</h3>
          <svg
            width={120}
            height={160}
            viewBox="0 0 120 160"
            className="border border-border-line rounded-lg bg-bg-primary"
          >
            {/* Human figure outline - front */}
            <path
              d="M 60 10 C 50 15, 30 20, 25 30 C 20 40, 20 50, 25 60 C 30 70, 30 80, 25 90 C 20 100, 20 110, 25 120 C 30 130, 30 140, 25 150 L 95 150 C 90 140, 90 130, 95 120 C 100 110, 100 100, 95 90 C 90 80, 90 70, 95 60 C 100 50, 100 40, 95 30 C 90 20, 70 15, 60 10 Z"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="1"
              opacity="0.3"
            />
            
            {/* Muscle groups - front */}
            {MUSCLE_GROUPS.map((muscle) => (
              muscle.frontPath && (
                <path
                  key={`front-${muscle.id}`}
                  d={muscle.frontPath}
                  fill={isWorked(muscle.id) ? muscle.color : '#f8f8f8'}
                  stroke={isWorked(muscle.id) ? muscle.color : '#e0e0e0'}
                  strokeWidth={isWorked(muscle.id) ? "1" : "0.5"}
                  className="transition-all duration-300"
                />
              )
            ))}
          </svg>
        </div>

        {/* Back View */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Back View</h3>
          <svg
            width={120}
            height={160}
            viewBox="0 0 120 160"
            className="border border-border-line rounded-lg bg-bg-primary"
          >
            {/* Human figure outline - back */}
            <path
              d="M 60 10 C 50 15, 30 20, 25 30 C 20 40, 20 50, 25 60 C 30 70, 30 80, 25 90 C 20 100, 20 110, 25 120 C 30 130, 30 140, 25 150 L 95 150 C 90 140, 90 130, 95 120 C 100 110, 100 100, 95 90 C 90 80, 90 70, 95 60 C 100 50, 100 40, 95 30 C 90 20, 70 15, 60 10 Z"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="1"
              opacity="0.3"
            />
            
            {/* Muscle groups - back */}
            {MUSCLE_GROUPS.map((muscle) => (
              muscle.backPath && (
                <path
                  key={`back-${muscle.id}`}
                  d={muscle.backPath}
                  fill={isWorked(muscle.id) ? muscle.color : '#f8f8f8'}
                  stroke={isWorked(muscle.id) ? muscle.color : '#e0e0e0'}
                  strokeWidth={isWorked(muscle.id) ? "1" : "0.5"}
                  className="transition-all duration-300"
                />
              )
            ))}
          </svg>
        </div>

        {/* Side View */}
        <div className="flex flex-col items-center">
          <h3 className="text-sm font-semibold text-text-primary mb-2">Side View</h3>
          <svg
            width={120}
            height={160}
            viewBox="0 0 120 160"
            className="border border-border-line rounded-lg bg-bg-primary"
          >
            {/* Human figure outline - side */}
            <path
              d="M 60 10 C 40 15, 30 25, 25 35 C 20 45, 20 55, 25 65 C 30 75, 30 85, 25 95 C 20 105, 20 115, 25 125 C 30 135, 30 145, 25 155 L 95 155 C 90 145, 90 135, 95 125 C 100 115, 100 105, 95 95 C 90 85, 90 75, 95 65 C 100 55, 100 45, 95 35 C 90 25, 80 15, 60 10 Z"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="1"
              opacity="0.3"
            />
            
            {/* Muscle groups - side */}
            {MUSCLE_GROUPS.map((muscle) => (
              muscle.sidePath && (
                <path
                  key={`side-${muscle.id}`}
                  d={muscle.sidePath}
                  fill={isWorked(muscle.id) ? muscle.color : '#f8f8f8'}
                  stroke={isWorked(muscle.id) ? muscle.color : '#e0e0e0'}
                  strokeWidth={isWorked(muscle.id) ? "1" : "0.5"}
                  className="transition-all duration-300"
                />
              )
            ))}
          </svg>
        </div>
      </div>
      
      {/* Legend */}
      <div className="mt-4 text-center">
        <h3 className="text-sm font-semibold text-text-primary mb-2">Muscles Worked</h3>
        <div className="flex flex-wrap justify-center gap-2">
          {workedMuscles.map((muscleId) => {
            const muscle = MUSCLE_GROUPS.find(m => m.id === muscleId)
            return muscle ? (
              <div
                key={muscleId}
                className="flex items-center space-x-1 px-2 py-1 bg-bg-tertiary rounded text-xs"
              >
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: muscle.color }}
                />
                <span className="text-text-primary">{muscle.name}</span>
              </div>
            ) : null
          })}
        </div>
      </div>
    </div>
  )
}





