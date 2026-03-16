import { useState } from 'react'
import { useWorkoutSessions, useExercises, useExerciseHistory } from '../hooks/useWorkouts'
import { supabase } from '../lib/supabase'
import { formatNumber } from '../lib/utils'
import DateSelector from '../components/DateSelector'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import PBBadge from '../components/PBBadge'
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

const chartTooltipStyle = { background: '#FFFFFF', border: '1px solid #E2E5EB', borderRadius: 10, fontSize: 13, padding: '8px 12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }

function ExerciseHistoryChart({ exerciseId }) {
  const { history } = useExerciseHistory(exerciseId)
  const data = history.map(h => ({
    date: h.session?.date ? format(new Date(h.session.date), 'MMM d') : '',
    weight: Number(h.weight_kg),
  }))

  if (data.length < 2) return <p className="text-text-secondary text-[13px] py-8 text-center">Not enough data yet</p>

  return (
    <div className="h-48 mt-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={42} />
          <Tooltip contentStyle={chartTooltipStyle} />
          <Line type="monotone" dataKey="weight" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3, fill: '#10B981', strokeWidth: 0 }} />
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

  const inputClass = "w-full bg-surface border border-border rounded-xl px-4 py-3 text-[14px] text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3 p-5 bg-gray-50 rounded-xl border border-gray-200">
      <label className="flex-1 min-w-[180px]">
        <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Exercise</span>
        <select value={exerciseId} onChange={e => setExerciseId(e.target.value)} required className={inputClass}>
          <option value="">Select exercise...</option>
          {exercises.map(ex => (
            <option key={ex.id} value={ex.id}>{ex.name}</option>
          ))}
        </select>
      </label>
      <label className="w-24">
        <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Reps</span>
        <input type="number" value={reps} onChange={e => setReps(e.target.value)} required className={inputClass} />
      </label>
      <label className="w-28">
        <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Weight (kg)</span>
        <input type="number" step="any" value={weight} onChange={e => setWeight(e.target.value)} className={inputClass} />
      </label>
      <div className="flex gap-2">
        <button type="submit" className="px-5 py-3 bg-accent text-white rounded-xl text-[13px] font-semibold hover:bg-accent-hover transition-colors shadow-sm">
          Add Set
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-3 text-text-secondary text-[13px] font-semibold hover:text-text transition-colors">
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
  const [newSessionOpen, setNewSessionOpen] = useState(false)
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
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-bold text-[26px] text-text leading-tight">Workouts</h1>
          <p className="text-text-secondary text-[14px] mt-0.5">Log your training sessions</p>
        </div>
        <div className="flex items-center gap-4">
          <DateSelector date={date} onChange={setDate} />
          <button
            onClick={() => setNewSessionOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm"
          >
            <Plus size={16} /> New Session
          </button>
        </div>
      </div>

      {sessions.length === 0 ? (
        <EmptyState
          message="No workouts logged for this day"
          actionLabel="+ New Session"
          onAction={() => setNewSessionOpen(true)}
        />
      ) : (
        <div className="space-y-6">
          {sessions.map(session => {
            const groups = groupSetsByExercise(session.workout_sets)
            const totalSets = session.workout_sets?.length || 0

            return (
              <div key={session.id} className="card overflow-hidden">
                {/* Session header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border">
                  <div>
                    <h3 className="text-text font-bold text-[18px]">{session.name}</h3>
                    <p className="text-text-secondary text-[13px] mt-0.5">{groups.length} exercises · {totalSets} total sets</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteSession(session.id)}
                      className="p-2.5 rounded-xl text-text-secondary/30 hover:text-danger hover:bg-red-50 transition-all duration-150"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {addingToSession === session.id && (
                  <div className="p-5 border-b border-border bg-gray-50/50">
                    <AddSetForm
                      exercises={exercises}
                      onAdd={(set) => handleAddSet(session.id, set)}
                      onCancel={() => setAddingToSession(null)}
                    />
                  </div>
                )}

                {groups.length === 0 ? (
                  <div className="px-6 py-12 text-center">
                    <p className="text-text-secondary text-[14px]">No exercises added yet</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border">
                    {groups.map(group => {
                      const hasPb = group.sets.some(s => s.is_pb)
                      const bestWeight = Math.max(...group.sets.map(s => s.weight_kg || 0))
                      const isExpanded = expandedExercise === group.exercise?.id
                      return (
                        <div key={group.exercise?.id || 'unknown'}>
                          <button
                            onClick={() => setExpandedExercise(isExpanded ? null : group.exercise?.id)}
                            className="flex items-center justify-between w-full px-6 py-4 text-left hover:bg-gray-50/70 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-text font-semibold text-[15px]">{group.exercise?.name || 'Unknown'}</span>
                              {group.exercise?.muscle_group && (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-text-secondary border border-gray-200">
                                  {group.exercise.muscle_group}
                                </span>
                              )}
                              {hasPb && <PBBadge />}
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="text-text-secondary text-[13px] tabular-nums font-medium">
                                {group.sets.length} sets · {formatNumber(bestWeight)}kg
                              </span>
                              {isExpanded
                                ? <ChevronUp size={16} className="text-text-secondary/40" />
                                : <ChevronDown size={16} className="text-text-secondary/40" />
                              }
                            </div>
                          </button>
                          {isExpanded && (
                            <div className="px-6 pb-5">
                              <div className="flex flex-wrap gap-2.5 mb-4">
                                {group.sets
                                  .sort((a, b) => a.set_number - b.set_number)
                                  .map(set => (
                                    <div key={set.id} className="group/set flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2.5 rounded-xl text-[13px]">
                                      <span className="text-text-secondary font-semibold">S{set.set_number}</span>
                                      <span className="text-text tabular-nums font-semibold">{set.reps} × {formatNumber(set.weight_kg)}kg</span>
                                      {set.is_pb && <PBBadge />}
                                      <button
                                        onClick={() => deleteSet(session.id, set.id)}
                                        className="text-text-secondary/20 hover:text-danger transition-colors opacity-0 group-hover/set:opacity-100 ml-1"
                                      >
                                        <Trash2 size={12} />
                                      </button>
                                    </div>
                                  ))}
                              </div>
                              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                                <p className="section-header mb-1">Weight Over Time</p>
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
                <div className="px-6 py-4 border-t border-border">
                  <button
                    onClick={() => setAddingToSession(addingToSession === session.id ? null : session.id)}
                    className="flex items-center gap-1.5 text-accent text-[13px] font-semibold hover:text-accent-hover transition-colors"
                  >
                    <Plus size={14} /> Add Exercise
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={newSessionOpen} onClose={() => setNewSessionOpen(false)} title="New Workout Session">
        <form onSubmit={handleNewSession} className="space-y-5">
          <label className="block">
            <span className="text-text-secondary text-[13px] mb-2 block font-semibold">Session Name</span>
            <input
              type="text"
              value={sessionName}
              onChange={e => setSessionName(e.target.value)}
              placeholder="e.g. Push Day A, Leg Day..."
              required
              autoFocus
              className="w-full bg-surface border border-border rounded-xl px-4 py-3 text-[15px] text-text placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"
            />
          </label>
          <button type="submit" className="w-full py-3 bg-accent text-white rounded-xl text-[15px] font-semibold hover:bg-accent-hover transition-colors shadow-sm">
            Create Session
          </button>
        </form>
      </Modal>
    </div>
  )
}
