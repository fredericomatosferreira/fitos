import { useState } from 'react'
import { useAuth } from '../lib/AuthContext'

function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  )
}

export default function AuthForm() {
  const { signInWithGoogle, enterDemo, isConfigured } = useAuth()
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setError('')
    setLoading(true)
    const { error: authError } = await signInWithGoogle()
    if (authError) setError(authError.message)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-accent flex items-center justify-center text-white font-bold text-[20px] shadow-md">
            F
          </div>
        </div>
        <h1 className="font-bold text-[28px] text-text text-center mb-1">FitOS</h1>
        <p className="text-text-secondary text-[14px] text-center mb-8">
          Track nutrition, workouts & body metrics
        </p>

        <div className="card p-6">
          {!isConfigured && (
            <div className="mb-5 p-4 bg-amber-50 border border-amber-200 rounded-xl text-center">
              <p className="text-text-secondary text-[13px] mb-3">
                Supabase is not configured. Add your credentials to <code className="text-accent font-semibold">.env.local</code> or try the demo.
              </p>
              <button
                onClick={enterDemo}
                className="w-full py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm"
              >
                Enter Demo Mode
              </button>
            </div>
          )}

          {isConfigured && (
            <>
              {error && <p className="text-danger text-[13px] text-center mb-4 font-medium">{error}</p>}

              <button
                onClick={handleGoogle}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 py-3.5 bg-surface border border-border rounded-xl text-[15px] text-text font-semibold hover:bg-gray-50 hover:border-border-hover transition-all disabled:opacity-50 shadow-sm"
              >
                <GoogleIcon />
                {loading ? 'Redirecting...' : 'Continue with Google'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
