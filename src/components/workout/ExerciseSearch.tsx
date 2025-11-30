import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, X } from 'lucide-react'
import { ExerciseOption, searchExercises } from '@/lib/exercises'
import { searchCustomExercises } from '@/lib/customExercises'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

interface ExerciseSearchProps {
  onExerciseSelect: (exercise: ExerciseOption) => void
  placeholder?: string
  className?: string
}

export const ExerciseSearch = ({ onExerciseSelect, placeholder = "Search exercises...", className }: ExerciseSearchProps) => {
  const { user } = useAuth()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<ExerciseOption[]>([])
  const [customResults, setCustomResults] = useState<ExerciseOption[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [selectedExercise, setSelectedExercise] = useState<ExerciseOption | null>(null)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const performSearch = async () => {
      if (query.trim()) {
        // Search standard exercises
        const standardResults = searchExercises(query)
        
        // Search custom exercises if user is authenticated
        let customExercisesResults: ExerciseOption[] = []
        if (user?.id) {
          try {
            const customExercises = await searchCustomExercises(user.id, query)
            customExercisesResults = customExercises.map(custom => ({
              id: custom.id,
              name: custom.name,
              category: custom.category,
              equipment: custom.equipment,
              muscle_groups: custom.muscle_groups,
              instructions: custom.instructions,
              isTimeBased: custom.is_time_based
            }))
          } catch (error) {
            console.error('Error searching custom exercises:', error)
          }
        }
        
        // Store custom results for the UI indicator
        setCustomResults(customExercisesResults)
        
        // Combine results with custom exercises first
        const combinedResults = [...customExercisesResults, ...standardResults]
        setResults(combinedResults)
        setIsOpen(true)
        setFocusedIndex(-1)
      } else {
        setResults([])
        setIsOpen(false)
      }
    }

    performSearch()
  }, [query, user?.id])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value)
    setSelectedExercise(null)
  }

  const handleExerciseSelect = (exercise: ExerciseOption) => {
    setSelectedExercise(exercise)
    setQuery(exercise.name)
    setIsOpen(false)
    onExerciseSelect(exercise)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setFocusedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setFocusedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (focusedIndex >= 0 && results[focusedIndex]) {
          handleExerciseSelect(results[focusedIndex])
        }
        break
      case 'Escape':
        setIsOpen(false)
        inputRef.current?.blur()
        break
    }
  }

  const clearSelection = () => {
    setSelectedExercise(null)
    setQuery('')
    setResults([])
    setIsOpen(false)
    inputRef.current?.focus()
  }

  return (
    <div className={cn("relative", className)} ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim() && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2 border border-border-line rounded-md bg-bg-secondary text-text-primary placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-accent-primary focus:border-accent-primary"
        />
        {selectedExercise && (
          <button
            onClick={clearSelection}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <ChevronDown className={cn(
          "absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-secondary transition-transform",
          isOpen && "rotate-180"
        )} />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 w-full mt-1 card-primary border border-border-line rounded-md shadow-lg max-h-60 overflow-auto">
          {results.map((exercise, index) => (
            <button
              key={exercise.id}
              onClick={() => handleExerciseSelect(exercise)}
              className={cn(
                "w-full px-4 py-3 text-left hover:bg-bg-tertiary focus:bg-bg-tertiary focus:outline-none transition-colors",
                index === focusedIndex && "bg-bg-tertiary"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-text-primary flex items-center gap-2">
                    {exercise.name}
                    {customResults.some(custom => custom.id === exercise.id) && (
                      <span className="text-xs bg-accent-primary text-white px-2 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-text-secondary">
                    {exercise.category} • {exercise.muscle_groups.join(', ')}
                  </div>
                </div>
                <div className="text-xs text-text-secondary bg-bg-tertiary px-2 py-1 rounded">
                  {exercise.equipment.length > 0 ? exercise.equipment[0] : 'No equipment'}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {isOpen && query.trim() && results.length === 0 && (
        <div className="absolute z-50 w-full mt-1 card-primary border border-border-line rounded-md shadow-lg p-4 text-center text-text-secondary">
          No exercises found for "{query}"
        </div>
      )}
    </div>
  )
}











