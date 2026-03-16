import { useState } from 'react'
import { useExercises } from '../hooks/useWorkouts'
import { MUSCLE_GROUPS } from '../lib/utils'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

function ExerciseForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [name, setName] = useState(initial?.name || '')
  const [muscleGroup, setMuscleGroup] = useState(initial?.muscle_group || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name, muscle_group: muscleGroup })
  }

  const inputClass = "w-full bg-surface border border-border rounded-xl px-4 py-3 text-[14px] text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Exercise Name</span>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus className={inputClass} />
      </label>
      <label className="block">
        <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Muscle Group</span>
        <select value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} className={inputClass}>
          <option value="">Select...</option>
          {MUSCLE_GROUPS.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 py-3 bg-surface border border-border rounded-xl text-[14px] text-text font-medium hover:bg-gray-50 transition-colors">
            Cancel
          </button>
        )}
        <button type="submit" className="flex-1 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm">
          {submitLabel || 'Save'}
        </button>
      </div>
    </form>
  )
}

export default function ExerciseLibrary() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useExercises()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editExercise, setEditExercise] = useState(null)

  const filtered = search.trim()
    ? exercises.filter(e =>
        e.name.toLowerCase().includes(search.toLowerCase()) ||
        (e.muscle_group || '').toLowerCase().includes(search.toLowerCase())
      )
    : exercises

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-[26px] text-text leading-tight">Exercises</h1>
          <p className="text-text-secondary text-[14px] mt-0.5">Your exercise library</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Exercise
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" />
        <input
          type="text"
          placeholder="Search exercises..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-[14px] text-text placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={search ? 'No exercises match your search' : 'No exercises in your library yet'}
          actionLabel={!search ? '+ Add your first exercise' : undefined}
          onAction={!search ? () => setAddOpen(true) : undefined}
        />
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-gray-50/50">
                <th className="text-left px-6 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Name</th>
                <th className="text-left px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Muscle Group</th>
                <th className="px-4 py-3.5 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(ex => (
                <tr key={ex.id} className="group hover:bg-gray-50/70 transition-colors">
                  <td className="px-6 py-4 text-text font-medium text-[14px]">{ex.name}</td>
                  <td className="px-5 py-4">
                    {ex.muscle_group ? (
                      <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-gray-100 text-text-secondary border border-gray-200">
                        {ex.muscle_group}
                      </span>
                    ) : (
                      <span className="text-text-secondary text-[14px]">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditExercise(ex)} className="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-gray-100 transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => deleteExercise(ex.id)} className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-red-50 transition-all">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Exercise">
        <ExerciseForm
          onSubmit={async (ex) => { await addExercise(ex); setAddOpen(false) }}
          onCancel={() => setAddOpen(false)}
          submitLabel="Add Exercise"
        />
      </Modal>

      <Modal open={!!editExercise} onClose={() => setEditExercise(null)} title="Edit Exercise">
        {editExercise && (
          <ExerciseForm
            initial={editExercise}
            onSubmit={async (ex) => { await updateExercise(editExercise.id, ex); setEditExercise(null) }}
            onCancel={() => setEditExercise(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </div>
  )
}
