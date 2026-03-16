import { useState, useEffect } from 'react'
import { useGoals } from '../hooks/useGoals'
import { useProfile } from '../hooks/useProfile'
import { useAuth } from '../lib/AuthContext'
import { Check, Save } from 'lucide-react'

export default function Settings() {
  const { goals, saveGoals } = useGoals()
  const { profile, saveProfile } = useProfile()
  const { user } = useAuth()
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

  const inputClass = "w-full bg-surface border border-border rounded-xl px-4 py-3 text-[14px] text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-bold text-[26px] text-text leading-tight">Settings</h1>
        <p className="text-text-secondary text-[14px] mt-0.5">Goals and profile</p>
      </div>

      {saved && (
        <div className="mb-6 px-5 py-3.5 bg-accent/10 border border-accent/20 rounded-xl flex items-center gap-2.5 shadow-sm">
          <Check size={18} className="text-accent" />
          <span className="text-accent text-[14px] font-semibold">Saved successfully</span>
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Nutrition Goals */}
        <div className="card p-6 mb-5">
          <h2 className="text-text font-bold text-[17px] mb-5">Nutrition Goals</h2>
          <div className="grid grid-cols-2 gap-5">
            {[
              { key: 'calories', label: 'Daily Calories (kcal)' },
              { key: 'protein_g', label: 'Protein (g)' },
              { key: 'carbs_g', label: 'Carbs (g)' },
              { key: 'fat_g', label: 'Fat (g)' },
            ].map(f => (
              <label key={f.key} className="block">
                <span className="text-text-secondary text-[12px] mb-2 block font-semibold">{f.label}</span>
                <input
                  type="number"
                  value={goalsForm[f.key]}
                  onChange={e => setGoalsForm(p => ({ ...p, [f.key]: e.target.value }))}
                  className={inputClass}
                />
              </label>
            ))}
          </div>
        </div>

        {/* Profile */}
        <div className="card p-6 mb-6">
          <h2 className="text-text font-bold text-[17px] mb-5">Profile</h2>
          <label className="block max-w-[280px]">
            <span className="text-text-secondary text-[12px] mb-2 block font-semibold">Height (cm)</span>
            <input type="number" value={height} onChange={e => setHeight(e.target.value)} className={inputClass} />
          </label>
        </div>

        <button
          type="submit"
          className="flex items-center gap-2 px-7 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Save size={16} /> Save Changes
        </button>
      </form>

      {/* Account */}
      <div className="card p-6 mt-8">
        <h2 className="text-text font-bold text-[17px] mb-4">Account</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold text-[15px]">
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
          <span className="text-text text-[14px] font-medium">{user?.email}</span>
        </div>
      </div>
    </div>
  )
}
