import { useState } from 'react'
import { useMealTemplates } from '../hooks/useMealTemplates'
import { useFoods } from '../hooks/useNutrition'
import { calcMacros, formatNumber } from '../lib/utils'
import Modal from '../components/Modal'
import { Plus, Trash2, Pencil, Search, X } from 'lucide-react'

const inputCls = "w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"

function TemplateTotals({ items }) {
  const totals = items.reduce((acc, item) => {
    if (!item.food) return acc
    const m = calcMacros(item.food, item.quantity_g)
    acc.calories += m.calories
    acc.protein += m.protein
    acc.carbs += m.carbs
    acc.fat += m.fat
    return acc
  }, { calories: 0, protein: 0, carbs: 0, fat: 0 })

  return (
    <div className="flex items-center gap-3 text-xs tabular-nums">
      <span className="text-muted-foreground">{formatNumber(totals.calories, 0)} kcal</span>
      <span className="text-secondary font-medium">P {formatNumber(totals.protein, 0)}g</span>
      <span className="text-accent font-medium">C {formatNumber(totals.carbs, 0)}g</span>
      <span className="text-chart-rose font-medium">F {formatNumber(totals.fat, 0)}g</span>
    </div>
  )
}

function TemplateEditor({ foods, initialName, initialItems, onSave, onCancel }) {
  const [name, setName] = useState(initialName || '')
  const [items, setItems] = useState(initialItems || [])
  const [searchOpen, setSearchOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? foods.filter(f => f.name.toLowerCase().includes(search.toLowerCase()))
    : foods

  const addFood = (food) => {
    setItems(prev => [...prev, { food_id: food.id, food, quantity_g: food.serving_size_g || 100 }])
    setSearchOpen(false)
    setSearch('')
  }

  const removeFood = (index) => {
    setItems(prev => prev.filter((_, i) => i !== index))
  }

  const updateQuantity = (index, qty) => {
    setItems(prev => prev.map((item, i) => i === index ? { ...item, quantity_g: Number(qty) } : item))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim() || items.length === 0) return
    onSave(name.trim(), items.map(i => ({ food_id: i.food_id, quantity_g: i.quantity_g })))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="block">
        <span className="text-xs font-medium text-muted-foreground mb-1 block">Meal Name</span>
        <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Smoothie, Post-Workout Shake..." required autoFocus className={inputCls} />
      </label>

      <div>
        <span className="text-xs font-medium text-muted-foreground mb-2 block">Foods in this meal</span>
        {items.length > 0 && (
          <div className="space-y-2 mb-3">
            {items.map((item, i) => (
              <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-md p-2 border border-border">
                <span className="flex-1 text-sm font-medium text-foreground truncate">{item.food?.name}</span>
                <input
                  type="number"
                  value={item.quantity_g}
                  onChange={e => updateQuantity(i, e.target.value)}
                  className="w-20 h-8 rounded-md border border-input bg-background px-2 text-sm text-right"
                  min="1"
                />
                <span className="text-xs text-muted-foreground">g</span>
                <button type="button" onClick={() => removeFood(i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <TemplateTotals items={items} />
          </div>
        )}

        {searchOpen ? (
          <div className="border border-border rounded-md overflow-hidden">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search foods..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-sm border-b border-border bg-background focus:outline-none"
                autoFocus
              />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {filtered.map(food => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => addFood(food)}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors text-sm"
                >
                  <span className="font-medium text-foreground">{food.name}</span>
                  <span className="text-xs text-muted-foreground ml-2">{formatNumber(food.calories_per_100g, 0)} cal/100g</span>
                </button>
              ))}
              {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No foods found</p>}
            </div>
            <button type="button" onClick={() => { setSearchOpen(false); setSearch('') }} className="w-full text-xs text-muted-foreground py-2 border-t border-border hover:bg-muted transition-colors">
              Cancel
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-1 text-primary text-xs font-medium hover:opacity-70 transition-colors"
          >
            <Plus className="w-4 h-4" /> Add food
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
          Save Meal
        </button>
      </div>
    </form>
  )
}

export default function MealLibrary() {
  const { templates, addTemplate, updateTemplate, deleteTemplate } = useMealTemplates()
  const { foods } = useFoods()
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
          <h1 className="text-2xl font-bold text-foreground">Saved Meals</h1>
          <p className="text-sm text-muted-foreground">{templates.length} meal{templates.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors animate-press"
        >
          <Plus className="w-4 h-4" /> Create Meal
        </button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search meals..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="bg-card rounded-lg border border-border py-16 text-center">
          <p className="text-sm text-muted-foreground">{templates.length === 0 ? 'No saved meals yet. Create one to quickly log multiple foods at once.' : 'No meals match your search.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(template => (
            <div key={template.id} className="bg-card rounded-lg border border-border p-5 group">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-foreground">{template.name}</h3>
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
              <div className="space-y-1 mb-3">
                {(template.meal_template_items || []).map(item => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.food?.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(item.quantity_g, 0)}g</span>
                  </div>
                ))}
              </div>
              <TemplateTotals items={template.meal_template_items || []} />
            </div>
          ))}
        </div>
      )}

      <Modal open={createOpen} onClose={() => setCreateOpen(false)} title="Create Saved Meal">
        <TemplateEditor foods={foods} onSave={handleCreate} onCancel={() => setCreateOpen(false)} />
      </Modal>

      <Modal open={!!editingTemplate} onClose={() => setEditingTemplate(null)} title="Edit Saved Meal">
        {editingTemplate && (
          <TemplateEditor
            foods={foods}
            initialName={editingTemplate.name}
            initialItems={(editingTemplate.meal_template_items || []).map(i => ({
              food_id: i.food_id,
              food: i.food,
              quantity_g: i.quantity_g,
            }))}
            onSave={handleUpdate}
            onCancel={() => setEditingTemplate(null)}
          />
        )}
      </Modal>
    </>
  )
}
