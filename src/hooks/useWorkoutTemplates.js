import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export function useWorkoutTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    if (!user || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('workout_templates')
      .select('*, workout_template_items(*, exercise:exercises(*))')
      .eq('user_id', user.id)
      .order('name')
    setTemplates(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const addTemplate = async (name, items) => {
    if (!user || !supabase) return
    const { data: template, error } = await supabase
      .from('workout_templates')
      .insert({ name, user_id: user.id })
      .select()
      .single()
    if (error) return { error }

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('workout_template_items')
        .insert(items.map((i, idx) => ({
          template_id: template.id,
          exercise_id: i.exercise_id,
          sort_order: idx,
          default_sets: i.default_sets || 3,
          default_reps: i.default_reps || 10,
        })))
      if (itemsError) return { error: itemsError }
    }

    await fetchTemplates()
    return { data: template }
  }

  const updateTemplate = async (id, name, items) => {
    if (!supabase) return
    const { error } = await supabase
      .from('workout_templates')
      .update({ name })
      .eq('id', id)
    if (error) return { error }

    await supabase.from('workout_template_items').delete().eq('template_id', id)
    if (items.length > 0) {
      await supabase
        .from('workout_template_items')
        .insert(items.map((i, idx) => ({
          template_id: id,
          exercise_id: i.exercise_id,
          sort_order: idx,
          default_sets: i.default_sets || 3,
          default_reps: i.default_reps || 10,
        })))
    }

    await fetchTemplates()
    return { data: true }
  }

  const deleteTemplate = async (id) => {
    if (!supabase) return
    const { error } = await supabase.from('workout_templates').delete().eq('id', id)
    if (!error) setTemplates(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  return { templates, loading, addTemplate, updateTemplate, deleteTemplate, refetch: fetchTemplates }
}
