import { useState } from 'react'
import { useFoods } from '../hooks/useNutrition'
import { formatNumber } from '../lib/utils'
import Modal from '../components/Modal'
import EmptyState from '../components/EmptyState'
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

  const inputClass = "w-full bg-surface border border-border rounded-xl px-4 py-3 text-[14px] text-text focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {fields.map(f => (
        <label key={f.key} className="block">
          <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">{f.label}</span>
          <input
            type={f.type}
            value={form[f.key]}
            onChange={e => set(f.key, e.target.value)}
            required={f.required}
            step="any"
            className={inputClass}
          />
        </label>
      ))}
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
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-bold text-[26px] text-text leading-tight">Food Library</h1>
          <p className="text-text-secondary text-[14px] mt-0.5">Manage your saved foods</p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex items-center gap-2 px-6 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm"
        >
          <Plus size={16} /> Add Food
        </button>
      </div>

      <div className="relative mb-6">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" />
        <input
          type="text"
          placeholder="Search foods..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-[14px] text-text placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all shadow-sm"
        />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          message={search ? 'No foods match your search' : 'No foods in your library yet'}
          actionLabel={!search ? '+ Add your first food' : undefined}
          onAction={!search ? () => setAddOpen(true) : undefined}
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-gray-50/50">
                  <th className="text-left px-6 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Name</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Cal</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Protein</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Carbs</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Fat</th>
                  <th className="text-right px-5 py-3.5 text-[11px] font-bold text-text-secondary uppercase tracking-wider">Serving</th>
                  <th className="px-4 py-3.5 w-24"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(food => (
                  <tr key={food.id} className="group hover:bg-gray-50/70 transition-colors">
                    <td className="px-6 py-4 text-text font-medium text-[14px]">{food.name}</td>
                    <td className="px-5 py-4 text-right text-text tabular-nums text-[14px] font-medium">{formatNumber(food.calories_per_100g, 0)}</td>
                    <td className="px-5 py-4 text-right text-protein tabular-nums text-[14px] font-medium">{formatNumber(food.protein_per_100g)}</td>
                    <td className="px-5 py-4 text-right text-carbs tabular-nums text-[14px] font-medium">{formatNumber(food.carbs_per_100g)}</td>
                    <td className="px-5 py-4 text-right text-fat tabular-nums text-[14px] font-medium">{formatNumber(food.fat_per_100g)}</td>
                    <td className="px-5 py-4 text-right text-text-secondary tabular-nums text-[13px]">{formatNumber(food.serving_size_g, 0)}g</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setEditFood(food)} className="p-2 rounded-lg text-text-secondary hover:text-text hover:bg-gray-100 transition-all">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => deleteFood(food.id)} className="p-2 rounded-lg text-text-secondary hover:text-danger hover:bg-red-50 transition-all">
                          <Trash2 size={14} />
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
    </div>
  )
}
