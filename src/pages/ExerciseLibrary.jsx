import { useState } from 'react'
import { useExercises } from '../hooks/useWorkouts'
import { MUSCLE_GROUPS } from '../lib/utils'
import Modal from '../components/Modal'
import { Plus, Pencil, Trash2, Search } from 'lucide-react'

function ExerciseForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [name, setName] = useState(initial?.name || '')
  const [muscleGroup, setMuscleGroup] = useState(initial?.muscle_group || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({ name, muscle_group: muscleGroup })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground mb-1 block">Exercise Name</span>
        <input type="text" value={name} onChange={e => setName(e.target.value)} required autoFocus className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2" />
      </label>
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground mb-1 block">Muscle Group</span>
        <select value={muscleGroup} onChange={e => setMuscleGroup(e.target.value)} className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
          <option value="">Select...</option>
          {MUSCLE_GROUPS.map(g => (
            <option key={g} value={g}>{g}</option>
          ))}
        </select>
      </label>
      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="flex-1 h-10 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
        )}
        <button type="submit" className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press">
          {submitLabel || 'Save'}
        </button>
      </div>
    </form>
  )
}

export default function ExerciseLibrary() {
  const { exercises, addExercise, updateExercise, deleteExercise } = useExercises()
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [addOpen, setAddOpen] = useState(false)
  const [editExercise, setEditExercise] = useState(null)

  const filtered = exercises.filter(e => {
    const matchesSearch = !search.trim() || e.name.toLowerCase().includes(search.toLowerCase()) || (e.muscle_group || '').toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'All' || e.muscle_group === filter
    return matchesSearch && matchesFilter
  })

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Exercise Library</h1>
          <p className="text-sm text-muted-foreground">{exercises.length} exercises</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press"
        >
          <Plus className="w-4 h-4" /> Add Exercise
        </button>
      </div>

      {/* Filter bar */}
      <div className="space-y-3">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {['All', ...MUSCLE_GROUPS].map(g => (
            <button
              key={g}
              onClick={() => setFilter(g)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                filter === g
                  ? g === 'All' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-lg border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">{search || filter !== 'All' ? 'No exercises match your search' : 'No exercises yet'}</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Exercise</th>
                <th className="text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Muscle Group</th>
                <th className="px-4 py-3 w-20"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((ex, i) => (
                <tr key={ex.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors group ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{ex.name}</td>
                  <td className="px-4 py-3">
                    {ex.muscle_group ? (
                      <span className="bg-secondary/10 text-secondary rounded px-2 py-1 text-xs font-medium">
                        {ex.muscle_group}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => setEditExercise(ex)} className="p-1.5 rounded-md hover:bg-muted hover:text-foreground text-muted-foreground transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => deleteExercise(ex.id)} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
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
    </>
  )
}
