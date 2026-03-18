import { useState, useMemo } from 'react'
import { useMealLogs, useFoods } from '../hooks/useNutrition'
import { useMealTemplates } from '../hooks/useMealTemplates'
import { useGoals } from '../hooks/useGoals'
import { MEAL_TYPES, mealTypeLabel, calcMacros, formatNumber } from '../lib/utils'
import DateSelector from '../components/DateSelector'
import FoodSearchModal from '../components/FoodSearchModal'
import Modal from '../components/Modal'
import { Plus, Trash2, BookOpen } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

const PIE_COLORS = {
  Protein: 'hsl(239,84%,67%)',
  Carbs: 'hsl(38,92%,50%)',
  Fat: 'hsl(350,89%,60%)',
}

const BAR_COLORS = {
  Calories: 'bg-chart-emerald',
  Protein: 'bg-chart-indigo',
  Carbs: 'bg-chart-amber',
  Fat: 'bg-destructive',
}

export default function Nutrition() {
  const [date, setDate] = useState(new Date())
  const { logs, addMealLog, deleteMealLog } = useMealLogs(date)
  const { foods } = useFoods()
  const { templates } = useMealTemplates()
  const { goals } = useGoals()
  const [modalOpen, setModalOpen] = useState(false)
  const [mealModalOpen, setMealModalOpen] = useState(false)
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
    { name: 'Protein', value: totals.protein * 4, color: PIE_COLORS.Protein },
    { name: 'Carbs', value: totals.carbs * 4, color: PIE_COLORS.Carbs },
    { name: 'Fat', value: totals.fat * 9, color: PIE_COLORS.Fat },
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

  const openMealModal = (mealType) => {
    setActiveMealType(mealType)
    setMealModalOpen(true)
  }

  const handleLogMealTemplate = async (template) => {
    const items = template.meal_template_items || []
    for (const item of items) {
      await addMealLog({
        meal_type: activeMealType,
        food_id: item.food_id,
        quantity_g: item.quantity_g,
      })
    }
    setMealModalOpen(false)
  }

  const progressBars = [
    { label: 'Calories', current: totals.calories, goal: goals.calories, unit: 'kcal', color: BAR_COLORS.Calories },
    { label: 'Protein', current: totals.protein, goal: goals.protein_g, unit: 'g', color: BAR_COLORS.Protein },
    { label: 'Carbs', current: totals.carbs, goal: goals.carbs_g, unit: 'g', color: BAR_COLORS.Carbs },
    { label: 'Fat', current: totals.fat, goal: goals.fat_g, unit: 'g', color: BAR_COLORS.Fat },
  ]

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">Nutrition</h1>
        <DateSelector date={date} onChange={setDate} />
      </div>

      {/* Meal sections */}
      {MEAL_TYPES.map(type => {
        const items = logsByMeal[type]
        const mealCals = items.reduce((sum, l) => sum + calcMacros(l.food, l.quantity_g).calories, 0)
        return (
          <div key={type} className="bg-card rounded-lg border border-border p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-foreground">{mealTypeLabel(type)}</h3>
              <span className="text-sm text-muted-foreground tabular-nums">{items.length > 0 ? `${formatNumber(mealCals, 0)} kcal` : ''}</span>
            </div>
            {items.length > 0 && (
              <div className="divide-y divide-border">
                {items.map(log => {
                  const m = calcMacros(log.food, log.quantity_g)
                  return (
                    <div key={log.id} className="flex items-center py-2 group">
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground">{log.food.name}</span>
                        <span className="text-xs text-muted-foreground ml-2">{formatNumber(log.quantity_g, 0)}g</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm tabular-nums shrink-0">
                        <span className="text-muted-foreground">{formatNumber(m.calories, 0)} kcal</span>
                        <span className="text-secondary font-medium">P {formatNumber(m.protein, 0)}g</span>
                        <span className="text-accent font-medium">C {formatNumber(m.carbs, 0)}g</span>
                        <span className="text-chart-rose font-medium">F {formatNumber(m.fat, 0)}g</span>
                      </div>
                      <button
                        onClick={() => deleteMealLog(log.id)}
                        className="ml-3 text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => openModal(type)}
                className="flex items-center gap-1 text-primary text-xs font-medium hover:opacity-70 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add food
              </button>
              {templates.length > 0 && (
                <button
                  onClick={() => openMealModal(type)}
                  className="flex items-center gap-1 text-secondary text-xs font-medium hover:opacity-70 transition-colors"
                >
                  <BookOpen className="w-4 h-4" /> Log saved meal
                </button>
              )}
            </div>
          </div>
        )
      })}

      {/* Bottom: Pie chart + Progress bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Macro Breakdown */}
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Macro Breakdown</p>
          {pieData.length > 0 ? (
            <>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
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
              <div className="flex items-center justify-center gap-5 mt-2">
                {[
                  { name: 'Protein', val: totals.protein, color: 'bg-chart-indigo' },
                  { name: 'Carbs', val: totals.carbs, color: 'bg-chart-amber' },
                  { name: 'Fat', val: totals.fat, color: 'bg-chart-rose' },
                ].map(m => (
                  <div key={m.name} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full ${m.color}`} />
                    {m.name} {formatNumber(m.val, 0)}g
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="py-16 text-center text-sm text-muted-foreground">No data yet</div>
          )}
        </div>

        {/* Daily Totals vs Goals */}
        <div className="bg-card rounded-lg border border-border p-5">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Daily Totals vs Goals</p>
          <div className="space-y-4">
            {progressBars.map(bar => {
              const pct = Math.min((bar.current / (bar.goal || 1)) * 100, 100)
              return (
                <div key={bar.label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-foreground">{bar.label}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(bar.current, 0)} / {formatNumber(bar.goal, 0)} {bar.unit}</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full ${bar.color} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <FoodSearchModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        foods={foods}
        onSelect={handleAddFood}
      />

      <Modal open={mealModalOpen} onClose={() => setMealModalOpen(false)} title="Log Saved Meal">
        <p className="text-sm text-muted-foreground mb-4">
          All foods in the selected meal will be logged to <strong className="text-foreground">{mealTypeLabel(activeMealType)}</strong>.
        </p>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {templates.map(template => {
            const items = template.meal_template_items || []
            const totals = items.reduce((acc, i) => {
              if (!i.food) return acc
              const m = calcMacros(i.food, i.quantity_g)
              acc.calories += m.calories; acc.protein += m.protein; acc.carbs += m.carbs; acc.fat += m.fat
              return acc
            }, { calories: 0, protein: 0, carbs: 0, fat: 0 })
            return (
              <button
                key={template.id}
                onClick={() => handleLogMealTemplate(template)}
                className="w-full text-left bg-muted/30 hover:bg-muted rounded-lg border border-border p-3 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground">{template.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(totals.calories, 0)} kcal</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {items.map(i => i.food?.name).filter(Boolean).join(', ')}
                </div>
              </button>
            )
          })}
        </div>
      </Modal>
    </>
  )
}
