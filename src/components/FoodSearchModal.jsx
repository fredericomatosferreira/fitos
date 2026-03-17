import { useState, useMemo } from 'react'
import Modal from './Modal'
import { formatNumber, calcMacros } from '../lib/utils'
import { Search } from 'lucide-react'

export default function FoodSearchModal({ open, onClose, foods, onSelect }) {
  const [search, setSearch] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)
  const [quantity, setQuantity] = useState('')

  const filtered = useMemo(() => {
    if (!search.trim()) return foods
    const q = search.toLowerCase()
    return foods.filter(f => f.name.toLowerCase().includes(q))
  }, [foods, search])

  const macros = selectedFood && quantity
    ? calcMacros(selectedFood, Number(quantity))
    : null

  const handleAdd = () => {
    if (!selectedFood || !quantity) return
    onSelect(selectedFood, Number(quantity))
    setSearch('')
    setSelectedFood(null)
    setQuantity('')
    onClose()
  }

  const handleClose = () => {
    setSearch('')
    setSelectedFood(null)
    setQuantity('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Food">
      {!selectedFood ? (
        <>
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search your food library..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-colors"
              autoFocus
            />
          </div>
          <div className="max-h-72 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-10">No foods found</p>
            ) : (
              <div className="space-y-0.5">
                {filtered.map(food => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food)
                      setQuantity(String(food.serving_size_g || 100))
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-md hover:bg-muted transition-colors"
                  >
                    <span className="text-sm font-medium text-foreground">{food.name}</span>
                    <div className="flex gap-3 mt-0.5">
                      <span className="text-xs text-muted-foreground tabular-nums">{formatNumber(food.calories_per_100g, 0)} cal</span>
                      <span className="text-xs text-secondary tabular-nums">P {formatNumber(food.protein_per_100g, 0)}</span>
                      <span className="text-xs text-accent tabular-nums">C {formatNumber(food.carbs_per_100g, 0)}</span>
                      <span className="text-xs text-chart-rose tabular-nums">F {formatNumber(food.fat_per_100g, 0)}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="bg-muted/50 rounded-md p-4 mb-4 border border-border">
            <p className="font-semibold text-sm text-foreground">{selectedFood.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{formatNumber(selectedFood.calories_per_100g, 0)} cal per 100g</p>
          </div>
          <label className="block mb-4">
            <span className="text-xs font-medium text-muted-foreground mb-1 block">Quantity (grams)</span>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              autoFocus
            />
          </label>
          {macros && (
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[
                { label: 'Cal', value: macros.calories, cls: 'text-foreground' },
                { label: 'Protein', value: macros.protein, cls: 'text-secondary' },
                { label: 'Carbs', value: macros.carbs, cls: 'text-accent' },
                { label: 'Fat', value: macros.fat, cls: 'text-chart-rose' },
              ].map(m => (
                <div key={m.label} className="bg-muted/50 rounded-md p-3 text-center border border-border">
                  <p className={`${m.cls} text-base font-bold tabular-nums`}>{formatNumber(m.value, 0)}</p>
                  <p className="text-muted-foreground text-[10px] mt-0.5">{m.label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedFood(null)}
              className="flex-1 h-10 rounded-md border border-border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAdd}
              disabled={!quantity || Number(quantity) <= 0}
              className="flex-1 h-10 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-colors disabled:opacity-30 animate-press"
            >
              Add Food
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
