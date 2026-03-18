import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMealLogs } from '../hooks/useNutrition'
import { useWorkoutSessions } from '../hooks/useWorkouts'
import { useBodyMetrics } from '../hooks/useBodyMetrics'
import { useGoals } from '../hooks/useGoals'
import { calcMacros, mealTypeLabel, MEAL_TYPES, formatNumber } from '../lib/utils'
import DateSelector from '../components/DateSelector'
import MacroRing from '../components/MacroRing'
import PBBadge from '../components/PBBadge'
import { Plus, UtensilsCrossed, Dumbbell, Scale, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { subDays, format } from 'date-fns'

const MACRO_COLORS = {
  calories: 'hsl(160,84%,39%)',
  protein: 'hsl(239,84%,67%)',
  carbs: 'hsl(38,92%,50%)',
  fat: 'hsl(350,89%,60%)',
}

const tooltipStyle = {
  background: '#fff',
  border: '1px solid hsl(214 20% 90%)',
  borderRadius: 8,
  fontSize: 13,
  padding: '8px 12px',
}

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
    <>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Your daily overview</p>
        </div>
        <DateSelector date={date} onChange={setDate} />
      </div>

      {/* MACROS */}
      <div className="bg-card rounded-lg border border-border p-6">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-6">Macros</p>
        <div className="flex items-center justify-around flex-wrap gap-6">
          <MacroRing label="Calories" value={totals.calories} goal={goals.calories} color={MACRO_COLORS.calories} size={110} unit="kcal" />
          <MacroRing label="Protein" value={totals.protein} goal={goals.protein_g} color={MACRO_COLORS.protein} size={100} unit="g" />
          <MacroRing label="Carbs" value={totals.carbs} goal={goals.carbs_g} color={MACRO_COLORS.carbs} size={100} unit="g" />
          <MacroRing label="Fat" value={totals.fat} goal={goals.fat_g} color={MACRO_COLORS.fat} size={100} unit="g" />
        </div>
      </div>

      {/* Two-column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* TODAY'S MEALS */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today&apos;s Meals</p>
            <UtensilsCrossed className="w-4 h-4 text-muted-foreground opacity-30" />
          </div>
          <div className="divide-y divide-border">
            {MEAL_TYPES.map(type => {
              const items = mealsByType[type]
              if (items.length === 0) return null
              const mealCals = items.reduce((sum, l) => sum + calcMacros(l.food, l.quantity_g).calories, 0)
              return (
                <div key={type} className="px-6 py-3.5">
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-semibold text-foreground">{mealTypeLabel(type)}</p>
                    <span className="text-sm text-muted-foreground tabular-nums">{formatNumber(mealCals, 0)} kcal</span>
                  </div>
                  {items.map(log => (
                    <div key={log.id} className="flex items-center justify-between py-1 pl-4">
                      <span className="text-sm font-medium text-foreground">{log.food.name}</span>
                      <span className="text-sm text-muted-foreground tabular-nums">{formatNumber(log.quantity_g, 0)}g</span>
                    </div>
                  ))}
                </div>
              )
            })}
            {logs.length === 0 && (
              <div className="px-6 py-14 text-center">
                <p className="text-sm text-muted-foreground">No meals logged yet</p>
              </div>
            )}
          </div>
        </div>

        {/* TODAY'S WORKOUT */}
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-border">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Today&apos;s Workout</p>
            <Dumbbell className="w-4 h-4 text-muted-foreground opacity-30" />
          </div>
          {!sessionSummary ? (
            <div className="px-6 py-14 text-center">
              <p className="text-sm text-muted-foreground">Rest day</p>
            </div>
          ) : (
            <div className="p-6">
              <p className="font-bold text-lg text-foreground">{sessionSummary.name}</p>
              <p className="text-sm text-muted-foreground mb-4">{sessionSummary.exerciseCount} exercises · {sessionSummary.totalSets} sets</p>
              <div className="space-y-2.5">
                {sessionSummary.exercises.map(g => (
                  <div key={g.exercise?.id || 'unknown'} className="flex items-center justify-between bg-muted/50 rounded-lg px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground">{g.exercise?.name || 'Unknown'}</span>
                      {g.hasPb && <PBBadge />}
                    </div>
                    <span className="text-sm text-muted-foreground tabular-nums">{g.sets.length} sets · best {formatNumber(g.bestWeight)}kg</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WEIGHT CHART */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight — Last 30 Days</p>
          <Scale className="w-4 h-4 text-muted-foreground opacity-30" />
        </div>
        <div className="flex items-baseline gap-3 mb-5">
          {latestWeight ? (
            <>
              <span className="text-2xl font-bold text-foreground tabular-nums">{formatNumber(latestWeight.weight_kg)} kg</span>
              {weightChange && (
                <span className={`text-sm font-medium tabular-nums flex items-center gap-1 ${Number(weightChange) <= 0 ? 'text-chart-emerald' : 'text-destructive'}`}>
                  {Number(weightChange) <= 0 && <TrendingDown className="w-3.5 h-3.5" />}
                  {Number(weightChange) > 0 ? '+' : ''}{weightChange} kg
                </span>
              )}
            </>
          ) : (
            <span className="text-sm text-muted-foreground">No data yet</span>
          )}
        </div>
        {weightData.length >= 2 ? (
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weightData}>
                <defs>
                  <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(160,84%,39%)" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="hsl(160,84%,39%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} width={40} domain={['dataMin - 0.5', 'dataMax + 0.5']} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="weight" stroke="hsl(160,84%,39%)" strokeWidth={2} fill="url(#weightGradient)" dot={{ r: 2.5, fill: 'hsl(160,84%,39%)', strokeWidth: 0 }} name="Weight (kg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-40 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">Not enough data</p>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <button onClick={() => navigate('/nutrition')} className="flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors">
          <Plus className="w-4 h-4" /> Log Meal
        </button>
        <button onClick={() => navigate('/workouts')} className="flex items-center gap-2 px-4 py-2 rounded-md border border-secondary text-secondary text-sm font-medium hover:bg-secondary/10 transition-colors">
          <Plus className="w-4 h-4" /> Log Workout
        </button>
        <button onClick={() => navigate('/body')} className="flex items-center gap-2 px-4 py-2 rounded-md border border-border text-foreground text-sm font-medium hover:bg-muted transition-colors">
          <Plus className="w-4 h-4" /> Log Weight
        </button>
      </div>
    </>
  )
}
