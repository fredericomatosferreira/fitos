import { createContext, useContext, useEffect, useState } from 'react'
import { supabase, isConfigured } from './supabase'

const AuthContext = createContext({})

const DEMO_USER = { id: 'demo-user', email: 'demo@fitos.app' }

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    if (!isConfigured) {
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    if (!isConfigured) return { error: { message: 'Supabase not configured' } }
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    })
    return { error }
  }

  const signOut = async () => {
    if (demoMode) {
      setUser(null)
      setDemoMode(false)
      return
    }
    if (isConfigured) await supabase.auth.signOut()
  }

  const enterDemo = () => {
    setUser(DEMO_USER)
    setDemoMode(true)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signInWithGoogle, signOut, demoMode, enterDemo, isConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
