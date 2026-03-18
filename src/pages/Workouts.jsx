import { useState } from 'react'
import { useWorkoutSessions, useExercises, useExerciseHistory } from '../hooks/useWorkouts'
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates'
import { supabase } from '../lib/supabase'
import { formatNumber } from '../lib/utils'
import DateSelector from '../components/DateSelector'
import Modal from '../components/Modal'
import PBBadge from '../components/PBBadge'
import { Plus, Trash2, ChevronDown, ChevronUp, BookOpen } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { format } from 'date-fns'

const tooltipStyle = {
  background: '#fff',
  border: '1px solid hsl(214 20% 90%)',
  borderRadius: 8,
  fontSize: 12,
  padding: '6px 10px',
}

function ExerciseHistoryChart({ exerciseId }) {
  const { history } = useExerciseHistory(exerciseId)
  const data = history.map(h => ({
    date: h.session?.date ? format(new Date(h.session.date), 'MMM d') : '',
    weight: Number(h.weight_kg),
  }))

  if (data.length < 2) return <p className="text-sm text-muted-foreground py-8 text-center">Not enough data yet</p>

  return (
    <div className="h-32 mt-2">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(214 20% 90%)" />
          <XAxis dataKey="date" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} width={36} />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="weight" stroke="hsl(239,84%,67%)" strokeWidth={2} dot={{ r: 3, fill: 'hsl(239,84%,67%)', strokeWidth: 0 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function AddSetForm({ exercises, onAdd, onCancel }) {
  const [exerciseId, setExerciseId] = useState('')
  const [reps, setReps] = useState('')
  const [weight, setWeight] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!exerciseId) return
    onAdd({ exercise_id: exerciseId, reps: Number(reps) || 0, weight_kg: Number(weight) || 0 })
    setReps('')
    setWeight('')
  }

  const inputCls = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 p-4 bg-muted/30 rounded-md border border-border">
      <label className="flex-1 min-w-[160px]">
        <span className="text-xs font-medium text-muted-foreground mb-1 block">Exercise</span>
        <select value={exerciseId} onChange={e => setExerciseId(e.target.value)} required className={inputCls}>
          <option value="">Select exercise...</option>
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </label>
      <label className="w-20">
        <span className="text-xs font-medium text-muted-foreground mb-1 block">Reps</span>
        <input type="number" value={reps} onChange={e => setReps(e.target.value)} required className={inputCls} />
      </label>
      <label className="w-24">
        <span className="text-xs font-medium text-muted-foreground mb-1 block">Weight (kg)</span>
        <input type="number" step="any" value={weight} onChange={e => setWeight(e.target.value)} className={inputCls} />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="h-10 px-4 rounded-md bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90 transition-colors">
          Add Set
        </button>
        <button type="button" onClick={onCancel} className="h-10 px-3 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Done
        </button>
      </div>
    </form>
  )
}

export default function Workouts() {
  const [date, setDate] = useState(new Date())
  const { sessions, addSession, deleteSession, addSet, deleteSet } = useWorkoutSessions(date)
  const { exercises } = useExercises()
  const { templates } = useWorkoutTemplates()
  const [newSessionOpen, setNewSessionOpen] = useState(false)
  const [templateModalOpen, setTemplateModalOpen] = useState(false)
  const [sessionName, setSessionName] = useState('')
  const [addingToSession, setAddingToSession] = useState(null)
  const [expandedExercise, setExpandedExercise] = useState(null)

  const handleNewSession = async (e) => {
    e.preventDefault()
    if (!sessionName.trim()) return
    await addSession({ name: sessionName.trim() })
    setSessionName('')
    setNewSessionOpen(false)
  }

  const handleStartFromTemplate = async (template) => {
    const result = await addSession({ name: template.name })
    if (!result?.data) return
    const sessionId = result.data.id
    const items = (template.workout_template_items || []).sort((a, b) => a.sort_order - b.sort_order)
    for (const item of items) {
      for (let s = 1; s <= (item.default_sets || 3); s++) {
        await addSet(sessionId, {
          exercise_id: item.exercise_id,
          set_number: s,
          reps: item.default_reps || 10,
          weight_kg: 0,
          is_pb: false,
        })
      }
    }
    setTemplateModalOpen(false)
  }

  const handleAddSet = async (sessionId, set) => {
    const session = sessions.find(s => s.id === sessionId)
    const setsForExercise = (session?.workout_sets || []).filter(s => s.exercise_id === set.exercise_id)
    const setNumber = setsForExercise.length + 1

    let isPb = false
    if (set.weight_kg > 0 && supabase) {
      const { data: existing } = await supabase
        .from('workout_sets')
        .select('weight_kg')
        .eq('exercise_id', set.exercise_id)
        .order('weight_kg', { ascending: false })
        .limit(1)
      if (!existing?.length || set.weight_kg > existing[0].weight_kg) isPb = true
    }

    await addSet(sessionId, { ...set, set_number: setNumber, is_pb: isPb })
  }

  const groupSetsByExercise = (sets) => {
    const groups = {}
    const order = []
    for (const s of (sets || [])) {
      if (!groups[s.exercise_id]) {
        groups[s.exercise_id] = { exercise: s.exercise, sets: [] }
        order.push(s.exercise_id)
      }
      groups[s.exercise_id].sets.push(s)
    }
    return order.map(id => groups[id])
  }

  return (
    <>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-foreground">Workouts</h1>
        <div className="flex items-center gap-3">
          <DateSelector date={date} onChange={setDate} />
          {templates.length > 0 && (
            <button
              onClick={() => setTemplateModalOpen(true)}
              className="flex items-center gap-2 h-10 px-4 rounded-md border border-secondary text-secondary text-sm font-medium hover:bg-secondary/10 transition-colors"
            >
              <BookOpen className="w-4 h-4" /> From Template
            </button>
          )}
          <button
            onClick={() => setNewSessionOpen(true)}
            className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press"
          >
            <Plus className="w-4 h-4" /> New Session
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="bg-card rounded-lg border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">No workouts logged for this day</p>
        </div>
      ) : (
        sessions.map(session => {
          const groups = groupSetsByExercise(session.workout_sets)
          const totalSets = session.workout_sets?.length || 0

          return (
            <div key={session.id} className="bg-card rounded-lg border border-border overflow-hidden">
              {/* Session header */}
              <div className="flex items-center justify-between px-5 py-4 group/header">
                <div>
                  <h3 className="font-bold text-lg text-foreground">{session.name}</h3>
                  <p className="text-xs text-muted-foreground">{groups.length} exercises · {totalSets} total sets</p>
                </div>
                <button
                  onClick={() => deleteSession(session.id)}
                  className="p-2 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover/header:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {addingToSession === session.id && (
                <div className="p-4 border-b border-border">
                  <AddSetForm
                    exercises={exercises}
                    onAdd={(set) => handleAddSet(session.id, set)}
                    onCancel={() => setAddingToSession(null)}
                  />
                </div>
              )}

              {groups.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-muted-foreground">No exercises added yet</div>
              ) : (
                <div className="px-5 py-3 space-y-2">
                  {groups.map(group => {
                    const hasPb = group.sets.some(s => s.is_pb)
                    const bestWeight = Math.max(...group.sets.map(s => s.weight_kg || 0))
                    const isExpanded = expandedExercise === group.exercise?.id
                    return (
                      <div key={group.exercise?.id || 'unknown'}>
                        <button
                          onClick={() => setExpandedExercise(isExpanded ? null : group.exercise?.id)}
                          className="flex items-center justify-between w-full bg-muted/50 rounded-md px-4 py-2.5 text-left hover:bg-muted/70 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-foreground">{group.exercise?.name || 'Unknown'}</span>
                            {group.exercise?.muscle_group && (
                              <span className="bg-muted rounded px-2 py-0.5 text-xs text-muted-foreground">
                                {group.exercise.muscle_group}
                              </span>
                            )}
                            {hasPb && <PBBadge />}
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {group.sets.length} sets · {formatNumber(bestWeight)}kg
                            </span>
                            {isExpanded
                              ? <ChevronUp className="w-4 h-4 text-muted-foreground" />
                              : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                            }
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="px-5 pb-4">
                            {/* Sets table */}
                            <div className="bg-muted/30 rounded-md overflow-hidden mb-3">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="border-b border-border">
                                    <th className="text-left px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Set</th>
                                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Reps</th>
                                    <th className="text-right px-3 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Weight</th>
                                    <th className="px-3 py-2 w-16"></th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {group.sets
                                    .sort((a, b) => a.set_number - b.set_number)
                                    .map(set => (
                                      <tr key={set.id} className="border-b border-border last:border-0 group/set">
                                        <td className="px-3 py-2 text-muted-foreground">{set.set_number}</td>
                                        <td className="px-3 py-2 text-right tabular-nums text-foreground">{set.reps}</td>
                                        <td className="px-3 py-2 text-right tabular-nums text-foreground">{formatNumber(set.weight_kg)}kg</td>
                                        <td className="px-3 py-2 text-right">
                                          <div className="flex items-center gap-1 justify-end">
                                            {set.is_pb && <PBBadge />}
                                            <button
                                              onClick={() => deleteSet(session.id, set.id)}
                                              className="text-muted-foreground/30 hover:text-destructive transition-colors opacity-0 group-hover/set:opacity-100"
                                            >
                                              <Trash2 className="w-3 h-3" />
                                            </button>
                                          </div>
                                        </td>
                                      </tr>
                                    ))}
                                </tbody>
                              </table>
                            </div>
                            <button
                              onClick={() => setAddingToSession(addingToSession === session.id ? null : session.id)}
                              className="flex items-center gap-1 text-secondary text-xs font-medium hover:opacity-70 transition-colors mb-3"
                            >
                              <Plus className="w-4 h-4" /> Add Set
                            </button>
                            {/* Weight progression */}
                            <div className="border border-border rounded-md p-3">
                              <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-1">Weight Progression</p>
                              <ExerciseHistoryChart exerciseId={group.exercise.id} />
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Add exercise link */}
              <div className="px-5 pb-4">
                <button
                  onClick={() => setAddingToSession(addingToSession === session.id ? null : session.id)}
                  className="flex items-center gap-1 text-primary text-xs font-medium hover:opacity-70 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Exercise
                </button>
              </div>
            </div>
          )
        })
      )}

      <Modal open={newSessionOpen} onClose={() => setNewSessionOpen(false)} title="New Workout Session">
        <form onSubmit={handleNewSession} className="space-y-4">
          <label className="block">
            <span className="text-xs font-medium text-muted-foreground mb-1 block">Session Name</span>
            <input
              type="text"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              placeholder="e.g. Push Day A, Leg Day..."
              required
              autoFocus
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            />
          </label>
          <button type="submit" className="w-full h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press">
            Create Session
          </button>
        </form>
      </Modal>

      <Modal open={templateModalOpen} onClose={() => setTemplateModalOpen(false)} title="Start from Saved Workout">
        <p className="text-sm text-muted-foreground mb-4">
          A new session will be created with all exercises and sets pre-filled.
        </p>
        <div className="space-y-2 max-h-80 overflow-y-auto">
          {templates.map(template => {
            const items = (template.workout_template_items || []).sort((a, b) => a.sort_order - b.sort_order)
            const totalSets = items.reduce((sum, i) => sum + (i.default_sets || 0), 0)
            return (
              <button
                key={template.id}
                onClick={() => handleStartFromTemplate(template)}
                className="w-full text-left bg-muted/30 hover:bg-muted rounded-lg border border-border p-3 transition-colors"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-sm text-foreground">{template.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{items.length} exercises · {totalSets} sets</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {items.map(i => i.exercise?.name).filter(Boolean).join(', ')}
                </div>
              </button>
            )
          })}
        </div>
      </Modal>
    </>
  )
}
