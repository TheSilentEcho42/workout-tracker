import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export const HomePage = () => {
  const { user, isGuest, loading } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && (user || isGuest)) {
      navigate('/dashboard', { replace: true })
    }
  }, [user, isGuest, loading, navigate])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  if (user || isGuest) {
    return null // Will redirect
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Workout Tracker
          </h1>
          <p className="text-gray-600 mb-8">
            Track your workouts and progress
          </p>
          
          <div className="space-y-4">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-gray-900 text-white rounded-md hover:bg-gray-800 transition-colors font-medium block w-full text-center"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
