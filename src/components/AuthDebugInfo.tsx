import { useAuth } from '@/contexts/AuthContext'

export const AuthDebugInfo = () => {
  const { user, session, loading, isGuest } = useAuth()

  return (
    <div className="card-primary border border-border-line rounded-lg p-4">
      <h3 className="text-lg font-semibold text-text-primary mb-3">Authentication Debug Info</h3>
      <div className="space-y-2 text-sm">
        <div>
          <span className="font-medium">Loading:</span> 
          <span className={`ml-2 ${loading ? 'text-yellow-600' : 'text-green-600'}`}>
            {loading ? 'Yes' : 'No'}
          </span>
        </div>
        <div>
          <span className="font-medium">Mode:</span> 
          <span className={`ml-2 ${isGuest ? 'text-accent-primary' : user ? 'text-green-600' : 'text-red-600'}`}>
            {isGuest ? 'Guest Mode' : user ? 'Authenticated' : 'Not authenticated'}
          </span>
        </div>
        <div>
          <span className="font-medium">User ID:</span> 
          <span className={`ml-2 ${user?.id ? 'text-green-600' : isGuest ? 'text-accent-primary' : 'text-red-600'}`}>
            {isGuest ? 'Guest User' : (user?.id || 'Not authenticated')}
          </span>
        </div>
        <div>
          <span className="font-medium">Email:</span> 
          <span className="ml-2 text-text-secondary">
            {isGuest ? 'Guest Mode' : (user?.email || 'Not available')}
          </span>
        </div>
        <div>
          <span className="font-medium">Session:</span> 
          <span className={`ml-2 ${session ? 'text-green-600' : isGuest ? 'text-accent-primary' : 'text-red-600'}`}>
            {isGuest ? 'Guest Mode' : (session ? 'Active' : 'None')}
          </span>
        </div>
      </div>
    </div>
  )
}
