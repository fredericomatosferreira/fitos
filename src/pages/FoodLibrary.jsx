import { useState } from 'react'
import { useFoods } from '../hooks/useNutrition'
import { formatNumber } from '../lib/utils'
import Modal from '../components/Modal'
import { Plus, Search, Pencil, Trash2 } from 'lucide-react'

function FoodForm({ initial, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(
    initial || {
      name: '',
      calories_per_100g: '',
      protein_per_100g: '',
      carbs_per_100g: '',
      fat_per_100g: '',
      serving_size_g: '100',
    }
  )

  const set = (key, val) => setForm(prev => ({ ...prev, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit({
      name: form.name,
      calories_per_100g: Number(form.calories_per_100g) || 0,
      protein_per_100g: Number(form.protein_per_100g) || 0,
      carbs_per_100g: Number(form.carbs_per_100g) || 0,
      fat_per_100g: Number(form.fat_per_100g) || 0,
      serving_size_g: Number(form.serving_size_g) || 100,
    })
  }

  const fields = [
    { key: 'name', label: 'Food Name', type: 'text', required: true },
    { key: 'calories_per_100g', label: 'Calories / 100g', type: 'number' },
    { key: 'protein_per_100g', label: 'Protein / 100g', type: 'number' },
    { key: 'carbs_per_100g', label: 'Carbs / 100g', type: 'number' },
    { key: 'fat_per_100g', label: 'Fat / 100g', type: 'number' },
    { key: 'serving_size_g', label: 'Default Serving (g)', type: 'number' },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {fields.map(f => (
        <label key={f.key} className="block">
          <span className="text-xs font-medium text-muted-foreground mb-1 block">{f.label}</span>
          <input
            type={f.type}
            value={form[f.key]}
            onChange={e => set(f.key, e.target.value)}
            required={f.required}
            step="any"
            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          />
        </label>
      ))}
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

export default function FoodLibrary() {
  const { foods, addFood, updateFood, deleteFood } = useFoods()
  const [search, setSearch] = useState('')
  const [addOpen, setAddOpen] = useState(false)
  const [editFood, setEditFood] = useState(null)

  const filtered = search.trim()
    ? foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foods

  const handleAdd = async (food) => {
    await addFood(food)
    setAddOpen(false)
  }

  const handleEdit = async (food) => {
    await updateFood(editFood.id, food)
    setEditFood(null)
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Food Library</h1>
          <p className="text-sm text-muted-foreground">{foods.length} foods</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press"
        >
          <Plus className="w-4 h-4" /> Add Food
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-lg border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">{search ? 'No foods match your search' : 'No foods in your library yet'}</p>
        </div>
      ) : (
        <div className="bg-card rounded-lg border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Name</th>
                  <th className="text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Cal/100g</th>
                  <th className="text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Protein</th>
                  <th className="text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Carbs</th>
                  <th className="text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Fat</th>
                  <th className="text-right font-semibold text-muted-foreground text-xs uppercase tracking-wider px-4 py-3">Serving</th>
                  <th className="px-4 py-3 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((food, i) => (
                  <tr key={food.id} className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors group ${i % 2 === 1 ? 'bg-muted/20' : ''}`}>
                    <td className="px-4 py-3 text-sm font-medium text-foreground">{food.name}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-foreground">{formatNumber(food.calories_per_100g, 0)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-secondary font-medium">{formatNumber(food.protein_per_100g)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-accent font-medium">{formatNumber(food.carbs_per_100g)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-chart-rose font-medium">{formatNumber(food.fat_per_100g)}</td>
                    <td className="px-4 py-3 text-right text-sm tabular-nums text-muted-foreground">{formatNumber(food.serving_size_g, 0)}g</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditFood(food)} className="p-1.5 rounded-md hover:bg-muted hover:text-foreground text-muted-foreground transition-colors">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => deleteFood(food.id)} className="p-1.5 rounded-md hover:bg-destructive/10 hover:text-destructive text-muted-foreground transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Food">
        <FoodForm onSubmit={handleAdd} onCancel={() => setAddOpen(false)} submitLabel="Add Food" />
      </Modal>

      <Modal open={!!editFood} onClose={() => setEditFood(null)} title="Edit Food">
        {editFood && (
          <FoodForm
            initial={{
              name: editFood.name,
              calories_per_100g: String(editFood.calories_per_100g),
              protein_per_100g: String(editFood.protein_per_100g),
              carbs_per_100g: String(editFood.carbs_per_100g),
              fat_per_100g: String(editFood.fat_per_100g),
              serving_size_g: String(editFood.serving_size_g),
            }}
            onSubmit={handleEdit}
            onCancel={() => setEditFood(null)}
            submitLabel="Save Changes"
          />
        )}
      </Modal>
    </>
  )
}
