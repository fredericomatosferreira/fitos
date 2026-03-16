import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

const DEFAULT_GOALS = { calories: 2000, protein_g: 150, carbs_g: 250, fat_g: 65 }

export function useGoals() {
  const { user } = useAuth()
  const [goals, setGoals] = useState(DEFAULT_GOALS)
  const [loading, setLoading] = useState(true)

  const fetchGoals = useCallback(async () => {
    if (!user || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('nutrition_goals')
      .select('*')
      .eq('user_id', user.id)
      .single()
    if (data) setGoals(data)
    setLoading(false)
  }, [user])

  useEffect(() => { fetchGoals() }, [fetchGoals])

  const saveGoals = async (updates) => {
    if (!user || !supabase) return
    const { data, error } = await supabase
      .from('nutrition_goals')
      .upsert({ user_id: user.id, ...updates }, { onConflict: 'user_id' })
      .select()
      .single()
    if (!error && data) setGoals(data)
    return { data, error }
  }

  return { goals, loading, saveGoals, refetch: fetchGoals }
}
