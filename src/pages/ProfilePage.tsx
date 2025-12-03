import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { 
  User, 
  Mail, 
  Calendar, 
  Download, 
  FileText, 
  Database,
  Sparkles,
  Settings,
  Shield,
  Target,
  BarChart3,
  CheckCircle,
  ArrowRight,
  Zap,
  Star,
  TrendingUp,
  Info
} from 'lucide-react'
import { getCompletedWorkouts } from '@/lib/history'
import { exportToJSON, exportToCSV, prepareExportData } from '@/lib/exportUtils'

export const ProfilePage = () => {
  const { user, isGuest } = useAuth()
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  const handleExportData = async (format: 'json' | 'csv') => {
    setIsExporting(true)
    setExportError('')

    try {
      const workouts = await getCompletedWorkouts()
      
      if (workouts.length === 0) {
        setExportError('No workout data found to export')
        return
      }

      const exportData = prepareExportData(workouts)
      
      if (format === 'json') {
        exportToJSON(exportData)
      } else {
        exportToCSV(exportData)
      }
    } catch (error: any) {
      setExportError(error.message || 'Failed to export data')
    } finally {
      setIsExporting(false)
    }
  }

  const features = [
    {
      icon: User,
      title: "Personal Profile",
      description: "Manage your account information and fitness preferences"
    },
    {
      icon: Settings,
      title: "AI Preferences",
      description: "Customize your AI workout recommendations and goals"
    },
    {
      icon: Shield,
      title: "Data Security",
      description: "Your workout data is encrypted and securely stored"
    },
    {
      icon: Download,
      title: "Data Export",
      description: "Download your workout history for backup or analysis"
    }
  ]

  const benefits = [
    {
      icon: Target,
      title: "Personalized Goals",
      description: "Set and track your fitness objectives with AI-powered insights"
    },
    {
      icon: BarChart3,
      title: "Progress Analytics",
      description: "Monitor your fitness journey with detailed performance metrics"
    },
    {
      icon: Zap,
      title: "AI Optimization",
      description: "Get workout recommendations tailored to your preferences and progress"
    },
    {
      icon: Star,
      title: "Achievement Tracking",
      description: "Celebrate milestones and stay motivated with achievement badges"
    }
  ]

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Coming Soon Banner */}
      <div className="bg-accent-primary/10 border-b border-accent-primary/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center space-x-3 text-accent-primary">
            <Info className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm sm:text-base text-center">
              <span className="font-semibold">Profile Management Coming Soon:</span> Advanced profile customization and AI preference settings are currently in development. Data export is available now!
            </p>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 via-transparent to-accent-secondary/10"></div>
        <div className="container mx-auto px-4 py-16 sm:py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-accent-primary/10 border border-accent-primary/20 mb-6">
              <User className="w-4 h-4 text-accent-primary mr-2" />
              <span className="text-sm font-medium text-accent-primary">Your Profile</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-text-primary mb-6 leading-tight">
              Manage Your
              <span className="text-accent-primary block">Fitness Profile</span>
            </h1>
            
            <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Customize your AI workout preferences, manage your account settings, and export your 
              fitness data. Take control of your fitness journey.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Section 1 - Account Information */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Account Information
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Your personal details and account settings are securely managed and protected.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-primary/20 rounded-lg">
                      <Mail className="w-6 h-6 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Email Address</h3>
                      <p className="text-text-secondary">
                        {isGuest ? 'Guest Mode - No email required' : `Your account email: ${user?.email || 'N/A'}`}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-secondary/20 rounded-lg">
                      <Calendar className="w-6 h-6 text-accent-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Member Since</h3>
                      <p className="text-text-secondary">
                        {isGuest ? 'Guest Mode' : (user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-primary/20 rounded-lg">
                      <Shield className="w-6 h-6 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Account Security</h3>
                      <p className="text-text-secondary">
                        Your data is encrypted and securely stored with industry-standard protection.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-primary p-8">
                <div className="text-center mb-6">
                  <div className="p-4 bg-accent-primary/20 rounded-full w-fit mx-auto mb-4">
                    <User className="w-16 h-16 text-accent-primary" />
                  </div>
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Profile Overview</h3>
                  <p className="text-text-secondary">Your fitness journey summary</p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                    <span className="text-text-primary">Account Status</span>
                    <span className="text-accent-primary">✓ Active</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                    <span className="text-text-primary">AI Preferences</span>
                    <span className="text-accent-primary">✓ Configured</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                    <span className="text-text-primary">Data Export</span>
                    <span className="text-accent-primary">✓ Available</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-bg-tertiary rounded-lg">
                    <span className="text-text-primary">Security</span>
                    <span className="text-accent-primary">✓ Protected</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features List Section */}
      <section className="py-16 sm:py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Profile Management Features
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Everything you need to customize your fitness experience and manage your data.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="card-primary p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="p-3 bg-accent-primary/20 rounded-lg w-fit mx-auto mb-4">
                    <feature.icon className="w-8 h-8 text-accent-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 2 - AI Preferences */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                AI Workout Preferences
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Customize how our AI creates workout plans and recommendations for you.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="card-primary p-8">
                <div className="text-center mb-6">
                  <Sparkles className="w-16 h-16 text-accent-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-text-primary mb-2">AI Configuration</h3>
                  <p className="text-text-secondary">Personalize your AI experience</p>
                </div>
                
                <div className="space-y-4">
                  <div className="p-4 bg-bg-tertiary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-text-primary">Workout Intensity</span>
                      <span className="text-accent-primary">Moderate</span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      AI will adjust workout difficulty based on your preferences
                    </div>
                  </div>
                  
                  <div className="p-4 bg-bg-tertiary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-text-primary">Exercise Focus</span>
                      <span className="text-accent-primary">Balanced</span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      Mix of strength, cardio, and flexibility training
                    </div>
                  </div>
                  
                  <div className="p-4 bg-bg-tertiary rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-text-primary">Schedule Preference</span>
                      <span className="text-accent-primary">Flexible</span>
                    </div>
                    <div className="text-sm text-text-secondary">
                      Workouts adapt to your available time
                    </div>
                  </div>
                </div>
                
                <button 
                  className="btn-primary w-full mt-6 flex items-center justify-center opacity-60 cursor-not-allowed"
                  disabled
                  title="Coming soon - Profile customization features are in development"
                >
                  Configure AI Settings
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
              
              <div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-primary/20 rounded-lg">
                      <Target className="w-6 h-6 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Goal Customization</h3>
                      <p className="text-text-secondary">
                        Set specific fitness goals and let AI create targeted workout plans.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-secondary/20 rounded-lg">
                      <BarChart3 className="w-6 h-6 text-accent-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Progress Tracking</h3>
                      <p className="text-text-secondary">
                        AI monitors your progress and adjusts recommendations accordingly.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-primary/20 rounded-lg">
                      <Zap className="w-6 h-6 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Smart Adaptations</h3>
                      <p className="text-text-secondary">
                        Workout plans automatically evolve based on your performance and feedback.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section 3 - Data Export */}
      <section className="py-16 sm:py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Export Your Workout Data
              </h2>
              <p className="text-xl text-text-secondary max-w-3xl mx-auto">
                Download your complete workout history for backup, analysis, or sharing with other fitness apps.
              </p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-primary/20 rounded-lg">
                      <FileText className="w-6 h-6 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">JSON Format</h3>
                      <p className="text-text-secondary">
                        Complete workout data with all metadata, perfect for developers and advanced users.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-secondary/20 rounded-lg">
                      <Database className="w-6 h-6 text-accent-secondary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">CSV Format</h3>
                      <p className="text-text-secondary">
                        Spreadsheet-compatible format for easy analysis in Excel or Google Sheets.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-accent-primary/20 rounded-lg">
                      <Shield className="w-6 h-6 text-accent-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-text-primary mb-2">Data Privacy</h3>
                      <p className="text-text-secondary">
                        Your data is exported securely and remains under your control.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="card-primary p-8">
                <div className="text-center mb-6">
                  <Download className="w-16 h-16 text-accent-primary mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-text-primary mb-2">Export Options</h3>
                  <p className="text-text-secondary">Choose your preferred format</p>
                </div>
                
                {exportError && (
                  <div className="text-error text-sm bg-error/10 border border-error/30 p-3 rounded-md mb-4">
                    {exportError}
                  </div>
                )}

                <div className="space-y-4">
                  <button
                    onClick={() => handleExportData('json')}
                    disabled={isExporting}
                    className="btn-secondary w-full flex items-center justify-center space-x-2 disabled:btn-disabled"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Export as JSON</span>
                  </button>
                  
                  <button
                    onClick={() => handleExportData('csv')}
                    disabled={isExporting}
                    className="btn-secondary w-full flex items-center justify-center space-x-2 disabled:btn-disabled"
                  >
                    <Database className="h-4 w-4" />
                    <span>Export as CSV</span>
                  </button>
                </div>
                
                <div className="mt-6 text-xs text-text-secondary">
                  <p>• JSON format includes all workout details and metadata</p>
                  <p>• CSV format is compatible with Excel and Google Sheets</p>
                  <p>• Both formats include exercise sets, weights, reps, and notes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Why Manage Your Profile?
              </h2>
              <p className="text-xl text-text-secondary">
                Take control of your fitness journey with personalized settings and data management.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="card-primary p-6 text-center hover:shadow-lg transition-shadow">
                  <div className="p-3 bg-accent-primary/20 rounded-lg w-fit mx-auto mb-4">
                    <benefit.icon className="w-8 h-8 text-accent-primary" />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-3">{benefit.title}</h3>
                  <p className="text-text-secondary">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 bg-bg-secondary">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Your Fitness Journey
              </h2>
              <p className="text-xl text-text-secondary">
                Track your progress and achievements with detailed analytics.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="card-primary p-6 text-center">
                <div className="p-3 bg-accent-primary/20 rounded-lg w-fit mx-auto mb-3">
                  <Calendar className="w-6 h-6 text-accent-primary" />
                </div>
                <p className="text-sm text-text-secondary mb-1">Member Since</p>
                <p className="text-lg font-semibold text-text-primary">
                  {isGuest ? 'Guest Mode' : (user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A')}
                </p>
              </div>
              
              <div className="card-primary p-6 text-center">
                <div className="p-3 bg-accent-secondary/20 rounded-lg w-fit mx-auto mb-3">
                  <TrendingUp className="w-6 h-6 text-accent-secondary" />
                </div>
                <p className="text-sm text-text-secondary mb-1">Account Status</p>
                <p className="text-lg font-semibold text-text-primary">Active</p>
              </div>
              
              <div className="card-primary p-6 text-center">
                <div className="p-3 bg-accent-primary/20 rounded-lg w-fit mx-auto mb-3">
                  <Shield className="w-6 h-6 text-accent-primary" />
                </div>
                <p className="text-sm text-text-secondary mb-1">Data Security</p>
                <p className="text-lg font-semibold text-text-primary">Protected</p>
              </div>
              
              <div className="card-primary p-6 text-center">
                <div className="p-3 bg-accent-secondary/20 rounded-lg w-fit mx-auto mb-3">
                  <Star className="w-6 h-6 text-accent-secondary" />
                </div>
                <p className="text-sm text-text-secondary mb-1">AI Optimization</p>
                <p className="text-lg font-semibold text-text-primary">Enabled</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="card-primary p-8 sm:p-12">
              <h2 className="text-3xl sm:text-4xl font-bold text-text-primary mb-4">
                Ready to Optimize Your Profile?
              </h2>
              <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
                Customize your AI preferences, manage your data, and take control of your fitness journey.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                <button 
                  className="btn-primary text-lg px-8 py-4 flex items-center justify-center group opacity-60 cursor-not-allowed"
                  disabled
                  title="Coming soon - Profile customization features are in development"
                >
                  <Settings className="w-5 h-5 mr-2" />
                  Configure AI Settings
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
                
                <button 
                  onClick={() => handleExportData('json')}
                  disabled={isExporting}
                  className="btn-secondary text-lg px-8 py-4 flex items-center justify-center disabled:btn-disabled"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Export Data
                </button>
              </div>
              
              <div className="flex items-center justify-center space-x-6 text-sm text-text-secondary">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent-primary mr-2" />
                  <span>Secure data storage</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent-primary mr-2" />
                  <span>AI personalization</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-accent-primary mr-2" />
                  <span>Data export</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}