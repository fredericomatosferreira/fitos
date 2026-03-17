import { useState, useEffect } from 'react'
import { useGoals } from '../hooks/useGoals'
import { useProfile } from '../hooks/useProfile'
import { Save, Check } from 'lucide-react'

export default function Settings() {
  const { goals, saveGoals } = useGoals()
  const { profile, saveProfile } = useProfile()
  const [goalsForm, setGoalsForm] = useState({ calories: '', protein_g: '', carbs_g: '', fat_g: '' })
  const [height, setHeight] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (goals) {
      setGoalsForm({
        calories: String(goals.calories || ''),
        protein_g: String(goals.protein_g || ''),
        carbs_g: String(goals.carbs_g || ''),
        fat_g: String(goals.fat_g || ''),
      })
    }
  }, [goals])

  useEffect(() => {
    if (profile?.height_cm) setHeight(String(profile.height_cm))
  }, [profile])

  const handleSave = async (e) => {
    e.preventDefault()
    await saveGoals({
      calories: Number(goalsForm.calories) || 0,
      protein_g: Number(goalsForm.protein_g) || 0,
      carbs_g: Number(goalsForm.carbs_g) || 0,
      fat_g: Number(goalsForm.fat_g) || 0,
    })
    await saveProfile({ height_cm: Number(height) || null })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputCls = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-foreground mb-6">Settings</h1>

      {saved && (
        <div className="mb-4 px-4 py-2.5 bg-primary/10 border border-primary/20 rounded-md flex items-center gap-2">
          <Check className="w-4 h-4 text-primary" />
          <span className="text-primary text-sm font-medium">Settings saved</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Nutrition Goals */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="font-bold text-foreground mb-4">Nutrition Goals</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { key: 'calories', label: 'Daily Calories (kcal)' },
              { key: 'protein_g', label: 'Protein (g)' },
              { key: 'carbs_g', label: 'Carbs (g)' },
              { key: 'fat_g', label: 'Fat (g)' },
            ].map(f => (
              <label key={f.key} className="block">
                <span className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</span>
                <input
                  type="number"
                  value={goalsForm[f.key]}
                  onChange={e => setGoalsForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={inputCls}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Profile */}
        <div className="bg-card rounded-lg border border-border p-5">
          <h2 className="font-bold text-foreground mb-4">Profile</h2>
          <label className="block max-w-xs">
            <span className="text-xs font-medium text-muted-foreground mb-1 block">Height (cm)</span>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputCls} />
          </label>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press"
        >
          <Save className="w-4 h-4" /> Save Changes
        </button>
      </form>
    </div>
  )
}
