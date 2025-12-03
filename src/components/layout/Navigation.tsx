import { Link, useLocation } from 'react-router-dom'
import { LogOut, History, Calendar, Menu, X, User, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { useOffline } from '@/contexts/OfflineContext'
import { useState } from 'react'

export const Navigation = () => {
  const { signOut, user, isGuest } = useAuth()
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  // Safely get offline status (may not be available on all pages)
  let isOnline = true
  let isSyncing = false
  let pendingSyncCount = 0
  let failedSyncCount = 0
  let syncNow = async () => {}
  
  try {
    const offline = useOffline()
    isOnline = offline.isOnline
    isSyncing = offline.isSyncing
    pendingSyncCount = offline.pendingSyncCount
    failedSyncCount = offline.failedSyncCount
    syncNow = offline.syncNow
  } catch {
    // OfflineProvider not available, use defaults
  }

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isActive = (path: string) => location.pathname === path

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  const navigationLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: null },
    { path: '/workout-plans', label: 'Workout Plans', icon: Calendar },
    { path: '/history', label: 'History', icon: History },
    { path: '/profile', label: 'Profile', icon: null }
  ]

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={user || isGuest ? "/dashboard" : "/"} className="text-xl font-bold text-gray-900">
            WorkoutTracker
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationLinks.map((link) => {
              const Icon = link.icon
              const isLinkActive = link.path === '/dashboard' ? 
                (isActive('/dashboard') || isActive('/')) : 
                link.path === '/workout-plans' ? 
                  (isActive('/workout-plans') || location.pathname.startsWith('/workout-plan/')) :
                  isActive(link.path)
              
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                    isLinkActive
                      ? 'text-cyan-600 bg-cyan-50'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {Icon ? (
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{link.label}</span>
                    </div>
                  ) : (
                    link.label
                  )}
                </Link>
              )
            })}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Offline Indicator */}
            {!isOnline ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800">
                <WifiOff className="h-3 w-3 mr-1" />
                Offline
              </span>
            ) : isSyncing ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Syncing...
              </span>
            ) : pendingSyncCount > 0 ? (
              <button
                onClick={syncNow}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-orange-100 text-orange-800 hover:bg-orange-200 transition-colors"
                title={`${pendingSyncCount} items pending sync`}
              >
                <Wifi className="h-3 w-3 mr-1" />
                {pendingSyncCount} pending
              </button>
            ) : failedSyncCount > 0 ? (
              <button
                onClick={syncNow}
                className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                title={`${failedSyncCount} items failed to sync`}
              >
                <WifiOff className="h-3 w-3 mr-1" />
                {failedSyncCount} failed
              </button>
            ) : null}
            
            {isGuest ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-100 text-cyan-800">
                <User className="h-3 w-3 mr-1" />
                Guest Mode
              </span>
            ) : (
              <span className="text-sm text-gray-600 truncate max-w-32">
                {user?.email}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-2">
              {navigationLinks.map((link) => {
                const Icon = link.icon
                const isLinkActive = link.path === '/dashboard' ? 
                  (isActive('/dashboard') || isActive('/')) : 
                  link.path === '/workout-plans' ? 
                    (isActive('/workout-plans') || location.pathname.startsWith('/workout-plan/')) :
                    isActive(link.path)
                
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={closeMobileMenu}
                    className={`flex items-center px-3 py-3 text-base font-medium rounded-md transition-colors ${
                      isLinkActive
                        ? 'text-cyan-600 bg-cyan-50'
                        : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {Icon && <Icon className="h-5 w-5 mr-3" />}
                    {link.label}
                  </Link>
                )
              })}
              
              {/* Mobile User Section */}
              <div className="pt-4 mt-4 border-t border-gray-200">
                {isGuest ? (
                  <div className="px-3 py-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-cyan-100 text-cyan-800">
                      <User className="h-3 w-3 mr-1" />
                      Guest Mode
                    </span>
                  </div>
                ) : (
                  <div className="px-3 py-2">
                    <p className="text-sm text-gray-600 truncate">
                      {user?.email}
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    handleSignOut()
                    closeMobileMenu()
                  }}
                  className="w-full flex items-center px-3 py-3 text-base font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <LogOut className="h-5 w-5 mr-3" />
                  {isGuest ? 'Exit Guest Mode' : 'Sign Out'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
