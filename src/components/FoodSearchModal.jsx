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

  const inputClass = "w-full bg-surface border border-border rounded-xl px-4 py-3 text-[14px] text-text placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"

  return (
    <Modal open={open} onClose={handleClose} title="Add Food">
      {!selectedFood ? (
        <>
          <div className="relative mb-4">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary/40" />
            <input
              type="text"
              placeholder="Search your food library..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl pl-11 pr-4 py-3 text-[14px] text-text placeholder:text-text-secondary/40 focus:outline-none focus:border-accent/50 focus:ring-2 focus:ring-accent/10 transition-all"
              autoFocus
            />
          </div>
          <div className="max-h-80 overflow-y-auto -mx-1">
            {filtered.length === 0 ? (
              <p className="text-text-secondary text-[14px] text-center py-12">No foods found</p>
            ) : (
              <div className="space-y-1">
                {filtered.map(food => (
                  <button
                    key={food.id}
                    onClick={() => {
                      setSelectedFood(food)
                      setQuantity(String(food.serving_size_g || 100))
                    }}
                    className="w-full text-left px-4 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    <span className="text-text text-[14px] font-semibold">{food.name}</span>
                    <div className="flex gap-3 mt-1">
                      <span className="text-text-secondary text-[12px] tabular-nums font-medium">{formatNumber(food.calories_per_100g, 0)} cal</span>
                      <span className="text-protein text-[12px] tabular-nums font-medium">P {formatNumber(food.protein_per_100g, 0)}</span>
                      <span className="text-carbs text-[12px] tabular-nums font-medium">C {formatNumber(food.carbs_per_100g, 0)}</span>
                      <span className="text-fat text-[12px] tabular-nums font-medium">F {formatNumber(food.fat_per_100g, 0)}</span>
                      <span className="text-text-secondary/30 text-[11px]">per 100g</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          <div className="bg-gray-50 rounded-xl p-4 mb-5 border border-gray-200">
            <p className="text-text font-semibold text-[15px]">{selectedFood.name}</p>
            <p className="text-text-secondary text-[13px] mt-1 font-medium">
              {formatNumber(selectedFood.calories_per_100g, 0)} cal per 100g
            </p>
          </div>
          <label className="block mb-5">
            <span className="text-text-secondary text-[12px] mb-1.5 block font-semibold">Quantity (grams)</span>
            <input
              type="number"
              value={quantity}
              onChange={e => setQuantity(e.target.value)}
              className={inputClass}
              autoFocus
            />
          </label>
          {macros && (
            <div className="grid grid-cols-4 gap-2.5 mb-5">
              {[
                { label: 'Cal', value: macros.calories, color: 'text-text' },
                { label: 'Protein', value: macros.protein, color: 'text-protein' },
                { label: 'Carbs', value: macros.carbs, color: 'text-carbs' },
                { label: 'Fat', value: macros.fat, color: 'text-fat' },
              ].map(m => (
                <div key={m.label} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-200">
                  <p className={`${m.color} text-[18px] font-bold tabular-nums`}>{formatNumber(m.value, 0)}</p>
                  <p className="text-text-secondary text-[11px] mt-0.5 font-medium">{m.label}</p>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedFood(null)}
              className="flex-1 px-4 py-3 bg-surface border border-border rounded-xl text-[14px] text-text font-medium hover:bg-gray-50 transition-colors"
            >
              Back
            </button>
            <button
              onClick={handleAdd}
              disabled={!quantity || Number(quantity) <= 0}
              className="flex-1 px-4 py-3 bg-accent text-white rounded-xl text-[14px] font-semibold hover:bg-accent-hover transition-colors shadow-sm disabled:opacity-30"
            >
              Add Food
            </button>
          </div>
        </>
      )}
    </Modal>
  )
}
