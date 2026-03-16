import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'
import { format } from 'date-fns'

export function useExercises() {
  const { user } = useAuth()
  const [exercises, setExercises] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchExercises = useCallback(async () => {
    if (!user || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('exercises')
      .select('*')
      .eq('user_id', user.id)
      .order('name')
    setExercises(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchExercises() }, [fetchExercises])

  const addExercise = async (exercise) => {
    if (!user || !supabase) return
    const { data, error } = await supabase
      .from('exercises')
      .insert({ ...exercise, user_id: user.id })
      .select()
      .single()
    if (!error) setExercises(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return { data, error }
  }

  const updateExercise = async (id, updates) => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('exercises')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (!error) setExercises(prev => prev.map(e => e.id === id ? data : e))
    return { data, error }
  }

  const deleteExercise = async (id) => {
    if (!supabase) return
    const { error } = await supabase.from('exercises').delete().eq('id', id)
    if (!error) setExercises(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  return { exercises, loading, addExercise, updateExercise, deleteExercise, refetch: fetchExercises }
}

export function useWorkoutSessions(date) {
  const { user } = useAuth()
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const dateStr = format(date, 'yyyy-MM-dd')

  const fetchSessions = useCallback(async () => {
    if (!user || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('workout_sessions')
      .select('*, workout_sets(*, exercise:exercises(*))')
      .eq('user_id', user.id)
      .eq('date', dateStr)
      .order('created_at')
    setSessions(data || [])
    setLoading(false)
  }, [user, dateStr])

  useEffect(() => { fetchSessions() }, [fetchSessions])

  const addSession = async (session) => {
    if (!user || !supabase) return
    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({ ...session, user_id: user.id, date: dateStr })
      .select('*, workout_sets(*, exercise:exercises(*))')
      .single()
    if (!error) setSessions(prev => [...prev, data])
    return { data, error }
  }

  const deleteSession = async (id) => {
    if (!supabase) return
    const { error } = await supabase.from('workout_sessions').delete().eq('id', id)
    if (!error) setSessions(prev => prev.filter(s => s.id !== id))
    return { error }
  }

  const addSet = async (sessionId, set) => {
    if (!supabase) return
    const { data, error } = await supabase
      .from('workout_sets')
      .insert({ ...set, session_id: sessionId })
      .select('*, exercise:exercises(*)')
      .single()
    if (!error) {
      setSessions(prev => prev.map(s => {
        if (s.id !== sessionId) return s
        return { ...s, workout_sets: [...(s.workout_sets || []), data] }
      }))
    }
    return { data, error }
  }

  const deleteSet = async (sessionId, setId) => {
    if (!supabase) return
    const { error } = await supabase.from('workout_sets').delete().eq('id', setId)
    if (!error) {
      setSessions(prev => prev.map(s => {
        if (s.id !== sessionId) return s
        return { ...s, workout_sets: s.workout_sets.filter(st => st.id !== setId) }
      }))
    }
    return { error }
  }

  return { sessions, loading, addSession, deleteSession, addSet, deleteSet, refetch: fetchSessions }
}

export function useExerciseHistory(exerciseId) {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    if (!user || !exerciseId || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('workout_sets')
      .select('*, session:workout_sessions(date)')
      .eq('exercise_id', exerciseId)
      .order('created_at')
    setHistory(data || [])
    setLoading(false)
  }, [user, exerciseId])

  useEffect(() => { fetchHistory() }, [fetchHistory])

  return { history, loading }
}

export function usePersonalBest(exerciseId) {
  const { user } = useAuth()
  const [pb, setPb] = useState(0)

  useEffect(() => {
    if (!user || !exerciseId || !supabase) return
    supabase
      .from('workout_sets')
      .select('weight_kg, session:workout_sessions!inner(user_id)')
      .eq('exercise_id', exerciseId)
      .eq('session.user_id', user.id)
      .order('weight_kg', { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (data?.[0]) setPb(data[0].weight_kg)
      })
  }, [user, exerciseId])

  return pb
}
