import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export function useBodyMetrics() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMetrics = useCallback(async () => {
    if (!user || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('body_metrics')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: true })
    setMetrics(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchMetrics() }, [fetchMetrics])

  const addMetric = async (metric) => {
    if (!user || !supabase) return
    const { data, error } = await supabase
      .from('body_metrics')
      .insert({ ...metric, user_id: user.id })
      .select()
      .single()
    if (!error) {
      setMetrics(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
    }
    return { data, error }
  }

  const deleteMetric = async (id) => {
    if (!supabase) return
    const { error } = await supabase.from('body_metrics').delete().eq('id', id)
    if (!error) setMetrics(prev => prev.filter(m => m.id !== id))
    return { error }
  }

  return { metrics, loading, addMetric, deleteMetric, refetch: fetchMetrics }
}
