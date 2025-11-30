import { Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { WorkoutPage } from '@/pages/WorkoutPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { HistoryPage } from '@/pages/HistoryPage'
import { AIWorkoutPage } from '@/pages/AIWorkoutPage'
import { WorkoutPlansPage } from '@/pages/WorkoutPlansPage'
import { WorkoutPlanDetailPage } from '@/pages/WorkoutPlanDetailPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><Layout><DashboardPage /></Layout></ProtectedRoute>} />
          <Route path="/workout/:id" element={<ProtectedRoute><Layout><WorkoutPage /></Layout></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} />
          <Route path="/history" element={<ProtectedRoute><Layout><HistoryPage /></Layout></ProtectedRoute>} />
          <Route path="/ai-workout" element={<ProtectedRoute><Layout><AIWorkoutPage /></Layout></ProtectedRoute>} />
          <Route path="/workout-plans" element={<ProtectedRoute><Layout><WorkoutPlansPage /></Layout></ProtectedRoute>} />
          <Route path="/workout-plan/:id" element={<ProtectedRoute><Layout><WorkoutPlanDetailPage /></Layout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
