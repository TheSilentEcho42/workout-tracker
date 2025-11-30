import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase, isDatabaseConfigured } from '@/lib/supabase'
import { resetGuestData, clearGuestData } from '@/lib/guestData'
import { createGuestAccount, seedGuestWorkoutHistory, seedGuestWorkoutPlan, deleteGuestAccount } from '@/lib/guestAccount'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isGuest: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signInAsGuest: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export { AuthContext }

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [isGuest, setIsGuest] = useState(false)

  // Helper function to check if a user is a guest
  const isGuestUser = (user: User | null): boolean => {
    if (!user) return false
    // Check if email matches guest pattern
    return user.email?.includes('@guest.temp') || user.user_metadata?.is_guest === true
  }

  useEffect(() => {
    // Get initial session first
    supabase.auth.getSession().then(({ data: { session } }) => {
      // If there's a session, check if it's a guest user
      if (session?.user) {
        const guest = isGuestUser(session.user)
        setSession(session)
        setUser(session.user)
        setIsGuest(guest)
        // Clear old guest mode flag if it exists
        if (localStorage.getItem('guest_mode') === 'true') {
          localStorage.removeItem('guest_mode')
        }
        setLoading(false)
        return
      }
      
      // No session - user is not authenticated
      setSession(null)
      setUser(null)
      setIsGuest(false)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        // User is authenticated - check if it's a guest
        const guest = isGuestUser(session.user)
        setSession(session)
        setUser(session.user)
        setIsGuest(guest)
        // Clear old guest mode flag if it exists
        if (localStorage.getItem('guest_mode') === 'true') {
          localStorage.removeItem('guest_mode')
        }
      } else {
        // No session - user is not authenticated
        setIsGuest(false)
        setUser(null)
        setSession(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    // Clear guest mode before signing in
    if (localStorage.getItem('guest_mode') === 'true') {
      localStorage.removeItem('guest_mode')
      setIsGuest(false)
    }
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    if (error) throw error
  }

  const signInAsGuest = async () => {
    try {
      // Check if database is configured
      if (!isDatabaseConfigured) {
        throw new Error('Database is not configured. Please configure Supabase to use guest accounts.')
      }

      // Create a new guest account
      const { userId, email } = await createGuestAccount()
      
      // Wait a moment for the session to be established
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get the current session (should be set by signUp if email confirmation is disabled)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Error getting session after guest account creation:', sessionError)
        // Try to sign in with the credentials we just created
        // Note: This won't work if we don't store the password, so we rely on auto-signin
        throw sessionError
      }
      
      if (!session?.user) {
        // If no session, the account might require email confirmation
        // For guest accounts, we should disable email confirmation in Supabase settings
        throw new Error('Guest account created but not signed in. Please ensure email confirmation is disabled for guest accounts in Supabase settings.')
      }
      
      // Seed the account with sample data
      await seedGuestWorkoutHistory(userId)
      seedGuestWorkoutPlan(userId)
      
      // The session should be set automatically by the auth state change listener
      // But we'll also set it here to be safe
      setSession(session)
      setUser(session.user)
      setIsGuest(true)
      
      console.log('✅ Guest account created and signed in:', email)
    } catch (error) {
      console.error('❌ Error creating guest account:', error)
      throw error
    }
  }

  const signOut = async () => {
    if (isGuest && user) {
      // Delete the guest account and all associated data
      try {
        await deleteGuestAccount(user.id)
      } catch (error) {
        console.error('Error deleting guest account:', error)
        // Continue with sign out even if deletion fails
      }
      // Clear guest data from localStorage
      resetGuestData()
      clearGuestData()
      setIsGuest(false)
      localStorage.removeItem('guest_mode')
      // Sign out from Supabase
      await supabase.auth.signOut()
    } else {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    }
  }

  const value = {
    user,
    session,
    loading,
    isGuest,
    signIn,
    signUp,
    signInAsGuest,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
