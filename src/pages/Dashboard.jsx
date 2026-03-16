import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMealLogs } from '../hooks/useNutrition'
import { useWorkoutSessions } from '../hooks/useWorkouts'
import { useBodyMetrics } from '../hooks/useBodyMetrics'
import { useGoals } from '../hooks/useGoals'
import { calcMacros, mealTypeLabel, MEAL_TYPES, formatNumber } from '../lib/utils'
import DateSelector from '../components/DateSelector'
import MacroRing from '../components/MacroRing'
import { Plus, Utensils, Dumbbell, Scale } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { subDays, format } from 'date-fns'

const chartTooltipStyle = { background: '#FFFFFF', border: '1px solid #E2E5EB', borderRadius: 10, fontSize: 13, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

export default function Dashboard() {
  const [date, setDate] = useState(new Date())
  const navigate = useNavigate()
  const { logs } = useMealLogs(date)
  const { sessions } = useWorkoutSessions(date)
  const { metrics } = useBodyMetrics()
  const { goals } = useGoals()

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

  const mealsByType = useMemo(() => {
    const grouped = {}
    MEAL_TYPES.forEach(t => { grouped[t] = [] })
    logs.forEach(l => {
      if (grouped[l.meal_type]) grouped[l.meal_type].push(l)
    })
    return grouped
  }, [logs])

  const weightData = useMemo(() => {
    const cutoff = subDays(new Date(), 30)
    return metrics
      .filter(m => m.weight_kg && new Date(m.date) >= cutoff)
      .map(m => ({ date: format(new Date(m.date), 'MMM d'), weight: Number(m.weight_kg) }))
  }, [metrics])

  const latestWeight = metrics.length > 0 ? metrics[metrics.length - 1] : null
  const firstWeight = metrics.length > 1 ? metrics[0] : null
  const weightChange = (latestWeight?.weight_kg && firstWeight?.weight_kg)
    ? (Number(latestWeight.weight_kg) - Number(firstWeight.weight_kg)).toFixed(1)
    : null

  // Group sets by exercise for workout summary
  const sessionSummary = useMemo(() => {
    if (sessions.length === 0) return null
    const s = sessions[0]
    const groups = {}
    const order = []
    for (const set of (s.workout_sets || [])) {
      if (!groups[set.exercise_id]) {
        groups[set.exercise_id] = { exercise: set.exercise, sets: [], hasPb: false, bestWeight: 0 }
        order.push(set.exercise_id)
      }
      groups[set.exercise_id].sets.push(set)
      if (set.is_pb) groups[set.exercise_id].hasPb = true
      if (set.weight_kg > groups[set.exercise_id].bestWeight) groups[set.exercise_id].bestWeight = set.weight_kg
    }
    return {
      ...s,
      exerciseCount: order.length,
      totalSets: s.workout_sets?.length || 0,
      exercises: order.map(id => groups[id]),
    }
  }, [sessions])

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-[26px] text-text leading-tight">Dashboard</h1>
          <p className="text-text-secondary text-[14px] mt-0.5">Your daily overview</p>
        </div>
        <DateSelector date={date} onChange={setDate} />
      </div>

      {/* MACROS */}
      <div className="card p-8 mb-6">
        <p className="section-header mb-6">Macros</p>
        <div className="flex items-center justify-center gap-10 sm:gap-16 flex-wrap">
          <MacroRing label="Calories" value={totals.calories} goal={goals.calories} size={140} strokeWidth={10} />
          <MacroRing label="Protein" value={totals.protein} goal={goals.protein_g} color="var(--color-protein)" size={120} />
          <MacroRing label="Carbs" value={totals.carbs} goal={goals.carbs_g} color="var(--color-carbs)" size={120} />
          <MacroRing label="Fat" value={totals.fat} goal={goals.fat_g} color="var(--color-fat)" size={120} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 mb-6">
        {/* TODAY'S MEALS */}
        <div className="lg:col-span-3 card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <p className="section-header">Today&apos;s Meals</p>
            <Utensils size={18} className="text-text-secondary/30" />
          </div>
          <div className="divide-y divide-border">
            {MEAL_TYPES.map(type => {
              const items = mealsByType[type]
              if (items.length === 0) return null
              const mealCals = items.reduce((sum, l) => sum + calcMacros(l.food, l.quantity_g).calories, 0)
              return (
                <div key={type} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-text font-bold text-[14px]">{mealTypeLabel(type)}</p>
                    <span className="text-text-secondary text-[13px] tabular-nums font-medium">{formatNumber(mealCals, 0)} kcal</span>
                  </div>
                  {items.map(log => (
                    <div key={log.id} className="flex items-center justify-between py-1.5 pl-3">
                      <span className="text-text-secondary text-[14px]">{log.food.name}</span>
                      <span className="text-text-secondary tabular-nums text-[13px]">{formatNumber(log.quantity_g, 0)}g</span>
                    </div>
                  ))}
                </div>
              )
            })}
            {logs.length === 0 && (
              <div className="px-6 py-14 text-center">
                <p className="text-text-secondary text-[14px]">No meals logged yet</p>
              </div>
            )}
          </div>
        </div>

        {/* TODAY'S WORKOUT */}
        <div className="lg:col-span-2 card overflow-hidden">
          <div className="px-6 py-4 border-b border-border flex items-center justify-between">
            <p className="section-header">Today&apos;s Workout</p>
            <Dumbbell size={18} className="text-text-secondary/30" />
          </div>
          {!sessionSummary ? (
            <div className="px-6 py-14 text-center">
              <p className="text-text-secondary text-[14px]">Rest day</p>
            </div>
          ) : (
            <div className="p-6">
              <p className="text-text font-bold text-[17px]">{sessionSummary.name}</p>
              <p className="text-text-secondary text-[13px] mb-4">{sessionSummary.exerciseCount} exercises · {sessionSummary.totalSets} sets</p>
              <div className="space-y-2.5">
                {sessionSummary.exercises.map(g => (
                  <div key={g.exercise?.id || 'unknown'} className="flex items-center justify-between py-2.5 px-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2.5">
                      <span className="text-text text-[14px] font-semibold">{g.exercise?.name || 'Unknown'}</span>
                      {g.hasPb && (
                        <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-600">
                          ⭐ PB
                        </span>
                      )}
                    </div>
                    <span className="text-text-secondary text-[13px] tabular-nums font-medium">{g.sets.length} sets · best {formatNumber(g.bestWeight)}kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WEIGHT CHART */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="section-header">Weight — Last 30 Days</p>
          <Scale size={18} className="text-text-secondary/30" />
        </div>
        <div className="flex items-baseline gap-3 mb-5">
          {latestWeight ? (
            <>
              <span className="text-text font-bold text-[30px] tabular-nums leading-none">{formatNumber(latestWeight.weight_kg)} kg</span>
              {weightChange && (
                <span className={`text-[14px] font-semibold tabular-nums ${Number(weightChange) <= 0 ? 'text-accent' : 'text-danger'}`}>
                  ~{Number(weightChange) > 0 ? '+' : ''}{weightChange} kg
                </span>
              )}
            </>
          ) : (
            <span className="text-text-secondary text-[14px]">No data yet</span>
          )}
        </div>
        {weightData.length >= 2 ? (
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={42} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#10B981' }} name="Weight (kg)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-36 flex items-center justify-center">
            <p className="text-text-secondary text-[14px]">Not enough data</p>
          </div>
        )}
      </div>

      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate('/nutrition')}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus size={16} /> Log Meal
        </button>
        <button
          onClick={() => navigate('/workouts')}
          className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl text-[14px] text-text font-semibold hover:bg-gray-50 hover:border-border-hover transition-colors shadow-sm"
        >
          <Plus size={16} /> Log Workout
        </button>
        <button
          onClick={() => navigate('/body')}
          className="flex items-center gap-2 px-6 py-3 bg-surface border border-border rounded-xl text-[14px] text-text font-semibold hover:bg-gray-50 hover:border-border-hover transition-colors shadow-sm"
        >
          <Plus size={16} /> Log Weight
        </button>
      </div>
    </div>
  )
}
