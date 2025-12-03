import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
import { processSyncQueue, getSyncQueueStatus } from '@/lib/offline/sync'

interface OfflineContextType {
  isOnline: boolean
  isSyncing: boolean
  pendingSyncCount: number
  failedSyncCount: number
  syncNow: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

interface OfflineProviderProps {
  children: ReactNode
}

export const OfflineProvider = ({ children }: OfflineProviderProps) => {
  const isOnline = useOnlineStatus()
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [failedSyncCount, setFailedSyncCount] = useState(0)

  // Update sync status
  const updateSyncStatus = async () => {
    const status = await getSyncQueueStatus()
    setPendingSyncCount(status.pending)
    setFailedSyncCount(status.failed)
  }

  // Sync when coming online
  useEffect(() => {
    if (isOnline) {
      syncNow()
    }
  }, [isOnline])

  // Listen for online event to trigger sync
  useEffect(() => {
    const handleOnline = async () => {
      await syncNow()
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  // Periodically update sync status
  useEffect(() => {
    updateSyncStatus()
    const interval = setInterval(updateSyncStatus, 5000) // Check every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const syncNow = async () => {
    if (!isOnline || isSyncing) return

    setIsSyncing(true)
    try {
      await processSyncQueue()
      await updateSyncStatus()
    } catch (error) {
      console.error('Sync error:', error)
    } finally {
      setIsSyncing(false)
    }
  }

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingSyncCount,
        failedSyncCount,
        syncNow,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export const useOffline = () => {
  const context = useContext(OfflineContext)
  if (context === undefined) {
    throw new Error('useOffline must be used within an OfflineProvider')
  }
  return context
}


