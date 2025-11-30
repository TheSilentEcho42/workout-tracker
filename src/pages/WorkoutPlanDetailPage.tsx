import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Calendar, 
  Target, 
  Dumbbell, 
  Edit3, 
  Save, 
  Trash2, 
  Download,
  Star,
  Clock,
  Play,
  CheckCircle,
  X
} from 'lucide-react'
import { 
  getWorkoutPlanById, 
  updateWorkoutPlan, 
  deleteWorkoutPlan, 
  activateWorkoutPlan,
  exportWorkoutPlan,
  SavedWorkoutPlan 
} from '@/lib/workoutPlans'

export const WorkoutPlanDetailPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<SavedWorkoutPlan | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedPlan, setEditedPlan] = useState<SavedWorkoutPlan | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [editingExercise, setEditingExercise] = useState<{ dayIndex: number; exerciseIndex: number } | null>(null)
  const [exerciseInput, setExerciseInput] = useState('')

  useEffect(() => {
    if (id) {
      const foundPlan = getWorkoutPlanById(id)
      if (foundPlan) {
        setPlan(foundPlan)
        setEditedPlan(foundPlan)
      } else {
        navigate('/workout-plans')
      }
    }
  }, [id, navigate])

  const handleSave = () => {
    if (editedPlan) {
      try {
        updateWorkoutPlan(editedPlan.id, editedPlan)
        setPlan(editedPlan)
        setIsEditing(false)
        alert('Workout plan updated successfully!')
      } catch (error) {
        console.error('Failed to update plan:', error)
        alert('Failed to update workout plan')
      }
    }
  }

  const handleDelete = () => {
    if (plan) {
      try {
        deleteWorkoutPlan(plan.id)
        navigate('/workout-plans')
      } catch (error) {
        console.error('Failed to delete plan:', error)
        alert('Failed to delete workout plan')
      }
    }
  }

  const handleActivate = () => {
    if (plan) {
      try {
        activateWorkoutPlan(plan.id)
        // Reload the plan to get updated active status
        const updatedPlan = getWorkoutPlanById(plan.id)
        if (updatedPlan) {
          setPlan(updatedPlan)
          setEditedPlan(updatedPlan)
        }
        alert('Workout plan activated!')
      } catch (error) {
        console.error('Failed to activate plan:', error)
        alert('Failed to activate workout plan')
      }
    }
  }

  const handleExport = () => {
    if (plan) {
      try {
        const exportData = exportWorkoutPlan(plan.id)
        const blob = new Blob([exportData], { type: 'application/json' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `workout-plan-${plan.name.replace(/\s+/g, '-')}.json`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } catch (error) {
        console.error('Failed to export plan:', error)
        alert('Failed to export workout plan')
      }
    }
  }

  const handleExerciseEdit = (dayIndex: number, exerciseIndex: number) => {
    if (editedPlan) {
      const exercise = editedPlan.workouts[dayIndex].exercises[exerciseIndex]
      setExerciseInput(exercise)
      setEditingExercise({ dayIndex, exerciseIndex })
    }
  }

  const handleExerciseSave = () => {
    if (editingExercise && editedPlan) {
      const newPlan = { ...editedPlan }
      newPlan.workouts[editingExercise.dayIndex].exercises[editingExercise.exerciseIndex] = exerciseInput
      setEditedPlan(newPlan)
      setEditingExercise(null)
      setExerciseInput('')
    }
  }

  const handleExerciseDelete = (dayIndex: number, exerciseIndex: number) => {
    if (editedPlan) {
      const newPlan = { ...editedPlan }
      newPlan.workouts[dayIndex].exercises.splice(exerciseIndex, 1)
      setEditedPlan(newPlan)
    }
  }

  const handleAddExercise = (dayIndex: number) => {
    if (editedPlan) {
      const newPlan = { ...editedPlan }
      newPlan.workouts[dayIndex].exercises.push('New Exercise')
      setEditedPlan(newPlan)
    }
  }

  const getSplitIcon = (splitType: string) => {
    switch (splitType) {
      case 'push_pull_legs':
        return <div className="w-12 h-12 bg-accent-secondary rounded-full flex items-center justify-center text-white text-lg font-bold">PPL</div>
      case 'upper_lower':
        return <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center text-white text-lg font-bold">UL</div>
      case 'full_body':
        return <div className="w-12 h-12 bg-accent-secondary rounded-full flex items-center justify-center text-white text-lg font-bold">FB</div>
      case 'ppl_upper':
        return <div className="w-12 h-12 bg-accent-primary rounded-full flex items-center justify-center text-white text-lg font-bold">PPL+</div>
      case 'custom':
        return <div className="w-12 h-12 bg-accent-secondary rounded-full flex items-center justify-center text-white text-lg font-bold">C</div>
      default:
        return <Dumbbell className="w-12 h-12 text-accent-primary" />
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (!plan || !editedPlan) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent-primary mx-auto mb-4"></div>
        <p className="text-text-secondary">Loading workout plan...</p>
      </div>
    )
  }

  const currentPlan = isEditing ? editedPlan : plan

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/10"></div>
        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-6">
              <Target className="w-4 h-4 text-accent-primary mr-2" />
              <span className="text-sm font-medium text-accent-primary">Workout Plan Details</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              {currentPlan.name}
              {currentPlan.is_active && (
                <span className="text-accent-primary block">Active Plan</span>
              )}
            </h1>
            
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              {currentPlan.description}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-16">
        {/* Header Navigation */}
        <section className="py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between">
              <Link
                to="/workout-plans"
                className="flex items-center text-text-secondary hover:text-text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Plans
              </Link>
              
              <div className="flex items-center space-x-3">
                {!isEditing && (
                  <>
                    <button
                      onClick={handleActivate}
                      disabled={currentPlan.is_active}
                      className="btn-secondary disabled:btn-disabled"
                    >
                      <Star className="w-4 h-4 mr-2" />
                      {currentPlan.is_active ? 'Active' : 'Activate'}
                    </button>
                    
                    <button
                      onClick={handleExport}
                      className="btn-secondary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </button>
                    
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn-secondary"
                    >
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  </>
                )}
                
                {isEditing && (
                  <>
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setEditedPlan(plan)
                      }}
                      className="btn-secondary"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                    
                    <button
                      onClick={handleSave}
                      className="btn-primary"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-4 py-2 border border-error text-error rounded-lg hover:bg-error/10 transition-colors flex items-center"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Plan Overview */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto">
            <div className="card-primary p-6">
              <div className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  {getSplitIcon(currentPlan.split_type)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-text-primary">{currentPlan.name}</h2>
                  </div>
                  <p className="text-text-secondary text-lg mb-4">{currentPlan.description}</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-accent-primary" />
                      <span className="text-text-primary">{currentPlan.days_per_week} days per week</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Target className="w-5 h-5 text-accent-primary" />
                      <span className="text-text-primary">{currentPlan.workouts.filter(w => !w.is_rest).length} workout days</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Dumbbell className="w-5 h-5 text-accent-primary" />
                      <span className="text-text-primary">{currentPlan.workouts.filter(w => w.is_rest).length} rest days</span>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-accent-primary" />
                      <span className="text-text-primary">Updated {formatDate(currentPlan.updated_at)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Weekly Schedule */}
        <section className="py-16 bg-bg-secondary">
          <div className="max-w-6xl mx-auto">
            <div className="card-primary p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-text-primary">Weekly Schedule</h2>
                {isEditing && (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="btn-primary"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Workout
                  </button>
                )}
              </div>
              
              <div className="space-y-4">
                {currentPlan.workouts.map((workout, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      workout.is_rest
                        ? 'border-border-line bg-bg-tertiary'
                        : 'border-accent-primary/20 bg-accent-primary/5 hover:border-accent-primary/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="font-bold text-lg text-text-primary">{workout.day}</div>
                        
                        {workout.is_rest ? (
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="w-5 h-5 text-text-secondary" />
                            <span className="text-text-secondary font-medium">Rest Day</span>
                          </div>
                        ) : (
                          <span className="text-text-primary font-medium">{workout.focus}</span>
                        )}
                      </div>
                      
                      {isEditing && !workout.is_rest && (
                        <button
                          onClick={() => handleAddExercise(dayIndex)}
                          className="px-3 py-1 text-sm border border-border-line rounded-md hover:bg-bg-tertiary transition-colors"
                        >
                          + Add Exercise
                        </button>
                      )}
                    </div>
                    
                    {!workout.is_rest && (
                      <div className="space-y-2">
                        {workout.exercises.map((exercise, exerciseIndex) => (
                          <div key={exerciseIndex} className="flex items-center space-x-3">
                            <div className="flex-1 bg-bg-primary p-3 rounded-lg border border-border-line">
                              {editingExercise?.dayIndex === dayIndex && editingExercise?.exerciseIndex === exerciseIndex ? (
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="text"
                                    value={exerciseInput}
                                    onChange={(e) => setExerciseInput(e.target.value)}
                                    className="input-primary flex-1"
                                    onKeyDown={(e) => e.key === 'Enter' && handleExerciseSave()}
                                  />
                                  <button
                                    onClick={handleExerciseSave}
                                    className="p-1 text-success hover:bg-success/10 rounded"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                  <button
                                    onClick={() => setEditingExercise(null)}
                                    className="p-1 text-error hover:bg-error/10 rounded"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-between">
                                  <span className="text-text-primary">{exercise}</span>
                                  {isEditing && (
                                    <div className="flex items-center space-x-1">
                                      <button
                                        onClick={() => handleExerciseEdit(dayIndex, exerciseIndex)}
                                        className="p-1 text-text-secondary hover:text-accent-primary rounded"
                                      >
                                        <Edit3 className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleExerciseDelete(dayIndex, exerciseIndex)}
                                        className="p-1 text-text-secondary hover:text-error rounded"
                                      >
                                        <X className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="card-primary p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-text-primary mb-4">Delete Workout Plan</h3>
              <p className="text-text-secondary mb-6">
                Are you sure you want to delete "{plan.name}"? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-error text-white rounded-md hover:bg-error/90 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

