import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export const WorkoutPage = () => {
  const { id } = useParams()

  return (
    <>
      <div className="mb-8">
        <Link 
          to="/dashboard" 
          className="text-gray-600 hover:text-gray-900 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Workout Details
        </h1>
        <p className="text-gray-600 mb-4">
          Session #{id}
        </p>
      </div>
    </>
  )
}
