import { useState } from 'react'
import { Database, AlertCircle, CheckCircle } from 'lucide-react'
import { testCustomExercisesTable } from '@/lib/testCustomExercises'

export const DatabaseTestComponent = () => {
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const handleTest = async () => {
    setIsTesting(true)
    setTestResult(null)
    
    try {
      const result = await testCustomExercisesTable()
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="card-primary border border-border-line rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Database className="h-5 w-5 text-accent-primary" />
        <h3 className="text-lg font-semibold text-text-primary">Database Test</h3>
      </div>
      
      <div className="space-y-4">
        <p className="text-sm text-text-secondary">
          Test if the custom exercises table exists and is accessible.
        </p>
        
        <button
          onClick={handleTest}
          disabled={isTesting}
          className="px-4 py-2 bg-accent-primary text-white rounded hover:bg-accent-primary/90 disabled:opacity-50 transition-colors"
        >
          {isTesting ? 'Testing...' : 'Test Database'}
        </button>
        
        {testResult && (
          <div className={`p-3 rounded-md flex items-start space-x-2 ${
            testResult.success 
              ? 'bg-green-50 border border-green-200' 
              : 'bg-red-50 border border-red-200'
          }`}>
            {testResult.success ? (
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
            )}
            <div>
              <p className={`text-sm font-medium ${
                testResult.success ? 'text-green-800' : 'text-red-800'
              }`}>
                {testResult.message}
              </p>
              {!testResult.success && (
                <div className="mt-2 text-xs text-red-700">
                  <p className="font-medium">To fix this issue:</p>
                  <ol className="list-decimal list-inside mt-1 space-y-1">
                    <li>Open your Supabase dashboard</li>
                    <li>Go to the SQL Editor</li>
                    <li>Run the contents of <code className="bg-red-100 px-1 rounded">database-fix-rls-policies.sql</code></li>
                    <li>Refresh this page and test again</li>
                  </ol>
                  {testResult.details && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs">
                      <p className="font-medium">Debug Info:</p>
                      <pre className="whitespace-pre-wrap">{JSON.stringify(testResult.details, null, 2)}</pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
