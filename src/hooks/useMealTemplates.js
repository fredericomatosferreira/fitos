import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../lib/AuthContext'

export function useMealTemplates() {
  const { user } = useAuth()
  const [templates, setTemplates] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTemplates = useCallback(async () => {
    if (!user || !supabase) { setLoading(false); return }
    const { data } = await supabase
      .from('meal_templates')
      .select('*, meal_template_items(*, food:foods(*))')
      .eq('user_id', user.id)
      .order('name')
    setTemplates(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => { fetchTemplates() }, [fetchTemplates])

  const addTemplate = async (name, items) => {
    if (!user || !supabase) return
    const { data: template, error } = await supabase
      .from('meal_templates')
      .insert({ name, user_id: user.id })
      .select()
      .single()
    if (error) return { error }

    if (items.length > 0) {
      const { error: itemsError } = await supabase
        .from('meal_template_items')
        .insert(items.map(i => ({ template_id: template.id, food_id: i.food_id, quantity_g: i.quantity_g })))
      if (itemsError) return { error: itemsError }
    }

    await fetchTemplates()
    return { data: template }
  }

  const updateTemplate = async (id, name, items) => {
    if (!supabase) return
    const { error } = await supabase
      .from('meal_templates')
      .update({ name })
      .eq('id', id)
    if (error) return { error }

    await supabase.from('meal_template_items').delete().eq('template_id', id)
    if (items.length > 0) {
      await supabase
        .from('meal_template_items')
        .insert(items.map(i => ({ template_id: id, food_id: i.food_id, quantity_g: i.quantity_g })))
    }

    await fetchTemplates()
    return { data: true }
  }

  const deleteTemplate = async (id) => {
    if (!supabase) return
    const { error } = await supabase.from('meal_templates').delete().eq('id', id)
    if (!error) setTemplates(prev => prev.filter(t => t.id !== id))
    return { error }
  }

  return { templates, loading, addTemplate, updateTemplate, deleteTemplate, refetch: fetchTemplates }
}
