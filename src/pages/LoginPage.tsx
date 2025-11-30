import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { isDatabaseConfigured } from '@/lib/supabase'
import { 
  Eye, 
  EyeOff
} from 'lucide-react'

export const LoginPage = () => {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const { signIn, signUp, signInAsGuest } = useAuth()
  const navigate = useNavigate()

  const handleGuestLogin = async () => {
    setLoading(true)
    setError('')
    try {
      await signInAsGuest()
      navigate('/dashboard')
    } catch (error: any) {
      console.error('Guest login error:', error)
      if (error?.message) {
        setError(error.message)
      } else {
        setError('Failed to create guest account. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check if Supabase is configured
    if (!isDatabaseConfigured) {
      setError('Database is not configured. Please configure Supabase in your .env file to use authentication.')
      setLoading(false)
      return
    }

    try {
      if (isSignUp) {
        await signUp(email, password, fullName)
        setMessage('Account created successfully! You will receive a verification email. Please click the link in the email to verify your account, then return to this page to sign in.')
      } else {
        await signIn(email, password)
        navigate('/dashboard')
      }
    } catch (error: any) {
      console.error('Authentication error:', error)
      // Handle different error formats
      if (error?.message) {
        setError(error.message)
      } else if (typeof error === 'string') {
        setError(error)
      } else if (error?.error_description) {
        setError(error.error_description)
      } else if (error?.error) {
        setError(error.error)
      } else {
        setError('An error occurred during authentication. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Link to="/" className="text-text-primary">
            WorkoutTracker
          </Link>
          <Link to="/" className="text-text-secondary">
            ← Back to Home
          </Link>
        </div>

        <div className="max-w-md mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h1>
          </div>

          <div className="card-primary p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-text-primary mb-2">
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-primary w-full"
                    placeholder="Enter your full name"
                  />
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-primary w-full"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-primary w-full pr-10"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-error text-sm border border-error p-3">
                  {String(error)}
                </div>
              )}

              {message && (
                <div className="text-success text-sm border border-success p-3">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full disabled:btn-disabled"
              >
                {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-text-secondary"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-border-line">
              <button
                type="button"
                onClick={handleGuestLogin}
                disabled={loading}
                className="btn-secondary w-full disabled:btn-disabled"
              >
                {loading ? 'Creating Guest Account...' : 'Continue as Guest'}
              </button>
              <p className="text-xs text-text-secondary text-center mt-2">
                Try the app with sample data. A temporary account will be created and deleted when you sign out.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
