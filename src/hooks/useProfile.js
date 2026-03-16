import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export function useProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async () => {
    if (!user || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('users_profile')
      .select('*')
      .eq('user_id', user.id)
      .single()
    setProfile(data)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchProfile() }, [fetchProfile])

  const saveProfile = async (updates) => {
    if (!user || !supabase) return
    const { data, error } = await supabase
      .from('users_profile')
      .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
      .select()
      .single()
    if (!error && data) setProfile(data)
    return { data, error }
  }

  return { profile, loading, saveProfile, refetch: fetchProfile }
}
