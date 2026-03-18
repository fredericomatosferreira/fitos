import { useState } from 'react'
import { useWorkoutTemplates } from '../hooks/useWorkoutTemplates'
import { useExercises } from '../hooks/useWorkouts'
import Modal from '../components/Modal'
import { Plus, Trash2, Pencil, Search, X, GripVertical } from 'lucide-react'

const inputCls = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

function TemplateEditor({ exercises, initialName, initialItems, onSave, onCancel }) {
  const [name, setName] = useState(initialName || '')
  const [items, setItems] = useState(initialItems || [])
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()))
    : exercises

  const addExercise = (exercise) => {
    setItems(prev => [...prev, { exercise_id: exercise.id, exercise, default_sets: 3, default_reps: 10 }])
    setSearchOpen(false)
    setSearch('')
  }

  const removeExercise = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateItem = (index, field, value) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, [field]: Number(value) } : item))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || items.length === 0) return
    onSave(name.trim(), items.map(i => ({
      exercise_id: i.exercise_id,
      default_sets: i.default_sets,
      default_reps: i.default_reps,
    })))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground mb-1 block">Workout Name</span>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Upper Body, Push Day A..." required autoFocus className={inputCls} />
      </label>

      <div>
        <span className="text-xs font-medium text-muted-foreground mb-2 block">Exercises in this workout</span>
        {items.length > 0 && (
          <div className="space-y-2 mb-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-md p-2 border border-border">
                <GripVertical className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0" />
                <div className="flex-1 min-w-0">
                  <span className="text-sm font-medium text-foreground truncate block">{item.exercise?.name}</span>
                  {item.exercise?.muscle_group && (
                    <span className="text-[10px] text-muted-foreground">{item.exercise.muscle_group}</span>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <input
                    type="number"
                    value={item.default_sets}
                    onChange={e => updateItem(i, 'default_sets', e.target.value)}
                    className="w-14 h-7 rounded border border-input bg-background px-2 text-xs text-right"
                    min="1"
                  />
                  <span className="text-[10px] text-muted-foreground">sets</span>
                  <input
                    type="number"
                    value={item.default_reps}
                    onChange={e => updateItem(i, 'default_reps', e.target.value)}
                    className="w-14 h-7 rounded border border-input bg-background px-2 text-xs text-right ml-1"
                    min="1"
                  />
                  <span className="text-[10px] text-muted-foreground">reps</span>
                </div>
                <button type="button" onClick={() => removeExercise(i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {searchOpen ? (
          <div className="border border-border rounded-md overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search exercises..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border-b border-border bg-background focus:outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(ex => (
                <button
                  key={ex.id}
                  type="button"
                  onClick={() => addExercise(ex)}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                >
                  <span className="font-medium text-foreground">{ex.name}</span>
                  {ex.muscle_group && <span className="text-xs text-muted-foreground ml-2">{ex.muscle_group}</span>}
                </button>
              ))}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No exercises found</p>}
            </div>
            <button type="button" onClick={() => { setSearchOpen(false); setSearch('') }} className="w-full text-xs text-muted-foreground py-2 border-t border-border hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1 text-secondary text-xs font-medium hover:opacity-70 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add exercise
          </button>
        )}
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 h-10 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || items.length === 0}
          className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-30 animate-press"
        >
          Save Workout
        </button>
      </div>
    </form>
  )
}

export default function WorkoutTemplates() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useWorkoutTemplates()
  const { exercises } = useExercises()
  const [createOpen, setCreateOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? templates.filter(t => t.name.toLowerCase().includes(search.toLowerCase()))
    : templates

  const handleCreate = async (name, items) => {
    await addTemplate(name, items)
    setCreateOpen(false)
  }

  const handleUpdate = async (name, items) => {
    await updateTemplate(editingTemplate.id, name, items)
    setEditingTemplate(null)
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Saved Workouts</h1>
          <p className="text-sm text-muted-foreground">{templates.length} workout{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press"
        >
          <Plus className="w-4 h-4" /> Create Workout
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search workouts..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-lg border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">{templates.length === 0 ? 'No saved workouts yet. Create one to quickly start a session with preset exercises.' : 'No workouts match your search.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(template => {
            const items = template.workout_template_items || []
            const totalSets = items.reduce((sum, i) => sum + (i.default_sets || 0), 0)
            return (
              <div key={template.id} className="bg-card rounded-lg border border-border p-5 group">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-foreground">{template.name}</h3>
                    <p className="text-xs text-muted-foreground">{items.length} exercise{items.length !== 1 ? 's' : ''} · {totalSets} total sets</p>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingTemplate(template)}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="space-y-1">
                  {items
                    .sort((a, b) => a.sort_order - b.sort_order)
                    .map(item => (
                      <div key={item.id} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="text-foreground">{item.exercise?.name}</span>
                          {item.exercise?.muscle_group && (
                            <span className="bg-muted rounded px-2 py-0.5 text-[10px] text-muted-foreground">{item.exercise.muscle_group}</span>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground tabular-nums">{item.default_sets}×{item.default_reps}</span>
                      </div>
                    ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Saved Workout">
        <TemplateEditor exercises={exercises} onSave={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editingTemplate} onClose={() => setEditingTemplate(null)} title="Edit Saved Workout">
        {editingTemplate && (
          <TemplateEditor
            exercises={exercises}
            initialName={editingTemplate.name}
            initialItems={(editingTemplate.workout_template_items || [])
              .sort((a, b) => a.sort_order - b.sort_order)
              .map(i => ({
                exercise_id: i.exercise_id,
                exercise: i.exercise,
                default_sets: i.default_sets,
                default_reps: i.default_reps,
              }))}
            onSave={handleUpdate}
            onCancel={() => setEditingTemplate(null)}
          />
        )}
      </Modal>
    </>
  )
}
