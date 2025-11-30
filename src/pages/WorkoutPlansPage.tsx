import { useState, useEffect } from 'react'
import { 
  Plus, 
  Calendar, 
  Target, 
  Dumbbell, 
  Trash2, 
  Download, 
  Upload, 
  Star,
  Clock,
  TrendingUp,
  Play,
  ArrowRight,
  Sparkles,
  BarChart3,
  Zap
} from 'lucide-react'
import { 
  getSavedWorkoutPlans, 
  deleteWorkoutPlan, 
  activateWorkoutPlan, 
  exportWorkoutPlan,
  importWorkoutPlan,
  getWorkoutPlanStats,
  SavedWorkoutPlan 
} from '@/lib/workoutPlans'
import { Link } from 'react-router-dom'

export const WorkoutPlansPage = () => {
  const [plans, setPlans] = useState<SavedWorkoutPlan[]>([])
  const [stats, setStats] = useState(getWorkoutPlanStats())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importData, setImportData] = useState('')

  useEffect(() => {
    loadPlans()
  }, [])

  const loadPlans = () => {
    const savedPlans = getSavedWorkoutPlans()
    setPlans(savedPlans)
    setStats(getWorkoutPlanStats())
  }

  const handleDeletePlan = (id: string) => {
    try {
      deleteWorkoutPlan(id)
      loadPlans()
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete plan:', error)
    }
  }

  const handleActivatePlan = (id: string) => {
    try {
      activateWorkoutPlan(id)
      loadPlans()
    } catch (error) {
      console.error('Failed to activate plan:', error)
    }
  }

  const handleExportPlan = (id: string) => {
    try {
      const exportData = exportWorkoutPlan(id)
      const blob = new Blob([exportData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `workout-plan-${id}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Failed to export plan:', error)
    }
  }

  const handleImportPlan = () => {
    try {
      if (!importData.trim()) return
      
      const importedPlan = importWorkoutPlan(importData)
      loadPlans()
      setShowImportModal(false)
      setImportData('')
      
      // Show success message
      alert(`Successfully imported: ${importedPlan.name}`)
    } catch (error) {
      console.error('Failed to import plan:', error)
      alert('Failed to import workout plan. Please check the file format.')
    }
  }

  const getSplitIcon = (splitType: string) => {
    switch (splitType) {
      case 'push_pull_legs':
        return <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">PPL</div>
      case 'upper_lower':
        return <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center text-white text-xs font-bold">UL</div>
      case 'full_body':
        return <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">FB</div>
      case 'ppl_upper':
        return <div className="w-8 h-8 bg-accent-primary rounded-full flex items-center justify-center text-white text-xs font-bold">PPL+</div>
      case 'custom':
        return <div className="w-8 h-8 bg-accent-secondary rounded-full flex items-center justify-center text-white text-xs font-bold">C</div>
      default:
        return <Dumbbell className="w-8 h-8 text-accent-primary" />
    }
  }

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (plans.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="card-primary p-12">
          <div className="p-6 bg-accent-primary/20 rounded-full w-fit mx-auto mb-8">
            <Dumbbell className="h-16 w-16 text-accent-primary" />
          </div>
          
          <h1 className="text-3xl font-bold text-text-primary mb-4">No Workout Plans Yet</h1>
          <p className="text-text-secondary text-lg mb-8 max-w-2xl mx-auto">
            Create your first AI-powered workout plan to get started on your fitness journey. 
            Our AI will analyze your goals and create a personalized plan just for you.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/ai-workout"
              className="btn-primary text-lg px-8 py-4 flex items-center justify-center group"
            >
              <Plus className="w-5 h-5 mr-2" />
              Create AI Workout Plan
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            
            <button
              onClick={() => setShowImportModal(true)}
              className="btn-secondary text-lg px-8 py-4 flex items-center justify-center"
            >
              <Upload className="w-5 h-5 mr-2" />
              Import Plan
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/10"></div>
        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-accent-primary mr-2" />
              <span className="text-sm font-medium text-accent-primary">AI-Powered Plans</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              My Workout Plans
              <span className="text-accent-primary block">AI-Generated Programs</span>
            </h1>
            
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Manage and track your personalized workout plans created by our advanced AI system. 
              View, activate, and customize your fitness programs.
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 space-y-16">

      {/* Features List Section */}
      <div className="card-primary p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Plan Management Features</h2>
          <p className="text-text-secondary">
            Everything you need to organize and optimize your workout plans
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="p-4 bg-accent-primary/20 rounded-full w-fit mx-auto mb-4">
              <Target className="w-8 h-8 text-accent-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">AI-Generated Plans</h3>
            <p className="text-text-secondary text-sm">
              Personalized workout plans tailored to your goals and experience level
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-4 bg-accent-secondary/20 rounded-full w-fit mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-accent-secondary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Progress Tracking</h3>
            <p className="text-text-secondary text-sm">
              Monitor your performance and track improvements over time
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-4 bg-accent-primary/20 rounded-full w-fit mx-auto mb-4">
              <Zap className="w-8 h-8 text-accent-primary" />
            </div>
            <h3 className="font-semibold text-text-primary mb-2">Easy Management</h3>
            <p className="text-text-secondary text-sm">
              Activate, export, import, and modify your plans with ease
            </p>
          </div>
        </div>
      </div>

      {/* Feature Section 1 - Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`card-primary p-6 transition-all hover:shadow-lg ${
              plan.is_active ? 'border-accent-primary bg-accent-primary/5' : 'hover:border-accent-primary/30'
            }`}
          >
            {/* Plan Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {getSplitIcon(plan.split_type)}
                <div>
                  <h3 className="font-bold text-text-primary">{plan.name}</h3>
                  <p className="text-sm text-text-secondary">{plan.split_type.replace('_', ' ')}</p>
                </div>
              </div>
              
              {plan.is_active && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-accent-primary text-bg-primary">
                  Active
                </span>
              )}
            </div>

            {/* Plan Details */}
            <p className="text-text-secondary text-sm mb-4 line-clamp-2">
              {plan.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-text-secondary">
                <Calendar className="w-4 h-4 mr-2" />
                {plan.days_per_week} days per week
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <Dumbbell className="w-4 h-4 mr-2" />
                {plan.workouts.filter(w => !w.is_rest).length} workout days
              </div>
              <div className="flex items-center text-sm text-text-secondary">
                <Clock className="w-4 h-4 mr-2" />
                Created {formatDate(plan.created_at)}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <Link
                to={`/workout-plan/${plan.id}`}
                className="flex-1 btn-primary text-sm font-medium text-center flex items-center justify-center"
              >
                <Play className="w-4 h-4 mr-1" />
                View Plan
              </Link>
              
              <button
                onClick={() => handleActivatePlan(plan.id)}
                disabled={plan.is_active}
                className="p-2 text-text-secondary hover:text-accent-primary transition-colors disabled:opacity-50"
                title={plan.is_active ? 'Already active' : 'Activate plan'}
              >
                <Star className={`w-4 h-4 ${plan.is_active ? 'fill-current' : ''}`} />
              </button>
              
              <button
                onClick={() => handleExportPlan(plan.id)}
                className="p-2 text-text-secondary hover:text-accent-primary transition-colors"
                title="Export plan"
              >
                <Download className="w-4 h-4" />
              </button>
              
              <button
                onClick={() => setShowDeleteConfirm(plan.id)}
                className="p-2 text-text-secondary hover:text-error transition-colors"
                title="Delete plan"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Section 1 - Create New Plan */}
      <div className="card-primary p-8 text-center">
        <div className="p-4 bg-accent-primary/20 rounded-full w-fit mx-auto mb-6">
          <Plus className="h-8 w-8 text-accent-primary" />
        </div>
        
        <h2 className="text-2xl font-bold text-text-primary mb-4">Create New Plan</h2>
        <p className="text-text-secondary mb-6 max-w-2xl mx-auto">
          Generate a new AI-powered workout plan tailored to your current goals and preferences
        </p>
        
        <Link
          to="/ai-workout"
          className="btn-primary text-lg px-8 py-4 flex items-center justify-center group mx-auto w-fit"
        >
          <Plus className="w-5 h-5 mr-2" />
          Create AI Workout Plan
          <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Feature Section 2 - Plan Statistics */}
      <div className="card-primary p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Plan Statistics</h2>
          <p className="text-text-secondary">
            Overview of your workout plan performance and usage
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="p-3 bg-accent-primary/20 rounded-lg w-fit mx-auto mb-3">
              <Target className="w-6 h-6 text-accent-primary" />
            </div>
            <p className="text-sm text-text-secondary mb-1">Total Plans</p>
            <p className="text-2xl font-bold text-text-primary">{stats.totalPlans}</p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-accent-secondary/20 rounded-lg w-fit mx-auto mb-3">
              <Star className="w-6 h-6 text-accent-secondary" />
            </div>
            <p className="text-sm text-text-secondary mb-1">Active Plan</p>
            <p className="text-2xl font-bold text-text-primary">
              {stats.activePlan ? '1' : '0'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-accent-primary/20 rounded-lg w-fit mx-auto mb-3">
              <Calendar className="w-6 h-6 text-accent-primary" />
            </div>
            <p className="text-sm text-text-secondary mb-1">Most Recent</p>
            <p className="text-lg font-semibold text-text-primary">
              {stats.recentPlans[0] ? formatDate(stats.recentPlans[0].updated_at) : 'N/A'}
            </p>
          </div>
          
          <div className="text-center">
            <div className="p-3 bg-accent-secondary/20 rounded-lg w-fit mx-auto mb-3">
              <TrendingUp className="w-6 h-6 text-accent-secondary" />
            </div>
            <p className="text-sm text-text-secondary mb-1">Popular Type</p>
            <p className="text-lg font-semibold text-text-primary">
              {Object.entries(stats.plansByType).sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section 2 - Import/Export */}
      <div className="card-primary p-8">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Import & Export Plans</h2>
          <p className="text-text-secondary">
            Share your plans or import plans from other users
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setShowImportModal(true)}
            className="btn-secondary text-lg px-8 py-4 flex items-center justify-center"
          >
            <Upload className="w-5 h-5 mr-2" />
            Import Plan
          </button>
          
          <div className="text-center text-text-secondary text-sm">
            <p>Export individual plans using the download button on each plan card</p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="card-primary p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-text-primary mb-2">Frequently Asked Questions</h2>
          <p className="text-text-secondary">Common questions about plan management</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-bg-tertiary rounded-lg">
            <h3 className="font-semibold text-text-primary mb-2">How do I activate a plan?</h3>
            <p className="text-text-secondary text-sm">
              Click the star icon on any plan card to activate it. Only one plan can be active at a time.
            </p>
          </div>
          
          <div className="p-6 bg-bg-tertiary rounded-lg">
            <h3 className="font-semibold text-text-primary mb-2">Can I modify an existing plan?</h3>
            <p className="text-text-secondary text-sm">
              Yes! Click "View Plan" to see detailed exercises and make modifications to suit your needs.
            </p>
          </div>
          
          <div className="p-6 bg-bg-tertiary rounded-lg">
            <h3 className="font-semibold text-text-primary mb-2">How do I export my plans?</h3>
            <p className="text-text-secondary text-sm">
              Use the download icon on each plan card to export it as a JSON file for backup or sharing.
            </p>
          </div>
          
          <div className="p-6 bg-bg-tertiary rounded-lg">
            <h3 className="font-semibold text-text-primary mb-2">What file format do I need for importing?</h3>
            <p className="text-text-secondary text-sm">
              Import plans using JSON format. You can export plans from this app or use compatible formats.
            </p>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card-primary p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Delete Workout Plan</h3>
            <p className="text-text-secondary mb-6">
              Are you sure you want to delete this workout plan? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(showDeleteConfirm)}
                className="px-4 py-2 bg-error text-white rounded-md hover:bg-error/90 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="card-primary p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-text-primary mb-4">Import Workout Plan</h3>
            <p className="text-text-secondary mb-4">
              Paste the JSON data from an exported workout plan file.
            </p>
            <textarea
              value={importData}
              onChange={(e) => setImportData(e.target.value)}
              placeholder="Paste JSON data here..."
              className="input-primary w-full resize-none"
              rows={8}
            />
            <div className="flex justify-end space-x-3 mt-4">
              <button
                onClick={() => {
                  setShowImportModal(false)
                  setImportData('')
                }}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleImportPlan}
                disabled={!importData.trim()}
                className="btn-primary disabled:btn-disabled"
              >
                Import
              </button>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}

