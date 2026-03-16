import { useState, useMemo } from 'react'
import { useMealLogs, useFoods } from '../hooks/useNutrition'
import { useGoals } from '../hooks/useGoals'
import { MEAL_TYPES, mealTypeLabel, calcMacros, formatNumber } from '../lib/utils'
import DateSelector from '../components/DateSelector'
import MacroRing from '../components/MacroRing'
import FoodSearchModal from '../components/FoodSearchModal'
import { Plus, Trash2 } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

export default function Nutrition() {
  const [date, setDate] = useState(new Date())
  const { logs, addMealLog, deleteMealLog } = useMealLogs(date)
  const { foods } = useFoods()
  const { goals } = useGoals()
  const [modalOpen, setModalOpen] = useState(false)
  const [activeMealType, setActiveMealType] = useState('breakfast')

  const totals = useMemo(() => {
    return logs.reduce(
      (acc, log) => {
        const m = calcMacros(log.food, log.quantity_g)
        acc.calories += m.calories
        acc.protein += m.protein
        acc.carbs += m.carbs
        acc.fat += m.fat
        return acc
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 }
    )
  }, [logs])

  const logsByMeal = useMemo(() => {
    const grouped = {}
    MEAL_TYPES.forEach(t => { grouped[t] = [] })
    logs.forEach(l => {
      if (grouped[l.meal_type]) grouped[l.meal_type].push(l)
    })
    return grouped
  }, [logs])

  const pieData = [
    { name: 'Protein', value: totals.protein * 4, color: '#0891B2' },
    { name: 'Carbs', value: totals.carbs * 4, color: '#D97706' },
    { name: 'Fat', value: totals.fat * 9, color: '#DB2777' },
  ].filter(d => d.value > 0)

  const handleAddFood = async (food, quantity) => {
    await addMealLog({
      meal_type: activeMealType,
      food_id: food.id,
      quantity_g: quantity,
    })
  }

  const openModal = (mealType) => {
    setActiveMealType(mealType)
    setModalOpen(true)
  }

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-[26px] text-text leading-tight">Nutrition</h1>
          <p className="text-text-secondary text-[14px] mt-0.5">Track your daily intake</p>
        </div>
        <DateSelector date={date} onChange={setDate} />
      </div>

      {/* Macro rings */}
      <div className="card p-8 mb-6">
        <p className="section-header mb-6">Macros</p>
        <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap">
          <MacroRing label="Calories" value={totals.calories} goal={goals.calories} size={140} strokeWidth={10} />
          <MacroRing label="Protein" value={totals.protein} goal={goals.protein_g} color="var(--color-protein)" size={120} />
          <MacroRing label="Carbs" value={totals.carbs} goal={goals.carbs_g} color="var(--color-carbs)" size={120} />
          <MacroRing label="Fat" value={totals.fat} goal={goals.fat_g} color="var(--color-fat)" size={120} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Meals column */}
        <div className="lg:col-span-2 space-y-5">
          {MEAL_TYPES.map(type => (
            <div key={type} className="card overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h3 className="text-text font-bold text-[15px]">{mealTypeLabel(type)}</h3>
                <button
                  onClick={() => openModal(type)}
                  className="flex items-center gap-1.5 text-accent text-[13px] font-semibold hover:text-accent-hover transition-colors"
                >
                  <Plus size={14} /> Add Food
                </button>
              </div>
              {logsByMeal[type].length === 0 ? (
                <div className="px-6 py-10 text-center">
                  <p className="text-text-secondary text-[14px]">No foods logged</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {logsByMeal[type].map(log => {
                    const m = calcMacros(log.food, log.quantity_g)
                    return (
                      <div key={log.id} className="px-6 py-3.5 flex items-center gap-4 group">
                        <div className="flex-1 min-w-0">
                          <p className="text-text text-[14px] font-medium truncate">{log.food.name}</p>
                          <p className="text-text-secondary text-[12px] tabular-nums">{formatNumber(log.quantity_g, 0)}g</p>
                        </div>
                        <div className="flex items-center gap-3 text-[12px] tabular-nums shrink-0 font-medium">
                          <span className="text-text-secondary">{formatNumber(m.calories, 0)} cal</span>
                          <span className="text-protein">{formatNumber(m.protein)}p</span>
                          <span className="text-carbs">{formatNumber(m.carbs)}c</span>
                          <span className="text-fat">{formatNumber(m.fat)}f</span>
                        </div>
                        <button
                          onClick={() => deleteMealLog(log.id)}
                          className="text-text-secondary/20 hover:text-danger transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Pie chart column */}
        <div className="card p-6 h-fit">
          <p className="section-header mb-5">Macro Breakdown</p>
          {pieData.length > 0 ? (
            <>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={58}
                      outerRadius={85}
                      paddingAngle={3}
                      strokeWidth={0}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-3.5 mt-5">
                {[
                  { label: 'Protein', val: totals.protein, unit: 'g', color: 'bg-protein' },
                  { label: 'Carbs', val: totals.carbs, unit: 'g', color: 'bg-carbs' },
                  { label: 'Fat', val: totals.fat, unit: 'g', color: 'bg-fat' },
                ].map(m => (
                  <div key={m.label} className="flex items-center gap-3 text-[14px]">
                    <span className={`w-3 h-3 rounded-full ${m.color}`} />
                    <span className="text-text-secondary flex-1 font-medium">{m.label}</span>
                    <span className="text-text font-semibold tabular-nums">{formatNumber(m.val)}{m.unit}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-20 text-center">
              <p className="text-text-secondary text-[14px]">No data yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Sticky daily totals bar */}
      <div className="fixed bottom-16 md:bottom-0 left-0 md:left-[240px] right-0 bg-surface/95 backdrop-blur-sm border-t border-border px-6 py-3.5 z-30 shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1160px] mx-auto flex items-center justify-around tabular-nums">
          {[
            { label: 'Calories', value: totals.calories, goal: goals.calories, color: 'text-text' },
            { label: 'Protein', value: totals.protein, goal: goals.protein_g, color: 'text-protein' },
            { label: 'Carbs', value: totals.carbs, goal: goals.carbs_g, color: 'text-carbs' },
            { label: 'Fat', value: totals.fat, goal: goals.fat_g, color: 'text-fat' },
          ].map(m => (
            <div key={m.label} className="text-center">
              <div className="text-[14px]">
                <span className={`${m.color} font-bold`}>{formatNumber(m.value, 0)}</span>
                <span className="text-text-secondary/30 mx-1">/</span>
                <span className="text-text-secondary font-medium">{formatNumber(m.goal, 0)}</span>
              </div>
              <p className="text-text-secondary text-[11px] font-semibold uppercase tracking-wider mt-0.5">{m.label}</p>
            </div>
          ))}
        </div>
      </div>

      <FoodSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        foods={foods}
        onSelect={handleAddFood}
      />
    </div>
  )
}
