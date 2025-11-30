import { useState, useEffect } from 'react'
import { DollarSign, Brain, TrendingUp } from 'lucide-react'

interface CostData {
  totalCost: number
  operations: {
    followUpQuestions: number
    workoutPlans: number
    feedbackProcessing: number
    exerciseAlternatives: number
  }
  lastUpdated: Date
}

export const AICostMonitor = () => {
  const [costData, setCostData] = useState<CostData>({
    totalCost: 0,
    operations: {
      followUpQuestions: 0,
      workoutPlans: 0,
      feedbackProcessing: 0,
      exerciseAlternatives: 0
    },
    lastUpdated: new Date()
  })

  useEffect(() => {
    // Listen for cost logging from AI operations
    const handleCostLog = (event: CustomEvent) => {
      const { operation, cost } = event.detail
      setCostData(prev => ({
        totalCost: prev.totalCost + cost,
        operations: {
          ...prev.operations,
          [operation]: prev.operations[operation as keyof typeof prev.operations] + 1
        },
        lastUpdated: new Date()
      }))
    }

    window.addEventListener('ai-cost-log', handleCostLog as EventListener)
    
    return () => {
      window.removeEventListener('ai-cost-log', handleCostLog as EventListener)
    }
  }, [])

  const formatCost = (cost: number) => {
    if (cost < 0.01) return `$${cost.toFixed(4)}`
    return `$${cost.toFixed(2)}`
  }

  const getCostBreakdown = () => {
    const { operations } = costData
    const breakdown = []
    
    if (operations.followUpQuestions > 0) {
      breakdown.push(`${operations.followUpQuestions} question sets`)
    }
    if (operations.workoutPlans > 0) {
      breakdown.push(`${operations.workoutPlans} plan generations`)
    }
    if (operations.feedbackProcessing > 0) {
      breakdown.push(`${operations.feedbackProcessing} feedback adjustments`)
    }
    if (operations.exerciseAlternatives > 0) {
      breakdown.push(`${operations.exerciseAlternatives} exercise alternatives`)
    }
    
    return breakdown.join(', ')
  }

  if (costData.totalCost === 0) return null

  return (
    <div className="fixed bottom-4 right-4 card-primary border border-border-line rounded-lg p-4 shadow-lg z-40 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Brain className="h-4 w-4 text-accent-primary" />
          <span className="text-sm font-medium text-text-primary">AI Usage</span>
        </div>
        <TrendingUp className="h-4 w-4 text-text-secondary" />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Total Cost:</span>
          <span className="text-sm font-bold text-text-primary">
            {formatCost(costData.totalCost)}
          </span>
        </div>
        
        <div className="text-xs text-text-secondary">
          {getCostBreakdown()}
        </div>
        
        <div className="text-xs text-text-secondary">
          Last: {costData.lastUpdated.toLocaleTimeString()}
        </div>
      </div>
      
      <div className="mt-3 pt-2 border-t border-border-line">
        <div className="flex items-center justify-between text-xs">
          <span className="text-text-secondary">Session Cost</span>
          <div className="flex items-center space-x-1">
            <DollarSign className="h-3 w-3 text-success" />
            <span className="text-success font-medium">
              {formatCost(costData.totalCost)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

