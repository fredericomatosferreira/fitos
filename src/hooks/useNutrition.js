import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { format } from 'date-fns'

export function useFoods() {
  const { user } = useAuth()
  const [foods, setFoods] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchFoods = useCallback(async () => {
    if (!user || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('foods')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    setFoods(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchFoods() }, [fetchFoods])

  const addFood = async (food) => {
    if (!user || !supabase) return
    const { data, error } = await supabase
      .from('foods')
      .insert({ ...food, user_id: user.id })
      .select()
      .single()
    if (!error) setFoods(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return { data, error }
  }

  const updateFood = async (id, updates) => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('foods')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setFoods(prev => prev.map(f => f.id === id ? data : f))
    return { data, error }
  }

  const deleteFood = async (id) => {
    if (!supabase) return
    const { error } = await supabase.from('foods').delete().eq('id', id)
    if (!error) setFoods(prev => prev.filter(f => f.id !== id))
    return { error }
  }

  return { foods, loading, addFood, updateFood, deleteFood, refetch: fetchFoods }
}

export function useMealLogs(date) {
  const { user } = useAuth()
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)
  const dateStr = format(date, 'yyyy-MM-dd')

  const fetchLogs = useCallback(async () => {
    if (!user || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('meal_logs')
      .select('*, food:foods(*)')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .order('created_at')
    setLogs(data || [])
    setLoading(false)
  }, [user, dateStr])

  useEffect(() => { fetchLogs() }, [fetchLogs])

  const addMealLog = async (log) => {
    if (!user || !supabase) return
    const { data, error } = await supabase
      .from('meal_logs')
      .insert({ ...log, user_id: user.id, date: dateStr })
      .select('*, food:foods(*)')
      .single()
    if (!error) setLogs(prev => [...prev, data])
    return { data, error }
  }

  const deleteMealLog = async (id) => {
    if (!supabase) return
    const { error } = await supabase.from('meal_logs').delete().eq('id', id)
    if (!error) setLogs(prev => prev.filter(l => l.id !== id))
    return { error }
  }

  return { logs, loading, addMealLog, deleteMealLog, refetch: fetchLogs }
}
